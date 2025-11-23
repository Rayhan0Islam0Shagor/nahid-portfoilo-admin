import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    src: {
      type: String,
      required: true,
    },
    height: {
      type: String,
      enum: ['small', 'medium', 'large', 'xlarge'],
      default: 'medium',
      required: true,
    },
    caption: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

const Gallery = mongoose.model('Gallery', gallerySchema);

export default Gallery;

