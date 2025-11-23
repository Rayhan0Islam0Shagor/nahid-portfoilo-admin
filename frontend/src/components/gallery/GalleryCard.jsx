import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const GalleryCard = ({ image, onEdit, onDelete }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const imgRef = useRef(null);

  // Get image URL - use original for now, can add optimizations later
  const imageUrl = image?.src || '';

  // Reset states when image URL changes
  useEffect(() => {
    if (imageUrl) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [imageUrl]);

  // Check if image is already loaded (cached images)
  useEffect(() => {
    if (imageUrl && imgRef.current) {
      const img = imgRef.current;
      // If image is already loaded (cached), hide loading immediately
      if (img.complete && img.naturalHeight !== 0) {
        setImageLoading(false);
        setImageError(false);
      }
    }
  }, [imageUrl]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = (e) => {
    // Only set error if image is actually invalid
    if (
      e.target &&
      e.target.naturalWidth === 0 &&
      e.target.naturalHeight === 0
    ) {
      setImageError(true);
      setImageLoading(false);
    } else {
      // Image might have loaded but error was triggered - give it a moment
      setTimeout(() => {
        if (
          imgRef.current &&
          imgRef.current.naturalWidth === 0 &&
          imgRef.current.naturalHeight === 0
        ) {
          setImageError(true);
          setImageLoading(false);
        }
      }, 100);
    }
  };

  return (
    <Card className="overflow-hidden bg-white border border-gray-200 shadow-sm transition-all duration-300 group hover:shadow-md hover:border-gray-300">
      {/* Image Container */}
      <div className="overflow-hidden relative bg-gray-50 aspect-4/3">
        {imageLoading && !imageError && (
          <div className="flex absolute inset-0 justify-center items-center bg-gray-50">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-gray-300 animate-spin border-t-gray-600" />
              <p className="text-xs text-gray-500">Loading...</p>
            </div>
          </div>
        )}

        <img
          ref={imgRef}
          src={imageUrl}
          alt={image?.caption || 'Gallery image'}
          className={`h-full w-full object-cover transition-all duration-300 ${
            imageLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          } ${imageError ? 'hidden' : 'block'} group-hover:scale-105`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />

        {imageError && (
          <div className="flex absolute inset-0 justify-center items-center bg-gray-50">
            <div className="flex flex-col items-center space-y-2 text-gray-400">
              <ImageIcon className="w-12 h-12" />
              <p className="text-xs">Image not found</p>
            </div>
          </div>
        )}

        {/* Height Badge */}
        <div className="absolute top-2 right-2 z-10">
          <Badge
            variant="secondary"
            className="bg-white/95 px-2 py-0.5 text-xs font-medium capitalize text-gray-700 shadow-sm backdrop-blur-sm"
          >
            {image?.height || 'medium'}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Caption */}
        {image?.caption && (
          <div className="mb-3 min-h-12">
            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
              {image.caption
                .replace(/\\n/g, '\n')
                .split('\n')
                .map((line, index, array) => (
                  <span key={index}>
                    {line}
                    {index < array.length - 1 && <br />}
                  </span>
                ))}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
            onClick={() => onEdit(image)}
          >
            <Edit className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs font-medium transition-colors text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30"
            onClick={() => onDelete(image._id || image.id)}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default GalleryCard;
