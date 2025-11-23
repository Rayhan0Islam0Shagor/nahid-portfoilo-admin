// Vercel Serverless Function Handler
// This file wraps the Express app for Vercel deployment
import app from '../backend/server.js';

// Export the Express app as a serverless function
// @vercel/node will automatically handle the Express app
export default app;
