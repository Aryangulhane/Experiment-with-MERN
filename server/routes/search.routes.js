// server/routes/search.routes.js
const express = require('express');
const router = express.Router();

// Ensure this path is correct based on your project structure:
// It means from 'server/routes' directory, go up one level '..' to 'server',
// then into 'services' and find 'search.service.js'.
const searchService = require('../services/search.service');

router.get('/', async (req, res) => {
  try {
    // Extract query parameters from the request
    // 'q' is the main search query
    // 'page' defaults to 1
    // 'limit' defaults to 10 (you can adjust this, but 5 from service is also good)
    // 'tags' is a comma-separated string of tags from the frontend
    const { q, page = 1, limit = 5, tags } = req.query; // Set default limit to 5 to match service if desired

    // Validate the search query (at least one of 'q' or 'tags' should be present)
    //if (!q && (!tags || tags.length === 0)) {
       // return res.status(400).json({ message: 'A search query (q) or tags are required.' });
    //}

    // Prepare tags for the service:
    // If 'tags' exists and is a string, split it into an array, otherwise default to an empty array.
    const tagsArray = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : [];

    // Call the searchProjects function from the service
    // Pass an object as arguments, matching the service's expected parameters:
    // async function searchProjects({ query, tags, page = 1, limit = 5 })
    const results = await searchService.searchProjects({
      query: q,
      tags: tagsArray, // Pass the processed tags array
      page: parseInt(page, 10), // Parse page to integer with base 10
      limit: parseInt(limit, 10), // Parse limit to integer with base 10
    });

    // Send the results back to the frontend
    res.json(results);
  } catch (error) {
    // Log the error for debugging purposes on the server (Render logs)
    console.error('Error in search route:', error);

    // Send a 500 Internal Server Error response to the frontend
    res.status(500).json({
      message: 'Error searching projects', // More specific message
      error: error.message // Pass the actual error message for debugging on frontend (during development)
    });
  }
});

module.exports = router;