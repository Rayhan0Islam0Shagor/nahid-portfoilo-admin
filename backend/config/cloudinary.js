import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import sharp from 'sharp';

// Load environment variables if not already loaded
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration for thumbnails (images)
const thumbnailStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nahid-admin/tracks/thumbnails',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
});

// Storage configuration for audio files
const audioStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nahid-admin/tracks/audio',
    resource_type: 'video', // Cloudinary uses 'video' for audio files
    allowed_formats: ['mp3', 'wav', 'm4a', 'ogg'],
  },
});

// Multer upload middleware for thumbnails
export const uploadThumbnail = multer({
  storage: thumbnailStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnails'), false);
    }
  },
});

// Multer upload middleware for audio
export const uploadAudio = multer({
  storage: audioStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  },
});

// Combined upload middleware for both files
export const uploadTrackFiles = multer({
  storage: multer.memoryStorage(), // We'll handle uploads manually
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Helper function to upload file to Cloudinary
export const uploadToCloudinary = async (
  file,
  folder,
  resourceType = 'image',
) => {
  return new Promise((resolve, reject) => {
    // Ensure Cloudinary is configured
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return reject(
        new Error(
          'Cloudinary configuration is missing. Please check your environment variables.',
        ),
      );
    }

    // Reconfigure Cloudinary to ensure it has the latest config
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Validate file buffer exists
    const buffer = Buffer.isBuffer(file) ? file : file.buffer;

    if (!buffer || buffer.length === 0) {
      return reject(new Error('File buffer is empty or invalid'));
    }

    const uploadOptions = {
      folder: folder,
      resource_type: resourceType,
    };

    if (resourceType === 'image') {
      uploadOptions.transformation = [
        { width: 800, height: 800, crop: 'limit' },
      ];
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(
            new Error(
              `Cloudinary upload failed: ${error.message || 'Unknown error'}`,
            ),
          );
        } else {
          resolve(result.secure_url);
        }
      },
    );

    uploadStream.end(buffer);
  });
};

// Helper function to compress image if it exceeds Cloudinary's 10MB limit
const compressImageIfNeeded = async (
  buffer,
  maxSizeBytes = 10 * 1024 * 1024,
) => {
  const originalSize = buffer.length;

  // If image is already under the limit, return as-is
  if (originalSize <= maxSizeBytes) {
    return buffer;
  }

  console.log(
    `Image size ${(originalSize / (1024 * 1024)).toFixed(
      2,
    )}MB exceeds limit. Compressing...`,
  );

  try {
    let compressedBuffer = buffer;
    let quality = 85; // Start with 85% quality
    let currentWidth = null;
    let currentHeight = null;

    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    currentWidth = metadata.width;
    currentHeight = metadata.height;

    // If image is very large, resize it first
    if (currentWidth > 1920 || currentHeight > 1920) {
      const ratio = Math.min(1920 / currentWidth, 1920 / currentHeight);
      currentWidth = Math.round(currentWidth * ratio);
      currentHeight = Math.round(currentHeight * ratio);
    }

    // Try to compress to under the limit
    while (compressedBuffer.length > maxSizeBytes && quality >= 50) {
      const sharpInstance = sharp(buffer)
        .resize(currentWidth, currentHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality });

      compressedBuffer = await sharpInstance.toBuffer();

      if (compressedBuffer.length > maxSizeBytes) {
        quality -= 5; // Reduce quality by 5%
        if (quality < 50) {
          // If still too large, reduce dimensions
          currentWidth = Math.round(currentWidth * 0.9);
          currentHeight = Math.round(currentHeight * 0.9);
          quality = 80; // Reset quality
        }
      }
    }

    console.log(
      `Compressed image from ${(originalSize / (1024 * 1024)).toFixed(
        2,
      )}MB to ${(compressedBuffer.length / (1024 * 1024)).toFixed(2)}MB`,
    );

    return compressedBuffer;
  } catch (error) {
    console.error('Error compressing image:', error);
    // If compression fails, return original buffer and let Cloudinary handle it
    return buffer;
  }
};

