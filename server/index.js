// server/index.js

// 1. Import required packages
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

// --- Security Middleware ---
const helmet = require('helmet'); // Helps secure your Express apps by setting various HTTP headers
const rateLimit = require('express-rate-limit'); // Basic rate-limiting middleware to prevent abuse
//const xss = require('xss-clean'); // Sanitizes user input coming from POST body, GET queries, and URL params

// --- Import Route Files ---
const projectsRoutes = require('./routes/projects.routes');
const tagsRoutes = require('./routes/tags.routes');
const searchRoutes = require('./routes/search.routes');
const suggestionsRoutes = require('./routes/suggestions.routes');
const categoriesRoutes = require('./routes/categories.routes');
const webhookRoutes = require('./routes/webhook.routes'); // Assuming you've created this for webhooks

// --- Import Custom Error Handling Middleware (optional but recommended) ---
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// 2. Create an Express application
const app = express();
const PORT = process.env.PORT || 5000; // Use environment variable for PORT, default to 5000

// 3. Connect to MongoDB
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('FATAL ERROR: MONGODB_URI is not defined in environment variables.');
  process.exit(1); // Exit the process with an error code
}

mongoose.connect(uri)
  .then(() => console.log('✅ MongoDB database connection established successfully!'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    // Optionally, exit the application if DB connection is critical
    process.exit(1);
  });

// 4. Apply Global Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*', // Restrict CORS to your frontend domain in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // If you're using cookies/sessions
}));

// Security Middleware
app.use(helmet()); // Set security-related HTTP headers
//app.use(xss());    // Sanitize user input

// Rate Limiting (apply to all requests or specific routes)
// 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});
app.use(limiter); // Apply to all requests

// Body Parser Middleware (must be before routes that use req.body)
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// --- Define Routes ---
app.use('/api/projects', projectsRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/webhooks', webhookRoutes); // Typically /api/webhooks or similar specific path

// --- Catch-all for undefined routes (404 Not Found) ---
// This middleware should be placed AFTER all valid routes
//app.use(notFound);

// --- Global Error Handling Middleware ---
// This middleware should be placed LAST
//app.use(errorHandler);

// 5. Start the server and listen for connections
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📡 Connected to MongoDB at: ${uri.split('@')[1] ? uri.split('@')[1].split('/')[0] : 'local'}`); // Basic URI redaction for log
  console.log('----------------------------------------------------');
});

// --- Graceful Shutdown ---
// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err, origin) => {
  console.error(`❌ Uncaught Exception: ${err.message}, Origin: ${origin}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle SIGTERM (e.g., from `kill` command or orchestrators like Kubernetes)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received. Shutting down gracefully.');
  server.close(() => {
    mongoose.connection.close(false, () => { // false means no force close in-progress operations
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('👋 SIGINT signal received. Shutting down gracefully.');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});