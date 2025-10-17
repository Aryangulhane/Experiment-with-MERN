// server/routes/tags.routes.js
const express = require('express');
const router = express.Router();
const { getTagSuggestionsController, getCanonicalTagsController } = require('../controllers/tags.controller');
const { query } = require('express-validator'); // For validation

// Route for tag suggestions (uses Atlas Search on Project tags)
router.get('/suggestions',
  [
    query('q').trim().notEmpty().withMessage('Search query (q) is required for tag suggestions.'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be an integer between 1 and 50.')
  ],
  getTagSuggestionsController
);

// Route for canonical tags (retrieves from Tag collection)
router.get('/',
  [
    query('q').optional().trim().notEmpty().withMessage('Search query (q) cannot be empty if provided.'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be an integer between 1 and 50.')
  ],
  getCanonicalTagsController
);

module.exports = router;