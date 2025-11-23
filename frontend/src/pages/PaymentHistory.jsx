import { useState, useEffect } from 'react';
import { useData } from '@/context/useDataContext';
import { dashboardAPI } from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, CreditCard, TrendingUp, Wallet } from 'lucide-react';
import SalesChart from '@/components/dashboard/SalesChart';
import TopTracks from '@/components/dashboard/TopTracks';
import PaymentHistoryTable from '@/components/dashboard/PaymentHistory';

const PaymentHistory = () => {
  const { stats } = useData();
  const [salesStats, setSalesStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSalesStats = async () => {
      setLoading(true);
      setError('');

      try {
        const result = await dashboardAPI.getSalesStats(30);
        if (result.success) {
          setSalesStats(result.data);
        } else {
          setError(result.message || 'Failed to fetch sales statistics');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch sales statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesStats();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="flex gap-2 items-center text-3xl font-bold text-gray-900">
          <CreditCard className="w-8 h-8" />
          Payment History & Analytics
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Complete overview of sales, profit distribution, and payment
          transactions
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Sales Statistics Section */}
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="flex gap-2 items-center text-2xl font-bold text-gray-900 mb-2">
            <TrendingUp className="w-6 h-6" />
            Sales Statistics
          </h2>
          <p className="text-sm text-gray-600">
            Detailed insights into your sales performance and revenue
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Sales Chart */}
            <div className="mb-6">
              <SalesChart salesByDate={salesStats?.salesByDate || []} />
            </div>

            {/* Top Tracks and Sales Summary */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <TopTracks topTracks={salesStats?.topTracks || []} />
              <Card>
                <CardHeader>
                  <CardTitle>Sales Summary</CardTitle>
                  <CardDescription>
                    Overview of sales performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesStats?.salesByStatus && (
                      <>
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-3">By Status</p>
                          {salesStats.salesByStatus.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between mb-2"
                            >
                              <span className="text-sm text-muted-foreground capitalize">
                                {item.status} Sales
                              </span>
                              <div className="text-right">
                                <span className="text-lg font-semibold">
                                  {item.count}
                                </span>
                                {item.status === 'completed' && (
                                  <p className="text-xs text-muted-foreground">
                                    ৳{item.revenue.toFixed(2)}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {salesStats?.salesByMethod && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium mb-3">
                          By Payment Method
                        </p>
                        {salesStats.salesByMethod.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between mb-2"
                          >
                            <span className="text-sm text-muted-foreground capitalize">
                              {item.method}
                            </span>
                            <div className="text-right">
                              <span className="text-sm font-semibold">
                                {item.count} sales
                              </span>
                              <p className="text-xs text-muted-foreground">
                                ৳{item.revenue.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {salesStats && (
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Total Sales
                          </span>
                          <span className="text-lg font-bold">
                            {salesStats.totalSales}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-medium">
                            Completed Sales
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            {salesStats.completedSales}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t">
                          <span className="text-sm font-medium">
                            Total Revenue
                          </span>
                          <span className="text-xl font-bold text-indigo-600">
                            ৳{salesStats.totalRevenue.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      {/* Revenue Overview Section */}
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="flex gap-2 items-center text-2xl font-bold text-gray-900 mb-2">
            <Wallet className="w-6 h-6" />
            Revenue Overview
          </h2>
          <p className="text-sm text-gray-600">
            Summary of your revenue metrics and sales performance
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Summary
            </CardTitle>
            <CardDescription>Overview of your revenue metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Revenue
                </span>
                <span className="text-2xl font-bold text-indigo-600">
                  ৳{stats.totalProfit.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Tracks Sold
                </span>
                <span className="text-lg font-semibold">
                  {stats.totalTracksSold}
                </span>
              </div>
              {stats.totalTracksSold > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Average Revenue per Sale
                    </span>
                    <span className="text-lg font-bold">
                      ৳{(stats.totalProfit / stats.totalTracksSold).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History Section */}
      <div>
        <div className="mb-6">
          <h2 className="flex gap-2 items-center text-2xl font-bold text-gray-900 mb-2">
            <CreditCard className="w-6 h-6" />
            Payment History
          </h2>
          <p className="text-sm text-gray-600">
            View and manage all payment transactions
          </p>
        </div>
        <PaymentHistoryTable />
      </div>
    </div>
  );
};

export default PaymentHistory;
