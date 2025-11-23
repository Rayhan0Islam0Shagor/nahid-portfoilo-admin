/**
 * Profit Distribution Utility
 * Handles profit distribution logic for track sales
 */

/**
 * Calculate profit distribution
 * @param {number} totalAmount - Total sale amount
 * @param {object} distributionRules - Distribution rules
 * @returns {object} Distribution breakdown
 */
export const calculateProfitDistribution = (totalAmount, distributionRules = {}) => {
  const {
    platformFee = 0.1, // 10% platform fee by default
    artistShare = 0.7, // 70% to artist by default
    producerShare = 0.2, // 20% to producer by default
  } = distributionRules;

  // Ensure percentages add up to 100%
  const totalPercentage = platformFee + artistShare + producerShare;
  if (totalPercentage > 1) {
    throw new Error('Distribution percentages cannot exceed 100%');
  }

  const platformAmount = totalAmount * platformFee;
  const artistAmount = totalAmount * artistShare;
  const producerAmount = totalAmount * producerShare;
  const remaining = totalAmount - platformAmount - artistAmount - producerAmount;

  return {
    totalAmount,
    platformFee: {
      percentage: platformFee * 100,
      amount: Math.round(platformAmount * 100) / 100,
    },
    artistShare: {
      percentage: artistShare * 100,
      amount: Math.round(artistAmount * 100) / 100,
    },
    producerShare: {
      percentage: producerShare * 100,
      amount: Math.round(producerAmount * 100) / 100,
    },
    remaining: Math.round(remaining * 100) / 100,
  };
};

/**
 * Get profit distribution for a sale
 * @param {object} sale - Sale object
 * @param {object} track - Track object (optional, for track-specific rules)
 * @returns {object} Profit distribution
 */
export const getSaleProfitDistribution = (sale, track = null) => {
  if (sale.paymentStatus !== 'completed') {
    return {
      totalAmount: sale.price,
      platformFee: { percentage: 0, amount: 0 },
      artistShare: { percentage: 0, amount: 0 },
      producerShare: { percentage: 0, amount: 0 },
      remaining: 0,
      status: 'pending',
    };
  }

  // You can customize distribution rules per track if needed
  const distributionRules = track?.distributionRules || {};

  const distribution = calculateProfitDistribution(sale.price, distributionRules);

  return {
    ...distribution,
    saleId: sale._id,
    trackId: sale.trackId,
    trackTitle: sale.trackTitle,
    status: 'completed',
    saleDate: sale.createdAt,
  };
};

/**
 * Calculate total profits by category
 * @param {array} sales - Array of completed sales
 * @returns {object} Total profits breakdown
 */
export const calculateTotalProfits = (sales) => {
  const completedSales = sales.filter((sale) => sale.paymentStatus === 'completed');

  const totals = completedSales.reduce(
    (acc, sale) => {
      const distribution = getSaleProfitDistribution(sale);
      acc.totalRevenue += distribution.totalAmount;
      acc.platformFee += distribution.platformFee.amount;
      acc.artistShare += distribution.artistShare.amount;
      acc.producerShare += distribution.producerShare.amount;
      acc.remaining += distribution.remaining;
      return acc;
    },
    {
      totalRevenue: 0,
      platformFee: 0,
      artistShare: 0,
      producerShare: 0,
      remaining: 0,
      totalSales: completedSales.length,
    },
  );

  return {
    ...totals,
    totalRevenue: Math.round(totals.totalRevenue * 100) / 100,
    platformFee: Math.round(totals.platformFee * 100) / 100,
    artistShare: Math.round(totals.artistShare * 100) / 100,
    producerShare: Math.round(totals.producerShare * 100) / 100,
    remaining: Math.round(totals.remaining * 100) / 100,
  };
};

export default {
  calculateProfitDistribution,
  getSaleProfitDistribution,
  calculateTotalProfits,
};

