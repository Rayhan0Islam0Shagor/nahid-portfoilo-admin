import Sale from '../../sales/Sale.js';

/**
 * Middleware to verify if user has purchased a track
 * Checks by saleSerialId (orderId) or purchase token
 */
export const verifyPurchase = async (req, res, next) => {
  try {
    const { trackId } = req.params;
    const saleSerialId = req.query.orderId || req.headers['x-order-id'];
    const purchaseToken = req.query.token || req.headers['x-purchase-token'];

    if (!saleSerialId && !purchaseToken) {
      return res.status(401).json({
        message:
          'Purchase verification required. Please provide order ID (saleSerialId) or purchase token.',
      });
    }

    let purchaseVerified = false;

    if (purchaseToken) {
      // Verify purchase token
      const sale = await Sale.findOne({
        trackId,
        transactionId: purchaseToken,
        paymentStatus: 'completed',
      });
      purchaseVerified = !!sale;
    } else if (saleSerialId) {
      // Verify purchase by saleSerialId (orderId)
      const sale = await Sale.findOne({
        trackId,
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

    // Add purchase info to request
    req.purchaseVerified = true;
    next();
  } catch (error) {
    res.status(500).json({
      message: 'Error verifying purchase',
      error: error.message,
    });
  }
};
