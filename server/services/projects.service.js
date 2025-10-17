// server/services/projects.service.js
const Project = require('../models/projects.model'); // Assuming your Project model
const Tag = require('../models/tag.model');       // Assuming your Tag model
const Category = require('../models/category.model'); // Assuming your Category model
const slugify = require('slugify');              // Install: npm install slugify

/**
 * Creates a new project, handles associated tags, and ensures category validity.
 *
 * @param {object} projectData - Data for the new project.
 * @param {string} projectData.projectName - The name of the project.
 * @param {string} projectData.description - The description of the project.
 * @param {string} [projectData.liveUrl] - URL for the live demo.
 * @param {string} [projectData.githubUrl] - URL for the GitHub repository.
 * @param {string} [projectData.imageUrl] - URL for the project image.
 * @param {string[]} projectData.tags - An array of tag names (strings).
 * @param {string[]} projectData.categories - An array of category ObjectIDs.
 * @returns {Promise<Project>} The newly created project document.
 * @throws {Error} If categories are invalid/missing, or any database operation fails.
 */
async function createProject({
  projectName,
  description,
  liveUrl,
  githubUrl,
  imageUrl,
  tags = [],         // Default to empty array if not provided
  categories = []     // Default to empty array if not provided
}) {
  try {
    // 1. --- Input Sanitization and Validation (Basic, route handles more) ---
    const sanitizedProjectName = projectName ? projectName.trim() : '';
    const sanitizedDescription = description ? description.trim() : '';

    if (!sanitizedProjectName) throw new Error('Project name is required.');
    if (!sanitizedDescription) throw new Error('Project description is required.');

    // 2. --- Validate and process Categories ---
    if (!categories || categories.length === 0) {
      throw new Error('At least one category is required for the project.');
    }
    // Ensure provided category IDs are valid ObjectId format and actually exist
    const validCategoryIds = [];
    for (const catId of categories) {
      if (!mongoose.Types.ObjectId.isValid(catId)) {
        throw new Error(`Invalid category ID format: ${catId}`);
      }
      const exists = await Category.findById(catId);
      if (!exists) {
        throw new Error(`Category with ID ${catId} not found.`);
      }
      validCategoryIds.push(catId);
    }
    console.log(`✅ Validated categories: ${validCategoryIds.length} found.`);

    // 3. --- Handle Tags: find existing or create new, and update counts ---
    const processedTags = []; // Store normalized tags
    const tagPromises = tags.map(async (tagName) => {
      const normalizedName = tagName.toLowerCase().trim();
      if (!normalizedName) return; // Skip empty tags

      // Use `projectCount` as per your Tag model update
      const tagDoc = await Tag.findOneAndUpdate(
        { name: normalizedName, type: 'tag' }, // Find a tag by its normalized name and type 'tag'
        {
          $setOnInsert: { name: normalizedName, type: 'tag' }, // If new, set name and type
          $inc: { projectCount: 1 } // Increment the project count by 1
        },
        {
          upsert: true, // Create the doc if it doesn't exist
          new: true,    // Return the updated doc
          runValidators: true // Ensure schema validators run on update/insert
        }
      );
      if (tagDoc) processedTags.push(tagDoc.name);
      return tagDoc;
    });

    // Wait for all tag database operations to complete
    await Promise.all(tagPromises);
    console.log(`✅ Processed tags: ${processedTags.length} unique tags.`);

    // 4. --- Generate a SEO-friendly slug ---
    const slug = slugify(sanitizedProjectName, { lower: true, strict: true, locale: 'en' });
    // You might want to add logic here to ensure slug uniqueness if a project with the same name exists

    // 5. --- Create the new project ---
    const newProject = new Project({
      projectName: sanitizedProjectName,
      description: sanitizedDescription,
      liveUrl: liveUrl ? liveUrl.trim() : undefined,
      githubUrl: githubUrl ? githubUrl.trim() : undefined,
      imageUrl: imageUrl ? imageUrl.trim() : undefined,
      tags: processedTags, // Use the processed and existing tags
      categories: validCategoryIds, // Use the validated category IDs
      slug: slug // Add the generated slug
    });

    const savedProject = await newProject.save();
    console.log(`🎉 Project "${savedProject.projectName}" (ID: ${savedProject._id}) created successfully.`);

    return savedProject;

  } catch (error) {
    console.error('❌ Error in createProject service:', error.message);
    // Re-throw the error to be caught by the controller
    throw error;
  }
}

module.exports = { createProject };