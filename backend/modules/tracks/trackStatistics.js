import Track from './Track.js';
import { logger } from '../../utils/logger.js';

/**
 * Update track statistics (saleCount and totalSoldPrice)
 * @param {string} trackId - Track ID
 * @param {number} salePrice - Price of the sale
 * @param {string} operation - 'increment' or 'decrement'
 */
export const updateTrackStatistics = async (
  trackId,
  salePrice,
  operation = 'increment',
) => {
  try {
    const track = await Track.findById(trackId);
    if (!track) {
      logger.warn('Track not found for statistics update', { trackId });
      return;
    }

    if (operation === 'increment') {
      track.saleCount = (track.saleCount || 0) + 1;
      track.totalSoldPrice = (track.totalSoldPrice || 0) + salePrice;
    } else if (operation === 'decrement') {
      track.saleCount = Math.max(0, (track.saleCount || 0) - 1);
      track.totalSoldPrice = Math.max(0, (track.totalSoldPrice || 0) - salePrice);
    }

    await track.save();
    logger.info('Track statistics updated', {
      trackId,
      operation,
      saleCount: track.saleCount,
      totalSoldPrice: track.totalSoldPrice,
    });
  } catch (error) {
    logger.error('Error updating track statistics', { trackId, error });
  }
};

