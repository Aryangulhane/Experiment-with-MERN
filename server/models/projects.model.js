const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @description Schema for the Post collection.
 * Tags are embedded as an array of strings for optimal read performance
 * and efficient indexing with Atlas Search[cite: 199, 200, 201].
 */
const projectSchema = new Schema({
  projectName: { type: String, required: true },
  description: { type: String, required: true },
  // Add fields for your project links and images
  liveUrl: { type: String },
  githubUrl: { type: String },
  imageUrl: { type: String }, // For your project image
  tags: [String], // Keep this for search/categories
}, { timestamps: true });

// REPLACE WITH THIS (correct)
projectSchema.index({ projectName: 'text', description: 'text' });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;