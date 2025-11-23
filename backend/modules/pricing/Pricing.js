import mongoose from 'mongoose';

const pricingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Pricing = mongoose.model('Pricing', pricingSchema);

export default Pricing;
