import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cluster from 'cluster';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

// Import modules
import { authRoutes, authenticateToken } from './modules/auth/index.js';
import { tracksRoutes } from './modules/tracks/index.js';
import { galleryRoutes } from './modules/gallery/index.js';
import { pricingRoutes } from './modules/pricing/index.js';
import { dashboardRoutes } from './modules/dashboard/index.js';
import { salesRoutes } from './modules/sales/index.js';
import { contactsRoutes } from './modules/contacts/index.js';
import { paymentRoutes } from './modules/payments/index.js';
import { youtubeRoutes } from './modules/youtube/index.js';
import { tiktokRoutes } from './modules/tiktok/index.js';

// Load environment variables
try {
  dotenv.config();
} catch (error) {
  // dotenv.config() failed
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Determine if running on Vercel
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

// Add global error handler for uncaught errors
process.on('uncaughtException', (error) => {
  // Uncaught exception handled
});

process.on('unhandledRejection', (reason, promise) => {
  // Unhandled rejection handled
});

// CORS Configuration
// Allow requests from frontend URL, Vercel domains, and localhost for development
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://nahid-admin-panel.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or same-origin requests)
      if (!origin) return callback(null, true);

      // Check if origin matches allowed origins
      const isAllowed = allowedOrigins.some((allowed) => {
        if (!allowed) return false;
        // Check exact match or if origin starts with allowed origin
        return origin === allowed || origin.startsWith(allowed);
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        // For Vercel deployments, allow all vercel.app domains (including preview URLs)
        if (process.env.VERCEL || process.env.VERCEL_ENV) {
          // Allow any *.vercel.app domain
          if (origin.includes('.vercel.app')) {
            callback(null, true);
          } else {
            callback(null, true); // Allow all origins on Vercel for flexibility
          }
        } else {
          // Local development: only allow configured origins
          callback(null, true); // For now, allow all in development
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-api-key',
      'X-Requested-With',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
  }),
);
// Increase body size limit to handle base64 images (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Health check - Put this FIRST so it works even if routes fail
app.get('/api/health', (req, res) => {
  try {
    res.json({
      status: 'OK',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      vercel: process.env.VERCEL === '1' || !!process.env.VERCEL_ENV,
      mongodb:
        mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message,
    });
  }
});

// Serve static files from frontend build (only if files exist)
if (!isVercel) {
  // Local development: serve from dist folder
  const staticPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(staticPath));
} else {
  // Vercel: static files are served by Vercel, not Express
  // Only serve if the path exists (for fallback)
  try {
    const staticPath = path.join(__dirname, '../frontend/dist');
    app.use(express.static(staticPath));
  } catch (error) {
    // Static files path not found, Vercel will handle static files
  }
}

// API Routes (with error handling for each route)
try {
  app.use('/api/auth', authRoutes);
} catch (error) {
  // Failed to register auth routes
}

try {
  app.use('/api/tracks', tracksRoutes);
} catch (error) {
  // Failed to register tracks routes
}

try {
  app.use('/api/gallery', galleryRoutes);
} catch (error) {
  // Failed to register gallery routes
}

try {
  app.use('/api/pricing', pricingRoutes);
} catch (error) {
  // Failed to register pricing routes
}

try {
  app.use('/api/sales', salesRoutes);
} catch (error) {
  // Failed to register sales routes
}

try {
  app.use('/api/contacts', contactsRoutes);
} catch (error) {
  // Failed to register contacts routes
}

try {
  app.use('/api/payments', paymentRoutes);
} catch (error) {
  // Failed to register payment routes
}

try {
  app.use('/api/dashboard', dashboardRoutes);
} catch (error) {
  // Failed to register dashboard routes
}

try {
  app.use('/api/youtube', youtubeRoutes);
} catch (error) {
  // Failed to register YouTube routes
}

try {
  app.use('/api/tiktok', tiktokRoutes);
} catch (error) {
  // Failed to register TikTok routes
}

