import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Crop, Scissors } from 'lucide-react';
import Dropzone from '@/components/ui/dropzone';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AudioTrimmer from './AudioTrimmer';
import { useState } from 'react';

const TRACK_CATEGORIES = [
  'Rock',
  'Folk',
  'Hip-Hop',
  'Jazz & Blues',
  'Modern Song',
  'Classical',
];

const TrackForm = ({
  formData,
  handleInputChange,
  handleThumbnailChange,
  handleAudioChange,
  handlePreviewAudioChange,
  thumbnailPreview,
  audioPreview,
  previewAudioPreview,
  onOpenCropModal,
  audioFile,
}) => {
  const [showTrimmer, setShowTrimmer] = useState(false);

  const handleThumbnailSelect = (file) => {
    handleThumbnailChange(file);
  };

  const handleAudioSelect = (file) => {
    handleAudioChange(file);
    // Reset trimmer when new audio is selected
    setShowTrimmer(false);
  };

  const handlePreviewAudioSelect = (file) => {
    handlePreviewAudioChange(file);
    setShowTrimmer(false);
  };

  const handleExtractPreview = (extractedFile) => {
    handlePreviewAudioChange(extractedFile);
    setShowTrimmer(false);
  };

  const handleCategoryChange = (value) => {
    handleInputChange({
      target: { name: 'category', value },
    });
  };

  return (
    <div className="space-y-4">
      {/* Thumbnail */}
      <div>
        <Dropzone
          label="Thumbnail"
          type="image"
          accept="image/*"
          onFileSelect={handleThumbnailSelect}
          preview={thumbnailPreview}
          currentValue={formData.thumbnail && !thumbnailPreview ? formData.thumbnail : null}
          required
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
      </div>

      {/* Audio File */}
      <div>
        <Dropzone
          label="Audio File (Full Track)"
          type="audio"
          accept="audio/*"
          onFileSelect={handleAudioSelect}
          preview={audioPreview}
          currentValue={formData.audio && !audioPreview ? formData.audio : null}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Full track audio (requires purchase to access)
        </p>
        {audioFile && !showTrimmer && (
          <div className="mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTrimmer(true)}
              className="w-full"
            >
              <Scissors className="w-4 h-4 mr-2" />
              Extract Preview from Full Track
            </Button>
          </div>
        )}
      </div>

      {/* Audio Trimmer */}
      {showTrimmer && audioFile && (
        <AudioTrimmer
          audioFile={audioFile}
          onExtract={handleExtractPreview}
          onCancel={() => setShowTrimmer(false)}
        />
      )}

      {/* Preview Audio File */}
      <div>
        <Dropzone
          label="Preview Audio"
          type="audio"
          accept="audio/*"
          onFileSelect={handlePreviewAudioSelect}
          preview={previewAudioPreview}
          currentValue={formData.previewAudio && !previewAudioPreview ? formData.previewAudio : null}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Short/preview audio for public playback
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
          placeholder="Enter track title"
          required
        />
      </div>

      {/* Release Date, Category, and Price in one row on desktop */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Release Date */}
        <div>
          <Label htmlFor="releaseDate">Release Date</Label>
          <Input
            id="releaseDate"
            name="releaseDate"
            type="date"
            value={formData.releaseDate}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={handleCategoryChange}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {TRACK_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price */}
        <div>
          <Label htmlFor="price">Price (৳)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Enter price"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Price will be displayed with ৳ (BDT) symbol
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrackForm;

