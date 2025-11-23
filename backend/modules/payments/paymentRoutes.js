import express from 'express';
import { authenticateToken } from '../auth/index.js';
import { checkApiKey, checkOrigin } from '../../middleware/apiKey.js';
import Sale from '../sales/Sale.js';
import Track from '../tracks/Track.js';
import { updateTrackStatistics } from '../tracks/trackStatistics.js';
import {
  createPayment,
  executePayment,
  queryPayment,
  refundPayment,
  generateInvoiceNumber,
} from './bkash.js';
import {
  sendSuccess,
  sendError,
  sendValidationError,
} from '../../utils/response.js';
import { HTTP_STATUS } from '../../utils/constants.js';
import { logger } from '../../utils/logger.js';

const router = express.Router();

/**
 * @swagger
 * /payments/bkash/test-token:
 *   get:
 *     summary: Test bKash token grant (🔒 ADMIN ONLY)
 *     tags: [Payments]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Test endpoint to verify bKash credentials and token grant.
 *       Useful for debugging authentication issues.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token grant test result
 */
// Test bKash token grant (ADMIN ONLY - for debugging)
router.get('/bkash/test-token', authenticateToken, async (req, res) => {
  try {
    const { getAccessToken } = await import('./bkash.js');
    const token = await getAccessToken();

    // Get configuration details for diagnostics
    const config = {
      baseUrl:
        process.env.BKASH_BASE_URL ||
        'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
      paymentUrl:
        process.env.BKASH_PAYMENT_URL ||
        process.env.BKASH_BASE_URL ||
        'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
      tokenGrantEndpoint: `${
        process.env.BKASH_BASE_URL ||
        'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
      }/tokenized/checkout/token/grant`,
      paymentCreateEndpoint: `${
        process.env.BKASH_PAYMENT_URL ||
        process.env.BKASH_BASE_URL ||
        'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
      }/tokenized/checkout/payment/create`,
      hasAppKey: !!process.env.BKASH_APP_KEY,
      hasAppSecret: !!process.env.BKASH_APP_SECRET,
      hasUsername: !!process.env.BKASH_USERNAME,
      hasPassword: !!process.env.BKASH_PASSWORD,
    };

    return sendSuccess(res, HTTP_STATUS.OK, {
      success: true,
      message: 'Token grant successful',
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : null,
      configuration: config,
      note: 'If payment creation fails with 403 AWS SigV4 error, verify: 1) You are using Tokenized Checkout API credentials (not Payment Gateway), 2) Your bKash developer portal application is set to "Tokenized Checkout" type, 3) The endpoint URLs are correct',
    });
  } catch (error) {
    logger.error('bKash token grant test failed', error);
    return sendError(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message || 'Failed to get access token',
      error,
    );
  }
});

