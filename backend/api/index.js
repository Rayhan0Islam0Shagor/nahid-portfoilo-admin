// Vercel Serverless Function Handler
// This file wraps the Express app for Vercel deployment
// Located in backend/ so it can access backend/node_modules
import app from '../server.js';

// Export the Express app as a serverless function
// @vercel/node will automatically handle the Express app
export default app;
