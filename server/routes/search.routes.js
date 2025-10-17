// server/routes/search.routes.js
const express = require('express');
const router = express.Router();
// You might consider adding a validation library like 'express-validator' here.
// const { query, validationResult } = require('express-validator');

const searchService = require('../services/search.service'); // Ensure this path is correct

// --- Middleware for Query Parameter Validation (Optional but Recommended) ---
// This example uses simple checks. For more complex validation, consider express-validator.
const validateSearchParams = (req, res, next) => {
  const { q, page, limit, tags } = req.query;

  // Basic type and range checks
  if (page && (isNaN(parseInt(page, 10)) || parseInt(page, 10) < 1)) {
    return res.status(400).json({ message: 'Invalid "page" parameter. Must be a positive integer.' });
  }
  if (limit && (isNaN(parseInt(limit, 10)) || parseInt(limit, 10) < 1)) {
    return res.status(400).json({ message: 'Invalid "limit" parameter. Must be a positive integer.' });
  }
  if (q && typeof q !== 'string') {
    return res.status(400).json({ message: 'Invalid "q" parameter. Must be a string.' });
  }
  if (tags && typeof tags !== 'string') {
    return res.status(400).json({ message: 'Invalid "tags" parameter. Must be a comma-separated string.' });
  }
  
  // If no validation errors, proceed to the route handler
  next();
};

// --- Main Search Route ---
// @route   GET /api/search
// @desc    Search for projects by query and/or tags, with pagination.
//          Returns all projects if no query or tags are provided.
// @access  Public
router.get('/', validateSearchParams, async (req, res) => { // Apply validation middleware
  try {
    // Extract and process query parameters
    const { 
      q, 
      page = 1, // Default page to 1
      limit = 5, // Default limit to 5, matching service default for consistency
      tags 
    } = req.query;

    // Sanitize and parse parameters for the service
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const tagsArray = typeof tags === 'string'
                      ? tags.split(',').map(tag => tag.trim()).filter(Boolean) // Filter out empty strings from splitting
                      : [];
    const searchQuery = typeof q === 'string' ? q.trim() : ''; // Trim query, ensure it's a string

    // Log incoming request details for debugging in production (Render logs)
    console.log(`🔍 Search request: q='${searchQuery}', tags='${tagsArray.join(',')}', page=${parsedPage}, limit=${parsedLimit}`);

    // Call the searchProjects function from the service
    const results = await searchService.searchProjects({
      query: searchQuery,
      tags: tagsArray,
      page: parsedPage,
      limit: parsedLimit,
    });

    // Send the results back to the frontend
    res.json(results);
  } catch (error) {
    // Log the error for debugging purposes on the server (Render logs)
    console.error('❌ Error in search route:', error);

    // Send a 500 Internal Server Error response to the frontend
    res.status(500).json({
      message: 'Failed to search projects. Please try again later.', // User-friendly message
      error: error.message // Detailed error for developers (during development/debugging)
    });
  }
});

// --- Test Route (Optional - remove for production if not needed) ---
router.get('/test', (req, res) => {
  console.log('GET /api/search/test route hit.');
  res.json({ msg: 'Search Route Works' });
});

// --- Generic Error Handling for this router (Catches any unhandled errors in this router) ---
// This acts as a fallback if an error isn't caught by a specific try-catch block
router.use((err, req, res, next) => {
  console.error('🚨 Unhandled error within search router:', err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred in the search API.',
    error: err.message
  });
});

module.exports = router;