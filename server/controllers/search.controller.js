const searchService = require('../services/search.service');

const searchPostsController = async (req, res) => {
  try {
    const { q, tags, page } = req.query;
    const tagsArray = tags ? tags.split(',') : [];

    // Pass the page number to the service (default to 1 if not provided)
    const results = await searchService.searchPosts({
      query: q,
      tags: tagsArray,
      page: parseInt(page) || 1
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error searching posts', error: error.message });
  }
};

module.exports = { searchPostsController };