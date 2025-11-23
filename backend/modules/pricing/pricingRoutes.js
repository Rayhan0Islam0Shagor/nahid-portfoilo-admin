import express from 'express';
import Pricing from './Pricing.js';
import { authenticateToken } from '../auth/index.js';
import { checkApiKey, checkOrigin } from '../../middleware/apiKey.js';
import { cacheMiddleware } from '../../middleware/cache.js';
import { invalidateRouteCache } from '../../utils/cacheHelper.js';

const router = express.Router();

/**
 * @swagger
 * /pricing:
 *   get:
 *     summary: Get all pricing plans (🌐 PUBLIC)
 *     tags: [Pricing]
 *     description: |
 *       **Access Level: 🌐 PUBLIC**
 *
 *       Get all pricing plans. Public endpoint with optional API key or origin check.
 *     security:
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: List of pricing plans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pricing'
 */
// Get all pricing plans (PUBLIC - with optional API key or origin check)
router.get(
  '/',
  cacheMiddleware.long,
  checkApiKey,
  checkOrigin,
  async (req, res) => {
    try {
      const plans = await Pricing.find().sort({ price: 1 });
      res.json(plans);
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching pricing plans',
        error: error.message,
      });
    }
  },
);

/**
 * @swagger
 * /pricing/{id}:
 *   get:
 *     summary: Get single pricing plan (🌐 PUBLIC)
 *     tags: [Pricing]
 *     description: |
 *       **Access Level: 🌐 PUBLIC**
 *
 *       Get a single pricing plan by ID. Public endpoint with optional API key or origin check.
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
 *         description: Pricing plan details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pricing'
 *       404:
 *         description: Pricing plan not found
 */
// Get single pricing plan (PUBLIC - with optional API key or origin check)
router.get('/:id', checkApiKey, checkOrigin, async (req, res) => {
  try {
    const plan = await Pricing.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Pricing plan not found' });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching pricing plan',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /pricing:
 *   post:
 *     summary: Create pricing plan (🔒 ADMIN ONLY)
 *     tags: [Pricing]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Create a new pricing plan.
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
 *               - title
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Basic Plan"
 *               price:
 *                 type: number
 *                 example: 100
 *     responses:
 *       201:
 *         description: Pricing plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pricing'
 */
// Create pricing plan (protected)
router.post('/', authenticateToken, async (req, res) => {
  invalidateRouteCache('pricing');
  try {
    const { title, price } = req.body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!price || isNaN(price) || parseFloat(price) < 0) {
      return res.status(400).json({ message: 'Valid price is required' });
    }

    const planData = {
      title: title.trim(),
      price: parseFloat(price),
    };

    const plan = new Pricing(planData);
    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({
      message: 'Error creating pricing plan',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /pricing/{id}:
 *   put:
 *     summary: Update pricing plan (🔒 ADMIN ONLY)
 *     tags: [Pricing]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Update an existing pricing plan.
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
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Pricing plan updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pricing'
 *       404:
 *         description: Pricing plan not found
 */
// Update pricing plan (protected)
router.put('/:id', authenticateToken, async (req, res) => {
  invalidateRouteCache('pricing');
  try {
    const { title, price } = req.body;

    // Validate required fields
    if (
      title !== undefined &&
      (typeof title !== 'string' || title.trim() === '')
    ) {
      return res
        .status(400)
        .json({ message: 'Title must be a non-empty string' });
    }

    if (price !== undefined && (isNaN(price) || parseFloat(price) < 0)) {
      return res
        .status(400)
        .json({ message: 'Price must be a valid positive number' });
    }

    const planData = {};
    if (title !== undefined) {
      planData.title = title.trim();
    }
    if (price !== undefined) {
      planData.price = parseFloat(price);
    }

    const plan = await Pricing.findByIdAndUpdate(req.params.id, planData, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      return res.status(404).json({ message: 'Pricing plan not found' });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({
      message: 'Error updating pricing plan',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /pricing/{id}:
 *   delete:
 *     summary: Delete pricing plan (🔒 ADMIN ONLY)
 *     tags: [Pricing]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Delete a pricing plan by ID.
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
 *         description: Pricing plan deleted successfully
 *       404:
 *         description: Pricing plan not found
 */
// Delete pricing plan (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  invalidateRouteCache('pricing');
  try {
    const plan = await Pricing.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Pricing plan not found' });
    }
    res.json({ message: 'Pricing plan deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting pricing plan',
      error: error.message,
    });
  }
});

export default router;
