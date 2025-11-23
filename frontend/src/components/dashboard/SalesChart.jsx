import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SalesChart = ({ salesByDate }) => {
  if (!salesByDate || salesByDate.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Over Time</CardTitle>
          <CardDescription>Sales trend for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No sales data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find max revenue for scaling
  const maxRevenue = Math.max(...salesByDate.map((d) => d.revenue), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Over Time</CardTitle>
        <CardDescription>Daily sales revenue for the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {salesByDate.map((item, index) => {
            const percentage = (item.revenue / maxRevenue) * 100;
            const date = new Date(item.date);
            const formattedDate = date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 text-xs text-muted-foreground">
                  {formattedDate}
                </div>
                <div className="flex-1 relative">
                  <div className="h-8 bg-gray-100 rounded-md overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-md transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-medium">
                    <span className="text-gray-700">{item.count} sales</span>
                    <span className="text-indigo-600">৳{item.revenue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart;

