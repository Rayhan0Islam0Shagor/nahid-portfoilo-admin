import mongoose from 'mongoose';

const youtubeVideoSchema = new mongoose.Schema(
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
    duration: {
      type: String,
      default: '',
      trim: true,
      description: 'Video duration in ISO 8601 format (e.g., PT5M30S) or readable format (e.g., 5:30)',
    },
  },
  {
    timestamps: true,
  },
);

const YouTubeVideo = mongoose.model('YouTubeVideo', youtubeVideoSchema);

export default YouTubeVideo;
