import dotenv from 'dotenv';

dotenv.config();

/**
 * bKash Payment Gateway Service
 * Uses bkash-payment npm package for simplified integration
 * Handles bKash payment integration for track sales
 */

// bKash API Configuration
const BKASH_BASE_URL =
  process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';
const BKASH_APP_KEY = process.env.BKASH_APP_KEY;
const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET;
const BKASH_USERNAME = process.env.BKASH_USERNAME;
const BKASH_PASSWORD = process.env.BKASH_PASSWORD;
const BKASH_CALLBACK_URL =
  process.env.BKASH_CALLBACK_URL ||
  `${
    process.env.API_URL || 'http://localhost:5000'
  }/api/payments/bkash/callback`;

// Frontend URL for redirect after payment

/**
 * Get bKash configuration object for bkash-payment package
 * @returns {object} bKash configuration
 */
const getBkashConfig = () => {
  if (
    !BKASH_APP_KEY ||
    !BKASH_APP_SECRET ||
    !BKASH_USERNAME ||
    !BKASH_PASSWORD
  ) {
    throw new Error('bKash credentials are not configured');
  }

  return {
    base_url: BKASH_BASE_URL,
    username: BKASH_USERNAME,
    password: BKASH_PASSWORD,
    app_key: BKASH_APP_KEY,
    app_secret: BKASH_APP_SECRET,
  };
};

/**
 * Create payment request using bkash-payment package
 * @param {object} paymentData - Payment data
 * @param {string} paymentData.amount - Payment amount
 * @param {string} paymentData.merchantInvoiceNumber - Unique invoice number
 * @param {string} paymentData.intent - Payment intent (sale or authorize)
 * @param {string} paymentData.callbackURL - Callback URL
 * @returns {Promise<object>} Payment response
 */
export const createPayment = async (paymentData) => {
  try {
    const { amount, merchantInvoiceNumber, callbackURL } = paymentData;

    // Use custom callbackURL if provided, otherwise use default
    const finalCallbackURL = callbackURL || BKASH_CALLBACK_URL;

    console.log('Creating bKash payment:', {
      amount,
      merchantInvoiceNumber,
      callbackURL: finalCallbackURL,
    });

    // Dynamically import bkash-payment package (CommonJS)
    const bkashPayment = await import('bkash-payment');
    const { createPayment: createBkashPayment } = bkashPayment;

    const bkashConfig = getBkashConfig();

    // Create payment using bkash-payment package
    const paymentDetails = {
      amount: amount.toString(),
      callbackURL: finalCallbackURL,
      orderID: merchantInvoiceNumber,
      reference: merchantInvoiceNumber,
    };

    const result = await createBkashPayment(bkashConfig, paymentDetails);

    // Handle errors from the package
    if (result?.statusCode && result.statusCode !== '0000') {
      throw new Error(
        `bKash Payment Creation Failed: ${
          result.statusMessage || 'Unknown error'
        }`,
      );
    }

    // Check if result is an error object
    if (result instanceof Error) {
      throw result;
    }

    // Map response fields to match expected format
    // bkash-payment returns: paymentID, bkashURL, statusCode, statusMessage
    const paymentResponse = {
      paymentID: result?.paymentID,
      bkashURL: result?.bkashURL || result?.checkoutURL,
      statusCode: result?.statusCode,
      statusMessage: result?.statusMessage,
    };

    console.log('Payment created successfully:', {
      paymentID: paymentResponse.paymentID,
      bkashURL: paymentResponse.bkashURL ? 'Present' : 'Missing',
      statusCode: paymentResponse.statusCode,
    });

    return paymentResponse;
  } catch (error) {
    console.error('Error creating bKash payment:', error);

    // Format error message
    let errorMessage = 'Failed to create payment';
    if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.data) {
      errorMessage =
        error.response.data?.statusMessage ||
        error.response.data?.errorMessage ||
        error.response.data?.message ||
        'Unknown error';
    }

    throw new Error(`bKash Payment Creation Failed: ${errorMessage}`);
  }
};

