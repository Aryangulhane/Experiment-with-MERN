// server/services/projects.service.js
const Project = require('../models/projects.model'); // Updated to correct plural form
const mongoose = require('mongoose'); // For ObjectId validation

/**
 * Searches for projects using MongoDB Atlas Search, with pagination and facets.
 *
 * @param {object} searchOptions - Options for the search.
 * @param {string} [searchOptions.query] - The main text search query.
 * @param {string[]} [searchOptions.tags] - An array of tags to filter by.
 * @param {string[]} [searchOptions.categories] - An array of category IDs to filter by.
 * @param {number} [searchOptions.page=1] - The current page number for pagination.
 * @param {number} [searchOptions.limit=5] - The number of results per page.
 * @returns {Promise<{projects: Project[], totalPages: number, totalCount: number, tagFacets: object[], categoryFacets: object[]}>}
 * @throws {Error} If any aggregation error occurs or parameters are invalid.
 */
async function searchProjects({
  query,
  tags = [],       // Default to empty array
  categories = [], // Default to empty array
  page = 1,
  limit = 5
}) {
  try {
    // 1. --- Input Sanitization and Defaults ---
    const sanitizedQuery = query ? query.toLowerCase().trim() : '';
    const sanitizedTags = tags.map(tag => tag.toLowerCase().trim()).filter(Boolean); // Clean and remove empties
    const sanitizedCategories = categories.filter(catId => mongoose.Types.ObjectId.isValid(catId)); // Validate IDs

    const skip = (page - 1) * limit;

    // 2. --- Build the main Atlas Search query object dynamically ---
    const searchStage = {
      $search: {
        index: 'default', // Make sure this matches your Atlas Search index name
        compound: {
          must: [],
          filter: [] // Use filter for exact matches (like tags, categories)
        }
      }
    };

    // Add text search clause if a query exists.
    if (sanitizedQuery) {
      searchStage.$search.compound.must.push({
        text: {
          query: sanitizedQuery,
          path: ['projectName', 'description'], // Use correct fields from Project model
          fuzzy: { maxEdits: 1 } // Allow for minor typos
        }
      });
    }

    // Add tag filter clause if tags exist.
    if (sanitizedTags.length > 0) {
      searchStage.$search.compound.filter.push({
        text: { // Using text here for case-insensitive matching if tags are analyzed
          query: sanitizedTags,
          path: 'tags'
          // You might use 'term' if your tags field in Atlas Search is an unanalyzed string or keyword.
          // term: { query: sanitizedTags, path: 'tags' }
        }
      });
    }

    // Add category filter clause if categories exist.
    // Assuming 'categories' field in your Atlas Search index refers to the _id values.
    if (sanitizedCategories.length > 0) {
      searchStage.$search.compound.filter.push({
        text: { // Assuming categories in Atlas Search index are stored as text (IDs)
          query: sanitizedCategories.map(id => id.toString()), // Convert ObjectIds to strings for text search
          path: 'categories' // Path to the categories field in your Atlas Search index
          // If your Atlas Search index has categories as a "keyword" type, you might use:
          // term: { query: sanitizedCategories, path: 'categories' }
        }
      });
    }

    // If no specific 'must' conditions, add a wildcard to get results,
    // otherwise, the query will return nothing if filter only matches (must be present).
    if (searchStage.$search.compound.must.length === 0) {
      // If no text query, but there are filters, ensure it matches all documents that fit the filter
      // If no filters either, this will match all projects.
      // A common pattern is to make this conditional:
      // if (sanitizedTags.length === 0 && sanitizedCategories.length === 0) {
          searchStage.$search.compound.must.push({
            wildcard: {
              query: "*",
              path: "projectName", // Match anything on a relevant field
              allowAnalyzedField: true
            }
          });
      // }
    }
    // If only filters are present and no "must" (like a text search), compound.must must have at least one clause
    // that matches. If your goal is to return all items that match categories/tags even without a text query,
    // the above wildcard serves that purpose.

    // 3. Build the final aggregation pipeline.
    const pipeline = [
      searchStage, // The search query we built earlier
      {
        // Project relevant fields after search (optional, can be done in $project below too)
        $project: {
          _id: 1,
          projectName: 1,
          description: 1,
          liveUrl: 1,
          githubUrl: 1,
          imageUrl: 1,
          tags: 1,
          categories: 1, // Include categories for population later if needed
          slug: 1,
          createdAt: 1,
          score: { $meta: "searchScore" } // Get the search relevance score
        }
      },
      // You can add a sort stage here based on relevance score or other fields
      // { $sort: { score: -1 } },
      {
        $facet: {
          // Pipeline 1: Get the total count for pagination
          metadata: [{ $count: "total" }],

          // Pipeline 2: Get the paginated data for the current page
          data: [
            { $skip: skip },
            { $limit: limit },
            // Populate categories if you want their full details
            { $lookup: {
                from: 'categories', // The collection name for categories
                localField: 'categories',
                foreignField: '_id',
                as: 'categoryDetails'
            }},
            { $project: {
                // Exclude category _id if you only need the name or specific fields
                'categories': 0, // Exclude the raw category IDs array
            }}
          ],

          // Pipeline 3: Calculate the top tags (facets)
          tagFacets: [
            { $unwind: '$tags' }, // Deconstruct the tags array
            { $group: { _id: '$tags', count: { $sum: 1 } } }, // Group by tag name and count
            { $sort: { count: -1 } }, // Sort by the most common tags
            { $limit: 10 } // Return top N tags
          ],

          // Pipeline 4: Calculate the top categories (facets)
          categoryFacets: [
            { $unwind: '$categories' }, // Deconstruct the categories array (now containing ObjectIds)
            // This $lookup is crucial for getting category names if you want them in facets
            { $lookup: {
                from: 'categories', // The collection name for categories
                localField: '_id', // From the current _id (category ObjectId)
                foreignField: '_id',
                as: 'categoryDetail'
            }},
            { $unwind: '$categoryDetail' }, // Deconstruct the lookup result
            { $group: {
                _id: '$categoryDetail._id', // Group by category ID
                name: { $first: '$categoryDetail.name' }, // Get category name
                count: { $sum: 1 }
            }},
            { $sort: { count: -1 } }, // Sort by the most common categories
            { $limit: 5 } // Return top N categories
          ]
        }
      }
    ];

    // Log the pipeline (useful for debugging in Atlas)
    // console.log("Atlas Search Pipeline:", JSON.stringify(pipeline, null, 2));

    const results = await Project.aggregate(pipeline);

    // 4. Safely handle the response from the database.
    if (!results || !results[0]) {
      console.log('No search results or metadata found.');
      return { projects: [], totalPages: 0, totalCount: 0, tagFacets: [], categoryFacets: [] };
    }

    const { metadata, data, tagFacets, categoryFacets } = results[0];

    const projects = data || [];
    const totalCount = metadata[0] ? metadata[0].total : 0;
    const totalPages = Math.ceil(totalCount / limit);

    console.log(`✅ Search completed: Found ${totalCount} projects, page ${page}/${totalPages}.`);

    return {
      projects,
      totalPages,
      totalCount,
      tagFacets: tagFacets || [],
      categoryFacets: categoryFacets || []
    };
  } catch (error) {
    console.error("❌ Error during search aggregation in service:", error);
    // Re-throw the error to be caught by the controller
    throw error;
  }
}

module.exports = { searchProjects };