import express from 'express';
import Contact from './Contact.js';
import { authenticateToken } from '../auth/index.js';
import { checkApiKey, checkOrigin } from '../../middleware/apiKey.js';
import { sanitizeContact } from '../../utils/sanitize.js';
import { isValidEmail, isValidRequiredString } from '../../utils/validation.js';
import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
} from '../../utils/response.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../../utils/constants.js';
import { logger } from '../../utils/logger.js';
import { sendContactNotification } from '../../utils/email.js';

const router = express.Router();

/**
 * @swagger
 * /contacts:
 *   post:
 *     summary: Submit contact form (🌐 PUBLIC)
 *     tags: [Contacts]
 *     description: |
 *       **Access Level: 🌐 PUBLIC**
 *
 *       Submit a contact form. All inputs are sanitized to prevent XSS and injection attacks.
 *       Public endpoint with optional API key or origin check.
 *     security:
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phoneNumber
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: "John Doe"
 *               phoneNumber:
 *                 type: string
 *                 maxLength: 20
 *                 example: "+1234567890"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               subject:
 *                 type: string
 *                 maxLength: 200
 *                 example: "Inquiry about services"
 *               message:
 *                 type: string
 *                 maxLength: 5000
 *                 example: "I would like to know more about your services."
 *     responses:
 *       201:
 *         description: Contact form submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Thank you for your message. We will get back to you soon."
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
// Submit contact form (PUBLIC)
router.post('/', checkApiKey, checkOrigin, async (req, res) => {
  try {
    const { name, phoneNumber, email, subject, message } = req.body;

    // Sanitize all inputs
    const sanitized = sanitizeContact({
      name,
      phoneNumber,
      email,
      subject,
      message,
    });

    // Validate required fields after sanitization
    if (!isValidRequiredString(sanitized.name)) {
      return sendValidationError(
        res,
        'Name is required and must be a valid string',
      );
    }

    if (!isValidRequiredString(sanitized.phoneNumber)) {
      return sendValidationError(res, 'Phone number is required');
    }

    if (!isValidEmail(sanitized.email)) {
      return sendValidationError(res, 'Valid email address is required');
    }

    if (!isValidRequiredString(sanitized.subject)) {
      return sendValidationError(res, 'Subject is required');
    }

    if (!isValidRequiredString(sanitized.message)) {
      return sendValidationError(res, 'Message is required');
    }

    // Create contact entry first (this must succeed)
    const contact = new Contact(sanitized);
    await contact.save();

    logger.info('Contact form submitted', {
      contactId: contact._id,
      email: sanitized.email,
    });

    // Send email notification to admin (non-blocking - don't wait for it)
    // Even if email fails, the contact is already saved
    sendContactNotification(sanitized)
      .then(() => {
        logger.info('Contact notification email sent successfully', {
          contactId: contact._id,
        });
      })
      .catch((error) => {
        // Log error but don't fail the request
        logger.error('Failed to send contact notification email', {
          error: error.message,
          contactId: contact._id,
          email: sanitized.email,
        });
        // Contact is already saved, so we continue
      });

    // Return success immediately - contact is saved regardless of email status
    return sendSuccess(
      res,
      HTTP_STATUS.CREATED,
      contact,
      'Thank you for your message. We will get back to you soon.',
    );
  } catch (error) {
    logger.error('Error submitting contact form', error);
    return sendError(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'Failed to submit contact form',
      error,
    );
  }
});

/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: Get all contacts (🔒 ADMIN ONLY)
 *     tags: [Contacts]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Get all contact form submissions. Admin-only endpoint for viewing inbox.
 *       Supports filtering by read/unread status.
 *       Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status (true/false)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of contacts to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Contact'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
// Get all contacts (ADMIN ONLY)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { isRead, limit = 50, page = 1 } = req.query;

    // Build query
    const query = {};
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10))); // Max 100 per page
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const total = await Contact.countDocuments(query);

    // Get contacts
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    return sendSuccess(res, HTTP_STATUS.OK, {
      contacts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Error fetching contacts', error);
    return sendError(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'Failed to fetch contacts',
      error,
    );
  }
});

/**
 * @swagger
 * /contacts/{id}:
 *   get:
 *     summary: Get single contact (🔒 ADMIN ONLY)
 *     tags: [Contacts]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Get a single contact by ID. Automatically marks the contact as read.
 *       Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Contact details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Contact'
 *       404:
 *         description: Contact not found
 */
// Get single contact (ADMIN ONLY) - Marks as read
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return sendNotFound(res, 'Contact');
    }

    // Mark as read if not already read
    if (!contact.isRead) {
      contact.isRead = true;
      contact.readAt = new Date();
      await contact.save();
    }

    return sendSuccess(res, HTTP_STATUS.OK, contact);
  } catch (error) {
    logger.error('Error fetching contact', error);
    return sendError(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'Failed to fetch contact',
      error,
    );
  }
});

export default router;
