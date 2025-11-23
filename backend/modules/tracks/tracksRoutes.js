import express from 'express';
import Track from './Track.js';
import Sale from '../sales/Sale.js';
import { authenticateToken, optionalAuth } from '../auth/index.js';
import { checkApiKey, checkOrigin } from '../../middleware/apiKey.js';
import {
  uploadTrackFiles,
  uploadToCloudinary,
} from '../../config/cloudinary.js';
import { cacheMiddleware } from '../../middleware/cache.js';
import { invalidateRouteCache } from '../../utils/cacheHelper.js';

const router = express.Router();

/**
 * @swagger
 * /tracks/upload/thumbnail:
 *   post:
 *     summary: Upload track thumbnail (🔒 ADMIN ONLY)
 *     tags: [Tracks]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Upload a thumbnail image for a track. Returns Cloudinary URL.
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
 *                 description: Image file (jpg, jpeg, png, webp) - max 5MB
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
// Upload track thumbnail (protected) - Returns Cloudinary URL
router.post(
  '/upload/thumbnail',
  authenticateToken,
  uploadTrackFiles.single('thumbnail'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No thumbnail file provided' });
      }

      // Validate it's an image
      if (!req.file.mimetype.startsWith('image/')) {
        return res
          .status(400)
          .json({ message: 'Only image files are allowed for thumbnails' });
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
      const thumbnailUrl = await uploadToCloudinary(
        req.file,
        'nahid-admin/tracks/thumbnails',
        'image',
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
 * /tracks/upload/audio:
 *   post:
 *     summary: Upload track audio file (🔒 ADMIN ONLY)
 *     tags: [Tracks]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Upload an audio file for a track. Returns Cloudinary URL.
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
 *               - audio
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Audio file (mp3, wav, m4a, ogg) - max 50MB
 *     responses:
 *       200:
 *         description: Audio uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   format: uri
 *                   description: Cloudinary URL of uploaded audio
 *       400:
 *         description: No file provided or invalid file type
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Server error
 */
// Upload track audio (protected) - Returns Cloudinary URL
router.post(
  '/upload/audio',
  authenticateToken,
  uploadTrackFiles.single('audio'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No audio file provided' });
      }

      // Validate it's an audio file
      if (!req.file.mimetype.startsWith('audio/')) {
        return res
          .status(400)
          .json({ message: 'Only audio files are allowed' });
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
      const audioUrl = await uploadToCloudinary(
        req.file,
        'nahid-admin/tracks/audio',
        'video', // Cloudinary uses 'video' for audio files
      );

      res.json({ url: audioUrl });
    } catch (error) {
      res.status(500).json({
        message: 'Error uploading audio',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Failed to upload audio. Please check server logs.',
      });
    }
  },
);

/**
 * @swagger
 * /tracks/upload/preview-audio:
 *   post:
 *     summary: Upload preview/short audio file (🔒 ADMIN ONLY)
 *     tags: [Tracks]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Upload a short/preview audio file for public playback. Returns Cloudinary URL.
 *       This preview audio will be publicly accessible without purchase verification.
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
 *               - previewAudio
 *             properties:
 *               previewAudio:
 *                 type: string
 *                 format: binary
 *                 description: Preview audio file (mp3, wav, m4a, ogg) - max 50MB
 *     responses:
 *       200:
 *         description: Preview audio uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   format: uri
 *                   description: Cloudinary URL of uploaded preview audio
 *       400:
 *         description: No file provided or invalid file type
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Server error
 */
// Upload preview/short audio (protected) - Returns Cloudinary URL
// This preview audio will be publicly accessible
router.post(
  '/upload/preview-audio',
  authenticateToken,
  uploadTrackFiles.single('previewAudio'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: 'No preview audio file provided' });
      }

      // Validate it's an audio file
      if (!req.file.mimetype.startsWith('audio/')) {
        return res
          .status(400)
          .json({ message: 'Only audio files are allowed' });
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
      const previewAudioUrl = await uploadToCloudinary(
        req.file,
        'nahid-admin/tracks/preview-audio',
        'video', // Cloudinary uses 'video' for audio files
      );

      res.json({ url: previewAudioUrl });
    } catch (error) {
      res.status(500).json({
        message: 'Error uploading preview audio',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Failed to upload preview audio. Please check server logs.',
      });
    }
  },
);

