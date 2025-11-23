import { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Music, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dropzone = ({
  onFileSelect,
  accept,
  type = 'image', // 'image', 'audio', or 'video'
  preview,
  currentValue,
  label,
  className,
  required = false,
  maxSize, // Optional custom max size in bytes
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFile = (file) => {
    if (type === 'image') {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return false;
      }
      // Check file size (use custom maxSize if provided, otherwise default to 50MB)
      const maxFileSize = maxSize || 50 * 1024 * 1024;
      if (file.size > maxFileSize) {
        const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
        setError(`Image size must be less than ${maxSizeMB}MB`);
        return false;
      }
    } else if (type === 'audio') {
      if (!file.type.startsWith('audio/')) {
        setError('Please select an audio file');
        return false;
      }
      // Check file size (use custom maxSize if provided, otherwise default to 50MB)
      const maxFileSize = maxSize || 50 * 1024 * 1024;
      if (file.size > maxFileSize) {
        const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
        setError(`Audio file size must be less than ${maxSizeMB}MB`);
        return false;
      }
    } else if (type === 'video') {
      if (!file.type.startsWith('video/')) {
        setError('Please select a video file');
        return false;
      }
      // Check file size (use custom maxSize if provided, otherwise default to 100MB)
      const maxFileSize = maxSize || 100 * 1024 * 1024;
      if (file.size > maxFileSize) {
        const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
        setError(`Video file size must be less than ${maxSizeMB}MB`);
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayPreview = preview || currentValue;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={(e) => {
          // Don't trigger file selection if clicking on audio player or its container
          if (type === 'audio' && displayPreview) {
            const target = e.target;
            const audioContainer = target.closest('.relative.group');
            if (audioContainer || target.closest('audio') || target.tagName === 'AUDIO') {
              return;
            }
          }
          handleClick();
        }}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-all',
          displayPreview && type === 'audio' ? 'cursor-default' : 'cursor-pointer',
          'hover:border-primary hover:bg-primary/5',
          isDragging && 'border-primary bg-primary/10 scale-[1.02]',
          displayPreview && 'border-solid border-primary/50',
          error && 'border-red-500',
          className
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />

        {displayPreview ? (
          <div className="relative">
            {type === 'image' ? (
              <div className="relative group">
                <img
                  src={displayPreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : type === 'video' ? (
              <div className="relative group">
                <video
                  src={displayPreview}
                  controls
                  className="w-full h-48 object-cover rounded-md"
                >
                  Your browser does not support the video element.
                </video>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                className="relative group"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
              >
                <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4">
                  <audio 
                    controls 
                    className="w-full"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                  >
                    <source src={displayPreview} />
                    Your browser does not support the audio element.
                  </audio>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(e);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-xs text-center text-gray-500 mt-2">
              Click to replace or drag and drop a new file
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            {type === 'image' ? (
              <ImageIcon className="w-12 h-12 text-gray-400" />
            ) : type === 'video' ? (
              <Video className="w-12 h-12 text-gray-400" />
            ) : (
              <Music className="w-12 h-12 text-gray-400" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Drag and drop your {type === 'image' ? 'image' : type === 'video' ? 'video' : 'audio file'} here
              </p>
              <p className="text-xs text-gray-500 mt-1">
                or click to browse
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Upload className="w-4 h-4" />
              <span>
                Max size:{' '}
                {maxSize
                  ? `${Math.round(maxSize / (1024 * 1024))}MB`
                  : type === 'video'
                    ? '100MB'
                    : '50MB'}
              </span>
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
        )}
      </div>
    </div>
  );
};

export default Dropzone;

