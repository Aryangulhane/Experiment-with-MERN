// server/services/projects.service.js
const Project = require('../models/projects.model'); // Assuming your Project model
const Tag = require('../models/tag.model');       // Corrected to singular
const Category = require('../models/categories.model'); // Already correct
const slugify = require('slugify');              // Install: npm install slugify
const mongoose = require('mongoose');             // For ObjectId validation

/**
 * Creates a new project, handles associated tags, and ensures category validity.
 *
 * @param {object} projectData - Data for the new project.
 * @param {string} projectData.projectName - The name of the project.
 * @param {string} projectData.description - The description of the project.
 * @param {string} [projectData.liveUrl] - URL for the live demo.
 * @param {string} [projectData.githubUrl] - URL for the GitHub repository.
 * @param {string} [projectData.imageUrl] - URL for the project image.
 * @param {string[]} projectData.tags - An array of tag names (strings).
 * @param {string[]} projectData.categories - An array of category ObjectIDs.
 * @returns {Promise<Project>} The newly created project document.
 * @throws {Error} If categories are invalid/missing, or any database operation fails.
 */
async function createProject({
  projectName,
  description,
  liveUrl,
  githubUrl,
  imageUrl,
  tags = [],
  categories = []
}) {
  try {
    const sanitizedProjectName = projectName ? projectName.trim() : '';
    const sanitizedDescription = description ? description.trim() : '';

    if (!sanitizedProjectName) throw new Error('Project name is required.');
    if (!sanitizedDescription) throw new Error('Project description is required.');

    if (!categories || categories.length === 0) {
      throw new Error('At least one category is required for the project.');
    }
    const validCategoryIds = [];
    for (const catId of categories) {
      if (!mongoose.Types.ObjectId.isValid(catId)) {
        throw new Error(`Invalid category ID format: ${catId}`);
      }
      const exists = await Category.findById(catId);
      if (!exists) {
        throw new Error(`Category with ID ${catId} not found.`);
      }
      validCategoryIds.push(catId);
    }
    console.log(`✅ Validated categories: ${validCategoryIds.length} found.`);

    const processedTags = [];
    const tagPromises = tags.map(async (tagName) => {
      const normalizedName = tagName.toLowerCase().trim();
      if (!normalizedName) return;

      const tagDoc = await Tag.findOneAndUpdate(
        { name: normalizedName, type: 'tag' },
        {
          $setOnInsert: { name: normalizedName, type: 'tag' },
          $inc: { projectCount: 1 }
        },
        {
          upsert: true,
          new: true,
          runValidators: true
        }
      );
      if (tagDoc) processedTags.push(tagDoc.name);
      return tagDoc;
    });

    await Promise.all(tagPromises);
    console.log(`✅ Processed tags: ${processedTags.length} unique tags.`);

    const slug = slugify(sanitizedProjectName, { lower: true, strict: true, locale: 'en' });

    const newProject = new Project({
      projectName: sanitizedProjectName,
      description: sanitizedDescription,
      liveUrl: liveUrl ? liveUrl.trim() : undefined,
      githubUrl: githubUrl ? githubUrl.trim() : undefined,
      imageUrl: imageUrl ? imageUrl.trim() : undefined,
      tags: processedTags,
      categories: validCategoryIds,
      slug: slug
    });

    const savedProject = await newProject.save();
    console.log(`🎉 Project "${savedProject.projectName}" (ID: ${savedProject._id}) created successfully.`);

    return savedProject;

  } catch (error) {
    console.error('❌ Error in createProject service:', error.message);
    throw error;
  }
}

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
  tags = [],
  categories = [],
  page = 1,
  limit = 5
}) {
  try {
    // 1. --- Input Sanitization and Defaults ---
    const sanitizedQuery = query ? query.toLowerCase().trim() : '';
    const sanitizedTags = tags.map(tag => tag.toLowerCase().trim()).filter(Boolean);
    const sanitizedCategories = categories.filter(catId => mongoose.Types.ObjectId.isValid(catId));

    const skip = (page - 1) * limit;

    // 2. --- Build the main Atlas Search query object dynamically ---
    const searchStage = {
      $search: {
        index: 'default', // Make sure this matches your Atlas Search index name
        compound: {
          must: [],
          filter: []
        }
      }
    };

    // Add text search clause if a query exists.
    if (sanitizedQuery) {
      searchStage.$search.compound.must.push({
        text: {
          query: sanitizedQuery,
          // --- CRITICAL CHANGE HERE: ENSURE THESE MATCH YOUR SANITY FIELD NAMES AND ATLAS SEARCH INDEX ---
          // Based on typical Sanity setup, 'title' and 'description' are common.
          // Adjust 'projectName' and 'description' to your actual Sanity fields if they differ.
          path: ['projectName', 'description'], // <--- ADJUST THIS TO MATCH YOUR ATLAS SEARCH INDEX FIELD NAMES
          fuzzy: { maxEdits: 1 }
        }
      });
    }

    // Add tag filter clause if tags exist.
    if (sanitizedTags.length > 0) {
      searchStage.$search.compound.filter.push({
        text: { // Using text here if your 'tags' field is analyzed as text
          query: sanitizedTags,
          path: 'tags' // <--- Ensure this path matches your ATLAS SEARCH INDEX FIELD NAME
        }
        // If your Atlas Search index 'tags' field is type "keyword" or you want exact match:
        // term: { query: sanitizedTags, path: 'tags' }
      });
    }

    // Add category filter clause if categories exist.
    if (sanitizedCategories.length > 0) {
      searchStage.$search.compound.filter.push({
        term: {
          query: sanitizedCategories.map(id => new mongoose.Types.ObjectId(id)),
          path: 'categories' // <--- Ensure this path matches your ATLAS SEARCH INDEX FIELD NAME
        }
      });
    }

    // If no specific 'must' conditions (text query), but filters are present,
    // or if no filters are present either, this ensures a search is still performed.
    // This allows an empty query to return all results (with optional filters).
    if (searchStage.$search.compound.must.length === 0) {
      searchStage.$search.compound.must.push({
        wildcard: {
          query: "*",
          // --- CRITICAL CHANGE HERE: ENSURE THIS MATCHES AN INDEXED FIELD PRESENT IN ALL DOCS ---
          // '_id' is safest if you just want to return all. Otherwise, use a common field like 'projectName'
          path: "projectName", // <--- ADJUST THIS TO MATCH YOUR ATLAS SEARCH INDEX FIELD NAME (e.g., 'title', or '_id')
          allowAnalyzedField: true
        }
      });
    }

    // 3. --- Build the final aggregation pipeline. ---
    const pipeline = [
      // Optional: Add a $match stage here to filter out Sanity drafts if needed
      // {
      //   $match: {
      //     '_id': { $not: /^drafts\./ } // Exclude documents whose _id starts with 'drafts.'
      //   }
      // },
      searchStage, // The search query we built earlier
      {
        $project: {
          _id: 1,
          projectName: 1,
          description: 1,
          liveUrl: 1,
          githubUrl: 1,
          imageUrl: 1,
          tags: 1,
          categories: 1,
          slug: 1,
          createdAt: 1,
          score: { $meta: "searchScore" }
        }
      },
      { $sort: { score: -1, createdAt: -1 } }, // Sort by relevance first, then newest

      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            { $lookup: {
                from: 'categories', // The collection name for categories
                localField: 'categories',
                foreignField: '_id',
                as: 'categoryDetails'
            }},
            { $project: {
                categories: '$categoryDetails',
                categoryDetails: 0,
                _id: 1, projectName: 1, description: 1, liveUrl: 1, githubUrl: 1,
                imageUrl: 1, tags: 1, slug: 1, createdAt: 1, score: 1
            }}
          ],
          tagFacets: [
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          categoryFacets: [
            { $unwind: '$categories' },
            { $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'categoryDetail'
            }},
            { $unwind: '$categoryDetail' },
            { $group: {
                _id: '$categoryDetail._id',
                name: { $first: '$categoryDetail.name' },
                count: { $sum: 1 }
            }},
            { $sort: { count: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ];

    // console.log("Atlas Search Pipeline:", JSON.stringify(pipeline, null, 2)); // Debug log

    const results = await Project.aggregate(pipeline);

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
    throw error;
  }
}

module.exports = { createProject, searchProjects };