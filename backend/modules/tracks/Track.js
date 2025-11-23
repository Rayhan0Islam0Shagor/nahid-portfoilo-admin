import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema(
  {
    thumbnail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    audio: {
      type: String,
      required: true,
    },
    previewAudio: {
      type: String,
      required: true,
      description: 'Short/preview audio URL for public playback',
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'Rock',
        'Folk',
        'Hip-Hop',
        'Jazz & Blues',
        'Modern Song',
        'Classical',
      ],
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    saleCount: {
      type: Number,
      default: 0,
      min: 0,
      description: 'Total number of completed sales for this track',
    },
    totalSoldPrice: {
      type: Number,
      default: 0,
      min: 0,
      description: 'Total revenue from all completed sales (in BDT)',
    },
  },
  {
    timestamps: true,
  },
);

const Track = mongoose.model('Track', trackSchema);

export default Track;
