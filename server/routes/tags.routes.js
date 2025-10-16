const express = require('express');
const router = express.Router();
const { searchTagsController } = require('../controllers/tags.controller');

// @route   GET api/tags/search
// @desc    Search for tags for autocomplete
// @access  Public
router.get('/search', searchTagsController);

// We can keep the test route for now if we want
router.get('/test', (req, res) => res.json({ msg: 'Tags Route Works' }));

module.exports = router;