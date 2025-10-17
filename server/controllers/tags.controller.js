// server/controllers/tags.controller.js
const {
  getTags, // If you want a controller for retrieving actual Tag documents
  getTagSuggestionsFromProjects // Your Atlas Search based suggestions
} = require('../services/tags.service');
const { validationResult } = require('express-validator'); // For route-level validation errors

/**
 * Controller to handle requests for tag suggestions based on a search query.
 * It uses Atlas Search on projects to find matching tags.
 *
 * Route: GET /api/tags/suggestions?q=query_string&limit=N
 */
const getTagSuggestionsController = async (req, res) => {
  // 1. --- Check for route-level validation errors ---
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn('⚠️ Tag suggestion validation failed at controller:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const query = req.query.q; // The search query string
    const limit = parseInt(req.query.limit, 10) || 10; // Default limit to 10

    if (!query || query.trim() === '') {
      return res.status(200).json([]); // Return empty array if no query
    }

    // Call the service function that performs Atlas Search for suggestions
    const suggestedTags = await getTagSuggestionsFromProjects(query.trim());

    // Filter and limit on the server-side if Atlas Search limit is not strict enough
    // (though Atlas Search limit should be respected if designed well)
    const limitedTags = suggestedTags.slice(0, limit);

    console.log(`✅ Tag suggestions for "${query}" sent.`);
    res.json(limitedTags);
  } catch (error) {
    console.error('❌ Error in getTagSuggestionsController:', error.message);
    res.status(500).json({ message: 'Failed to retrieve tag suggestions.', error: error.message });
  }
};

/**
 * Controller to retrieve a list of all canonical tags from the Tag collection.
 * Useful for displaying a list of popular tags or a tag cloud.
 *
 * Route: GET /api/tags?q=query_string&limit=N
 */
const getCanonicalTagsController = async (req, res) => {
  // 1. --- Check for route-level validation errors ---
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn('⚠️ Canonical tags validation failed at controller:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const query = req.query.q; // Optional search query for filtering canonical tags
    const limit = parseInt(req.query.limit, 10) || 20; // Default limit for canonical tags

    // Call the service function to get tags from the Tag collection
    const canonicalTags = await getTags(query ? query.trim() : undefined, limit);

    console.log(`✅ Canonical tags retrieved (query: "${query || 'none'}").`);
    res.json(canonicalTags);
  } catch (error) {
    console.error('❌ Error in getCanonicalTagsController:', error.message);
    res.status(500).json({ message: 'Failed to retrieve canonical tags.', error: error.message });
  }
};


module.exports = {
  getTagSuggestionsController,
  getCanonicalTagsController
};