// server/models/category.model.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Category name is required.'],
    unique: true, // Ensure category names are unique
    trim: true,
    lowercase: true, // Store categories in lowercase for consistent querying
    minlength: [2, 'Category name must be at least 2 characters long.'],
    maxlength: [50, 'Category name cannot exceed 50 characters.'],
  },
}, {
  timestamps: true,
  collection: 'categories',
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;