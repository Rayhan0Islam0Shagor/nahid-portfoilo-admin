import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Crop } from 'lucide-react';
import Dropzone from '@/components/ui/dropzone';

const GalleryForm = ({
  formData,
  handleInputChange,
  handleSelectChange,
  handleFileChange,
  srcPreview,
  onOpenCropModal,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="src">Image Source (URL)</Label>
        <Input
          id="src"
          name="src"
          type="url"
          value={formData.src}
          onChange={handleInputChange}
          placeholder="https://example.com/image.jpg"
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter the full URL of the image, or use the dropzone below to upload
        </p>
      </div>

      <div>
        <Dropzone
          label="Upload Image"
          type="image"
          accept="image/*"
          onFileSelect={handleFileChange}
          preview={srcPreview}
          currentValue={formData.src && !srcPreview ? formData.src : null}
          required
        />
        {srcPreview && onOpenCropModal && (
          <div className="mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenCropModal}
              className="w-full"
            >
              <Crop className="mr-2 w-4 h-4" />
              Crop Image
            </Button>
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Upload an image (jpg, png, webp) - max 50MB. Images are automatically
          optimized to AVIF/WebP format with lossless compression for optimal
          web performance.
        </p>
      </div>
      <div>
        <Label htmlFor="height">Height</Label>
        <Select
          value={formData.height || 'medium'}
          onValueChange={(value) => handleSelectChange('height', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select height" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
            <SelectItem value="xlarge">XLarge</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="caption">Caption</Label>
        <Textarea
          id="caption"
          name="caption"
          value={formData.caption}
          onChange={handleInputChange}
          placeholder="Capturing moments that tell a story\nEvery frame holds a unique memory"
          rows="4"
        />
        <p className="mt-1 text-xs text-gray-500">
          Use new lines (\n) for multi-line captions
        </p>
      </div>
    </div>
  );
};

export default GalleryForm;
