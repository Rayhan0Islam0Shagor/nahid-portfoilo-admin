import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nahid Admin API',
      version: '1.0.0',
      description:
        'API documentation for Nahid Admin Dashboard. This API provides endpoints for managing tracks, gallery, pricing, sales, and authentication.\n\n' +
        '## Access Levels\n\n' +
        '- **🔒 ADMIN ONLY**: Requires admin authentication (JWT token)\n' +
        '- **🌐 PUBLIC**: Public endpoint, accessible without authentication (optional API key/origin check)\n' +
        '- **👤 PURCHASED USER**: Requires purchase verification (email or purchase token)\n\n' +
        '## Authentication\n\n' +
        '- **Admin endpoints**: Use JWT token from `/api/auth/login` in Authorization header: `Bearer <token>`\n' +
        '- **Public endpoints**: Optional API key in header `x-api-key` or query parameter `?apiKey=your-key`\n' +
        '- **Purchase verification**: Provide buyer email or purchase token for audio access',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : process.env.API_URL || 'http://localhost:5000',
        description: process.env.VERCEL_URL
          ? 'Production server (Vercel)'
          : 'Development server',
      },
      ...(process.env.VERCEL_URL
        ? []
        : [
            {
              url: 'http://localhost:5000',
              description: 'Local development server',
            },
          ]),
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'JWT token obtained from /api/auth/login endpoint. Include in Authorization header as: Bearer <token>',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description:
            'Optional API key for public endpoints. Can also be passed as query parameter: ?apiKey=your-key',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
            error: {
              type: 'string',
              description: 'Detailed error (only in development)',
            },
          },
        },
        Track: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Track ID',
            },
            thumbnail: {
              type: 'string',
              format: 'uri',
              description: 'Thumbnail image URL (Cloudinary)',
            },
            title: {
              type: 'string',
              description: 'Track title',
            },
            audio: {
              type: 'string',
              format: 'uri',
              description:
                'Audio file URL (only visible to admins in public APIs)',
            },
            previewAudio: {
              type: 'string',
              format: 'uri',
              description:
                'Preview/short audio file URL (required, publicly accessible for playback)',
            },
            releaseDate: {
              type: 'string',
              format: 'date',
              description: 'Release date (YYYY-MM-DD)',
            },
            price: {
              type: 'number',
              description: 'Price in BDT (৳)',
            },
            category: {
              type: 'string',
              enum: [
                'Rock',
                'Folk',
                'Hip-Hop',
                'Jazz & Blues',
                'Modern Song',
                'Classical',
              ],
              description: 'Track category',
            },
            views: {
              type: 'number',
              description: 'Number of times the track has been viewed',
              default: 0,
            },
            saleCount: {
              type: 'number',
              description: 'Total number of completed sales for this track',
              default: 0,
            },
            totalSoldPrice: {
              type: 'number',
              description: 'Total revenue from all completed sales (in BDT)',
              default: 0,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Gallery: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Image ID',
            },
            src: {
              type: 'string',
              format: 'uri',
              description: 'Image URL (Cloudinary)',
            },
            height: {
              type: 'string',
              enum: ['small', 'medium', 'large', 'xlarge'],
              description: 'Image height category',
            },
            caption: {
              type: 'string',
              description: 'Image caption (supports multi-line)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Pricing: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Pricing plan ID',
            },
            title: {
              type: 'string',
              description: 'Plan title',
            },
            price: {
              type: 'number',
              description: 'Price in BDT (৳)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Sale: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Sale ID',
            },
            trackId: {
              type: 'string',
              description: 'Track ID (reference)',
            },
            trackTitle: {
              type: 'string',
              description: 'Track title',
            },
            price: {
              type: 'number',
              description: 'Sale price',
            },
            saleSerialId: {
              type: 'string',
              description: 'Sale serial ID (Order ID) for tracking',
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'completed', 'failed', 'refunded'],
              description: 'Payment status',
            },
            paymentMethod: {
              type: 'string',
              description: 'Payment method',
            },
            transactionId: {
              type: 'string',
              description: 'Purchase token/transaction ID',
            },
            purchaseToken: {
              type: 'string',
              description: 'Purchase token (returned on creation)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            name: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['admin', 'user'],
            },
          },
        },
        Contact: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Contact ID',
            },
            name: {
              type: 'string',
              description: 'Contact name',
              maxLength: 100,
            },
            phoneNumber: {
              type: 'string',
              description: 'Phone number',
              maxLength: 20,
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address',
            },
            subject: {
              type: 'string',
              description: 'Message subject',
              maxLength: 200,
            },
            message: {
              type: 'string',
              description: 'Message content',
              maxLength: 5000,
            },
            isRead: {
              type: 'boolean',
              description: 'Whether the contact has been read',
              default: false,
            },
            readAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date when contact was marked as read',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        DashboardStats: {
          type: 'object',
          properties: {
            totalTracks: {
              type: 'number',
              description: 'Total number of tracks',
            },
            totalTracksSold: {
              type: 'number',
              description: 'Total number of tracks sold',
            },
            totalProfit: {
              type: 'number',
              description: 'Total profit from sales',
            },
            totalImages: {
              type: 'number',
              description: 'Total number of gallery images',
            },
            totalPricingPlans: {
              type: 'number',
              description: 'Total number of pricing plans',
            },
            totalContacts: {
              type: 'number',
              description: 'Total number of contacts',
            },
            unreadContacts: {
              type: 'number',
              description: 'Number of unread contacts',
            },
          },
        },
        YouTubeVideo: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Video ID',
            },
            videoUrl: {
              type: 'string',
              format: 'uri',
              description: 'YouTube video URL',
            },
            title: {
              type: 'string',
              description: 'Video title',
            },
            description: {
              type: 'string',
              description: 'Video description',
            },
            thumbnail: {
              type: 'string',
              format: 'uri',
              description: 'Custom thumbnail URL (optional)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        TikTokVideo: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Video ID',
            },
            videoUrl: {
              type: 'string',
              format: 'uri',
              description: 'TikTok video URL (Cloudinary)',
            },
            title: {
              type: 'string',
              description: 'Video title',
            },
            description: {
              type: 'string',
              description: 'Video description',
            },
            thumbnail: {
              type: 'string',
              format: 'uri',
              description: 'Auto-generated thumbnail URL',
            },
            tiktokLink: {
              type: 'string',
              format: 'uri',
              description: 'TikTok video link URL',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Authentication endpoints (login/logout) - 🔒 ADMIN ONLY',
      },
      {
        name: 'Tracks',
        description:
          'Track management endpoints - 🌐 PUBLIC (GET) / 🔒 ADMIN (POST/PUT/DELETE)',
      },
      {
        name: 'Gallery',
        description:
          'Gallery/image management endpoints - 🌐 PUBLIC (GET) / 🔒 ADMIN (POST/PUT/DELETE)',
      },
      {
        name: 'Pricing',
        description:
          'Pricing plan management endpoints - 🌐 PUBLIC (GET) / 🔒 ADMIN (POST/PUT/DELETE)',
      },
      {
        name: 'Sales',
        description:
          'Sales and purchase management endpoints - 🌐 PUBLIC (POST) / 🔒 ADMIN (GET/PUT/DELETE)',
      },
      {
        name: 'Dashboard',
        description: 'Dashboard statistics endpoints - 🔒 ADMIN ONLY',
      },
      {
        name: 'Contacts',
        description:
          'Contact form endpoints - 🌐 PUBLIC (POST) / 🔒 ADMIN (GET/PUT/DELETE)',
      },
      {
        name: 'Payments',
        description:
          'Payment gateway endpoints - 🌐 PUBLIC (POST/GET) / 🔒 ADMIN (POST refund)',
      },
      {
        name: 'YouTube',
        description:
          'YouTube video management endpoints - 🌐 PUBLIC (GET) / 🔒 ADMIN (POST/PUT/DELETE)',
      },
      {
        name: 'TikTok',
        description:
          'TikTok video management endpoints - 🌐 PUBLIC (GET) / 🔒 ADMIN (POST/PUT/DELETE)',
      },
    ],
  },
  // Use absolute paths with glob patterns to ensure swagger-jsdoc can find the files
  // swagger-jsdoc supports glob patterns, so we use ** to match all subdirectories
  apis: [
    path.join(__dirname, '../modules/**/*.js').replace(/\\/g, '/'), // Normalize path separators
    path.join(__dirname, '../server.js').replace(/\\/g, '/'),
  ],
};

// Generate swagger spec
let swaggerSpec;
try {
  swaggerSpec = swaggerJsdoc(options);

  // Add /api prefix to all paths since routes are mounted at /api/*
  if (swaggerSpec.paths) {
    const prefixedPaths = {};
    for (const [path, pathItem] of Object.entries(swaggerSpec.paths)) {
      // Only add /api prefix if it doesn't already exist
      const prefixedPath = path.startsWith('/api') ? path : `/api${path}`;
      prefixedPaths[prefixedPath] = pathItem;
    }
    swaggerSpec.paths = prefixedPaths;
  }
} catch (error) {
  // Swagger spec generation failed
  // Return empty spec to prevent app crash
  swaggerSpec = {
    openapi: '3.0.0',
    info: options.definition.info,
    paths: {},
  };
}

export { swaggerSpec };