// Helper function to upload optimized image to Cloudinary
// Automatically converts to AVIF/WebP format with lossless compression
// Uses Cloudinary's automatic format selection: AVIF for modern browsers, WebP as fallback
export const uploadOptimizedImage = async (
  file,
  folder,
  maxWidth = 1920,
  maxHeight = 1920,
) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Ensure Cloudinary is configured
      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      ) {
        return reject(
          new Error(
            'Cloudinary configuration is missing. Please check your environment variables.',
          ),
        );
      }

      // Reconfigure Cloudinary to ensure it has the latest config
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      // Validate file buffer exists
      let buffer = Buffer.isBuffer(file) ? file : file.buffer;

      if (!buffer || buffer.length === 0) {
        return reject(new Error('File buffer is empty or invalid'));
      }

      // Compress image if it exceeds Cloudinary's 10MB limit
      buffer = await compressImageIfNeeded(buffer, 10 * 1024 * 1024);

      const uploadOptions = {
        folder: folder,
        resource_type: 'image',
        transformation: [
          {
            width: maxWidth,
            height: maxHeight,
            crop: 'limit', // Maintain aspect ratio, don't crop
            quality: 'auto:best', // Automatic quality optimization (lossless when possible)
            fetch_format: 'auto', // Automatically serve AVIF to supported browsers, WebP as fallback
          },
        ],
        // Store as WebP for optimal compression
        // The fetch_format: 'auto' in transformation will serve AVIF when supported
        format: 'webp',
      };

      let uploadTimeout;
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (uploadTimeout) clearTimeout(uploadTimeout);

          if (error) {
            console.error('Cloudinary upload error:', {
              message: error.message,
              http_code: error.http_code,
              name: error.name,
            });
            reject(
              new Error(
                `Cloudinary upload failed: ${error.message || 'Unknown error'}`,
              ),
            );
          } else if (!result) {
            reject(new Error('Cloudinary upload failed: No result returned'));
          } else {
            try {
              // Generate optimized URL using Cloudinary's URL helper
              // Store as WebP but serve with f_auto for automatic format selection
              const publicId = result.public_id;

              if (!publicId) {
                return reject(
                  new Error('Cloudinary upload failed: No public_id returned'),
                );
              }

              // Generate URL with proper format extension
              // Use f_auto in transformation for automatic format selection
              // But ensure URL ends with .webp extension for browser compatibility
              const optimizedUrl = cloudinary.url(publicId, {
                secure: true,
                transformation: [
                  {
                    width: maxWidth,
                    height: maxHeight,
                    crop: 'limit',
                    quality: 'auto:best',
                    fetch_format: 'auto', // f_auto transformation
                  },
                ],
                format: 'webp', // Ensure URL has .webp extension
              });

              if (!optimizedUrl) {
                return reject(
                  new Error('Cloudinary upload failed: Failed to generate URL'),
                );
              }

              // Cloudinary will serve AVIF/WebP based on browser via f_auto transformation
              // But the URL will have .webp extension which browsers can handle
              resolve(optimizedUrl);
            } catch (urlError) {
              reject(
                new Error(
                  `Failed to generate image URL: ${
                    urlError.message || 'Unknown error'
                  }`,
                ),
              );
            }
          }
        },
      );

      // Add timeout for large file uploads (5 minutes)
      uploadTimeout = setTimeout(() => {
        uploadStream.destroy();
        reject(
          new Error(
            'Upload timeout: File is too large or upload is taking too long. Please try a smaller file or check your connection.',
          ),
        );
      }, 5 * 60 * 1000); // 5 minutes

      // Handle stream errors
      uploadStream.on('error', (streamError) => {
        if (uploadTimeout) clearTimeout(uploadTimeout);
        console.error('Upload stream error:', streamError);
        reject(
          new Error(
            `Upload stream error: ${streamError.message || 'Unknown error'}`,
          ),
        );
      });

      uploadStream.end(buffer);
    } catch (error) {
      reject(
        new Error(
          `Error processing image: ${error.message || 'Unknown error'}`,
        ),
      );
    }
  });
};

// Helper function to generate thumbnail from video URL
// Extracts a frame from the video and optimizes it
export const generateVideoThumbnail = async (
  videoUrl,
  folder,
  maxWidth = 720,
  maxHeight = 1280,
) => {
  return new Promise((resolve, reject) => {
    // Ensure Cloudinary is configured
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return reject(
        new Error(
          'Cloudinary configuration is missing. Please check your environment variables.',
        ),
      );
    }

    // Reconfigure Cloudinary to ensure it has the latest config
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Extract public_id from Cloudinary video URL
    // Cloudinary URLs format: https://res.cloudinary.com/{cloud_name}/video/upload/{folder}/{filename}.{ext}
    // The public_id is {folder}/{filename} (without extension)
    let publicId = null;

    if (videoUrl.includes('cloudinary.com')) {
      try {
        // Use Cloudinary's API to extract public_id from URL
        // This handles various URL formats including transformations
        const urlParts = videoUrl.split('/video/upload/');
        if (urlParts.length > 1) {
          // Get everything after /video/upload/
          let path = urlParts[1];
          // Remove query parameters if any
          path = path.split('?')[0];
          // Remove file extension
          path = path.replace(/\.[^/.]+$/, '');
          // Remove transformation parameters (they start with v or contain numbers and underscores)
          // Keep only the folder/filename parts
          const parts = path.split('/');
          publicId = parts
            .filter((part) => {
              // Filter out transformation parameters (usually contain numbers, underscores, or are single characters)
              return !/^[v]\d+$/.test(part) && !/^\d+$/.test(part);
            })
            .join('/');
        }
      } catch (error) {
        console.error('Error extracting public_id:', error);
      }
    }

    if (!publicId) {
      return reject(new Error('Invalid Cloudinary video URL'));
    }

    // Generate thumbnail URL using Cloudinary's video frame extraction
    // Extract frame at 1 second and convert to image
    // Cloudinary format: so_1 = start offset 1 second, w_720 = width, h_1280 = height, etc.
    const thumbnailUrl = cloudinary.url(publicId, {
      resource_type: 'video',
      secure: true,
      transformation: [
        {
          start_offset: 1, // Extract frame at 1 second
          width: maxWidth,
          height: maxHeight,
          crop: 'limit',
          quality: 'auto:best',
          fetch_format: 'auto',
        },
      ],
      format: 'auto', // Automatic format selection (AVIF > WebP)
    });

    resolve(thumbnailUrl);
  });
};

export default cloudinary;
