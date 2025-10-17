// server/routes/search.routes.js
const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator'); // Import express-validator

const searchService = require('../services/search.service'); // Ensure this path is correct

// --- Main Search Route ---
// @route   GET /api/search
// @desc    Search for projects by query and/or tags, with pagination.
//          Returns all projects if no query or tags are provided.
// @access  Public
router.get('/',
  [
    // Validation and Sanitization for 'q' (search query)
    query('q')
      .optional()
      .trim() // Trim whitespace from both ends
      .escape() // Sanitize to prevent XSS attacks
      .isString().withMessage('Search query (q) must be a string.'),

    // Validation for 'page'
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Invalid "page" parameter. Must be a positive integer.'),

    // Validation for 'limit'
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 }).withMessage('Invalid "limit" parameter. Must be a positive integer (max 50 recommended).'),

    // Validation and Sanitization for 'tags' (comma-separated string)
    query('tags')
      .optional()
      .isString().withMessage('Invalid "tags" parameter. Must be a comma-separated string.')
      .customSanitizer(value => {
        // Sanitize each individual tag in the comma-separated string
        return value.split(',')
                    .map(tag => tag.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')) // Simple XSS escape
                    .filter(Boolean) // Remove empty strings
                    .join(',');
      }),

    // Validation for 'categories' (comma-separated string of ObjectIDs)
    query('categories') // Assuming you'll add categories to search
      .optional()
      .isString().withMessage('Invalid "categories" parameter. Must be a comma-separated string of IDs.')
      .customSanitizer(value => {
        // Simple sanitization for category IDs (assuming they are alphanumeric)
        return value.split(',')
                    .map(catId => catId.trim().replace(/[^a-fA-F0-9]/g, '')) // Allow only hex chars for ObjectIDs
                    .filter(Boolean)
                    .join(',');
      }),
  ],
  async (req, res, next) => { // Use 'next' to pass errors to global handler
    // Check for validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('⚠️ Search route validation failed:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Extract parameters - express-validator will have trimmed/escaped them
      const {
        q,
        page = 1, // Default page to 1
        limit = 5, // Default limit to 5
        tags,
        categories // Include categories from req.query
      } = req.query;

      // Parse parameters for the service (now that they are validated/sanitized)
      const parsedPage = parseInt(page, 10);
      const parsedLimit = parseInt(limit, 10);
      const tagsArray = typeof tags === 'string'
                        ? tags.split(',').filter(Boolean) // Already trimmed/escaped by customSanitizer
                        : [];
      const categoriesArray = typeof categories === 'string'
                              ? categories.split(',').filter(Boolean) // Already sanitized by customSanitizer
                              : [];
      const searchQuery = typeof q === 'string' ? q.trim() : ''; // q is already trimmed/escaped

      // Log incoming request details for debugging
      console.log(`🔍 Search request: q='${searchQuery}', tags='${tagsArray.join(',')}', categories='${categoriesArray.join(',')}', page=${parsedPage}, limit=${parsedLimit}`);

      // Call the searchProjects function from the service
      const results = await searchService.searchProjects({
        query: searchQuery,
        tags: tagsArray,
        categories: categoriesArray, // Pass categories to the service
        page: parsedPage,
        limit: parsedLimit,
      });

      // Send the results back to the frontend
      res.json(results);
    } catch (error) {
      console.error('❌ Error in search route:', error);
      // Pass the error to the global error handling middleware
      next(error);
    }
  }
);

// --- Test Route (Optional - remove for production if not needed) ---
router.get('/test', (req, res) => {
  console.log('GET /api/search/test route hit.');
  res.json({ msg: 'Search Route Works' });
});

// --- Generic Error Handling for this router (Catches any unhandled errors in this router) ---
// Note: This specific router error handler is usually superseded by the global one in index.js
// but can be useful for debugging router-specific issues.
router.use((err, req, res, next) => {
  console.error('🚨 Unhandled error within search router:', err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred in the search API.',
    error: err.message
  });
});

module.exports = router;