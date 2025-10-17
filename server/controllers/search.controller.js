const searchService = require('../services/search.service');

const searchProjectsController = async (req, res) => {
  try {
    const { q, tags, page } = req.query;
    const tagsArray = tags ? tags.split(',') : [];

    // Pass the page number to the service (default to 1 if not provided)
    const results = await searchService.searchProjects({
      query: q,
      tags: tagsArray,
      page: parseInt(page) || 1
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error searching projects', error: error.message });
  }
};

module.exports = { searchProjectsController };