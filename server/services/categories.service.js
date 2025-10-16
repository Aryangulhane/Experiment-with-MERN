const Tag = require('../models/tag.model');

const createCategory = async ({ name, description }) => {
  const newCategory = new Tag({
    name,
    description,
    type: 'category' // This is the key part
  });
  await newCategory.save();
  return newCategory;
};

const getAllCategories = async () => {
  // Find all documents in the tags collection where the type is 'category'
  return await Tag.find({ type: 'category' }).sort({ name: 1 });
};

module.exports = { createCategory, getAllCategories };