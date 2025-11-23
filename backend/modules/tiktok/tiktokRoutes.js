import express from 'express';
import TikTokVideo from './TikTokVideo.js';
import { authenticateToken, optionalAuth } from '../auth/index.js';
import { checkApiKey, checkOrigin } from '../../middleware/apiKey.js';
import {
  uploadToCloudinary,
  generateVideoThumbnail,
  uploadOptimizedImage,
} from '../../config/cloudinary.js';
import multer from 'multer';
import { cacheMiddleware } from '../../middleware/cache.js';
import { invalidateRouteCache } from '../../utils/cacheHelper.js';

const router = express.Router();

// Multer middleware for video uploads
const uploadVideo = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  },
});

// Multer middleware for thumbnail uploads
const uploadThumbnail = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnails'), false);
    }
  },
});

/**
 * @swagger
 * /tiktok/upload:
 *   post:
 *     summary: Upload TikTok video file (🔒 ADMIN ONLY)
 *     tags: [TikTok]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Upload a TikTok video file. Returns Cloudinary URL.
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
 *               - video
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video file (mp4) - max 100MB
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   format: uri
 *                   description: Cloudinary URL of uploaded video
 *       400:
 *         description: No file provided or invalid file type
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Server error
 */
// Upload TikTok video (protected) - Returns Cloudinary URL
router.post(
  '/upload',
  authenticateToken,
  (req, res, next) => {
    uploadVideo.single('video')(req, res, (err) => {
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
        return res.status(400).json({ message: 'No video file provided' });
      }

      // Validate it's a video file
      if (!req.file.mimetype.startsWith('video/')) {
        return res
          .status(400)
          .json({ message: 'Only video files are allowed' });
      }

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

      // Upload to Cloudinary
      const videoUrl = await uploadToCloudinary(
        req.file,
        'nahid-admin/tiktok/videos',
        'video',
      );

      // Generate thumbnail from video (extract frame at 1 second)
      let thumbnailUrl = '';
      try {
        thumbnailUrl = await generateVideoThumbnail(
          videoUrl,
          'nahid-admin/tiktok/thumbnails',
          720, // Max width for TikTok thumbnails (9:16 aspect ratio)
          1280, // Max height
        );
      } catch (thumbnailError) {
        // If thumbnail generation fails, continue without thumbnail
        console.error('Error generating thumbnail:', thumbnailError);
        // Don't fail the upload if thumbnail generation fails
      }

      res.json({ url: videoUrl, thumbnail: thumbnailUrl });
    } catch (error) {
      res.status(500).json({
        message: 'Error uploading TikTok video',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Failed to upload video. Please check server logs.',
      });
    }
  },
);

/**
 * @swagger
 * /tiktok/upload-thumbnail:
 *   post:
 *     summary: Upload TikTok video thumbnail (🔒 ADMIN ONLY)
 *     tags: [TikTok]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Upload a thumbnail image file. Returns Cloudinary URL.
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
 *               - thumbnail
 *             properties:
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Thumbnail image file (jpg, png, webp) - max 5MB. Automatically optimized to AVIF/WebP format with lossless compression.
 *     responses:
 *       200:
 *         description: Thumbnail uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   format: uri
 *                   description: Cloudinary URL of uploaded thumbnail
 *       400:
 *         description: No file provided or invalid file type
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Server error
 */
// Upload thumbnail (protected) - Returns Cloudinary URL
router.post(
  '/upload-thumbnail',
  authenticateToken,
  (req, res, next) => {
    uploadThumbnail.single('thumbnail')(req, res, (err) => {
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
        return res.status(400).json({ message: 'No thumbnail file provided' });
      }

      // Validate it's an image file
      if (!req.file.mimetype.startsWith('image/')) {
        return res
          .status(400)
          .json({ message: 'Only image files are allowed' });
      }

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

      // Upload to Cloudinary with optimization
      // Automatically converts to AVIF/WebP format with lossless compression
      const thumbnailUrl = await uploadOptimizedImage(
        req.file,
        'nahid-admin/tiktok/thumbnails',
        720, // Max width for TikTok thumbnails (9:16 aspect ratio)
        1280, // Max height
      );

      res.json({ url: thumbnailUrl });
    } catch (error) {
      res.status(500).json({
        message: 'Error uploading thumbnail',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Failed to upload thumbnail. Please check server logs.',
      });
    }
  },
);