/**
 * @swagger
 * /tracks:
 *   get:
 *     summary: Get all tracks (🌐 PUBLIC)
 *     tags: [Tracks]
 *     description: |
 *       **Access Level: 🌐 PUBLIC**
 *
 *       Get all tracks with optional category filtering.
 *       - **Public users**: Full audio URLs are hidden for security, but previewAudio is available for public playback
 *       - **Admin users**: All audio URLs (including full audio) are included in response
 *
 *       Optional API key or origin check can be configured.
 *     security:
 *       - apiKey: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Rock, Folk, Hip-Hop, "Jazz & Blues", "Modern Song", Classical]
 *         description: Filter tracks by category
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         description: Optional API key for public access
 *       - in: query
 *         name: apiKey
 *         schema:
 *           type: string
 *         description: Optional API key (alternative to header)
 *     responses:
 *       200:
 *         description: List of tracks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Track'
 *             example:
 *               - _id: "507f1f77bcf86cd799439011"
 *                 thumbnail: "https://res.cloudinary.com/..."
 *                 title: "My Track"
 *                 releaseDate: "2024-01-15"
 *                 price: 100
 *                 category: "Rock"
 *       500:
 *         description: Server error
 */
// Get all tracks (PUBLIC - with optional API key or origin check, supports category filtering)
// Returns tracks without audio URL for security (except for admins)
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
      const { category } = req.query;

      // Build query
      const query = {};
      if (category && category.trim() !== '') {
        query.category = category.trim();
      }

      const tracks = await Track.find(query).sort({ createdAt: -1 });

      // Check if user is admin (authenticated admin users can see audio URLs and views)
      const isAdmin = req.user && req.user.role === 'admin';

      // Remove audio URL and views from public response for security (except for admins)
      const publicTracks = tracks.map((track) => {
        const trackObj = track.toObject();
        if (!isAdmin) {
          delete trackObj.audio; // Remove audio URL from public API for non-admins
          delete trackObj.views; // Remove views from public API for non-admins
        }
        return trackObj;
      });

      res.json(publicTracks);
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching tracks',
        error: error.message,
      });
    }
  },
);

/**
 * @swagger
 * /tracks/{id}/audio/stream:
 *   get:
 *     summary: Stream audio file (🔒 ADMIN / 👤 PURCHASED USER)
 *     tags: [Tracks]
 *     description: |
 *       **Access Level:**
 *       - 🔒 **ADMIN**: Full access without purchase verification
 *       - 👤 **PURCHASED USER**: Requires purchase verification (email or purchase token)
 *
 *       Stream audio file through server proxy for secure access.
 *       Public users must purchase the track first.
 *     security:
 *       - apiKey: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Track ID
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *         description: Order ID (saleSerialId) for purchase verification
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         description: Purchase token (for purchase verification)
 *       - in: header
 *         name: x-buyer-email
 *         schema:
 *           type: string
 *         description: Buyer email (alternative to query param)
 *       - in: header
 *         name: x-purchase-token
 *         schema:
 *           type: string
 *         description: Purchase token (alternative to query param)
 *     responses:
 *       200:
 *         description: Audio stream
 *         content:
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Purchase verification required
 *       403:
 *         description: Access denied - purchase required
 *       404:
 *         description: Track or audio file not found
 */
