import express from 'express';
import Gallery from './Gallery.js';
import { authenticateToken, optionalAuth } from '../auth/index.js';
import { checkApiKey, checkOrigin } from '../../middleware/apiKey.js';
import { uploadOptimizedImage } from '../../config/cloudinary.js';
import multer from 'multer';
import { cacheMiddleware } from '../../middleware/cache.js';
import { invalidateRouteCache } from '../../utils/cacheHelper.js';

const router = express.Router();

// Multer middleware for image uploads
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

/**
 * @swagger
 * /gallery:
 *   get:
 *     summary: Get gallery images with pagination (🌐 PUBLIC)
 *     tags: [Gallery]
 *     description: |
 *       **Access Level: 🌐 PUBLIC**
 *
 *       Get gallery images with pagination support. Returns paginated results with total count.
 *       Public endpoint with optional API key or origin check.
 *     security:
 *       - apiKey: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (1-indexed)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of images per page (max 100)
 *     responses:
 *       200:
 *         description: Paginated list of images
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 images:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Gallery'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     limit:
 *                       type: integer
 *                       description: Items per page
 *                     total:
 *                       type: integer
 *                       description: Total number of images
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                     hasNext:
 *                       type: boolean
 *                       description: Whether there are more pages
 *                     hasPrev:
 *                       type: boolean
 *                       description: Whether there are previous pages
 */
// Get gallery images with pagination (PUBLIC - with optional API key or origin check)
router.get(
  '/',
  optionalAuth,
  async (req, res, next) => {
    // Bypass cache if nocache query parameter is present or if user is admin
    if (req.query.nocache === 'true' || req.user?.role === 'admin') {
      return next();
    }
    return cacheMiddleware.medium(req, res, next);
  },
  checkApiKey,
  checkOrigin,
  async (req, res) => {
    try {
      // Parse pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100 per page
      const skip = (page - 1) * limit;

      // Get total count and paginated images in parallel for better performance
      const [total, images] = await Promise.all([
        Gallery.countDocuments(),
        Gallery.find().sort({ createdAt: 1 }).skip(skip).limit(limit).lean(), // Use lean() for better performance (returns plain JS objects)
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        images,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error fetching gallery', error: error.message });
    }
  },
);

/**
 * @swagger
 * /gallery/upload:
 *   post:
 *     summary: Upload gallery image (🔒 ADMIN ONLY)
 *     tags: [Gallery]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Upload an image file. Returns Cloudinary URL.
 *       Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (max 50MB)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   format: uri
 */
// Upload image (protected) - Returns Cloudinary URL
router.post(
  '/upload',
  authenticateToken,
  (req, res, next) => {
    uploadImage.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          message: 'File upload error',
          error: err.message || 'Invalid file',
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      // Log file info for debugging
      console.log('Uploading file:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: `${(req.file.size / (1024 * 1024)).toFixed(2)}MB`,
      });

      // Check Cloudinary configuration
      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      ) {
        return res.status(500).json({
          message:
            'Cloudinary configuration is missing. Please check your environment variables.',
          error:
            'Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET',
        });
      }

      // Validate file buffer
      if (!req.file.buffer || req.file.buffer.length === 0) {
        return res.status(400).json({
          message: 'File upload error',
          error: 'File buffer is empty or invalid',
        });
      }

      // Upload to Cloudinary with optimization
      const imageUrl = await uploadOptimizedImage(
        req.file,
        'nahid-admin/gallery',
        1920, // Max width
        1920, // Max height
      );

      if (!imageUrl) {
        return res.status(500).json({
          message: 'Error uploading image',
          error: 'Failed to get image URL from Cloudinary',
        });
      }

      res.json({ url: imageUrl });
    } catch (error) {
      console.error('Gallery upload error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      res.status(500).json({
        message: 'Error uploading image',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Failed to upload image. Please check server logs.',
        details:
          process.env.NODE_ENV === 'development'
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : undefined,
      });
    }
  },
);

/**
 * @swagger
 * /gallery/{id}:
 *   get:
 *     summary: Get single image (🌐 PUBLIC)
 *     tags: [Gallery]
 *     description: |
 *       **Access Level: 🌐 PUBLIC**
 *
 *       Get a single gallery image by ID. Public endpoint with optional API key or origin check.
 *     security:
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gallery'
 *       404:
 *         description: Image not found
 */
