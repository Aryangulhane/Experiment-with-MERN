// server/routes/categories.routes.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator'); // For input validation
const { createCategoryController, getAllCategoriesController } = require('../controllers/categories.controller');

// --- Validation Middleware for Category Creation ---
// Ensures 'name' field is present and is a non-empty string for new categories.
const validateCategoryCreation = [
  body('name')
    .trim() // Remove leading/trailing whitespace
    .notEmpty() // Ensure the field is not empty after trimming
    .withMessage('Category name is required.'), // Custom error message

  // Middleware to check for validation errors and return a response if errors exist
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If validation fails, send a 400 Bad Request response with the error details
      console.warn('⚠️ Category creation validation failed:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    // If validation passes, proceed to the next middleware/controller
    next();
  },
];


// @route   POST /api/categories
// @desc    Create a new project category
// @access  Public (add authentication middleware here if needed)
router.post('/', validateCategoryCreation, createCategoryController);

// @route   GET /api/categories
// @desc    Get all project categories
// @access  Public
router.get('/', getAllCategoriesController);


// --- Test Route ---
// @route   GET /api/categories/test
// @desc    A simple test route to confirm the router is working
// @access  Public
router.get('/test', (req, res) => {
  console.log('GET /api/categories/test route was hit.');
  res.json({ message: 'Categories route is functioning correctly.' });
});


// --- Router-level Error Handling (Optional, but good practice) ---
// This acts as a catch-all for any unhandled errors that might occur specifically
// within this router's middleware or controllers. If you have a global error
// handler in your main app.js, this might be somewhat redundant but provides
// a specific fallback for /api/categories routes.
router.use((err, req, res, next) => {
  console.error('❌ Unhandled error in categories router:', err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred in the categories API.',
    error: err.message
  });
});

module.exports = router;