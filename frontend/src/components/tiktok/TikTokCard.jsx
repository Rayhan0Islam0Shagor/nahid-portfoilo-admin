import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Play } from 'lucide-react';

const TikTokCard = ({ video, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isHovered) {
      // Play video with sound on hover
      videoElement.play().catch((error) => {
        console.error('Error playing video:', error);
      });
    } else {
      // Pause and reset video when not hovering
      videoElement.pause();
      videoElement.currentTime = 0;
    }
  }, [isHovered]);

  // Fix thumbnail URL issues (similar to YouTube card)
  const fixThumbnailUrl = (url) => {
    if (!url) return url;

    // Replace .auto extension with .webp for browser compatibility
    if (url.endsWith('.auto')) {
      url = url.replace(/\.auto$/, '.webp');
    }

    // Fix Cloudinary URL structure if needed
    if (url.includes('/image/upload/')) {
      url = url.replace(
        /\/image\/upload\/([^/]+)\/v\d+\//,
        '/image/upload/$1/',
      );
    }

    return url;
  };

  return (
    <Card className="overflow-hidden bg-white border border-gray-200 shadow-sm transition-all duration-300 group hover:shadow-md hover:border-gray-300">
      {/* Video Container */}
      <div
        className="overflow-hidden relative bg-gray-50 aspect-9/16"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {video.videoUrl ? (
          <>
            {/* Thumbnail - shown by default, hidden on hover */}
            {video.thumbnail && (
              <img
                src={fixThumbnailUrl(video.thumbnail)}
                alt={video.title || 'TikTok video thumbnail'}
                className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-300 ${
                  isHovered ? 'opacity-0' : 'opacity-100'
                }`}
                onError={(e) => {
                  // If thumbnail fails to load, hide it
                  e.target.style.display = 'none';
                }}
              />
            )}
            {/* Video - hidden by default, shown and played on hover */}
            <video
              ref={videoRef}
              src={video.videoUrl}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                isHovered ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              playsInline
              preload="metadata"
              muted={false}
              loop
            />
            {/* Fallback if no thumbnail - shown when not hovering */}
            {!video.thumbnail && !isHovered && (
              <div className="flex justify-center items-center w-full h-full bg-gray-100">
                <div className="p-4 text-center">
                  <Play className="mx-auto mb-2 w-12 h-12 text-gray-400" />
                  <p className="text-xs text-gray-500">Hover to play</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex justify-center items-center w-full h-full bg-gray-100">
            <div className="p-4 text-center">
              <Play className="mx-auto mb-2 w-12 h-12 text-gray-400" />
              <p className="text-xs text-gray-500">No video</p>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
          {video.title}
        </h3>

        {/* Description */}
        {video.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
            {video.description}
          </p>
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

export default TikTokCard;
