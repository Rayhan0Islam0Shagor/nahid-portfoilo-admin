import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { getYouTubeThumbnail } from '@/lib/utils';

const YouTubeTable = ({ videos, onEdit, onDelete }) => {
  if (videos.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No YouTube videos found. Add your first video!
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Thumbnail</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {videos.map((video) => {
          // Fix thumbnail URL issues
          const fixThumbnailUrl = (url) => {
            if (!url) return url;

            // Replace .auto extension with .webp for browser compatibility
            if (url.endsWith('.auto')) {
              url = url.replace(/\.auto$/, '.webp');
            }

            // Fix Cloudinary URL structure - remove version parameter from middle of path
            if (url.includes('/image/upload/')) {
              url = url.replace(
                /\/image\/upload\/([^/]+)\/v\d+\//,
                '/image/upload/$1/',
              );
            }

            return url;
          };

          // Prioritize uploaded thumbnail, fallback to YouTube thumbnail
          const uploadedThumbnail =
            video.thumbnail && video.thumbnail.trim() !== ''
              ? fixThumbnailUrl(video.thumbnail)
              : null;
          const youtubeThumbnailUrl = uploadedThumbnail
            ? null
            : getYouTubeThumbnail(video.videoUrl);
          const thumbnailUrl = uploadedThumbnail || youtubeThumbnailUrl;

          return (
            <TableRow key={video._id || video.id}>
              <TableCell>
                {thumbnailUrl ? (
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="overflow-hidden relative w-32 h-20 rounded border border-gray-200 transition-colors hover:border-blue-500">
                      <img
                        src={thumbnailUrl}
                        alt={video.title || 'YouTube video thumbnail'}
                        className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => {
                          // For uploaded thumbnails, don't try fallback
                          if (uploadedThumbnail) {
                            e.target.style.display = 'none';
                            return;
                          }
                          // For YouTube thumbnails, try fallback quality
                          const fallbackUrl = getYouTubeThumbnail(
                            video.videoUrl,
                            'hqdefault',
                          );
                          if (fallbackUrl && e.target.src !== fallbackUrl) {
                            e.target.src = fallbackUrl;
                          }
                        }}
                      />
                    </div>
                  </a>
                ) : (
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block max-w-xs text-sm text-blue-600 truncate hover:underline"
                  >
                    {video.videoUrl}
                  </a>
                )}
              </TableCell>
              <TableCell className="font-medium">{video.title}</TableCell>
              <TableCell className="max-w-md">
                {video.description ? (
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 max-h-32 overflow-y-auto bg-white p-2 rounded border border-gray-200">
                    {video.description}
                  </pre>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(video)}
                  className="mr-2"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(video._id || video.id)}
                  className="text-destructive hover:text-destructive"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default YouTubeTable;
