import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Dropzone from '@/components/ui/dropzone';

const TikTokForm = ({
  formData,
  handleInputChange,
  handleVideoChange,
  handleThumbnailChange,
  videoPreview,
  thumbnailPreview,
}) => {
  const handleVideoSelect = (file) => {
    handleVideoChange(file);
  };

  const handleThumbnailSelect = (file) => {
    handleThumbnailChange(file);
  };

  return (
    <div className="space-y-4">
      {/* Video File */}
      <div>
        <Dropzone
          label="TikTok Video (MP4)"
          type="video"
          accept="video/*"
          onFileSelect={handleVideoSelect}
          preview={videoPreview}
          currentValue={formData.videoUrl && !videoPreview ? formData.videoUrl : null}
          required
        />
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
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter video description"
          rows={4}
        />
      </div>

      {/* TikTok Link */}
      <div>
        <Label htmlFor="tiktokLink">TikTok Link</Label>
        <Input
          id="tiktokLink"
          name="tiktokLink"
          type="url"
          value={formData.tiktokLink || ''}
          onChange={handleInputChange}
          placeholder="https://www.tiktok.com/@username/video/..."
        />
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
        <p className="text-xs text-gray-500 mt-1">
          Upload a custom thumbnail image (jpg, png, webp) - max 5MB. If not provided, thumbnail will be auto-generated from the video.
        </p>
      </div>
    </div>
  );
};

export default TikTokForm;

