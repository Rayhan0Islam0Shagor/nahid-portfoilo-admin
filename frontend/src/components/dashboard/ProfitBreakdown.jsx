import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Building2, Wallet } from 'lucide-react';

const ProfitBreakdown = ({ profitBreakdown, totalProfit }) => {
  if (!profitBreakdown) {
    return null;
  }

  const breakdown = [
    {
      label: 'Platform Fee',
      amount: profitBreakdown.platformFee || 0,
      percentage: totalProfit > 0 ? ((profitBreakdown.platformFee / totalProfit) * 100).toFixed(1) : 0,
      color: 'bg-indigo-500',
      icon: Building2,
      description: 'Platform commission',
    },
    {
      label: 'Artist Share',
      amount: profitBreakdown.artistShare || 0,
      percentage: totalProfit > 0 ? ((profitBreakdown.artistShare / totalProfit) * 100).toFixed(1) : 0,
      color: 'bg-green-500',
      icon: Users,
      description: 'Artist earnings',
    },
    {
      label: 'Producer Share',
      amount: profitBreakdown.producerShare || 0,
      percentage: totalProfit > 0 ? ((profitBreakdown.producerShare / totalProfit) * 100).toFixed(1) : 0,
      color: 'bg-blue-500',
      icon: TrendingUp,
      description: 'Producer earnings',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Profit Distribution
        </CardTitle>
        <CardDescription>Breakdown of revenue distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {breakdown.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`${item.color} rounded-md p-2`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">৳{item.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Total Revenue</p>
              <p className="text-xl font-bold text-indigo-600">৳{totalProfit.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitBreakdown;

