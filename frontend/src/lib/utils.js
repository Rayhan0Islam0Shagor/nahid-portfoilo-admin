import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Extract YouTube video ID from various YouTube URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if invalid
 */
export function getYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') return null;

  // Clean the URL
  const cleanUrl = url.trim();

  // Short URL: https://youtu.be/VIDEO_ID or http://youtu.be/VIDEO_ID
  const shortMatch = cleanUrl.match(/(?:youtu\.be\/)([^#&?\s]+)/);
  if (shortMatch && shortMatch[1] && shortMatch[1].length === 11) {
    return shortMatch[1];
  }

  // Regular YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = cleanUrl.match(/(?:youtube\.com\/watch\?v=)([^#&?\s]+)/);
  if (watchMatch && watchMatch[1] && watchMatch[1].length === 11) {
    return watchMatch[1];
  }

  // Embed URL: https://www.youtube.com/embed/VIDEO_ID
  const embedMatch = cleanUrl.match(/(?:youtube\.com\/embed\/)([^#&?\s]+)/);
  if (embedMatch && embedMatch[1] && embedMatch[1].length === 11) {
    return embedMatch[1];
  }

  // Alternative formats: v=VIDEO_ID or &v=VIDEO_ID
  const vMatch = cleanUrl.match(/(?:[?&]v=)([^#&?\s]{11})/);
  if (vMatch && vMatch[1] && vMatch[1].length === 11) {
    return vMatch[1];
  }

  // Generic pattern: look for 11-character alphanumeric string after common YouTube patterns
  const genericMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/);
  if (genericMatch && genericMatch[1] && genericMatch[1].length === 11) {
    return genericMatch[1];
  }

  return null;
}

/**
 * Get YouTube thumbnail URL from video ID or URL
 * @param {string} videoIdOrUrl - YouTube video ID or URL
 * @param {string} quality - Thumbnail quality: 'maxresdefault', 'hqdefault', 'mqdefault', 'sddefault', 'default'
 * @returns {string|null} - Thumbnail URL or null if invalid
 */
export function getYouTubeThumbnail(videoIdOrUrl, quality = 'maxresdefault') {
  const videoId = videoIdOrUrl.length === 11 ? videoIdOrUrl : getYouTubeVideoId(videoIdOrUrl);
  
  if (!videoId) return null;

  const qualities = ['maxresdefault', 'hqdefault', 'mqdefault', 'sddefault', 'default'];
  const selectedQuality = qualities.includes(quality) ? quality : 'maxresdefault';

  return `https://img.youtube.com/vi/${videoId}/${selectedQuality}.jpg`;
}