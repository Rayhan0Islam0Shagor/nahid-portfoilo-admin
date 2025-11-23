import mongoose from 'mongoose';

const tiktokVideoSchema = new mongoose.Schema(
  {
    videoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    thumbnail: {
      type: String,
      default: '',
      trim: true,
    },
    tiktokLink: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const TikTokVideo = mongoose.model('TikTokVideo', tiktokVideoSchema);

export default TikTokVideo;
