const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @description Schema for the canonical Tag collection.
 * This collection serves as the master list for all tags and categories,
 * ensuring data integrity and providing metadata.
 */
const tagSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Tag name is required.'], // Custom error message
    unique: true,      // Ensures no duplicate tags like 'react' and 'React'
    lowercase: true,   // Normalizes all tags to lowercase
    trim: true,        // Removes leading/trailing whitespace
    minlength: [2, 'Tag name must be at least 2 characters long.'],
    maxlength: [50, 'Tag name cannot exceed 50 characters.'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [280, 'Description cannot exceed 280 characters.'],
  },
  type: {
    type: String,
    enum: {
      values: ['tag', 'category'], // Restricts this field to one of two values
      message: '{VALUE} is not a supported type. Must be "tag" or "category".' // Custom enum error
    },
    default: 'tag',
    required: true,
  },
  postCount: {
    type: Number,
    default: 0,      // A counter for how many posts use this tag
    min: 0,          // Ensures the count can't be negative
  },
  // Automatically add a createdAt timestamp
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true, // Prevents this field from being updated
  },
}, {
  // Schema options to explicitly name the collection and add `updatedAt`
  collection: 'tags',
  timestamps: { updatedAt: true } // Add `updatedAt` automatically, `createdAt` handled above
});

// A standard MongoDB index on 'name' to speed up searches
tagSchema.index({ name: 1 });
// A compound index to efficiently find tags of a certain type, sorted by popularity
tagSchema.index({ type: 1, postCount: -1 });

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;