// server/services/categories.service.js
const Tag = require('../models/tag.model'); // Assuming Tag model is used for categories

/**
 * Creates a new category.
 * It ensures the category name is unique and sets its type.
 *
 * @param {object} categoryData - Object containing category name and optional description.
 * @param {string} categoryData.name - The name of the category (required).
 * @param {string} [categoryData.description] - An optional description for the category.
 * @returns {Promise<Tag>} The newly created category document.
 * @throws {Error} If the category name already exists or any other database error occurs.
 */
const createCategory = async ({ name, description }) => {
  try {
    // 1. Basic validation (though most should be handled by schema/route validation)
    if (!name || name.trim() === '') {
      throw new Error('Category name cannot be empty.');
    }

    // 2. Check for existing category with the same name (case-insensitive due to schema lowercase)
    const existingCategory = await Tag.findOne({ name: name.toLowerCase().trim(), type: 'category' });
    if (existingCategory) {
      console.warn(`⚠️ Attempted to create duplicate category: "${name}"`);
      throw new Error(`Category "${name}" already exists.`);
    }

    // 3. Create and save the new category
    const newCategory = new Tag({
      name: name.trim(), // Trim name again for safety
      description: description ? description.trim() : undefined, // Trim description if present
      type: 'category' // Explicitly set type as 'category'
    });

    const savedCategory = await newCategory.save();
    console.log(`✅ Category "${savedCategory.name}" created successfully.`);
    return savedCategory;

  } catch (error) {
    console.error('❌ Error creating category:', error.message);
    // Re-throw the error to be caught by the controller
    throw error;
  }
};

/**
 * Retrieves all categories from the database.
 * Categories are sorted alphabetically by name.
 *
 * @returns {Promise<Tag[]>} An array of category documents.
 * @throws {Error} If any database error occurs during retrieval.
 */
const getAllCategories = async () => {
  try {
    const categories = await Tag.find({ type: 'category' })
                                  .sort({ name: 1 }) // Sort alphabetically by name
                                  .lean(); // Use .lean() for faster read operations if no Mongoose methods are needed
    console.log(`✅ Retrieved ${categories.length} categories.`);
    return categories;
  } catch (error) {
    console.error('❌ Error retrieving all categories:', error.message);
    // Re-throw the error to be caught by the controller
    throw error;
  }
};

module.exports = { createCategory, getAllCategories };