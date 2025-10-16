const Project = require('../models/projects.model');

async function searchProjects({ query, tags, page = 1, limit = 5 }) {
  // Return early if there's nothing to search for.
  if (!query && (!tags || tags.length === 0)) {
    return { projects: [], totalPages: 0 };
  }

  const skip = (page - 1) * limit;

  // 1. Build the main search query object dynamically.
  const searchStage = {
    $search: {
      index: 'default',
      compound: {
        must: [],
        filter: []
      }
    }
  };

  // Add the text search clause if a query exists.
  if (query) {
    searchStage.$search.compound.must.push({
      text: {
        query: query,
        path: ['title', 'body'],
        fuzzy: { maxEdits: 1 }
      }
    });
  }

  // Add the tag filter clause if tags exist.
  if (tags && tags.length > 0) {
    searchStage.$search.compound.filter.push({
      term: {
        query: tags.map(tag => tag.toLowerCase().trim()),
        path: 'tags'
      }
    });
  }
  
  // If there's no text query, add a wildcard to match all documents.
  if (searchStage.$search.compound.must.length === 0) {
    searchStage.$search.compound.must.push({
      wildcard: {
        query: "*",
        path: "tags", // Use a keyword field
        allowAnalyzedField: false
      }
    });
  }

  // 2. Build the final aggregation pipeline.
// REPLACE WITH THIS BLOCK
const pipeline = [
  searchStage, // The search query we built earlier
  {
    $facet: {
      // Pipeline 1: Get the total count for pagination
      metadata: [{ $count: "total" }],

      // Pipeline 2: Get the paginated data for the current page
      data: [
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            title: 1, body: 1, tags: 1, createdAt: 1, author: 1,
            score: { $meta: "searchScore" }
          }
        }
      ],

      // --- NEW: Pipeline 3: Calculate the top tags (facets) ---
      tagFacets: [
        { $unwind: '$tags' }, // Deconstruct the tags array
        { $group: { _id: '$tags', count: { $sum: 1 } } }, // Group by tag name and count
        { $sort: { count: -1 } }, // Sort by the most common tags
        { $limit: 5 } // Return only the top 5
      ]
    }
  }
];
  try {
    const results = await Project.aggregate(pipeline);

    // 3. Safely handle the response from the database.
// REPLACE WITH THIS BLOCK
if (!results[0]) {
  return { projects: [], totalPages: 0, facets: [] };
}

const projects = results[0].data || [];
const totalCount = results[0].metadata[0] ? results[0].metadata[0].total : 0;
const totalPages = Math.ceil(totalCount / limit);
const facets = results[0].tagFacets || [];

return { projects, totalPages, facets };
  } catch (error) {
    console.error("Error during search aggregation:", error);
    throw error; // Let the controller handle the 500 error
  }
}

module.exports = { searchProjects };