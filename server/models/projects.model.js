// server/models/project.model.js
const mongoose = require('mongoose');
const { Schema } = mongoose;
const slugify = require('slugify'); // Import slugify

/**
 * @description Schema for the Project collection.
 * Includes fields for project details, URLs, image, tags, categories, sanityId, and a unique slug.
 */
const projectSchema = new Schema({
  projectName: {
    type: String,
    required: [true, 'Project name is required.'],
    trim: true,
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
  },
  githubUrl: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  tags: {
    type: [String],
    default: [],
    set: (v) => Array.isArray(v) ? v.map(tag => tag.toLowerCase().trim()).filter(Boolean) : [],
  },
  
  // === CRITICAL FIX 1: Unique ID for Sanity Sync ===
  sanityId: {
    type: String,
    required: [true, 'Sanity document ID is required for synchronization.'],
    unique: true, 
    index: true,
    trim: true,
  },

  // === CRITICAL FIX 2: Made optional for sync ===
  // Sanity only sends strings; actual ObjectIDs must be resolved separately if categories are needed.
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category',
    // Removed 'required' validation for webhook compatibility
  }],
  
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
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
  // The 'pre' hook logic remains correct and does not need modification for the new 'sanityId' field.
  if (this.isNew || this.isModified('projectName')) {
    let baseSlug = slugify(this.projectName, { lower: true, strict: true, locale: 'en' });
    let uniqueSlug = baseSlug;
    let counter = 0;

    // Check for uniqueness across the collection, excluding the current document if updating.
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
projectSchema.index({ projectName: 'text', description: 'text', tags: 'text' });


const Project = mongoose.model('Project', projectSchema);

module.exports = Project;