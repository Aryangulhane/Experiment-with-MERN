const Project = require('../models/projects.model');

async function searchTags(query) {
  if (!query) {
    return [];
  }

  // This pipeline uses Atlas Search to find unique tags matching the query
  const pipeline = [
    {
      $search: {
        index: 'default',
        autocomplete: {
          query: query,
          path: 'tags'
        }
      }
    },
    { $unwind: '$tags' }, // Split posts into one document per tag
    {
      $group: { // Group by the tag name to get unique tags
        _id: '$tags',
        count: { $sum: 1 } // Count how many times each tag appears
      }
    },
    { $sort: { count: -1 } }, // Sort by the most popular tags
    { $limit: 10 }, // Limit to 10 suggestions
    {
      $project: { // Reshape the output to what the frontend expects
        _id: 0,
        name: '$_id'
      }
    }
  ];

  const tags = await Project.aggregate(pipeline);
  return tags;
}

module.exports = { searchTags };