/**
 * Execute payment (after user completes payment in bKash)
 * @param {string} paymentID - Payment ID from bKash
 * @returns {Promise<object>} Payment execution response
 */
export const executePayment = async (paymentID) => {
  try {
    // Dynamically import bkash-payment package (CommonJS)
    const bkashPayment = await import('bkash-payment');
    const { executePayment: executeBkashPayment } = bkashPayment;

    const bkashConfig = getBkashConfig();

    const result = await executeBkashPayment(bkashConfig, paymentID);

    // Handle errors
    if (result?.statusCode && result.statusCode !== '0000') {
      console.error('bKash Execute Payment Error:', result);
    }

    return result;
  } catch (error) {
    console.error('Error executing bKash payment:', error);
    throw new Error(
      `bKash Payment Execution Failed: ${error.message || 'Unknown error'}`,
    );
  }
};

/**
 * Query payment status
 * @param {string} paymentID - Payment ID
 * @returns {Promise<object>} Payment status
 */
export const queryPayment = async (paymentID) => {
  try {
    // Dynamically import bkash-payment package (CommonJS)
    const bkashPayment = await import('bkash-payment');
    const { queryPayment: queryBkashPayment } = bkashPayment;

    const bkashConfig = getBkashConfig();

    const result = await queryBkashPayment(bkashConfig, paymentID);

    return result;
  } catch (error) {
    console.error('Error querying bKash payment:', error);
    throw error;
  }
};

/**
 * Refund payment
 * @param {object} refundData - Refund data
 * @param {string} refundData.paymentID - Original payment ID
 * @param {string} refundData.amount - Refund amount
 * @param {string} refundData.trxID - Transaction ID
 * @param {string} refundData.sku - SKU (optional)
 * @param {string} refundData.reason - Refund reason
 * @returns {Promise<object>} Refund response
 */
export const refundPayment = async (refundData) => {
  try {
    const { paymentID, amount, trxID, sku, reason } = refundData;

    // Dynamically import bkash-payment package (CommonJS)
    const bkashPayment = await import('bkash-payment');
    const { refundTransaction: refundBkashTransaction } = bkashPayment;

    const bkashConfig = getBkashConfig();

    const result = await refundBkashTransaction(bkashConfig, {
      paymentID,
      trxID,
      amount,
      sku: sku || 'refund',
      reason: reason || 'Customer request',
    });

    return result;
  } catch (error) {
    console.error('Error processing bKash refund:', error);
    throw new Error(`bKash Refund Failed: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Generate unique invoice number
 * @param {string} trackId - Track ID
 * @returns {string} Invoice number
 */
export const generateInvoiceNumber = (trackId) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TRK-${trackId}-${timestamp}-${random}`;
};

/**
 * Verify payment signature (if bKash provides signature verification)
 * @param {object} paymentData - Payment data
 * @param {string} signature - Signature from bKash
 * @returns {Promise<boolean>} True if signature is valid
 */
export const verifySignature = async (paymentData, signature) => {
  // bKash signature verification logic
  // This depends on bKash's specific implementation
  // For now, we'll implement basic validation
  try {
    // Create signature string from payment data
    const dataString = JSON.stringify(paymentData);
    const crypto = await import('crypto');
    const hash = crypto.default
      .createHash('sha256')
      .update(dataString + BKASH_APP_SECRET)
      .digest('hex');

    return hash === signature;
  } catch (error) {
    return false;
  }
};

/**
 * Get access token (for compatibility - bkash-payment handles this internally)
 * @returns {Promise<string>} Access token (placeholder)
 */
export const getAccessToken = async () => {
  // bkash-payment package handles token grant internally
  // This function is kept for backward compatibility
  console.log('getAccessToken: Token grant handled by bkash-payment package');
  return 'token-handled-by-package';
};

export default {
  getAccessToken,
  createPayment,
  executePayment,
  queryPayment,
  refundPayment,
  generateInvoiceNumber,
  verifySignature,
};