/**
 * @swagger
 * /payments/bkash/create:
 *   post:
 *     summary: Create bKash payment (🌐 PUBLIC)
 *     tags: [Payments]
 *     description: |
 *       **Access Level: 🌐 PUBLIC**
 *
 *       Create a bKash payment for track purchase.
 *       Returns payment URL for user to complete payment.
 *     security:
 *       - apiKey: []
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
 *     responses:
 *       200:
 *         description: Payment created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
// Create bKash payment (PUBLIC)
router.post('/bkash/create', checkApiKey, checkOrigin, async (req, res) => {
  try {
    const { trackId } = req.body;

    // Validate required fields
    if (!trackId) {
      return sendValidationError(res, 'Track ID is required');
    }

    // Get track details
    const track = await Track.findById(trackId);
    if (!track) {
      return sendValidationError(res, 'Track not found');
    }

    if (!track.price || track.price <= 0) {
      return sendValidationError(res, 'Track price is invalid');
    }

    // Generate unique invoice number
    const merchantInvoiceNumber = generateInvoiceNumber(trackId);

    // Create callback URL with trackId for tracking (NO sale created yet)
    // Sale will only be created AFTER successful payment in the callback
    const baseCallbackUrl =
      process.env.BKASH_CALLBACK_URL ||
      `${
        process.env.API_URL || 'http://localhost:5000'
      }/api/payments/bkash/callback`;
    // Prioritize PORTFOLIO_URL over FRONTEND_URL (admin)
    // Portfolio runs on port 3000, admin runs on port 5173
    const frontendUrl =
      process.env.PORTFOLIO_URL ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';

    // Pass trackId in callback URL so we can create sale after payment success
    const callbackUrlWithTrackId = `${baseCallbackUrl}?trackId=${trackId}&redirectUrl=${encodeURIComponent(
      frontendUrl,
    )}`;

    // Create payment in bKash (NO sale record created yet)
    const paymentResponse = await createPayment({
      amount: track.price,
      merchantInvoiceNumber: merchantInvoiceNumber,
      intent: 'sale',
      callbackURL: callbackUrlWithTrackId,
    });

    if (!paymentResponse || !paymentResponse.paymentID) {
      return sendError(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Failed to create payment',
      );
    }

    logger.info(
      'bKash payment created (sale will be created after payment success)',
      {
        paymentID: paymentResponse.paymentID,
        trackId: trackId,
        amount: track.price,
      },
    );

    return sendSuccess(res, HTTP_STATUS.OK, {
      paymentID: paymentResponse.paymentID,
      paymentURL: paymentResponse.bkashURL,
      merchantInvoiceNumber: merchantInvoiceNumber,
      amount: track.price,
      trackTitle: track.title,
      note: 'Sale will be created only after successful payment',
    });
  } catch (error) {
    logger.error('Error creating bKash payment', error);
    return sendError(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'Failed to create payment',
      error,
    );
  }
});

/**
 * @swagger
 * /payments/bkash/callback:
 *   post:
 *     summary: bKash payment callback (🌐 PUBLIC)
 *     tags: [Payments]
 *     description: |
 *       **Access Level: 🌐 PUBLIC**
 *
 *       bKash callback endpoint for payment status updates.
 *       This is called by bKash after payment completion.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentID:
 *                 type: string
 *               status:
 *                 type: string
 *               transactionStatus:
 *                 type: string
 *     responses:
 *       200:
 *         description: Callback processed
 */
