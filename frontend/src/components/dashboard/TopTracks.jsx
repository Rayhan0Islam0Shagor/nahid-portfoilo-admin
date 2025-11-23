import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, TrendingUp } from 'lucide-react';

const TopTracks = ({ topTracks }) => {
  if (!topTracks || topTracks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Tracks</CardTitle>
          <CardDescription>Best performing tracks by revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            No sales data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Selling Tracks
        </CardTitle>
        <CardDescription>Best performing tracks by revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topTracks.map((track, index) => (
            <div
              key={track.trackId || index}
              className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{track.trackTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {track.count} {track.count === 1 ? 'sale' : 'sales'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-indigo-600">৳{track.revenue.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopTracks;

