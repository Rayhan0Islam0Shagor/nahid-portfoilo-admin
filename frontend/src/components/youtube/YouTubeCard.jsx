import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Play } from 'lucide-react';
import { getYouTubeThumbnail, getYouTubeVideoId } from '@/lib/utils';

const YouTubeCard = ({ video, onEdit, onDelete }) => {
  const [thumbnailError, setThumbnailError] = useState(false);

  // Fix thumbnail URL issues
  const fixThumbnailUrl = (url) => {
    if (!url) return url;

    // Replace .auto extension with .webp for browser compatibility
    if (url.endsWith('.auto')) {
      url = url.replace(/\.auto$/, '.webp');
    }

    // Fix Cloudinary URL structure - remove version parameter from middle of path
    // Cloudinary URLs should be: .../upload/{transformations}/{public_id}.{format}
    // But sometimes we get: .../upload/{transformations}/v1/{public_id}.{format}
    // The /v1/ in the middle breaks the URL structure
    if (url.includes('/image/upload/')) {
      // Remove version parameter (v1, v2, etc.) from the path
      // Pattern: /image/upload/{transformations}/v1/{public_id}
      // Should be: /image/upload/{transformations}/{public_id}
      url = url.replace(
        /\/image\/upload\/([^/]+)\/v\d+\//,
        '/image/upload/$1/',
      );
    }

    return url;
  };

  // Prioritize uploaded thumbnail, fallback to YouTube thumbnail
  const uploadedThumbnail =
    video.thumbnail && video.thumbnail.trim() !== ''
      ? fixThumbnailUrl(video.thumbnail)
      : null;
  const youtubeThumbnailUrl = uploadedThumbnail
    ? null
    : getYouTubeThumbnail(video.videoUrl);
  const thumbnailUrl = uploadedThumbnail || youtubeThumbnailUrl;
  const videoId = getYouTubeVideoId(video.videoUrl);

  const handleThumbnailError = (e) => {
    // If uploaded thumbnail fails, don't try fallback (it's already the best we have)
    if (uploadedThumbnail) {
      setThumbnailError(true);
      return;
    }

    // For YouTube thumbnails, try fallback quality
    const qualities = [
      'maxresdefault',
      'hqdefault',
      'mqdefault',
      'sddefault',
      'default',
    ];
    const currentQuality = 'maxresdefault';
    const currentIndex = qualities.indexOf(currentQuality);

    if (currentIndex < qualities.length - 1) {
      const nextQuality = qualities[currentIndex + 1];
      const fallbackUrl = getYouTubeThumbnail(video.videoUrl, nextQuality);
      if (fallbackUrl && e.target.src !== fallbackUrl) {
        e.target.src = fallbackUrl;
      }
    } else {
      setThumbnailError(true);
    }
  };

  return (
    <Card className="overflow-hidden bg-white border border-gray-200 shadow-sm transition-all duration-300 group hover:shadow-md hover:border-gray-300">
      {/* Thumbnail Container */}
      <div className="overflow-hidden relative bg-gray-50 aspect-video group/thumbnail">
        {thumbnailUrl && !thumbnailError ? (
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative w-full h-full"
          >
            <img
              src={thumbnailUrl}
              alt={video.title || 'YouTube video thumbnail'}
              className="object-cover w-full h-full transition-transform duration-300 group-hover/thumbnail:scale-105"
              onError={(e) => {
                console.error('Thumbnail load error:', {
                  url: thumbnailUrl,
                  error: e,
                  targetSrc: e.target.src,
                });
                handleThumbnailError(e);
              }}
              onLoad={() => {
                console.log('Thumbnail loaded successfully:', thumbnailUrl);
              }}
              loading="lazy"
              crossOrigin="anonymous"
            />
            {/* Play Button Overlay */}
            <div className="flex absolute inset-0 justify-center items-center transition-all duration-300 cursor-pointer bg-gray-900/20 group-hover/thumbnail:bg-opacity-40">
              <div className="flex justify-center items-center w-16 h-16 bg-red-600 rounded-full shadow-lg opacity-0 transition-opacity duration-300 transform scale-90 group-hover/thumbnail:opacity-100 group-hover/thumbnail:scale-100">
                <Play className="ml-1 w-8 h-8 text-white" fill="currentColor" />
              </div>
            </div>
          </a>
        ) : (
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center items-center w-full h-full bg-gray-100 transition-colors hover:bg-gray-200"
          >
            <div className="p-4 text-center">
              <Play className="mx-auto mb-2 w-12 h-12 text-gray-400" />
              <p className="mb-1 text-xs text-gray-500">YouTube Video</p>
              {videoId ? (
                <p className="font-mono text-xs text-gray-400">{videoId}</p>
              ) : (
                <p className="px-2 max-w-full text-xs text-gray-400 truncate">
                  {video.videoUrl}
                </p>
              )}
            </div>
          </a>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title */}
        <h3 className="mb-2 font-semibold text-gray-900 line-clamp-2 min-h-12">
          {video.title}
        </h3>

        {/* Description */}
        {video.description && (
          <pre className="mb-3 overflow-y-auto rounded border border-gray-200 bg-white p-2 text-sm font-sans text-gray-700 max-h-32 whitespace-pre-wrap">
            {video.description}
          </pre>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
            onClick={() => onEdit(video)}
          >
            <Edit className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs font-medium transition-colors text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30"
            onClick={() => onDelete(video._id || video.id)}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default YouTubeCard;