// Get single image (PUBLIC - with optional API key or origin check)
router.get('/:id', checkApiKey, checkOrigin, async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.json(image);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching image', error: error.message });
  }
});

/**
 * @swagger
 * /gallery:
 *   post:
 *     summary: Create gallery image entry (🔒 ADMIN ONLY)
 *     tags: [Gallery]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Create a new gallery image entry. Image must be uploaded first using /upload endpoint.
 *       Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - src
 *             properties:
 *               src:
 *                 type: string
 *                 format: uri
 *                 description: Image URL from /gallery/upload
 *               height:
 *                 type: string
 *                 enum: [small, medium, large, xlarge]
 *                 default: medium
 *               caption:
 *                 type: string
 *                 description: Image caption (supports multi-line)
 *     responses:
 *       201:
 *         description: Image created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gallery'
 */
// Create image (protected) - Only accepts URLs, not base64
router.post('/', authenticateToken, async (req, res) => {
  invalidateRouteCache('gallery');
  try {
    const { src, height, caption } = req.body;

    // Validate that src is a URL, not base64
    if (!src || typeof src !== 'string') {
      return res.status(400).json({ message: 'Image URL (src) is required' });
    }

    // Reject base64 strings - must use /upload endpoint first
    if (src.startsWith('data:image')) {
      return res.status(400).json({
        message:
          'Base64 images are not allowed. Please upload the image first using /api/gallery/upload endpoint, then use the returned URL.',
      });
    }

    // Validate URL format
    if (!src.startsWith('http://') && !src.startsWith('https://')) {
      return res.status(400).json({
        message: 'Invalid image URL format. Must be a valid HTTP/HTTPS URL.',
      });
    }

    const imageData = {
      src: src,
      height: height || 'medium',
      caption: caption || '',
    };

    const image = new Gallery(imageData);
    await image.save();
    res.status(201).json(image);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error creating image', error: error.message });
  }
});

/**
 * @swagger
 * /gallery/{id}:
 *   put:
 *     summary: Update gallery image (🔒 ADMIN ONLY)
 *     tags: [Gallery]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Update an existing gallery image entry.
 *       Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               src:
 *                 type: string
 *                 format: uri
 *               height:
 *                 type: string
 *                 enum: [small, medium, large, xlarge]
 *               caption:
 *                 type: string
 *     responses:
 *       200:
 *         description: Image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gallery'
 *       404:
 *         description: Image not found
 */
// Update image (protected) - Only accepts URLs, not base64
router.put('/:id', authenticateToken, async (req, res) => {
  invalidateRouteCache('gallery');
  try {
    const { src, height, caption } = req.body;

    // If src is provided, validate it's a URL, not base64
    if (src) {
      // Reject base64 strings - must use /upload endpoint first
      if (src.startsWith('data:image')) {
        return res.status(400).json({
          message:
            'Base64 images are not allowed. Please upload the image first using /api/gallery/upload endpoint, then use the returned URL.',
        });
      }

      // Validate URL format
      if (!src.startsWith('http://') && !src.startsWith('https://')) {
        return res.status(400).json({
          message: 'Invalid image URL format. Must be a valid HTTP/HTTPS URL.',
        });
      }
    }

    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const imageData = {
      src: src || image.src, // Keep existing if not provided
      height: height || image.height,
      caption: caption !== undefined ? caption : image.caption,
    };

    const updatedImage = await Gallery.findByIdAndUpdate(
      req.params.id,
      imageData,
      {
        new: true,
        runValidators: true,
      },
    );

    res.json(updatedImage);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating image', error: error.message });
  }
});

/**
 * @swagger
 * /gallery/{id}:
 *   delete:
 *     summary: Delete gallery image (🔒 ADMIN ONLY)
 *     tags: [Gallery]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Delete a gallery image by ID.
 *       Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       404:
 *         description: Image not found
 */
// Delete image (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  invalidateRouteCache('gallery');
  try {
    const image = await Gallery.findByIdAndDelete(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error deleting image', error: error.message });
  }
});

export default router;
