// 1. Import required packages
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// --- Import Route Files ---
const projectsRoutes = require('./routes/projects.routes.js');
const tagsRoutes = require('./routes/tags.routes.js');
const searchRoutes = require('./routes/search.routes.js');
const suggestionsRoutes = require('./routes/suggestions.routes.js');
const categoriesRoutes = require('./routes/categories.routes.js');
// server/index.js
const webhookRoutes = require('./routes/webhook.routes'); // Assuming you put it here
app.use('/api', webhookRoutes); // Or whatever your base route is

// 2. Create an Express application
const app = express();
const PORT = 5000;

// 3. Connect to MongoDB
const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(() => console.log('MongoDB database connection established successfully!'))
  .catch(err => console.log(err));

// 4. Apply middleware
app.use(cors());
app.use(express.json());

// --- Use Routes ---
app.use('/api/projects', projectsRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/categories', categoriesRoutes);

// We are removing the old test route from here
// app.get('/', (req, res) => { ... });

// 6. Start the server and listen for connections
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});