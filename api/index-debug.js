// Debug version to identify which module is failing
import express from 'express';

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check - should work even if nothing else does
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Debug server is running',
    timestamp: new Date().toISOString(),
  });
});

// Test endpoint to check imports one by one
app.get('/api/test-imports', async (req, res) => {
  const results = {};

  // Test each import
  try {
    const dotenv = await import('dotenv');
    results.dotenv = 'OK';
  } catch (e) {
    results.dotenv = `FAILED: ${e.message}`;
  }

  try {
    const mongoose = await import('mongoose');
    results.mongoose = 'OK';
  } catch (e) {
    results.mongoose = `FAILED: ${e.message}`;
  }

  try {
    const cors = await import('cors');
    results.cors = 'OK';
  } catch (e) {
    results.cors = `FAILED: ${e.message}`;
  }

  try {
    const serverModule = await import('../backend/server.js');
    results.server = 'OK';
  } catch (e) {
    results.server = `FAILED: ${e.message}`;
    results.serverStack = e.stack;
  }

  res.json(results);
});

export default app;
