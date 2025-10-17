// server/models/project.model.js
const mongoose = require('mongoose');
const { Schema } = mongoose;
const slugify = require('slugify'); // Import slugify

/**
 * @description Schema for the Project collection.
 * Includes fields for project details, URLs, image, tags, categories, and a unique slug.
 * Categories are referenced from the Category model.
 */
const projectSchema = new Schema({
  projectName: {
    type: String,
    required: [true, 'Project name is required.'], // Custom error message
    trim: true, // Automatically remove whitespace from the beginning/end
    minlength: [3, 'Project name must be at least 3 characters long.'],
    maxlength: [100, 'Project name cannot exceed 100 characters.'],
  },
  description: {
    type: String,
    required: [true, 'Project description is required.'],
    trim: true,
    minlength: [10, 'Project description must be at least 10 characters long.'],
    maxlength: [1000, 'Project description cannot exceed 1000 characters.'],
  },
  liveUrl: {
    type: String,
    trim: true,
    // Add a simple regex validation for URL format if desired
    // match: [/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/, 'Please enter a valid URL for the live demo.'],
  },
  githubUrl: {
    type: String,
    trim: true,
    // match: [/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+(\/.*)?$/, 'Please enter a valid GitHub URL.'],
  },
  imageUrl: {
    type: String,
    trim: true,
    // You might want to store image URLs from Sanity or a CDN
    // match: [/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/, 'Please enter a valid URL for the project image.'],
  },
  tags: {
    type: [String],
    default: [],
    set: (v) => Array.isArray(v) ? v.map(tag => tag.toLowerCase().trim()).filter(Boolean) : [],
  },
  sanityId: { // Add this for reliable upsert logic
        type: String,
        required: true,
        unique: true,
        index: true
  },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category',
   // required: [true, 'At least one category is required for the project.']
  }],
  // --- Correct Placement for Slug Field ---
  slug: {
    type: String,
    unique: true, // Crucial for unique URLs
    lowercase: true,
    trim: true,
    index: true, // Creates an index for faster slug-based lookups
  },
}, {
  timestamps: true,
  collection: 'projects',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// --- Schema Middleware (Pre-Save Hook) ---
projectSchema.pre('save', async function(next) {
  // 1. Sanitize Tags
  if (this.isModified('tags') && Array.isArray(this.tags)) {
    this.tags = this.tags.map(tag => tag.toLowerCase().trim()).filter(Boolean);
  }

  // 2. Trim Project Name and Description
  this.projectName = this.projectName.trim();
  this.description = this.description.trim();

  // 3. Generate Slug (if not already set or if project name is modified)
  if (this.isNew || this.isModified('projectName')) {
    let baseSlug = slugify(this.projectName, { lower: true, strict: true, locale: 'en' });
    let uniqueSlug = baseSlug;
    let counter = 0;

    // Ensure slug uniqueness: Check if a project with this slug already exists
    while (await mongoose.models.Project.exists({ slug: uniqueSlug, _id: { $ne: this._id } })) {
      counter++;
      uniqueSlug = `${baseSlug}-${counter}`;
    }
    this.slug = uniqueSlug;
  }
  next();
});

// --- Virtuals ---
projectSchema.virtual('shortDescription').get(function() {
  return this.description ? this.description.substring(0, 100) + '...' : '';
});

// --- Mongoose Text Index for basic text search ---
// This provides basic text search capabilities within MongoDB itself,
// complementary to your more advanced Atlas Search pipeline.
projectSchema.index({ projectName: 'text', description: 'text', tags: 'text' });


const Project = mongoose.model('Project', projectSchema);

module.exports = Project;