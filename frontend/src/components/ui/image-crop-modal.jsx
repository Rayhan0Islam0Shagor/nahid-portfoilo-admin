import { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

// Aspect ratio presets
const ASPECT_RATIOS = [
  { label: 'Original', value: null, icon: '🖼️' },
  { label: 'Square', value: 1, icon: '⬜' },
  { label: '16:9', value: 16 / 9, icon: '📺' },
  { label: '4:3', value: 4 / 3, icon: '📱' },
  { label: '9:16', value: 9 / 16, icon: '📱' },
  { label: '21:9', value: 21 / 9, icon: '🖥️' },
  { label: '3:2', value: 3 / 2, icon: '📷' },
  { label: '2:3', value: 2 / 3, icon: '📷' },
];

const ImageCropModal = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio: initialAspectRatio = null, // Default to free crop
  minZoom = 0.5,
  maxZoom = 5,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [selectedAspectRatio, setSelectedAspectRatio] =
    useState(initialAspectRatio);

  // Reset aspect ratio when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAspectRatio(initialAspectRatio);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  }, [isOpen, initialAspectRatio]);

  // Reset crop position and zoom when aspect ratio changes
  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    // When switching to "Free", reset zoom to show full image
    if (selectedAspectRatio === null) {
      setZoom(1);
    }
  }, [selectedAspectRatio]);

  const onCropChange = useCallback((crop) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoomValue) => {
    setZoom(zoomValue);
  }, []);

  // Handle zoom slider change
  const handleZoomChange = useCallback((value) => {
    const zoomValue = Array.isArray(value) ? value[0] : value;
    setZoom(zoomValue);
  }, []);

  const onCropCompleteCallback = useCallback(
    (croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Calculate the scale factor between displayed image and actual image
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Convert crop coordinates to actual image coordinates
    const actualCrop = {
      x: pixelCrop.x * scaleX,
      y: pixelCrop.y * scaleY,
      width: pixelCrop.width * scaleX,
      height: pixelCrop.height * scaleY,
    };

    // Ensure crop area is within image bounds
    const maxX = image.naturalWidth;
    const maxY = image.naturalHeight;

    // Clamp crop coordinates to image bounds
    const clampedCrop = {
      x: Math.max(0, Math.min(actualCrop.x, maxX - actualCrop.width)),
      y: Math.max(0, Math.min(actualCrop.y, maxY - actualCrop.height)),
      width: Math.min(actualCrop.width, maxX - Math.max(0, actualCrop.x)),
      height: Math.min(actualCrop.height, maxY - Math.max(0, actualCrop.y)),
    };

    // Ensure we have valid dimensions
    if (clampedCrop.width <= 0 || clampedCrop.height <= 0) {
      throw new Error('Invalid crop area');
    }

    // Set canvas size to match the cropped area
    canvas.width = clampedCrop.width;
    canvas.height = clampedCrop.height;

    // Draw only the cropped portion of the image (no black/white sides)
    ctx.drawImage(
      image,
      clampedCrop.x,
      clampedCrop.y,
      clampedCrop.width,
      clampedCrop.height,
      0,
      0,
      clampedCrop.width,
      clampedCrop.height,
    );

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          // Create a File object from the blob
          const file = new File([blob], 'cropped-image.png', {
            type: 'image/png',
          });
          resolve(file);
        },
        'image/png',
        1.0, // Quality (1.0 = lossless)
      );
    });
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) {
      return;
    }

    try {
      // If "Free" is selected and crop area covers the entire image, return original
      if (selectedAspectRatio === null) {
        const image = await createImage(imageSrc);
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const actualCrop = {
          x: croppedAreaPixels.x * scaleX,
          y: croppedAreaPixels.y * scaleY,
          width: croppedAreaPixels.width * scaleX,
          height: croppedAreaPixels.height * scaleY,
        };

        // Check if crop area covers the entire image (within 1% tolerance)
        const tolerance = 0.01;
        const coversFullWidth =
          actualCrop.x <= image.naturalWidth * tolerance &&
          actualCrop.width >= image.naturalWidth * (1 - tolerance);
        const coversFullHeight =
          actualCrop.y <= image.naturalHeight * tolerance &&
          actualCrop.height >= image.naturalHeight * (1 - tolerance);

        if (coversFullWidth && coversFullHeight) {
          // Return original image without cropping
          const response = await fetch(imageSrc);
          const blob = await response.blob();
          const file = new File([blob], 'original-image.png', {
            type: blob.type,
          });
          onCropComplete(file);
          handleClose();
          return;
        }
      }

      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
      handleClose();
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    }
  };

  const handleClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
          <DialogDescription>
            Select an aspect ratio or choose "Original" to keep the image as-is.
            Adjust by dragging and zooming. Click Save when done.
          </DialogDescription>
        </DialogHeader>

        {/* Aspect Ratio Selector */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Aspect Ratio</label>
          <div className="flex flex-wrap gap-2">
            {ASPECT_RATIOS.map((ratio) => (
              <Button
                key={ratio.label}
                type="button"
                variant={
                  selectedAspectRatio === ratio.value ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setSelectedAspectRatio(ratio.value)}
                className="text-xs"
              >
                <span className="mr-1">{ratio.icon}</span>
                {ratio.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="relative w-full h-[500px] bg-black rounded-lg overflow-hidden touch-none">
          {imageSrc && (
            <div className="relative w-full h-full">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={selectedAspectRatio}
                onCropChange={onCropChange}
                onZoomChange={onZoomChange}
                onCropComplete={onCropCompleteCallback}
                cropShape="rect"
                showGrid={selectedAspectRatio !== null}
                minZoom={minZoom}
                maxZoom={maxZoom}
                restrictPosition={true}
                zoomWithScroll={false}
                style={{
                  containerStyle: {
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    background: '#000',
                  },
                  cropAreaStyle: {
                    border: '2px solid rgba(255, 255, 255, 0.9)',
                    boxShadow:
                      selectedAspectRatio === null
                        ? 'none'
                        : '0 0 0 9999em rgba(0, 0, 0, 0.5)',
                  },
                  mediaStyle: {
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  },
                }}
              />
            </div>
          )}
        </div>
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">
                Zoom: {Math.round(zoom * 100)}%
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newZoom = Math.max(minZoom, zoom - 0.2);
                    setZoom(newZoom);
                  }}
                  className="p-0 w-8 h-8 text-lg"
                  disabled={zoom <= minZoom}
                >
                  −
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newZoom = Math.min(maxZoom, zoom + 0.2);
                    setZoom(newZoom);
                  }}
                  className="p-0 w-8 h-8 text-lg"
                  disabled={zoom >= maxZoom}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <span className="text-xs text-gray-500 min-w-12">
                {Math.round(minZoom * 100)}%
              </span>
              <Slider
                value={[zoom]}
                min={minZoom}
                max={maxZoom}
                step={0.1}
                onValueChange={handleZoomChange}
                className="flex-1"
              />
              <span className="text-xs text-right text-gray-500 min-w-12">
                {Math.round(maxZoom * 100)}%
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            💡 Tip: Drag the image to reposition, use zoom slider or +/- buttons
            to zoom in/out
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Cropped Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropModal;
