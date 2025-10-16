const express = require('express');
const router = express.Router();
const { createProjectController } = require('../controllers/projects.controller');

// @route   POST api/projects
// @desc    Create a new project
// @access  Public
router.post('/', createProjectController);

module.exports = router;