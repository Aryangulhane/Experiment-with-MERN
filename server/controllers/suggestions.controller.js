const suggestionsService = require('../services/suggestions.service');

const getTagSuggestions = async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required.' });
    }

    const tags = await suggestionsService.generateTags({ title, body });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: 'Error generating tag suggestions', error: error.message });
  }
};

module.exports = { getTagSuggestions };