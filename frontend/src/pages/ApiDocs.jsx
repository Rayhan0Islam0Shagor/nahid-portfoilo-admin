import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

// Static API documentation - Public routes only
const API_DOCS = {
  info: {
    title: 'Nahid Public API',
    version: '1.0.0',
    description:
      'Public API documentation for Nahid Admin Dashboard. This API provides public endpoints for accessing tracks, gallery, pricing, sales, contacts, and payments.\n\n' +
      '## Access Levels\n\n' +
      '- **🌐 PUBLIC**: Public endpoint, accessible without authentication (optional API key/origin check)\n' +
      '- **👤 PURCHASED USER**: Requires purchase verification (email or purchase token)\n\n' +
      '## Authentication\n\n' +
      '- **Public endpoints**: Optional API key in header `x-api-key` or query parameter `?apiKey=your-key`\n' +
      '- **Purchase verification**: Provide buyer email or purchase token for audio access',
  },
  tags: [
    {
      name: 'Tracks',
      description:
        'Track endpoints - 🌐 PUBLIC (GET) / 👤 PURCHASED USER (audio access)',
    },
    {
      name: 'Gallery',
      description: 'Gallery/image endpoints - 🌐 PUBLIC',
    },
    {
      name: 'Pricing',
      description: 'Pricing plan endpoints - 🌐 PUBLIC',
    },
    {
      name: 'Sales',
      description: 'Sales and purchase endpoints - 🌐 PUBLIC',
    },
    {
      name: 'Contacts',
      description: 'Contact form endpoints - 🌐 PUBLIC',
    },
    {
      name: 'Payments',
      description: 'Payment gateway endpoints - 🌐 PUBLIC',
    },
    {
      name: 'YouTube',
      description: 'YouTube video endpoints - 🌐 PUBLIC',
    },
    {
      name: 'TikTok',
      description: 'TikTok video endpoints - 🌐 PUBLIC',
    },
  ],
  paths: {
    '/api/tracks': {
      get: {
        summary: 'Get all tracks',
        description:
          '**Access Level: 🌐 PUBLIC**\n\nGet all tracks with optional category filtering.\n- **Public users**: Audio URLs are hidden for security\n- **Admin users**: Audio URLs are included in response',
        tags: ['Tracks'],
        parameters: [
          {
            name: 'category',
            in: 'query',
            schema: {
              type: 'string',
              enum: [
                'Rock',
                'Folk',
                'Hip-Hop',
                'Jazz & Blues',
                'Modern Song',
                'Classical',
              ],
            },
            description: 'Filter tracks by category',
          },
        ],
        responses: {
          200: {
            description: 'List of tracks',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      thumbnail: { type: 'string', format: 'uri' },
                      title: { type: 'string' },
                      releaseDate: { type: 'string', format: 'date' },
                      price: { type: 'number' },
                      category: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/tracks/{id}': {
      get: {
        summary: 'Get single track',
        description:
          '**Access Level: 🌐 PUBLIC**\n\nGet a single track by ID.\n- **Public users**: Audio URL is hidden\n- **Admin users**: Audio URL is included',
        tags: ['Tracks'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Track ID',
          },
        ],
        responses: {
          200: { description: 'Track details' },
          404: { description: 'Track not found' },
        },
      },
      put: {
        summary: 'Update track',
        description: '**Access Level: 🔒 ADMIN ONLY**\n\nUpdate a track by ID.',
        tags: ['Tracks'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  thumbnail: { type: 'string', format: 'uri' },
                  audio: { type: 'string', format: 'uri' },
                  releaseDate: { type: 'string', format: 'date' },
                  price: { type: 'number' },
                  category: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Track updated successfully' },
          404: { description: 'Track not found' },
        },
      },
      delete: {
        summary: 'Delete track',
        description: '**Access Level: 🔒 ADMIN ONLY**\n\nDelete a track by ID.',
        tags: ['Tracks'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Track deleted successfully' },
          404: { description: 'Track not found' },
        },
      },
    },
    '/api/tracks/{id}/audio': {
      get: {
        summary: 'Get audio file URL',
        description:
          '**Access Level: 👤 PURCHASED USER**\n\nGet audio file URL. Requires purchase verification (email or purchase token).',
        tags: ['Tracks'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Track ID',
          },
          {
            name: 'email',
            in: 'query',
            schema: { type: 'string', format: 'email' },
            description: 'Buyer email (for purchase verification)',
          },
          {
            name: 'token',
            in: 'query',
            schema: { type: 'string' },
            description: 'Purchase token (for purchase verification)',
          },
        ],
        responses: {
          200: {
            description: 'Audio URL with expiration',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    audioUrl: { type: 'string', format: 'uri' },
                    expiresAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          401: { description: 'Purchase verification required' },
          403: { description: 'Access denied - purchase required' },
        },
      },
    },
    '/api/tracks/{id}/audio/stream': {
      get: {
        summary: 'Stream audio file',
        description:
          '**Access Level: 👤 PURCHASED USER**\n\nStream audio file through server proxy. Requires purchase verification (email or purchase token).',
        tags: ['Tracks'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Track ID',
          },
          {
            name: 'email',
            in: 'query',
            schema: { type: 'string', format: 'email' },
            description: 'Buyer email (for purchase verification)',
          },
          {
            name: 'token',
            in: 'query',
            schema: { type: 'string' },
            description: 'Purchase token (for purchase verification)',
          },
        ],
        responses: {
          200: {
            description: 'Audio stream',
            content: {
              'audio/mpeg': { schema: { type: 'string', format: 'binary' } },
            },
          },
          401: { description: 'Purchase verification required' },
          403: { description: 'Access denied - purchase required' },
        },
      },
    },
    '/api/gallery': {
      get: {
        summary: 'Get all gallery images',
        description: '**Access Level: 🌐 PUBLIC**\n\nGet all gallery images.',
        tags: ['Gallery'],
        responses: {
          200: {
            description: 'List of images',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      src: { type: 'string', format: 'uri' },
                      height: {
                        type: 'string',
                        enum: ['small', 'medium', 'large', 'xlarge'],
                      },
                      caption: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create gallery image entry',
        description:
          '**Access Level: 🔒 ADMIN ONLY**\n\nCreate a new gallery image entry. Image must be uploaded first using /upload endpoint.',
        tags: ['Gallery'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['src'],
                properties: {
                  src: {
                    type: 'string',
                    format: 'uri',
                    description: 'Image URL from /gallery/upload',
                  },
                  height: {
                    type: 'string',
                    enum: ['small', 'medium', 'large', 'xlarge'],
                    default: 'medium',
                  },
                  caption: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Image created successfully' },
        },
      },
    },
    '/api/gallery/upload': {
      post: {
        summary: 'Upload gallery image',
        description:
          '**Access Level: 🔒 ADMIN ONLY**\n\nUpload an image file. Returns Cloudinary URL.',
        tags: ['Gallery'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: {
                  image: {
                    type: 'string',
                    format: 'binary',
                    description: 'Image file (max 10MB)',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Image uploaded successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    url: { type: 'string', format: 'uri' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/gallery/{id}': {
      get: {
        summary: 'Get single image',
        description:
          '**Access Level: 🌐 PUBLIC**\n\nGet a single gallery image by ID.',
        tags: ['Gallery'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Image details' },
          404: { description: 'Image not found' },
        },
      },
      put: {
        summary: 'Update gallery image',
        description:
          '**Access Level: 🔒 ADMIN ONLY**\n\nUpdate a gallery image by ID.',
        tags: ['Gallery'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  src: { type: 'string', format: 'uri' },
                  height: {
                    type: 'string',
                    enum: ['small', 'medium', 'large', 'xlarge'],
                  },
                  caption: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Image updated successfully' },
          404: { description: 'Image not found' },
        },
      },
      delete: {
        summary: 'Delete gallery image',
        description:
          '**Access Level: 🔒 ADMIN ONLY**\n\nDelete a gallery image by ID.',
        tags: ['Gallery'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Image deleted successfully' },
          404: { description: 'Image not found' },
        },
      },
    },
    '/api/pricing': {
      get: {
        summary: 'Get all pricing plans',
        description: '**Access Level: 🌐 PUBLIC**\n\nGet all pricing plans.',
        tags: ['Pricing'],
        responses: {
          200: {
            description: 'List of pricing plans',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      title: { type: 'string' },
                      price: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create pricing plan',
        description:
          '**Access Level: 🔒 ADMIN ONLY**\n\nCreate a new pricing plan.',
        tags: ['Pricing'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'price'],
                properties: {
                  title: { type: 'string' },
                  price: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Pricing plan created successfully' },
        },
      },
    },
    '/api/pricing/{id}': {
      get: {
        summary: 'Get single pricing plan',
        description:
          '**Access Level: 🌐 PUBLIC**\n\nGet a single pricing plan by ID.',
        tags: ['Pricing'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Pricing plan details' },
          404: { description: 'Pricing plan not found' },
        },
      },
      put: {
        summary: 'Update pricing plan',
        description:
          '**Access Level: 🔒 ADMIN ONLY**\n\nUpdate a pricing plan by ID.',
        tags: ['Pricing'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  price: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Pricing plan updated successfully' },
          404: { description: 'Pricing plan not found' },
        },
      },
      delete: {
        summary: 'Delete pricing plan',
        description:
          '**Access Level: 🔒 ADMIN ONLY**\n\nDelete a pricing plan by ID.',
        tags: ['Pricing'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Pricing plan deleted successfully' },
          404: { description: 'Pricing plan not found' },
        },
      },
    },
    '/api/youtube': {
      get: {
        summary: 'Get all YouTube videos',
        description:
          '**Access Level: 🌐 PUBLIC**\n\nGet all YouTube videos. Public endpoint with optional API key or origin check.',
        tags: ['YouTube'],
        responses: {
          200: {
            description: 'List of YouTube videos',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      videoUrl: { type: 'string', format: 'uri' },
                      title: { type: 'string' },
                      description: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/tiktok': {
      get: {
        summary: 'Get all TikTok videos',
        description:
          '**Access Level: 🌐 PUBLIC**\n\nGet all TikTok videos. Public endpoint with optional API key or origin check.',
        tags: ['TikTok'],
        responses: {
          200: {
            description: 'List of TikTok videos',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      videoUrl: { type: 'string', format: 'uri' },
                      title: { type: 'string' },
                      description: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/sales': {
      get: {
        summary: 'Get all sales',
        description:
          '**Access Level: 🔒 ADMIN ONLY**\n\nGet all sales records.',
        tags: ['Sales'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of sales',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      trackId: { type: 'string' },
                      trackTitle: { type: 'string' },
                      price: { type: 'number' },
                      buyerEmail: { type: 'string', format: 'email' },
                      buyerName: { type: 'string' },
                      paymentStatus: {
                        type: 'string',
                        enum: ['pending', 'completed', 'failed', 'refunded'],
                      },
                      paymentMethod: { type: 'string' },
                      transactionId: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create sale - Purchase track',
        description:
          '**Access Level: 🌐 PUBLIC**\n\nCreate a sale record for track purchase. Returns a purchase token.',
        tags: ['Sales'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['trackId', 'buyerEmail'],
                properties: {
                  trackId: {
                    type: 'string',
                    description: 'Track ID to purchase',
                  },
                  buyerEmail: { type: 'string', format: 'email' },
                  buyerName: { type: 'string' },
                  paymentMethod: { type: 'string' },
                  transactionId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Sale created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    purchaseToken: {
                      type: 'string',
                      description: 'Purchase token for accessing audio',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/sales/track/{trackId}': {
      get: {
        summary: 'Get sales by track',
        description:
          '**Access Level: 🔒 ADMIN ONLY**\n\nGet all sales records for a specific track.',
        tags: ['Sales'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'trackId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Track ID',
          },
        ],
        responses: {
          200: { description: 'List of sales for the track' },
        },
      },
    },
    '/api/sales/{id}': {
      get: {
        summary: 'Get single sale',
        description:
          '**Access Level: 🔒 ADMIN ONLY**\n\nGet a single sale record by ID.',
        tags: ['Sales'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Sale ID',
          },
        ],
        responses: {
          200: { description: 'Sale details' },
          404: { description: 'Sale not found' },
        },
      },
      put: {
        summary: 'Update sale',
        description: '**Access Level: 🔒 ADMIN ONLY**\n\nUpdate a sale record.',
        tags: ['Sales'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  paymentStatus: {
                    type: 'string',
                    enum: ['pending', 'completed', 'failed', 'refunded'],
                  },
                  paymentMethod: { type: 'string' },
                  transactionId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Sale updated successfully' },
          404: { description: 'Sale not found' },
        },
      },
      delete: {
        summary: 'Delete sale',
        description:
          '**Access Level: 🔒 ADMIN ONLY**\n\nDelete a sale record by ID.',
        tags: ['Sales'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Sale deleted successfully' },
          404: { description: 'Sale not found' },
        },
      },
    },
    '/api/dashboard/stats': {
      get: {
        summary: 'Get dashboard statistics',
        description:
          '**Access Level: 🔒 ADMIN ONLY**\n\nGet dashboard statistics including total tracks, sales, profit, images, pricing plans, and contacts.',
        tags: ['Dashboard'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Dashboard statistics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalTracks: { type: 'number' },
                    totalTracksSold: { type: 'number' },
                    totalProfit: { type: 'number' },
                    totalImages: { type: 'number' },
                    totalPricingPlans: { type: 'number' },
                    totalContacts: { type: 'number' },
                    unreadContacts: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/dashboard/sales-stats': {
      get: {
        summary: 'Get sales statistics',
        description:
          '**Access Level: 🔒 ADMIN ONLY**\n\nGet detailed sales statistics including sales by date, track, payment method, and status.',
        tags: ['Dashboard'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'days',
            in: 'query',
            schema: { type: 'integer', default: 30 },
            description: 'Number of days to analyze',
          },
        ],
        responses: {
          200: { description: 'Sales statistics' },
        },
      },
    },
    '/api/dashboard/payment-history': {
      get: {
        summary: 'Get payment history',
        description:
          '**Access Level: 🔒 ADMIN ONLY**\n\nGet recent payment history with pagination.',
        tags: ['Dashboard'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20 },
            description: 'Number of records to return',
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Page number',
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['pending', 'completed', 'failed', 'refunded'],
            },
            description: 'Filter by payment status',
          },
        ],
        responses: {
          200: { description: 'Payment history' },
        },
      },
    },
    '/api/contacts': {
      post: {
        summary: 'Submit contact form',
        description:
          '**Access Level: 🌐 PUBLIC**\n\nSubmit a contact form. All inputs are sanitized to prevent XSS and injection attacks.',
        tags: ['Contacts'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: [
                  'name',
                  'phoneNumber',
                  'email',
                  'subject',
                  'message',
                ],
                properties: {
                  name: { type: 'string', maxLength: 100, example: 'John Doe' },
                  phoneNumber: {
                    type: 'string',
                    maxLength: 20,
                    example: '+1234567890',
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'john@example.com',
                  },
                  subject: {
                    type: 'string',
                    maxLength: 200,
                    example: 'Inquiry about services',
                  },
                  message: {
                    type: 'string',
                    maxLength: 5000,
                    example: 'I would like to know more about your services.',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Contact form submitted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: { type: 'object' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error' },
        },
      },
      get: {
        summary: 'Get all contacts',
        description:
          '**Access Level: 🔒 ADMIN ONLY**\n\nGet all contact form submissions. Supports filtering by read/unread status.',
        tags: ['Contacts'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'isRead',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Filter by read status (true/false)',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 50 },
            description: 'Maximum number of contacts to return',
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Page number for pagination',
          },
        ],
        responses: {
          200: {
            description: 'List of contacts',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        contacts: { type: 'array' },
                        pagination: { type: 'object' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/contacts/{id}': {
      get: {
        summary: 'Get single contact',
        description:
          '**Access Level: 🔒 ADMIN ONLY**\n\nGet a single contact by ID. Automatically marks the contact as read.',
        tags: ['Contacts'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Contact ID',
          },
        ],
        responses: {
          200: { description: 'Contact details' },
          404: { description: 'Contact not found' },
        },
      },
    },
    '/api/payments/bkash/create': {
      post: {
        summary: 'Create bKash payment',
        description:
          '**Access Level: 🌐 PUBLIC**\n\nCreate a bKash payment for track purchase. Returns payment URL.',
        tags: ['Payments'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['trackId', 'buyerEmail', 'buyerName'],
                properties: {
                  trackId: {
                    type: 'string',
                    description: 'Track ID to purchase',
                  },
                  buyerEmail: { type: 'string', format: 'email' },
                  buyerName: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Payment created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    paymentID: { type: 'string' },
                    paymentURL: { type: 'string', format: 'uri' },
                    merchantInvoiceNumber: { type: 'string' },
                    amount: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/payments/bkash/callback': {
      post: {
        summary: 'bKash payment callback',
        description:
          '**Access Level: 🌐 PUBLIC**\n\nbKash callback endpoint for payment status updates. Called by bKash after payment completion.',
        tags: ['Payments'],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  paymentID: { type: 'string' },
                  status: { type: 'string' },
                  transactionStatus: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Callback processed' },
        },
      },
    },
    '/api/payments/bkash/status/{paymentID}': {
      get: {
        summary: 'Check payment status',
        description:
          '**Access Level: 🌐 PUBLIC**\n\nCheck the status of a bKash payment.',
        tags: ['Payments'],
        parameters: [
          {
            name: 'paymentID',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Payment ID',
          },
        ],
        responses: {
          200: {
            description: 'Payment status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    paymentID: { type: 'string' },
                    bKashStatus: { type: 'object' },
                    saleStatus: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/payments/bkash/refund': {
      post: {
        summary: 'Refund payment',
        description:
          '**Access Level: 🔒 ADMIN ONLY**\n\nRefund a bKash payment.',
        tags: ['Payments'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['paymentID', 'amount', 'trxID'],
                properties: {
                  paymentID: { type: 'string' },
                  amount: { type: 'number' },
                  trxID: { type: 'string' },
                  reason: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Refund processed' },
        },
      },
    },
  },
};

const ApiDocs = () => {
  const [expandedTags, setExpandedTags] = useState({});
  const [expandedPaths, setExpandedPaths] = useState({});
  const [copiedPath, setCopiedPath] = useState(null);

  const toggleTag = (tag) => {
    setExpandedTags((prev) => ({
      ...prev,
      [tag]: !prev[tag],
    }));
  };

  const togglePath = (path) => {
    setExpandedPaths((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const copyToClipboard = (text, path) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const getMethodColor = (method) => {
    const colors = {
      get: 'bg-blue-100 text-blue-800 border-blue-300',
      post: 'bg-green-100 text-green-800 border-green-300',
      put: 'bg-orange-100 text-orange-800 border-orange-300',
      delete: 'bg-red-100 text-red-800 border-red-300',
      patch: 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return (
      colors[method.toLowerCase()] ||
      'bg-gray-100 text-gray-800 border-gray-300'
    );
  };

  const getAccessLevel = (description) => {
    if (description?.includes('🔒 ADMIN ONLY'))
      return { level: 'ADMIN', color: 'text-red-600' };
    if (description?.includes('🌐 PUBLIC'))
      return { level: 'PUBLIC', color: 'text-green-600' };
    if (description?.includes('👤 PURCHASED USER'))
      return { level: 'PURCHASED', color: 'text-blue-600' };
    return { level: 'UNKNOWN', color: 'text-gray-600' };
  };

  // Group paths by tags
  const pathsByTag = {};
  API_DOCS.tags.forEach((tag) => {
    pathsByTag[tag.name] = [];
  });

  Object.entries(API_DOCS.paths).forEach(([path, pathItem]) => {
    Object.entries(pathItem).forEach(([method, details]) => {
      // Skip admin-only routes
      if (details.description?.includes('🔒 ADMIN ONLY')) {
        return;
      }

      if (details.tags && details.tags.length > 0) {
        details.tags.forEach((tag) => {
          if (!pathsByTag[tag]) pathsByTag[tag] = [];
          pathsByTag[tag].push({ path, method, details });
        });
      }
    });
  });

  return (
    <div className="p-6 mx-auto max-w-6xl">
      <div className="flex gap-3 items-center mb-8">
        <BookOpen className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
      </div>
      <p className="mb-6 text-sm text-gray-600">
        Public API reference for Nahid Admin Dashboard. All endpoints are
        publicly accessible (some may require purchase verification for audio
        access).
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{API_DOCS.info.title}</CardTitle>
          <CardContent className="p-0 pt-4 text-gray-700">
            <p className="whitespace-pre-wrap">{API_DOCS.info.description}</p>
          </CardContent>
        </CardHeader>
      </Card>

      {API_DOCS.tags.map((tag) => {
        const tagPaths = pathsByTag[tag.name] || [];
        if (tagPaths.length === 0) return null;

        return (
          <Card key={tag.name} className="mb-4">
            <CardHeader
              className="flex flex-row justify-between items-center cursor-pointer"
              onClick={() => toggleTag(tag.name)}
            >
              <CardTitle className="flex items-center text-xl font-semibold">
                {expandedTags[tag.name] ? (
                  <ChevronDown className="mr-2 w-5 h-5" />
                ) : (
                  <ChevronRight className="mr-2 w-5 h-5" />
                )}
                {tag.name}
                <span className="ml-3 text-sm font-normal text-gray-500">
                  {tag.description}
                </span>
              </CardTitle>
            </CardHeader>
            {expandedTags[tag.name] && (
              <CardContent className="pt-4 border-t">
                <div className="space-y-4">
                  {tagPaths.map(({ path, method, details }, idx) => {
                    const fullPath = path;
                    const isPathExpanded =
                      expandedPaths[`${tag.name}-${path}-${method}`];
                    const accessLevel = getAccessLevel(details.description);

                    return (
                      <div
                        key={`${path}-${method}-${idx}`}
                        className="bg-white rounded-lg border shadow-sm"
                      >
                        <div
                          className="px-4 py-3 bg-gray-50 transition-colors cursor-pointer hover:bg-gray-100"
                          onClick={() =>
                            togglePath(`${tag.name}-${path}-${method}`)
                          }
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex gap-3 items-center">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold border ${getMethodColor(
                                  method,
                                )}`}
                              >
                                {method.toUpperCase()}
                              </span>
                              <code className="font-mono text-sm text-gray-800">
                                {path}
                              </code>
                              {accessLevel.level && (
                                <span
                                  className={`text-xs font-medium ${accessLevel.color}`}
                                >
                                  {accessLevel.level}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2 items-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(
                                    fullPath,
                                    `${tag.name}-${path}-${method}`,
                                  );
                                }}
                                className="p-0 w-7 h-7"
                              >
                                {copiedPath ===
                                `${tag.name}-${path}-${method}` ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                              {isPathExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                          {details.summary && (
                            <p className="mt-2 ml-20 text-sm text-gray-600">
                              {details.summary}
                            </p>
                          )}
                        </div>
                        {isPathExpanded && (
                          <div className="p-4 bg-white border-t">
                            {details.description && (
                              <div>
                                <h4 className="mb-2 text-sm font-semibold">
                                  Description
                                </h4>
                                <div
                                  className="max-w-none text-sm text-gray-700 prose prose-sm"
                                  dangerouslySetInnerHTML={{
                                    __html: details.description.replace(
                                      /\n/g,
                                      '<br />',
                                    ),
                                  }}
                                />
                              </div>
                            )}

                            {details.parameters &&
                              details.parameters.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="mb-2 text-sm font-semibold">
                                    Parameters
                                  </h4>
                                  <div className="space-y-2">
                                    {details.parameters.map(
                                      (param, paramIdx) => (
                                        <div
                                          key={paramIdx}
                                          className="p-3 text-sm bg-gray-50 rounded"
                                        >
                                          <div className="flex gap-2 items-center mb-1">
                                            <code className="font-mono text-indigo-600">
                                              {param.name}
                                            </code>
                                            <span className="text-xs text-gray-500">
                                              ({param.in})
                                            </span>
                                            {param.required && (
                                              <span className="text-xs font-medium text-red-600">
                                                required
                                              </span>
                                            )}
                                          </div>
                                          {param.description && (
                                            <p className="text-xs text-gray-600">
                                              {param.description}
                                            </p>
                                          )}
                                          {param.schema && (
                                            <p className="mt-1 text-xs text-gray-500">
                                              Type:{' '}
                                              <code>
                                                {param.schema.type || 'string'}
                                              </code>
                                              {param.schema.enum && (
                                                <span>
                                                  {' '}
                                                  (one of:{' '}
                                                  {param.schema.enum.join(', ')}
                                                  )
                                                </span>
                                              )}
                                            </p>
                                          )}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                            {details.requestBody && (
                              <div className="mt-4">
                                <h4 className="mb-2 text-sm font-semibold">
                                  Request Body
                                </h4>
                                <div className="p-3 text-sm bg-gray-50 rounded">
                                  {details.requestBody.content &&
                                    Object.entries(
                                      details.requestBody.content,
                                    ).map(([contentType, content]) => (
                                      <div key={contentType}>
                                        <p className="mb-2 text-gray-600">
                                          Content-Type:{' '}
                                          <code>{contentType}</code>
                                        </p>
                                        {content.schema && (
                                          <div className="p-3 bg-white rounded border">
                                            <pre className="overflow-x-auto text-xs">
                                              {JSON.stringify(
                                                content.schema.properties || {},
                                                null,
                                                2,
                                              )}
                                            </pre>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {details.responses && (
                              <div className="mt-4">
                                <h4 className="mb-2 text-sm font-semibold">
                                  Responses
                                </h4>
                                <div className="space-y-2">
                                  {Object.entries(details.responses).map(
                                    ([statusCode, response]) => (
                                      <div
                                        key={statusCode}
                                        className="p-3 text-sm bg-gray-50 rounded"
                                      >
                                        <div
                                          className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 ${
                                            statusCode.startsWith('2')
                                              ? 'bg-green-100 text-green-800'
                                              : statusCode.startsWith('4')
                                              ? 'bg-red-100 text-red-800'
                                              : 'bg-yellow-100 text-yellow-800'
                                          }`}
                                        >
                                          {statusCode}: {response.description}
                                        </div>
                                        {response.content &&
                                          Object.entries(response.content).map(
                                            ([contentType, content]) => (
                                              <div
                                                key={contentType}
                                                className="mt-2"
                                              >
                                                {content.schema && (
                                                  <div className="p-2 text-xs bg-white rounded border">
                                                    <pre className="overflow-x-auto">
                                                      {JSON.stringify(
                                                        content.schema
                                                          .properties ||
                                                          content.schema.items
                                                            ?.properties ||
                                                          {},
                                                        null,
                                                        2,
                                                      )}
                                                    </pre>
                                                  </div>
                                                )}
                                              </div>
                                            ),
                                          )}
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                            {details.security &&
                              details.security.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="mb-2 text-sm font-semibold">
                                    Authentication
                                  </h4>
                                  <div className="p-3 text-sm bg-yellow-50 rounded border border-yellow-200">
                                    {details.security.map((sec, secIdx) => (
                                      <div key={secIdx}>
                                        {Object.keys(sec).map((scheme) => (
                                          <div key={scheme}>
                                            {scheme === 'bearerAuth' && (
                                              <p>
                                                🔒 Requires JWT token in
                                                Authorization header:{' '}
                                                <code>Bearer {'<token>'}</code>
                                              </p>
                                            )}
                                            {scheme === 'apiKey' && (
                                              <p>
                                                🔑 Optional API key in header{' '}
                                                <code>x-api-key</code> or query
                                                parameter <code>apiKey</code>
                                              </p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default ApiDocs;
