const postService = require('../services/projects.service');

const createProjectController = async (req, res) => {
  try { 
    const { title, body, tags } = req.body;
    
    // For now, we'll hardcode an author ID.
    // Later, this would come from a logged-in user.
    const authorId = '666d633558133591993213c8'; // IMPORTANT: Replace with a valid ObjectId for testing

    const project = await postService.createProject({ title, body, authorId, tags });
    
    res.status(201).json(project); // 201 means "Created"
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};

module.exports = { createProjectController };