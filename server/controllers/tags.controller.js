const tagService = require('../services/tags.service');

const searchTagsController = async (req, res) => {
  try {
    // The search query will come from the URL, like: ?q=react
    const query = req.query.q;
    const tags = await tagService.searchTags(query);
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: 'Error searching tags', error: error.message });
  }
};

module.exports = { searchTagsController };