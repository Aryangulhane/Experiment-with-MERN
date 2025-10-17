// server/controllers/projects.controller.js
// const Project = require('../models/project.model'); // No longer directly used in controller
// const Category = require('../models/category.model'); // No longer directly used in controller
const { createProject } = require('../services/projects.service'); // Import the service function
const { validationResult } = require('express-validator'); // For route-level validation errors

/**
 * Controller to handle the creation of a new project.
 * It expects project data in the request body, validates it, and
 * delegates the creation logic to the projects service.
 */
exports.createProjectController = async (req, res) => {
  // 1. --- Check for route-level validation errors ---
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn('⚠️ Project creation validation failed at controller:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      projectName,
      description,
      liveUrl,
      githubUrl,
      imageUrl,
      tags = [],      // Default to empty array for robustness
      categories = [] // Default to empty array for robustness
    } = req.body;

    // 2. --- Delegate project creation to the service layer ---
    // The service will handle tag creation/incrementing, category validation,
    // slug generation, and actual project saving.
    const newProject = await createProject({
      projectName,
      description,
      liveUrl,
      githubUrl,
      imageUrl,
      tags,
      categories,
    });

    // 3. --- Send success response ---
    console.log(`🎉 Project controller successfully created project: ${newProject.projectName}`);
    res.status(201).json(newProject);

  } catch (error) {
    // 4. --- Handle errors from the service layer ---
    console.error('❌ Error in createProjectController:', error.message);

    // Common Mongoose/service errors
    if (error.name === 'ValidationError') { // Mongoose validation error (e.g., minlength, maxlength)
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    if (error.message.includes('required')) { // Catch specific messages from service for user feedback
        return res.status(400).json({ message: error.message });
    }
    if (error.message.includes('Category with ID')) {
        return res.status(400).json({ message: error.message });
    }
    if (error.message.includes('Invalid category ID format')) {
        return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) { // MongoDB duplicate key error (e.g., if slug was unique and duplicate)
      return res.status(409).json({ message: 'A project with similar details already exists.' });
    }

    // Generic server error
    res.status(500).json({
      message: 'Failed to create project due to a server error.',
      error: error.message
    });
  }
};