// bKash payment callback (PUBLIC - called by bKash)
// bKash redirects users via GET request with query parameters
router.get('/bkash/callback', async (req, res) => {
  try {
    const { paymentID, status, transactionStatus } = req.query; // bKash sends via GET query params
    const { trackId, orderId, redirectUrl } = req.query; // Get trackId, orderId (legacy), and redirectUrl from query params

    // Log for debugging
    logger.info('bKash callback received', {
      paymentID,
      status,
      trackId,
      redirectUrl,
      orderId,
      allQueryParams: req.query,
    });

    if (!paymentID) {
      // Redirect to failed page if paymentID is missing
      // Prioritize redirectUrl from query params, then PORTFOLIO_URL, then FRONTEND_URL
      let frontendUrl =
        redirectUrl ||
        process.env.PORTFOLIO_URL ||
        process.env.FRONTEND_URL ||
        'http://localhost:3000';

      frontendUrl = frontendUrl.replace(/\/$/, '');
      const failedUrl = `${frontendUrl}/payment-failed.html?reason=missing-payment-id`;
      logger.info('Missing paymentID redirect URL:', failedUrl);
      return res.redirect(302, failedUrl);
    }

    // Check if payment was cancelled (status = cancel)
    if (status === 'cancel' || status === 'cancelled') {
      logger.info('bKash payment cancelled by user', {
        paymentID,
        trackId,
      });
      let frontendUrl =
        redirectUrl ||
        process.env.PORTFOLIO_URL ||
        process.env.FRONTEND_URL ||
        'http://localhost:3000';

      frontendUrl = frontendUrl.replace(/\/$/, '');
      const cancelUrl = `${frontendUrl}/payment-cancel.html`;
      logger.info('Cancel redirect URL:', cancelUrl);
      return res.redirect(302, cancelUrl);
    }

    // Execute payment to get final status
    const executeResponse = await executePayment(paymentID);

    if (executeResponse && executeResponse.statusCode === '0000') {
      // Payment successful - NOW create the sale record
      if (!trackId) {
        logger.error('TrackId missing in callback - cannot create sale', {
          paymentID,
          orderId,
        });
        // Try to find existing sale by orderId (legacy support)
        const existingSale = orderId
          ? await Sale.findOne({ saleSerialId: orderId })
          : null;
        if (existingSale) {
          existingSale.paymentStatus = 'completed';
          existingSale.transactionId = executeResponse.trxID || paymentID;
          await existingSale.save();
          let frontendUrl =
            redirectUrl ||
            process.env.PORTFOLIO_URL ||
            process.env.FRONTEND_URL ||
            'http://localhost:3000';

          frontendUrl = frontendUrl.replace(/\/$/, '');
          const successUrl = `${frontendUrl}/payment-success.html?orderId=${existingSale.saleSerialId}`;
          logger.info('Legacy sale success redirect URL:', successUrl);
          return res.redirect(302, successUrl);
        }
        let frontendUrl =
          redirectUrl ||
          process.env.PORTFOLIO_URL ||
          process.env.FRONTEND_URL ||
          'http://localhost:3000';

        frontendUrl = frontendUrl.replace(/\/$/, '');
        const failedUrl = `${frontendUrl}/payment-failed.html?reason=missing-track-id`;
        logger.info('Missing trackId redirect URL:', failedUrl);
        return res.redirect(302, failedUrl);
      }

      // Get track details
      const track = await Track.findById(trackId);
      if (!track) {
        logger.error('Track not found in callback', { trackId, paymentID });
        let frontendUrl =
          redirectUrl ||
          process.env.PORTFOLIO_URL ||
          process.env.FRONTEND_URL ||
          'http://localhost:3000';

        frontendUrl = frontendUrl.replace(/\/$/, '');
        const failedUrl = `${frontendUrl}/payment-failed.html?reason=track-not-found`;
        logger.info('Track not found redirect URL:', failedUrl);
        return res.redirect(302, failedUrl);
      }

      // Create sale record ONLY after successful payment
      const sale = new Sale({
        trackId: trackId,
        trackTitle: track.title,
        price: track.price,
        paymentStatus: 'completed', // Payment already successful
        paymentMethod: 'bKash',
        transactionId: executeResponse.trxID || paymentID,
      });
      await sale.save();

      // Update track statistics (saleCount and totalSoldPrice)
      await updateTrackStatistics(trackId, track.price, 'increment');

      logger.info('bKash payment completed - sale created', {
        paymentID: paymentID,
        trxID: executeResponse.trxID,
        saleId: sale._id,
        saleSerialId: sale.saleSerialId,
        trackId: trackId,
      });

      // Redirect to frontend success page with orderId
      // IMPORTANT: bKash may not preserve custom query params, so always use PORTFOLIO_URL as fallback
      // Prioritize redirectUrl from query params, then PORTFOLIO_URL, then FRONTEND_URL
      let frontendUrl =
        redirectUrl ||
        process.env.PORTFOLIO_URL ||
        process.env.FRONTEND_URL ||
        'http://localhost:3000';

      // Ensure frontendUrl doesn't have trailing slash and is properly formatted
      frontendUrl = frontendUrl.replace(/\/$/, '');

      // Log redirect URL for debugging
      logger.info('Redirecting to success page', {
        redirectUrl,
        PORTFOLIO_URL: process.env.PORTFOLIO_URL,
        FRONTEND_URL: process.env.FRONTEND_URL,
        finalUrl: frontendUrl,
        orderId: sale.saleSerialId,
        trackId,
      });

      const successUrl = `${frontendUrl}/payment-success.html?orderId=${sale.saleSerialId}&trackId=${trackId}`;
      logger.info('Success redirect URL:', successUrl);
      return res.redirect(302, successUrl);
    } else {
      // Payment failed - DO NOT create sale record
      logger.warn('bKash payment failed - no sale created', {
        paymentID: paymentID,
        response: executeResponse,
        trackId: trackId,
      });

      // Redirect to frontend failed page
      let frontendUrl =
        redirectUrl ||
        process.env.PORTFOLIO_URL ||
        process.env.FRONTEND_URL ||
        'http://localhost:3000';

      // Ensure frontendUrl doesn't have trailing slash
      frontendUrl = frontendUrl.replace(/\/$/, '');

      const failedUrl = `${frontendUrl}/payment-failed.html?reason=payment-failed&paymentID=${paymentID}`;
      logger.info('Failed redirect URL:', failedUrl);
      return res.redirect(302, failedUrl);
    }
  } catch (error) {
    logger.error('Error processing bKash callback', error);
    // Redirect to frontend error page
    let frontendUrl =
      process.env.PORTFOLIO_URL ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';

    frontendUrl = frontendUrl.replace(/\/$/, '');
    const errorUrl = `${frontendUrl}/payment-failed.html?reason=error`;
    logger.error('Error redirect URL:', errorUrl);
    return res.redirect(302, errorUrl);
  }
});

