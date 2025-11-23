import express from 'express';
import YouTubeVideo from './YouTubeVideo.js';
import { authenticateToken, optionalAuth } from '../auth/index.js';
import { cacheMiddleware } from '../../middleware/cache.js';
import { invalidateRouteCache } from '../../utils/cacheHelper.js';
import { uploadOptimizedImage } from '../../config/cloudinary.js';
import multer from 'multer';

const router = express.Router();

/**
 * Extract YouTube video ID from URL
 */
function getYouTubeVideoId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * Fetch YouTube video duration from YouTube Data API v3
 * Returns duration in ISO 8601 format (e.g., PT5M30S) or null if not available
 */
async function fetchYouTubeDuration(videoUrl) {
  try {
    const videoId = getYouTubeVideoId(videoUrl);
    if (!videoId) {
      return null;
    }

    // Try YouTube Data API v3 if API key is available
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (apiKey) {
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${apiKey}`;
      const response = await fetch(apiUrl);

      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          const duration = data.items[0].contentDetails?.duration;
          return duration || null;
        }
      }
    }

    // Fallback: Try oEmbed API (doesn't provide duration, but we can try)
    // Note: oEmbed doesn't provide duration, so this is just a placeholder
    // For now, return null if no API key
    return null;
  } catch (error) {
    console.error('Error fetching YouTube duration:', error.message);
    return null;
  }
}

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
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

/**
 * @swagger
 * /youtube:
 *   get:
 *     summary: Get all YouTube videos (🌐 PUBLIC)
 *     tags: [YouTube]
 *     description: |
 *       **Access Level: 🌐 PUBLIC**
 *
 *       Get all YouTube videos. Public endpoint with optional API key or origin check.
 *     security:
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: List of YouTube videos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/YouTubeVideo'
 */
// Get all YouTube videos (PUBLIC - no authentication required)
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
      const videos = await YouTubeVideo.find().sort({ createdAt: -1 });
      res.json(videos);
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching YouTube videos',
        error: error.message,
      });
    }
  },
);

/**
 * @swagger
 * /youtube/duration/{videoId}:
 *   get:
 *     summary: Get YouTube video duration (🌐 PUBLIC)
 *     tags: [YouTube]
 *     description: |
 *       **Access Level: 🌐 PUBLIC**
 *
 *       Fetch video duration from YouTube Data API v3.
 *       Requires YOUTUBE_API_KEY environment variable.
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: YouTube video ID
 *     responses:
 *       200:
 *         description: Video duration in ISO 8601 format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 duration:
 *                   type: string
 *                   example: "PT5M30S"
 *       404:
 *         description: Video not found or duration unavailable
 *       500:
 *         description: Server error
 */
// Get YouTube video duration (PUBLIC - fetches from YouTube API)
router.get('/duration/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId || videoId.length !== 11) {
      return res.status(400).json({ message: 'Invalid video ID' });
    }

    const duration = await fetchYouTubeDuration(
      `https://www.youtube.com/watch?v=${videoId}`,
    );

    if (duration) {
      res.json({ duration });
    } else {
      res.status(404).json({
        message:
          'Duration not available. YouTube API key may not be configured.',
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching video duration',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /youtube/upload:
 *   post:
 *     summary: Upload YouTube video thumbnail (🔒 ADMIN ONLY)
 *     tags: [YouTube]
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
  '/upload',
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
        'nahid-admin/youtube/thumbnails',
        1920, // Max width
        1080, // Max height (16:9 aspect ratio for YouTube thumbnails)
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
 * /youtube:
 *   post:
 *     summary: Create YouTube video entry (🔒 ADMIN ONLY)
 *     tags: [YouTube]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Create a new YouTube video entry.
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
 *                 description: YouTube video URL
 *               title:
 *                 type: string
 *                 example: "My YouTube Video"
 *               description:
 *                 type: string
 *                 description: Video description
 *     responses:
 *       201:
 *         description: YouTube video created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YouTubeVideo'
 */
// Create YouTube video (protected)
router.post('/', authenticateToken, async (req, res) => {
  invalidateRouteCache('youtube');
  try {
    const { videoUrl, title, description, thumbnail } = req.body;

    // Validate required fields
    if (!videoUrl || typeof videoUrl !== 'string' || videoUrl.trim() === '') {
      return res.status(400).json({ message: 'Video URL is required' });
    }

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Validate URL format (should be a YouTube URL)
    if (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
      return res.status(400).json({
        message: 'Invalid video URL format. Must be a valid HTTP/HTTPS URL.',
      });
    }

    const videoData = {
      videoUrl: videoUrl.trim(),
      title: title.trim(),
      description: description ? description.trim() : '',
      thumbnail: thumbnail ? thumbnail.trim() : '',
    };

    // Duration is fetched on frontend, not stored in database
    // But allow manual override if provided
    if (req.body.duration) {
      videoData.duration = req.body.duration.trim();
    }

    const video = new YouTubeVideo(videoData);
    await video.save();
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({
      message: 'Error creating YouTube video',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /youtube/{id}:
 *   put:
 *     summary: Update YouTube video (🔒 ADMIN ONLY)
 *     tags: [YouTube]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Update an existing YouTube video entry.
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
 *     responses:
 *       200:
 *         description: YouTube video updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YouTubeVideo'
 *       404:
 *         description: Video not found
 */
// Update YouTube video (protected)
router.put('/:id', authenticateToken, async (req, res) => {
  invalidateRouteCache('youtube');
  try {
    const video = await YouTubeVideo.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'YouTube video not found' });
    }

    const { videoUrl, title, description, thumbnail } = req.body;

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

    // Validate URL format if provided
    if (videoUrl) {
      if (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
        return res.status(400).json({
          message: 'Invalid video URL format. Must be a valid HTTP/HTTPS URL.',
        });
      }
    }

    const videoData = {};
    if (videoUrl !== undefined) {
      videoData.videoUrl = videoUrl.trim();
    }
    if (title !== undefined) {
      videoData.title = title.trim();
    }
    if (description !== undefined) {
      videoData.description = description.trim();
    }
    if (thumbnail !== undefined) {
      videoData.thumbnail = thumbnail.trim();
    }
    // Duration is fetched on frontend, not stored in database
    // But allow manual override if provided
    if (req.body.duration !== undefined) {
      videoData.duration = req.body.duration.trim();
    }

    const updatedVideo = await YouTubeVideo.findByIdAndUpdate(
      req.params.id,
      videoData,
      { new: true, runValidators: true },
    );

    res.json(updatedVideo);
  } catch (error) {
    res.status(500).json({
      message: 'Error updating YouTube video',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /youtube/{id}:
 *   delete:
 *     summary: Delete YouTube video (🔒 ADMIN ONLY)
 *     tags: [YouTube]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Delete a YouTube video by ID.
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
 *         description: YouTube video deleted successfully
 *       404:
 *         description: Video not found
 */
// Delete YouTube video (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  invalidateRouteCache('youtube');
  try {
    const video = await YouTubeVideo.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'YouTube video not found' });
    }
    res.json({ message: 'YouTube video deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting YouTube video',
      error: error.message,
    });
  }
});

export default router;
