import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const TikTokTable = ({ videos, onEdit, onDelete }) => {
  if (videos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No TikTok videos found. Add your first video!
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Video</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {videos.map((video) => (
          <TableRow key={video._id || video.id}>
            <TableCell>
              {video.videoUrl && (
                <video
                  src={video.videoUrl}
                  className="w-32 h-32 object-cover rounded"
                  controls
                />
              )}
            </TableCell>
            <TableCell className="font-medium">{video.title}</TableCell>
            <TableCell className="max-w-md truncate">
              {video.description || '-'}
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
        ))}
      </TableBody>
    </Table>
  );
};

export default TikTokTable;

