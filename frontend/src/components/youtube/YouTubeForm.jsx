import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Dropzone from '@/components/ui/dropzone';
import { Crop } from 'lucide-react';

const YouTubeForm = ({
  formData,
  handleInputChange,
  handleThumbnailChange,
  thumbnailPreview,
  onOpenCropModal,
}) => {
  const handleThumbnailSelect = (file) => {
    handleThumbnailChange(file);
  };

  return (
    <div className="space-y-4">
      {/* Video URL */}
      <div>
        <Label htmlFor="videoUrl">YouTube Video URL</Label>
        <Input
          id="videoUrl"
          name="videoUrl"
          value={formData.videoUrl}
          onChange={handleInputChange}
          placeholder="https://www.youtube.com/watch?v=..."
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter the full YouTube video URL
        </p>
      </div>

      {/* Thumbnail */}
      <div>
        <Dropzone
          label="Thumbnail Image (Optional)"
          type="image"
          accept="image/*"
          onFileSelect={handleThumbnailSelect}
          preview={thumbnailPreview}
          currentValue={
            formData.thumbnail && !thumbnailPreview ? formData.thumbnail : null
          }
          maxSize={5 * 1024 * 1024}
        />
        {thumbnailPreview && onOpenCropModal && (
          <div className="mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenCropModal}
              className="w-full"
            >
              <Crop className="w-4 h-4 mr-2" />
              Crop Image
            </Button>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Upload a custom thumbnail image (jpg, png, webp) - max 5MB. Images are automatically optimized to AVIF/WebP format with lossless compression for optimal web performance.
        </p>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter video title"
          required
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description / Lyrics</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter video description or song lyrics (line breaks will be preserved)"
          rows={8}
          className="font-mono text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter description or song lyrics. Line breaks and spacing will be preserved when displayed.
        </p>
      </div>
    </div>
  );
};

export default YouTubeForm;

