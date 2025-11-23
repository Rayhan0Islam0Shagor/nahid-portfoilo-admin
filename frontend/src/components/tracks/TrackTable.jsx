import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ShoppingCart, DollarSign } from 'lucide-react';

const TrackTable = ({ tracks, onEdit, onDelete }) => {
  // Format price with BDT symbol
  const formatPrice = (price) => {
    return `৳ ${parseFloat(price).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  if (tracks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tracks found. Add your first track!
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Thumbnail</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Release Date</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Views</TableHead>
          <TableHead>Sales</TableHead>
          <TableHead>Revenue</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tracks.map((track) => (
          <TableRow key={track._id || track.id}>
            <TableCell>
              {track.thumbnail && (
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
            </TableCell>
            <TableCell className="font-medium">{track.title}</TableCell>
            <TableCell>
              <Badge variant="secondary">{track.category || 'Uncategorized'}</Badge>
            </TableCell>
            <TableCell>
              {track.releaseDate
                ? new Date(track.releaseDate).toLocaleDateString()
                : '-'}
            </TableCell>
            <TableCell className="font-semibold">{formatPrice(track.price || 0)}</TableCell>
            <TableCell>
              {track.views !== undefined ? (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span>{track.views || 0}</span>
                </div>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </TableCell>
            <TableCell>
              {track.saleCount !== undefined ? (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <ShoppingCart className="w-4 h-4" />
                  <span>{track.saleCount || 0}</span>
                </div>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </TableCell>
            <TableCell className="font-semibold text-green-600">
              {track.totalSoldPrice !== undefined
                ? formatPrice(track.totalSoldPrice || 0)
                : '-'}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(track)}
                className="mr-2"
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(track._id || track.id)}
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

export default TrackTable;
