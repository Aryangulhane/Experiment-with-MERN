// server/routes/projects.routes.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator'); // Import validation tools
const { createProjectController } = require('../controllers/projects.controller');

// --- Validation Middleware ---
// This middleware checks and sanitizes the incoming request body before it reaches the controller.
const validateProjectCreation = [
  // projectName must be a non-empty string
  body('projectName')
    .trim()
    .notEmpty()
    .withMessage('Project name is required.'),

  // description must be a non-empty string
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required.'),

  // tags must be an array with at least one item
  body('tags')
    .isArray({ min: 1 })
    .withMessage('At least one tag or category is required.'),

  // Optional fields can also be validated if they exist
  body('liveUrl')
    .optional({ checkFalsy: true }) // checkFalsy allows empty strings
    .isURL()
    .withMessage('Please provide a valid URL for the live demo.'),

  body('githubUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Please provide a valid URL for the GitHub repository.'),

  // Function to handle the result of the validation
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there are validation errors, return a 400 Bad Request response
      return res.status(400).json({ errors: errors.array() });
    }
    // If validation passes, proceed to the controller
    next();
  },
];


// @route   POST api/projects
// @desc    Create a new project
// @access  Public (or private if you add authentication middleware)
router.post('/', validateProjectCreation, createProjectController);


// @route   GET api/projects/test
// @desc    A simple test route to confirm the router is working
// @access  Public
router.get('/test', (req, res) => {
  console.log('GET /api/projects/test route was hit.');
  res.json({ message: 'Projects route is functioning correctly.' });
});


module.exports = router;