// Get audio stream (PROTECTED - requires purchase verification, except for admins)
// This route must come before /:id to avoid route conflicts
router.get(
  '/:id/audio/stream',
  optionalAuth,
  checkApiKey,
  checkOrigin,
  async (req, res) => {
    try {
      const track = await Track.findById(req.params.id);
      if (!track) {
        return res.status(404).json({ message: 'Track not found' });
      }

      // Check if user is admin (admins can access audio without purchase verification)
      const isAdmin = req.user && req.user.role === 'admin';

      if (!isAdmin) {
        // For non-admin users, require purchase verification
        const saleSerialId = req.query.orderId || req.headers['x-order-id'];
        const purchaseToken =
          req.query.token || req.headers['x-purchase-token'];

        if (!saleSerialId && !purchaseToken) {
          return res.status(401).json({
            message:
              'Purchase verification required. Please provide order ID (saleSerialId) or purchase token.',
          });
        }

        // Verify purchase
        let purchaseVerified = false;

        if (purchaseToken) {
          const sale = await Sale.findOne({
            trackId: track._id,
            transactionId: purchaseToken,
            paymentStatus: 'completed',
          });
          purchaseVerified = !!sale;
        } else if (saleSerialId) {
          // Verify by saleSerialId (orderId)
          const sale = await Sale.findOne({
            trackId: track._id,
            saleSerialId: saleSerialId.trim(),
            paymentStatus: 'completed',
          });
          purchaseVerified = !!sale;
        }

        if (!purchaseVerified) {
          return res.status(403).json({
            message:
              'Access denied. You must purchase this track to access the audio file.',
          });
        }
      }

      // Stream audio from Cloudinary through server
      // This prevents direct URL access and makes it harder to download
      try {
        const audioResponse = await fetch(track.audio);

        if (!audioResponse.ok) {
          return res.status(404).json({ message: 'Audio file not found' });
        }

        // Set appropriate headers for audio streaming
        res.setHeader(
          'Content-Type',
          audioResponse.headers.get('content-type') || 'audio/mpeg',
        );
        res.setHeader(
          'Content-Length',
          audioResponse.headers.get('content-length') || '',
        );
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader(
          'Cache-Control',
          'private, no-cache, no-store, must-revalidate',
        );
        res.setHeader('X-Content-Type-Options', 'nosniff');

        // Stream the audio file
        if (
          audioResponse.body &&
          typeof audioResponse.body.pipe === 'function'
        ) {
          audioResponse.body.pipe(res);
        } else {
          // Fallback for older Node.js versions
          const buffer = await audioResponse.arrayBuffer();
          res.send(Buffer.from(buffer));
        }
      } catch (streamError) {
        res.status(500).json({
          message: 'Error streaming audio file',
          error: streamError.message,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching audio stream',
        error: error.message,
      });
    }
  },
);

/**
 * @swagger
 * /tracks/{id}/audio:
 *   get:
 *     summary: Get audio file URL (🔒 ADMIN / 👤 PURCHASED USER)
 *     tags: [Tracks]
 *     description: |
 *       **Access Level:**
 *       - 🔒 **ADMIN**: Full access without purchase verification
 *       - 👤 **PURCHASED USER**: Requires purchase verification (email or purchase token)
 *
 *       Get audio file URL. Public users must purchase the track first.
 *     security:
 *       - apiKey: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Track ID
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *         description: Order ID (saleSerialId) for purchase verification
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         description: Purchase token (for purchase verification)
 *     responses:
 *       200:
 *         description: Audio URL with expiration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 audioUrl:
 *                   type: string
 *                   format: uri
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Purchase verification required
 *       403:
 *         description: Access denied - purchase required
 *       404:
 *         description: Track not found
 */
// Get audio file URL (PROTECTED - requires purchase verification, except for admins)
router.get(
  '/:id/audio',
  optionalAuth,
  checkApiKey,
  checkOrigin,
  async (req, res) => {
    try {
      const track = await Track.findById(req.params.id);
      if (!track) {
        return res.status(404).json({ message: 'Track not found' });
      }

      // Check if user is admin (admins can access audio without purchase verification)
      const isAdmin = req.user && req.user.role === 'admin';

      if (!isAdmin) {
        // For non-admin users, require purchase verification
        const saleSerialId = req.query.orderId || req.headers['x-order-id'];
        const purchaseToken =
          req.query.token || req.headers['x-purchase-token'];

        if (!saleSerialId && !purchaseToken) {
          return res.status(401).json({
            message:
              'Purchase verification required. Please provide order ID (saleSerialId) or purchase token.',
          });
        }

        // Verify purchase
        let purchaseVerified = false;

        if (purchaseToken) {
          const sale = await Sale.findOne({
            trackId: track._id,
            transactionId: purchaseToken,
            paymentStatus: 'completed',
          });
          purchaseVerified = !!sale;
        } else if (saleSerialId) {
          // Verify by saleSerialId (orderId)
          const sale = await Sale.findOne({
            trackId: track._id,
            saleSerialId: saleSerialId.trim(),
            paymentStatus: 'completed',
          });
          purchaseVerified = !!sale;
        }

        if (!purchaseVerified) {
          return res.status(403).json({
            message:
              'Access denied. You must purchase this track to access the audio file.',
          });
        }
      }

      // Return audio URL with short expiration
      // Note: For maximum security, consider using the streaming endpoint instead
      res.json({
        audioUrl: track.audio,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching audio',
        error: error.message,
      });
    }
  },
);

/**
 * @swagger
 * /tracks/{id}:
 *   get:
 *     summary: Get single track (🌐 PUBLIC)
 *     tags: [Tracks]
 *     description: |
 *       **Access Level: 🌐 PUBLIC**
 *
 *       Get a single track by ID.
 *       - **Public users**: Full audio URL is hidden for security, but previewAudio is available for public playback
 *       - **Admin users**: All audio URLs (including full audio) are included in response
 *     security:
 *       - apiKey: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Track ID
 *     responses:
 *       200:
 *         description: Track details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Track'
 *       404:
 *         description: Track not found
 */
// Get single track (PUBLIC - with optional API key or origin check)
// Returns track without audio URL for security (except for admins)
/**
 * @swagger
 * /tracks/{id}/view:
 *   post:
 *     summary: Increment track view count (🌐 PUBLIC)
 *     tags: [Tracks]
 *     description: |
 *       **Access Level: 🌐 PUBLIC**
 *
 *       Increment the view count for a track. This endpoint is called when a user views/clicks on a track.
 *       No authentication required.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Track ID
 *     responses:
 *       200:
 *         description: View count incremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 views:
 *                   type: integer
 *                   description: Updated view count
 *       404:
 *         description: Track not found
 *       500:
 *         description: Server error
 */
// Increment track view count (PUBLIC - no authentication required)
router.post(
  '/:id/view',
  optionalAuth,
  checkApiKey,
  checkOrigin,
  async (req, res) => {
    try {
      const track = await Track.findByIdAndUpdate(
        req.params.id,
        { $inc: { views: 1 } },
        { new: true },
      );

      if (!track) {
        return res.status(404).json({ message: 'Track not found' });
      }

      res.json({
        message: 'View count incremented',
        views: track.views,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error incrementing view count',
        error: error.message,
      });
    }
  },
);

router.get('/:id', optionalAuth, checkApiKey, checkOrigin, async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    // Check if user is admin (authenticated admin users can see audio URLs and views)
    const isAdmin = req.user && req.user.role === 'admin';

    const trackObj = track.toObject();
    if (!isAdmin) {
      delete trackObj.audio; // Remove audio URL from public response for non-admins
      delete trackObj.views; // Remove views from public API for non-admins
    }

    res.json(trackObj);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching track',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /tracks:
 *   post:
 *     summary: Create a new track (🔒 ADMIN ONLY)
 *     tags: [Tracks]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Create a new track. Thumbnail and audio must be uploaded first using upload endpoints.
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
 *               - thumbnail
 *               - title
 *               - audio
 *               - previewAudio
 *               - releaseDate
 *               - price
 *               - category
 *             properties:
 *               thumbnail:
 *                 type: string
 *                 format: uri
 *                 description: Thumbnail URL from /tracks/upload/thumbnail
 *               title:
 *                 type: string
 *                 example: "My Track"
 *               audio:
 *                 type: string
 *                 format: uri
 *                 description: Audio URL from /tracks/upload/audio
 *               previewAudio:
 *                 type: string
 *                 format: uri
 *                 description: Preview/short audio URL from /tracks/upload/preview-audio (publicly accessible)
 *               releaseDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               price:
 *                 type: number
 *                 example: 100
 *               category:
 *                 type: string
 *                 enum: [Rock, Folk, Hip-Hop, "Jazz & Blues", "Modern Song", Classical]
 *     responses:
 *       201:
 *         description: Track created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Track'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
// Create track (protected) - Only accepts URLs, not files
router.post('/', authenticateToken, async (req, res) => {
  // Invalidate cache when creating new track
  invalidateRouteCache('tracks');
  try {
    const {
      thumbnail,
      title,
      audio,
      previewAudio,
      releaseDate,
      price,
      category,
    } = req.body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!thumbnail || typeof thumbnail !== 'string') {
      return res.status(400).json({ message: 'Thumbnail URL is required' });
    }

    if (!audio || typeof audio !== 'string') {
      return res.status(400).json({ message: 'Audio URL is required' });
    }

    if (!releaseDate) {
      return res.status(400).json({ message: 'Release date is required' });
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({ message: 'Category is required' });
    }

    // Validate category is one of the allowed values
    const allowedCategories = [
      'Rock',
      'Folk',
      'Hip-Hop',
      'Jazz & Blues',
      'Modern Song',
      'Classical',
    ];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        message: `Category must be one of: ${allowedCategories.join(', ')}`,
      });
    }

    if (!price || isNaN(price) || parseFloat(price) < 0) {
      return res.status(400).json({ message: 'Valid price is required' });
    }

    // Validate URL format
    if (thumbnail.startsWith('data:') || audio.startsWith('data:')) {
      return res.status(400).json({
        message:
          'Base64 data is not allowed. Please upload files first using /api/tracks/upload/thumbnail and /api/tracks/upload/audio endpoints, then use the returned URLs.',
      });
    }

    if (!thumbnail.startsWith('http://') && !thumbnail.startsWith('https://')) {
      return res.status(400).json({
        message:
          'Invalid thumbnail URL format. Must be a valid HTTP/HTTPS URL.',
      });
    }

    if (!audio.startsWith('http://') && !audio.startsWith('https://')) {
      return res.status(400).json({
        message: 'Invalid audio URL format. Must be a valid HTTP/HTTPS URL.',
      });
    }

    if (
      !previewAudio ||
      typeof previewAudio !== 'string' ||
      previewAudio.trim() === ''
    ) {
      return res.status(400).json({ message: 'Preview audio URL is required' });
    }

    // Validate previewAudio URL format
    if (previewAudio.startsWith('data:')) {
      return res.status(400).json({
        message:
          'Base64 data is not allowed. Please upload preview audio first using /api/tracks/upload/preview-audio endpoint, then use the returned URL.',
      });
    }
    if (
      !previewAudio.startsWith('http://') &&
      !previewAudio.startsWith('https://')
    ) {
      return res.status(400).json({
        message:
          'Invalid preview audio URL format. Must be a valid HTTP/HTTPS URL.',
      });
    }

    const trackData = {
      thumbnail,
      title: title.trim(),
      audio,
      previewAudio,
      releaseDate: new Date(releaseDate),
      price: parseFloat(price),
      category: category.trim(),
    };

    const track = new Track(trackData);
    await track.save();
    res.status(201).json(track);
  } catch (error) {
    res.status(500).json({
      message: 'Error creating track',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /tracks/{id}:
 *   put:
 *     summary: Update a track (🔒 ADMIN ONLY)
 *     tags: [Tracks]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Update an existing track. All fields are optional.
 *       Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Track ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               thumbnail:
 *                 type: string
 *                 format: uri
 *               title:
 *                 type: string
 *               audio:
 *                 type: string
 *                 format: uri
 *               previewAudio:
 *                 type: string
 *                 format: uri
 *                 description: Preview/short audio URL (publicly accessible)
 *               releaseDate:
 *                 type: string
 *                 format: date
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *                 enum: [Rock, Folk, Hip-Hop, "Jazz & Blues", "Modern Song", Classical]
 *     responses:
 *       200:
 *         description: Track updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Track'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Track not found
 */
// Update track (protected) - Only accepts URLs, not files
router.put('/:id', authenticateToken, async (req, res) => {
  // Invalidate cache when updating track
  invalidateRouteCache('tracks');
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    const {
      thumbnail,
      title,
      audio,
      previewAudio,
      releaseDate,
      price,
      category,
    } = req.body;

    // Validate fields if provided
    if (
      title !== undefined &&
      (typeof title !== 'string' || title.trim() === '')
    ) {
      return res
        .status(400)
        .json({ message: 'Title must be a non-empty string' });
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || category.trim() === '') {
        return res
          .status(400)
          .json({ message: 'Category must be a non-empty string' });
      }
      // Validate category is one of the allowed values
      const allowedCategories = [
        'Rock',
        'Folk',
        'Hip-Hop',
        'Jazz & Blues',
        'Modern Song',
        'Classical',
      ];
      if (!allowedCategories.includes(category.trim())) {
        return res.status(400).json({
          message: `Category must be one of: ${allowedCategories.join(', ')}`,
        });
      }
    }

    if (price !== undefined && (isNaN(price) || parseFloat(price) < 0)) {
      return res
        .status(400)
        .json({ message: 'Price must be a valid positive number' });
    }

    // Validate thumbnail URL if provided
    if (thumbnail) {
      if (thumbnail.startsWith('data:')) {
        return res.status(400).json({
          message:
            'Base64 data is not allowed. Please upload the thumbnail first using /api/tracks/upload/thumbnail endpoint, then use the returned URL.',
        });
      }
      if (
        !thumbnail.startsWith('http://') &&
        !thumbnail.startsWith('https://')
      ) {
        return res.status(400).json({
          message:
            'Invalid thumbnail URL format. Must be a valid HTTP/HTTPS URL.',
        });
      }
    }

    // Validate audio URL if provided
    if (audio) {
      if (audio.startsWith('data:')) {
        return res.status(400).json({
          message:
            'Base64 data is not allowed. Please upload the audio first using /api/tracks/upload/audio endpoint, then use the returned URL.',
        });
      }
      if (!audio.startsWith('http://') && !audio.startsWith('https://')) {
        return res.status(400).json({
          message: 'Invalid audio URL format. Must be a valid HTTP/HTTPS URL.',
        });
      }
    }

    // Validate previewAudio URL if provided
    if (previewAudio !== undefined) {
      if (previewAudio === null || previewAudio === '') {
        return res.status(400).json({
          message: 'Preview audio URL is required and cannot be empty.',
        });
      }
      if (previewAudio.startsWith('data:')) {
        return res.status(400).json({
          message:
            'Base64 data is not allowed. Please upload preview audio first using /api/tracks/upload/preview-audio endpoint, then use the returned URL.',
        });
      }
      if (
        !previewAudio.startsWith('http://') &&
        !previewAudio.startsWith('https://')
      ) {
        return res.status(400).json({
          message:
            'Invalid preview audio URL format. Must be a valid HTTP/HTTPS URL.',
        });
      }
    }

    const trackData = {};
    if (thumbnail !== undefined) {
      trackData.thumbnail = thumbnail;
    }
    if (title !== undefined) {
      trackData.title = title.trim();
    }
    if (audio !== undefined) {
      trackData.audio = audio;
    }
    if (previewAudio !== undefined) {
      trackData.previewAudio = previewAudio;
    }
    if (releaseDate !== undefined) {
      trackData.releaseDate = new Date(releaseDate);
    }
    if (price !== undefined) {
      trackData.price = parseFloat(price);
    }
    if (category !== undefined) {
      trackData.category = category.trim();
    }

    const updatedTrack = await Track.findByIdAndUpdate(
      req.params.id,
      trackData,
      { new: true, runValidators: true },
    );

    res.json(updatedTrack);
  } catch (error) {
    res.status(500).json({
      message: 'Error updating track',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /tracks/{id}:
 *   delete:
 *     summary: Delete a track (🔒 ADMIN ONLY)
 *     tags: [Tracks]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Delete a track by ID.
 *       Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Track ID
 *     responses:
 *       200:
 *         description: Track deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Track deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Track not found
 */
// Delete track (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  // Invalidate cache when deleting track
  invalidateRouteCache('tracks');
  try {
    const track = await Track.findByIdAndDelete(req.params.id);
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }
    res.json({ message: 'Track deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting track',
      error: error.message,
    });
  }
});

export default router;
