// server/services/tags.service.js
const Tag = require('../models/tag.model'); // Ensure this points to your Tag model (singular or plural as corrected)
const Project = require('../models/projects.model'); // Keep Project if we want suggestions from existing projects

// ... (your createCategory and getAllCategories functions if they are in this file as per previous updates) ...

/**
 * Retrieves a list of tags from the dedicated Tag collection, optionally filtered by a query.
 * This is primarily for getting actual Tag documents, not just unique tag strings.
 *
 * @param {string} [query] - Optional search query to filter tags by name.
 * @param {number} [limit=10] - Number of tags to return.
 * @returns {Promise<Tag[]>} An array of Tag documents.
 * @throws {Error} If any database error occurs during retrieval.
 */
async function getTags(query, limit = 10) {
  try {
    const filter = { type: 'tag' }; // Only retrieve documents of type 'tag'

    if (query) {
      filter.name = { $regex: query, $options: 'i' }; // Case-insensitive search
    }

    const tags = await Tag.find(filter)
      .sort({ projectCount: -1, name: 1 }) // Sort by popularity then alphabetically
      .limit(limit)
      .lean(); // Faster for read operations

    console.log(`✅ Retrieved ${tags.length} tags from Tag collection (query: "${query || 'none'}").`);
    return tags;
  } catch (error) {
    console.error('❌ Error retrieving tags from Tag collection:', error.message);
    throw error;
  }
}

/**
 * Provides tag suggestions by performing an Atlas Search autocomplete query
 * against the 'tags' field of the Project collection.
 * This is useful for getting tags that are *currently used* in projects,
 * even if they don't explicitly exist as a Tag document yet (though they should).
 *
 * @param {string} query - The search query for tag suggestions.
 * @returns {Promise<string[]>} An array of suggested tag strings.
 * @throws {Error} If the Atlas Search aggregation fails.
 */
async function getTagSuggestionsFromProjects(query) {
  try {
    if (!query || query.trim() === '') {
      return [];
    }

    const pipeline = [
      {
        $search: {
          index: 'default', // Ensure this matches your Atlas Search index name
          autocomplete: {
            query: query.trim(),
            path: 'tags',
            tokenOrder: 'any', // Allows "re js" to match "javascript react" if indexed properly
            fuzzy: {
              maxEdits: 1, // Allow 1 typo
              prefixLength: 2 // Require at least 2 characters for fuzzy matching
            }
          }
        }
      },
      { $unwind: '$tags' }, // Deconstruct the tags array from projects
      {
        $match: { // Ensure the unwound tag actually matches the query (case-insensitive)
          'tags': { $regex: query.trim(), $options: 'i' }
        }
      },
      {
        $group: { // Group by the tag name to get unique tags
          _id: '$tags',
          count: { $sum: 1 } // Count how many times each tag appears
        }
      },
      { $sort: { count: -1, _id: 1 } }, // Sort by popularity, then alphabetically
      { $limit: 10 }, // Limit to N suggestions
      {
        $project: { // Reshape the output to what the frontend expects
          _id: 0,
          name: '$_id' // Return 'name' property for consistency
        }
      }
    ];

    const suggestedTags = await Project.aggregate(pipeline);
    console.log(`✅ Generated ${suggestedTags.length} tag suggestions for query: "${query}".`);
    return suggestedTags;
  } catch (error) {
    console.error('❌ Error during Atlas Search for tag suggestions:', error.message);
    throw error; // Let the controller handle the 500 error
  }
}

module.exports = {
  // If your createCategory/getAllCategories are in this file:
  // createCategory,
  // getAllCategories,
  getTags, // New function for getting actual Tag documents
  getTagSuggestionsFromProjects // Your existing logic, renamed and slightly improved
};