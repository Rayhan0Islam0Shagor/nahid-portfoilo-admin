import express from 'express';
import Sale from './Sale.js';
import Track from '../tracks/Track.js';
import { updateTrackStatistics } from '../tracks/trackStatistics.js';
import { checkApiKey, checkOrigin } from '../../middleware/apiKey.js';
import { authenticateToken } from '../auth/index.js';

const router = express.Router();

/**
 * @swagger
 * /sales:
 *   get:
 *     summary: Get all sales (🔒 ADMIN ONLY)
 *     tags: [Sales]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Get all sales records. Admin-only endpoint for viewing all purchase history.
 *       Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sales
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sale'
 */
// Get all sales (protected - admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('trackId', 'title thumbnail price category')
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching sales',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /sales/track/{trackId}:
 *   get:
 *     summary: Get sales by track (🔒 ADMIN ONLY)
 *     tags: [Sales]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Get all sales records for a specific track. Admin-only endpoint for viewing purchase history of a track.
 *       Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trackId
 *         required: true
 *         schema:
 *           type: string
 *         description: Track ID
 *     responses:
 *       200:
 *         description: List of sales for the track
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sale'
 */
// Get sales by track (protected - admin only)
router.get('/track/:trackId', authenticateToken, async (req, res) => {
  try {
    const sales = await Sale.find({ trackId: req.params.trackId })
      .populate('trackId', 'title thumbnail price category')
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching sales',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /sales/download/{saleSerialId}:
 *   get:
 *     summary: Download track after payment success (🌐 PUBLIC)
 *     tags: [Sales]
 *     description: |
 *       **Access Level: 🌐 PUBLIC**
 *
 *       Download a purchased track using the sale serial ID (orderId).
 *       Only available for completed payments.
 *     security:
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: saleSerialId
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale Serial ID (Order ID) for tracking
 *     responses:
 *       200:
 *         description: Track file download
 *         content:
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Payment not completed or access denied
 *       404:
 *         description: Sale not found
 */
// Download track after payment success (PUBLIC) - Must be before /:id route
router.get(
  '/download/:saleSerialId',
  checkApiKey,
  checkOrigin,
  async (req, res) => {
    try {
      const { saleSerialId } = req.params;

      // Find sale by saleSerialId
      const sale = await Sale.findOne({ saleSerialId }).populate('trackId');

      if (!sale) {
        return res.status(404).json({
          message: 'Sale not found. Please check your order ID.',
        });
      }

      // Verify payment is completed
      if (sale.paymentStatus !== 'completed') {
        return res.status(403).json({
          message:
            'Download is only available for completed payments. Current status: ' +
            sale.paymentStatus,
        });
      }

      // Get track details
      const track = await Track.findById(sale.trackId);
      if (!track) {
        return res.status(404).json({ message: 'Track not found' });
      }

      if (!track.audio) {
        return res.status(404).json({ message: 'Audio file not available' });
      }

      // Fetch audio file from Cloudinary
      try {
        const audioResponse = await fetch(track.audio);

        if (!audioResponse.ok) {
          return res.status(404).json({ message: 'Audio file not found' });
        }

        // Set headers for file download
        const contentDisposition = `attachment; filename="${track.title.replace(
          /[^a-z0-9]/gi,
          '_',
        )}.mp3"`;
        res.setHeader('Content-Disposition', contentDisposition);
        res.setHeader(
          'Content-Type',
          audioResponse.headers.get('content-type') || 'audio/mpeg',
        );
        res.setHeader(
          'Content-Length',
          audioResponse.headers.get('content-length') || '',
        );
        res.setHeader('X-Order-ID', sale.saleSerialId);
        res.setHeader('X-Track-Title', track.title);

        // Stream the audio file for download
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
      } catch (downloadError) {
        res.status(500).json({
          message: 'Error downloading audio file',
          error: downloadError.message,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: 'Error processing download request',
        error: error.message,
      });
    }
  },
);

/**
 * @swagger
 * /sales/{id}:
 *   get:
 *     summary: Get single sale (🔒 ADMIN ONLY)
 *     tags: [Sales]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Get a single sale record by ID. Admin-only endpoint for viewing purchase details.
 *       Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       404:
 *         description: Sale not found
 */
// Get single sale (protected - admin only)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate(
      'trackId',
      'title thumbnail price category',
    );
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json(sale);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching sale',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /sales:
 *   post:
 *     summary: Create sale - Purchase track (🌐 PUBLIC)
 *     tags: [Sales]
 *     description: |
 *       **Access Level: 🌐 PUBLIC**
 *
 *       Create a sale record for track purchase. Public endpoint for users to purchase tracks.
 *       Returns a purchase token that can be used to access the purchased track's audio file.
 *
 *       **Note**: After purchase, use the returned `purchaseToken` to access audio via `/tracks/{id}/audio` endpoint.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trackId
 *             properties:
 *               trackId:
 *                 type: string
 *                 description: Track ID to purchase
 *               paymentMethod:
 *                 type: string
 *               transactionId:
 *                 type: string
 *                 description: Optional transaction ID
 *     responses:
 *       201:
 *         description: Sale created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Sale'
 *                 - type: object
 *                   properties:
 *                     purchaseToken:
 *                       type: string
 *                       description: Purchase token for accessing audio
 */
// Create sale (PUBLIC - for track purchases)
router.post('/', checkApiKey, checkOrigin, async (req, res) => {
  try {
    const { trackId, paymentMethod, transactionId } = req.body;

    // Validate required fields
    if (!trackId) {
      return res.status(400).json({ message: 'Track ID is required' });
    }

    // Find the track
    const track = await Track.findById(trackId);
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    // Generate purchase token (unique identifier for this purchase)
    const purchaseToken =
      transactionId ||
      `purchase_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create sale (tracking by serialID only)
    const saleData = {
      trackId: track._id,
      trackTitle: track.title,
      price: track.price,
      paymentStatus: 'completed', // You can integrate with payment gateway later
      paymentMethod: paymentMethod || 'manual',
      transactionId: purchaseToken,
    };

    const sale = new Sale(saleData);
    await sale.save();

    // Update track statistics (saleCount and totalSoldPrice)
    await updateTrackStatistics(track._id, track.price, 'increment');

    // Return sale with purchase token for accessing audio
    res.status(201).json({
      ...sale.toObject(),
      purchaseToken, // Include token for client to use when accessing audio
      saleSerialId: sale.saleSerialId, // Order ID for tracking
      orderId: sale.saleSerialId, // Alias for orderId
      downloadUrl: `/api/sales/download/${sale.saleSerialId}`, // Download URL after payment success
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating sale',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /sales/{id}:
 *   put:
 *     summary: Update sale (🔒 ADMIN ONLY)
 *     tags: [Sales]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Update a sale record. Admin-only endpoint for updating payment status, payment method, or transaction ID.
 *       Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, completed, failed, refunded]
 *               paymentMethod:
 *                 type: string
 *               transactionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sale updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       404:
 *         description: Sale not found
 */
// Update sale (protected - admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { paymentStatus, paymentMethod, transactionId } = req.body;

    const saleData = {};
    if (paymentStatus) {
      saleData.paymentStatus = paymentStatus;
    }
    if (paymentMethod) {
      saleData.paymentMethod = paymentMethod;
    }
    if (transactionId) {
      saleData.transactionId = transactionId;
    }

    const sale = await Sale.findByIdAndUpdate(req.params.id, saleData, {
      new: true,
      runValidators: true,
    })
      .populate('trackId', 'title thumbnail price category')
      .exec();

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.json(sale);
  } catch (error) {
    res.status(500).json({
      message: 'Error updating sale',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /sales/{id}:
 *   delete:
 *     summary: Delete sale (🔒 ADMIN ONLY)
 *     tags: [Sales]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Delete a sale record by ID. Admin-only endpoint for removing sale records.
 *       Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sale deleted successfully
 *       404:
 *         description: Sale not found
 */
// Delete sale (protected - admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting sale',
      error: error.message,
    });
  }
});

export default router;
