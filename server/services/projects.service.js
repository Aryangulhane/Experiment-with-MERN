const Post = require('../models/projects.model');
const Tag = require('../models/tag.model');

async function createProject({ projectName, description, liveUrl, githubUrl, imageUrl, tags }) {
  // 1. Handle the tags: find existing ones or create new ones
  const tagOperations = tags.map(tagName => {
    const normalizedName = tagName.toLowerCase().trim();
    // This is an "upsert": update if found, insert if not. It's atomic.
    return Tag.findOneAndUpdate(
      { name: normalizedName }, // Find a tag by its normalized name
      { 
        $setOnInsert: { name: normalizedName }, // If new, set the name
        $inc: { projectCount: 1 } // Increment the post count by 1
      },
      { 
        upsert: true, // Create the doc if it doesn't exist
        new: true     // Return the updated doc
      }
    );
  });

  // Wait for all tag database operations to complete
  await Promise.all(tagOperations);

  // 2. Create the new post with the normalized tag names embedded
  const newProject = new Project({
    title,
    body,
    author: authorId,
    tags: tags.map(t => t.toLowerCase().trim()) // Ensure tags in the post are also clean
  });

  await newProject.save();
  return newProject;
}

module.exports = { createProject };