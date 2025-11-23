import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const AudioPlayer = ({
  src,
  fileName,
  fileSize,
  onRemove,
  className,
  compact = false,
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', () => setIsLoading(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', () => setIsLoading(false));
    };
  }, [src]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (values) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = Array.isArray(values) ? values[0] : values;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (values) => {
    const newVolume = Array.isArray(values) ? values[0] : values;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const skip = (seconds) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(
      0,
      Math.min(duration, audio.currentTime + seconds),
    );
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div
      className={cn(
        'relative rounded-lg border border-gray-200 dark:border-gray-700',
        compact
          ? 'p-2 bg-white dark:bg-gray-800'
          : 'p-4 from-gray-50 to-gray-100 bg-linear-to-br dark:from-gray-900 dark:to-gray-800',
        className,
      )}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        style={{ display: 'none' }}
      />

      {/* File Info - Only show if not compact or if fileName/fileSize provided */}
      {(!compact || fileName || fileSize) && (
        <div className={cn(compact ? 'mb-2' : 'mb-4')}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1 min-w-0">
              {fileName && (
                <p
                  className={cn(
                    'font-semibold text-gray-900 truncate dark:text-gray-100',
                    compact ? 'text-xs' : 'text-sm',
                  )}
                >
                  {fileName}
                </p>
              )}
              {fileSize && (
                <p
                  className={cn(
                    'text-gray-500 dark:text-gray-400',
                    compact ? 'text-[10px] mt-0.5' : 'text-xs mt-0.5',
                  )}
                >
                  {formatFileSize(fileSize)}
                </p>
              )}
            </div>
            {onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className={cn(
                  'p-0 ml-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
                  compact ? 'w-6 h-6' : 'w-8 h-8',
                )}
              >
                ×
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className={cn(compact ? 'mb-2' : 'mb-3', 'relative z-20')}>
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full"
          disabled={isLoading || !duration}
        />
        <div
          className={cn(
            'flex justify-between mt-1 text-gray-500 dark:text-gray-400',
            compact ? 'text-[10px]' : 'text-xs',
          )}
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div
        className={cn(
          'flex relative z-20 items-center',
          compact ? 'gap-1' : 'gap-2 justify-between',
        )}
      >
        {/* Playback Controls */}
        <div className="flex relative z-20 gap-1 items-center">
          {!compact && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => skip(-10)}
              className="relative z-20 p-0 w-9 h-9"
              disabled={isLoading || !duration}
              title="Rewind 10s"
              style={{
                pointerEvents: isLoading || !duration ? 'none' : 'auto',
              }}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="default"
            size={compact ? 'sm' : 'lg'}
            onClick={togglePlayPause}
            className={cn(
              'relative z-20 p-0 text-white rounded-full',
              compact ? 'w-8 h-8' : 'w-10 h-10',
            )}
            disabled={isLoading || !duration}
            style={{ pointerEvents: isLoading || !duration ? 'none' : 'auto' }}
          >
            {isPlaying ? (
              <Pause className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
            ) : (
              <Play
                className={cn(compact ? 'h-4 w-4 ml-0.5' : 'h-5 w-5 ml-0.5')}
              />
            )}
          </Button>
          {!compact && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => skip(10)}
              className="relative z-20 p-0 w-9 h-9 text-white"
              disabled={isLoading || !duration}
              title="Forward 10s"
              style={{
                pointerEvents: isLoading || !duration ? 'none' : 'auto',
              }}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Volume Control */}
        {!compact && (
          <div className="flex items-center gap-2 flex-1 max-w-[200px] relative z-20">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="relative z-20 p-0 w-9 h-9 text-white"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="relative z-20 flex-1"
              disabled={false}
            />
          </div>
        )}
        {compact && (
          <div className="relative z-20 ml-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="relative z-20 p-0 w-8 h-8 text-white"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-3.5 w-3.5" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex absolute inset-0 z-30 justify-center items-center rounded-lg backdrop-blur-sm pointer-events-auto bg-white/80 dark:bg-black/80">
          <div className="w-8 h-8 rounded-full border-b-2 animate-spin border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
