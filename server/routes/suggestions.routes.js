const express = require('express');
const router = express.Router();
const { getTagSuggestions } = require('../controllers/suggestions.controller');

// @route   POST api/suggestions
// @desc    Generate tag suggestions from post text
// @access  Public
router.post('/', getTagSuggestions);

module.exports = router;