// Cache management endpoints (admin only)
// Use dynamic import to avoid blocking server initialization
try {
  import('./utils/cacheHelper.js')
    .then(({ getCacheStatsHandler, clearCacheHandler }) => {
      // Get cache statistics
      app.get('/api/cache/stats', authenticateToken, getCacheStatsHandler);

      // Clear all cache
      app.post('/api/cache/clear', authenticateToken, clearCacheHandler);
    })
    .catch((error) => {
      // Cache management endpoints not available
    });
} catch (error) {
  // Failed to load cache helper
}

// Swagger API Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Nahid Admin API Documentation',
    customfavIcon: '/favicon.ico',
  }),
);

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Connect to MongoDB (non-blocking for Vercel)
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      // MONGODB_URI not set. MongoDB connection skipped.
      return;
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    // MongoDB connection error - allow app to start even if DB connection fails
    // This prevents the entire function from crashing
  }
};

// Connect to MongoDB (non-blocking)
connectDB();

// Serve React app for all other routes (SPA fallback)
// This allows React Router to handle client-side routing
app.get('*', (req, res, next) => {
  // Skip API routes - they should have been handled above
  if (req.path.startsWith('/api')) {
    return next();
  }

  // Skip static file requests (they should be handled by Vercel or express.static)
  const staticExtensions = [
    '.js',
    '.css',
    '.ico',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
    '.json',
  ];
  if (staticExtensions.some((ext) => req.path.endsWith(ext))) {
    return next();
  }

  // Serve index.html for all other routes (SPA fallback)
  // This allows React Router to handle the routing on the client side
  // On Vercel, static files are in frontend/dist relative to project root
  try {
    // Try different possible paths for index.html
    const possiblePaths = [
      path.join(process.cwd(), 'frontend/dist/index.html'), // From project root (Vercel)
      path.join(__dirname, '../../frontend/dist/index.html'), // From backend/api/
      path.join(__dirname, '../frontend/dist/index.html'), // From backend/
    ];

    let indexPath = null;
    for (const testPath of possiblePaths) {
      try {
        if (fs.existsSync(testPath)) {
          indexPath = testPath;
          break;
        }
      } catch (e) {
        // Continue to next path
      }
    }

    // If found, read and serve it
    if (indexPath) {
      try {
        const htmlContent = fs.readFileSync(indexPath, 'utf-8');
        res.setHeader('Content-Type', 'text/html');
        return res.send(htmlContent);
      } catch (readError) {
        // Fall through to sendFile
        return res.sendFile(indexPath);
      }
    }

    // If not found, serve a generic HTML that will load assets
    // Vercel should serve the actual index.html, but this is a fallback
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nahid Admin Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script>
      // Load the actual index.html from root to get correct asset paths
      fetch('/')
        .then(r => r.text())
        .then(html => {
          document.open();
          document.write(html);
          document.close();
        })
        .catch(() => {
          // If that fails, try to load assets dynamically
          const script = document.createElement('script');
          script.type = 'module';
          script.src = '/assets/index.js';
          document.head.appendChild(script);
        });
    </script>
  </body>
</html>`);
  } catch (error) {
    // Fallback: serve basic HTML structure
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nahid Admin Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`);
  }
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  // Handle specific errors
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      message:
        'Payload too large. Image size exceeds the maximum allowed size (50MB).',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Don't expose internal errors in production
  const isDev =
    process.env.NODE_ENV === 'development' ||
    process.env.VERCEL_ENV === 'development';

  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: isDev ? err.message : undefined,
    ...(isDev && { stack: err.stack }),
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    message: 'API endpoint not found',
    path: req.path,
  });
});

// Only start the server if not in Vercel environment
// In Vercel, the serverless function will handle the app
if (process.env.VERCEL !== '1') {
  const server = app.listen(PORT, () => {
    // Server started
  });

  // Graceful shutdown for worker processes
  if (cluster.isWorker) {
    process.on('SIGTERM', () => {
      server.close(() => {
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      server.close(() => {
        process.exit(0);
      });
    });
  }
}

// Export the app for Vercel serverless functions
export default app;
