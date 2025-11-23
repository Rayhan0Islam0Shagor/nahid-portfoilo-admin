import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Scissors, X } from 'lucide-react';
// Removed unused import

const AudioTrimmer = ({ audioFile, onExtract, onCancel }) => {
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(30); // Default 30 seconds
  const [currentTime, setCurrentTime] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [audioFile]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const updateDuration = () => {
      const dur = audio.duration;
      setDuration(dur);
      // Set end time to min of 30 seconds or full duration
      setEndTime(Math.min(30, dur));
    };

    const updateTime = () => {
      const current = audio.currentTime;
      setCurrentTime(current);

      // Stop playback if we reach the end time
      if (current >= endTime) {
        audio.pause();
        setIsPlaying(false);
        audio.currentTime = startTime;
      }
    };

    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      audio.currentTime = startTime;
    });

    return () => {
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', () => {
        setIsPlaying(false);
        audio.currentTime = startTime;
      });
    };
  }, [audioUrl, endTime, startTime]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      // If current time is outside the selected range, reset to start
      if (audio.currentTime < startTime || audio.currentTime >= endTime) {
        audio.currentTime = startTime;
      }
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleStartTimeChange = (values) => {
    const newStart = Array.isArray(values) ? values[0] : values;
    setStartTime(Math.max(0, Math.min(newStart, endTime - 1)));
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(0, Math.min(newStart, endTime - 1));
    }
  };

  const handleEndTimeChange = (values) => {
    const newEnd = Array.isArray(values) ? values[0] : values;
    setEndTime(Math.max(startTime + 1, Math.min(newEnd, duration)));
    const audio = audioRef.current;
    if (audio && audio.currentTime > newEnd) {
      audio.currentTime = startTime;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const extractAudioSegment = async () => {
    if (!audioFile || !audioRef.current) return;

    setIsExtracting(true);
    try {
      // Create AudioContext
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Load audio file
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Calculate sample positions
      const sampleRate = audioBuffer.sampleRate;
      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.floor(endTime * sampleRate);
      const length = endSample - startSample;

      // Create new audio buffer with the selected segment
      const newBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        length,
        sampleRate,
      );

      // Copy audio data
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        const newChannelData = newBuffer.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          newChannelData[i] = channelData[startSample + i];
        }
      }

      // Convert AudioBuffer to WAV file
      const wav = audioBufferToWav(newBuffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const file = new File([blob], `preview-${audioFile.name}`, {
        type: 'audio/wav',
      });

      onExtract(file);
    } catch (error) {
      console.error('Error extracting audio:', error);
      alert('Failed to extract audio segment. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Convert AudioBuffer to WAV format
  const audioBufferToWav = (buffer) => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bytesPerSample = 2;
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;
    const bufferSize = 44 + dataSize;
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // audio format (PCM)
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // bits per sample
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(
          -1,
          Math.min(1, buffer.getChannelData(channel)[i]),
        );
        view.setInt16(
          offset,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true,
        );
        offset += 2;
      }
    }

    return arrayBuffer;
  };

  if (!audioFile || !audioUrl) {
    return null;
  }

  return (
    <div className="p-4 space-y-4 bg-gray-50 rounded-lg border dark:bg-gray-900">
      <div className="flex justify-between items-center">
        <Label className="text-base font-semibold text-white">
          Extract Preview from Full Track
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="p-0 w-8 h-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        style={{ display: 'none' }}
      />

      {/* Audio Player Controls */}
      <div className="flex gap-2 items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={togglePlayPause}
          disabled={!duration}
          className="bg-white"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
        <div className="flex-1 text-sm text-gray-600 dark:text-gray-400">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Start Time Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-sm text-gray-200">Start Time</Label>
          <span className="text-sm text-gray-400">{formatTime(startTime)}</span>
        </div>
        <Slider
          value={[startTime]}
          min={0}
          max={duration || 100}
          step={0.1}
          onValueChange={handleStartTimeChange}
          className="w-full"
        />
      </div>

      {/* End Time Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-sm text-gray-200">End Time</Label>
          <span className="text-sm text-gray-400">{formatTime(endTime)}</span>
        </div>
        <Slider
          value={[endTime]}
          min={startTime + 1}
          max={duration || 100}
          step={0.1}
          onValueChange={handleEndTimeChange}
          className="w-full"
        />
      </div>

      {/* Duration Display */}
      <div className="text-sm text-center text-gray-600 dark:text-gray-400">
        Preview Duration:{' '}
        <span className="font-semibold">{formatTime(endTime - startTime)}</span>
      </div>

      {/* Extract Button */}
      <Button
        type="button"
        onClick={extractAudioSegment}
        disabled={isExtracting || !duration || endTime <= startTime}
        className="w-full bg-white"
      >
        <Scissors className="mr-2 w-4 h-4" />
        {isExtracting ? 'Extracting...' : 'Extract Preview Audio'}
      </Button>
    </div>
  );
};

export default AudioTrimmer;