// bKash payment callback POST endpoint (for webhook/API calls if needed)
router.post('/bkash/callback', async (req, res) => {
  // Handle POST requests if bKash sends webhook
  // Convert POST body to query params and redirect to GET handler
  try {
    const queryParams = new URLSearchParams();
    if (req.body.paymentID) queryParams.append('paymentID', req.body.paymentID);
    if (req.body.status) queryParams.append('status', req.body.status);
    if (req.query.trackId) queryParams.append('trackId', req.query.trackId);
    if (req.query.redirectUrl)
      queryParams.append('redirectUrl', req.query.redirectUrl);
    if (req.query.orderId) queryParams.append('orderId', req.query.orderId);

    const queryString = queryParams.toString();
    return res.redirect(`/api/payments/bkash/callback?${queryString}`);
  } catch (error) {
    logger.error('Error in POST callback handler', error);
    const frontendUrl =
      process.env.PORTFOLIO_URL ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';
    return res.redirect(`${frontendUrl}/payment-failed?reason=callback-error`);
  }
});

/**
 * @swagger
 * /payments/bkash/status/{paymentID}:
 *   get:
 *     summary: Check payment status (🌐 PUBLIC)
 *     tags: [Payments]
 *     description: |
 *       **Access Level: 🌐 PUBLIC**
 *
 *       Check the status of a bKash payment.
 *     security:
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: paymentID
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment status
 */
// Check payment status (PUBLIC)
router.get(
  '/bkash/status/:paymentID',
  checkApiKey,
  checkOrigin,
  async (req, res) => {
    try {
      const { paymentID } = req.params;

      // Query payment from bKash
      const paymentStatus = await queryPayment(paymentID);

      // Also check sale record
      const sale = await Sale.findOne({ transactionId: paymentID });

      return sendSuccess(res, HTTP_STATUS.OK, {
        paymentID: paymentID,
        bKashStatus: paymentStatus,
        saleStatus: sale ? sale.paymentStatus : null,
        sale: sale
          ? {
              id: sale._id,
              saleSerialId: sale.saleSerialId,
              orderId: sale.saleSerialId, // Alias for orderId
              trackId: sale.trackId,
              trackTitle: sale.trackTitle,
              price: sale.price,
              paymentStatus: sale.paymentStatus,
              downloadUrl:
                sale.paymentStatus === 'completed'
                  ? `/api/sales/download/${sale.saleSerialId}`
                  : null,
            }
          : null,
      });
    } catch (error) {
      logger.error('Error checking payment status', error);
      return sendError(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Failed to check payment status',
        error,
      );
    }
  },
);

/**
 * @swagger
 * /payments/bkash/refund:
 *   post:
 *     summary: Refund payment (🔒 ADMIN ONLY)
 *     tags: [Payments]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Refund a bKash payment.
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
 *               - paymentID
 *               - amount
 *               - trxID
 *             properties:
 *               paymentID:
 *                 type: string
 *               amount:
 *                 type: number
 *               trxID:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Refund processed
 */
// Refund payment (ADMIN ONLY)
router.post('/bkash/refund', authenticateToken, async (req, res) => {
  try {
    const { paymentID, amount, trxID, reason } = req.body;

    if (!paymentID || !amount || !trxID) {
      return sendValidationError(
        res,
        'Payment ID, amount, and transaction ID are required',
      );
    }

    // Find sale record
    const sale = await Sale.findOne({ transactionId: paymentID });

    if (!sale) {
      return sendValidationError(res, 'Sale not found');
    }

    // Process refund
    const refundResponse = await refundPayment({
      paymentID: paymentID,
      amount: amount,
      trxID: trxID,
      reason: reason || 'Admin refund',
    });

    if (refundResponse && refundResponse.statusCode === '0000') {
      sale.paymentStatus = 'refunded';
      await sale.save();

      // Decrement track statistics when refunded
      await updateTrackStatistics(sale.trackId, sale.price, 'decrement');

      logger.info('bKash refund processed', {
        paymentID: paymentID,
        amount: amount,
        saleId: sale._id,
        trackId: sale.trackId,
      });

      return sendSuccess(res, HTTP_STATUS.OK, {
        success: true,
        refundID: refundResponse.refundTrxID,
        message: 'Refund processed successfully',
      });
    } else {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        'Refund failed',
        refundResponse,
      );
    }
  } catch (error) {
    logger.error('Error processing refund', error);
    return sendError(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'Failed to process refund',
      error,
    );
  }
});

export default router;
