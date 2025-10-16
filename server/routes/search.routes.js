const express = require('express');
const router = express.Router();
const { searchPostsController } = require('../controllers/search.controller');

// @route   GET api/search
// @desc    Search for posts by text and/or tags
// @access  Public
router.get('/', searchPostsController);

module.exports = router;