import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Music, Eye, ShoppingCart, DollarSign } from 'lucide-react';
import AudioPlayer from '@/components/ui/audio-player';

const TrackCard = ({ track, onEdit, onDelete }) => {
  const formatPrice = (price) => {
    return `৳ ${parseFloat(price).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Card className="overflow-hidden bg-white border border-gray-200 shadow-sm transition-all duration-300 group hover:shadow-md hover:border-gray-300">
      {/* Thumbnail Container */}
      <div className="overflow-hidden relative bg-gray-50 aspect-square">
        {track.thumbnail ? (
          <img
            src={track.thumbnail}
            alt={track.title || 'Track thumbnail'}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex justify-center items-center w-full h-full bg-gray-100">
            <div className="p-4 text-center">
              <Music className="mx-auto mb-2 w-12 h-12 text-gray-400" />
              <p className="text-xs text-gray-500">No thumbnail</p>
            </div>
          </div>
        )}
        {/* Category Badge */}
        {track.category && (
          <div className="absolute top-2 right-2 z-10">
            <Badge
              variant="secondary"
              className="bg-white/95 px-2 py-0.5 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm"
            >
              {track.category}
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title */}
        <h3 className="mb-2 font-semibold text-gray-900 line-clamp-2 min-h-12">
          {track.title}
        </h3>

        {/* Release Date, Price, and Views */}
        <div className="mb-3 space-y-1">
          {track.releaseDate && (
            <p className="text-xs text-gray-500">
              Release: {new Date(track.releaseDate).toLocaleDateString()}
            </p>
          )}
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-gray-900">
              {formatPrice(track.price || 0)}
            </p>
            {track.views !== undefined && (
              <div className="flex gap-1 items-center text-xs text-gray-500">
                <Eye className="w-3.5 h-3.5" />
                <span>{track.views || 0}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sales Statistics */}
        {(track.saleCount !== undefined || track.totalSoldPrice !== undefined) && (
          <div className="mb-3 p-2 bg-green-50 rounded-md border border-green-200">
            <div className="flex justify-between items-center mb-1">
              <div className="flex gap-1 items-center text-xs text-green-700">
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="font-medium">
                  {track.saleCount || 0} {track.saleCount === 1 ? 'Sale' : 'Sales'}
                </span>
              </div>
              {track.totalSoldPrice !== undefined && track.totalSoldPrice > 0 && (
                <div className="flex gap-1 items-center text-xs font-semibold text-green-700">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>{formatPrice(track.totalSoldPrice || 0)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview Audio Player */}
        {track.previewAudio && (
          <div className="mb-3">
            <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
              <p className="mb-1 text-xs font-medium text-gray-600">Preview:</p>
              <audio
                controls
                src={track.previewAudio}
                className="w-full h-8"
                preload="metadata"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        )}

        {/* Full Audio Player */}
        {track.audio && (
          <div className="mb-3">
            <AudioPlayer src={track.audio} compact={true} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
            onClick={() => onEdit(track)}
          >
            <Edit className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs font-medium transition-colors text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30"
            onClick={() => onDelete(track._id || track.id)}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TrackCard;