/**
 * @swagger
 * /tiktok:
 *   get:
 *     summary: Get all TikTok videos (🌐 PUBLIC)
 *     tags: [TikTok]
 *     description: |
 *       **Access Level: 🌐 PUBLIC**
 *
 *       Get all TikTok videos. Public endpoint with optional API key or origin check.
 *     security:
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: List of TikTok videos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TikTokVideo'
 */
// Get all TikTok videos (PUBLIC - no authentication required)
// Cache can be bypassed with ?nocache=true query parameter
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
  async (req, res) => {
    try {
      const videos = await TikTokVideo.find().sort({ createdAt: -1 });
      res.json(videos);
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching TikTok videos',
        error: error.message,
      });
    }
  },
);

/**
 * @swagger
 * /tiktok:
 *   post:
 *     summary: Create TikTok video entry (🔒 ADMIN ONLY)
 *     tags: [TikTok]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Create a new TikTok video entry. Video must be uploaded first using /upload endpoint.
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
 *               - videoUrl
 *               - title
 *             properties:
 *               videoUrl:
 *                 type: string
 *                 format: uri
 *                 description: Video URL from /tiktok/upload
 *               title:
 *                 type: string
 *                 example: "My TikTok Video"
 *               description:
 *                 type: string
 *                 description: Video description
 *               tiktokLink:
 *                 type: string
 *                 format: uri
 *                 description: TikTok video link URL
 *               thumbnail:
 *                 type: string
 *                 format: uri
 *                 description: Thumbnail URL (from /tiktok/upload-thumbnail). If not provided, thumbnail will be auto-generated from video URL if it's a Cloudinary URL.
 *     responses:
 *       201:
 *         description: TikTok video created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TikTokVideo'
 */
