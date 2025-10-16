const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * @description Schema for the canonical Tag collection.
 * This collection serves as the master list for all tags and categories,
 * ensuring data integrity and providing metadata[cite: 161, 162].
 */
const tagSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,      // Ensures no duplicate tags [cite: 167, 168]
    lowercase: true,   // Normalizes all tags to lowercase [cite: 170, 171]
    trim: true         // Removes leading/trailing whitespace [cite: 172, 173]
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['tag', 'category'], // Restricts this field to one of two values [cite: 181]
    default: 'tag'
  },
  postCount: {
    type: Number,
    default: 0 // A counter for how many posts use this tag [cite: 185, 188]
  }
});

// Create an index to speed up searches for tags by name [cite: 190]
tagSchema.index({ name: 1 });

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;