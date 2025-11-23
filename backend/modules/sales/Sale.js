import mongoose from 'mongoose';

/**
 * Generate a unique sale serial ID (orderId)
 * Format: ORDER-YYYYMMDD-XXXXXX (e.g., ORDER-20240115-A1B2C3)
 */
const generateSaleSerialId = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORDER-${dateStr}-${randomStr}`;
};

const saleSchema = new mongoose.Schema(
  {
    saleSerialId: {
      type: String,
      unique: true,
      index: true,
      trim: true,
      default: generateSaleSerialId,
    },
    trackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track',
      required: true,
    },
    trackTitle: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // Buyer information removed - tracking by saleSerialId only
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure saleSerialId is generated before saving if not set
saleSchema.pre('save', function (next) {
  if (!this.saleSerialId) {
    this.saleSerialId = generateSaleSerialId();
  }
  next();
});

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;