// Create TikTok video (protected) - Only accepts URLs, not files
router.post('/', authenticateToken, async (req, res) => {
  invalidateRouteCache('tiktok');
  try {
    const { videoUrl, title, description, tiktokLink, thumbnail } = req.body;

    // Validate required fields
    if (!videoUrl || typeof videoUrl !== 'string' || videoUrl.trim() === '') {
      return res.status(400).json({ message: 'Video URL is required' });
    }

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Reject base64 strings - must use /upload endpoint first
    if (videoUrl.startsWith('data:')) {
      return res.status(400).json({
        message:
          'Base64 data is not allowed. Please upload the video first using /api/tiktok/upload endpoint, then use the returned URL.',
      });
    }

    // Validate URL format
    if (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
      return res.status(400).json({
        message: 'Invalid video URL format. Must be a valid HTTP/HTTPS URL.',
      });
    }

    // Use provided thumbnail URL, or generate thumbnail from video URL if it's a Cloudinary URL
    let thumbnailUrl = '';
    if (thumbnail && typeof thumbnail === 'string' && thumbnail.trim() !== '') {
      // Use provided thumbnail URL
      thumbnailUrl = thumbnail.trim();
    } else if (videoUrl.includes('cloudinary.com')) {
      // Auto-generate thumbnail from Cloudinary video
      try {
        thumbnailUrl = await generateVideoThumbnail(
          videoUrl.trim(),
          'nahid-admin/tiktok/thumbnails',
          720,
          1280,
        );
      } catch (thumbnailError) {
        // If thumbnail generation fails, continue without thumbnail
        console.error('Error generating thumbnail:', thumbnailError);
      }
    }

    const videoData = {
      videoUrl: videoUrl.trim(),
      title: title.trim(),
      description: description ? description.trim() : '',
      thumbnail: thumbnailUrl,
      tiktokLink: tiktokLink ? tiktokLink.trim() : '',
    };

    const video = new TikTokVideo(videoData);
    await video.save();
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({
      message: 'Error creating TikTok video',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /tiktok/{id}:
 *   put:
 *     summary: Update TikTok video (🔒 ADMIN ONLY)
 *     tags: [TikTok]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Update an existing TikTok video entry.
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
 *               videoUrl:
 *                 type: string
 *                 format: uri
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               tiktokLink:
 *                 type: string
 *                 format: uri
 *                 description: TikTok video link URL
 *               thumbnail:
 *                 type: string
 *                 format: uri
 *                 description: Thumbnail URL (from /tiktok/upload-thumbnail). If not provided and videoUrl is updated, thumbnail will be auto-generated from video URL if it's a Cloudinary URL.
 *     responses:
 *       200:
 *         description: TikTok video updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TikTokVideo'
 *       404:
 *         description: Video not found
 */
// Update TikTok video (protected) - Only accepts URLs, not base64
router.put('/:id', authenticateToken, async (req, res) => {
  invalidateRouteCache('tiktok');
  try {
    const video = await TikTokVideo.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'TikTok video not found' });
    }

    const { videoUrl, title, description, tiktokLink, thumbnail } = req.body;

    // Validate fields if provided
    if (
      videoUrl !== undefined &&
      (typeof videoUrl !== 'string' || videoUrl.trim() === '')
    ) {
      return res
        .status(400)
        .json({ message: 'Video URL must be a non-empty string' });
    }

    if (
      title !== undefined &&
      (typeof title !== 'string' || title.trim() === '')
    ) {
      return res
        .status(400)
        .json({ message: 'Title must be a non-empty string' });
    }

    // If videoUrl is provided, validate it's a URL, not base64
    if (videoUrl) {
      // Reject base64 strings - must use /upload endpoint first
      if (videoUrl.startsWith('data:')) {
        return res.status(400).json({
          message:
            'Base64 data is not allowed. Please upload the video first using /api/tiktok/upload endpoint, then use the returned URL.',
        });
      }

      // Validate URL format
      if (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
        return res.status(400).json({
          message: 'Invalid video URL format. Must be a valid HTTP/HTTPS URL.',
        });
      }
    }

    const videoData = {};
    if (videoUrl !== undefined) {
      videoData.videoUrl = videoUrl.trim();
      // Generate thumbnail if video URL is updated and it's a Cloudinary URL (only if thumbnail not explicitly provided)
      if (thumbnail === undefined && videoUrl.includes('cloudinary.com')) {
        try {
          const thumbnailUrl = await generateVideoThumbnail(
            videoUrl.trim(),
            'nahid-admin/tiktok/thumbnails',
            720,
            1280,
          );
          videoData.thumbnail = thumbnailUrl;
        } catch (thumbnailError) {
          // If thumbnail generation fails, continue without updating thumbnail
          console.error('Error generating thumbnail:', thumbnailError);
        }
      }
    }
    if (title !== undefined) {
      videoData.title = title.trim();
    }
    if (description !== undefined) {
      videoData.description = description.trim();
    }
    if (tiktokLink !== undefined) {
      videoData.tiktokLink = tiktokLink.trim();
    }
    if (thumbnail !== undefined) {
      // Allow setting thumbnail to empty string to remove it
      videoData.thumbnail = thumbnail ? thumbnail.trim() : '';
    }

    const updatedVideo = await TikTokVideo.findByIdAndUpdate(
      req.params.id,
      videoData,
      { new: true, runValidators: true },
    );

    res.json(updatedVideo);
  } catch (error) {
    res.status(500).json({
      message: 'Error updating TikTok video',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /tiktok/{id}:
 *   delete:
 *     summary: Delete TikTok video (🔒 ADMIN ONLY)
 *     tags: [TikTok]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Delete a TikTok video by ID.
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
 *         description: TikTok video deleted successfully
 *       404:
 *         description: Video not found
 */
// Delete TikTok video (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  invalidateRouteCache('tiktok');
  try {
    const video = await TikTokVideo.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'TikTok video not found' });
    }
    res.json({ message: 'TikTok video deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting TikTok video',
      error: error.message,
    });
  }
});

export default router;
