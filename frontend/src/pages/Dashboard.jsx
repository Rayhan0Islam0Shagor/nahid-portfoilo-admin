import { useEffect } from 'react';
import { useData } from '@/context/useDataContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Music, DollarSign, ShoppingCart, Image, Mail, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { stats, fetchDataIfNeeded } = useData();

  useEffect(() => {
    fetchDataIfNeeded();
  }, [fetchDataIfNeeded]);

  const dashboardStats = [
    {
      name: 'Total Tracks',
      value: stats.totalTracks,
      icon: Music,
      color: 'bg-blue-500',
      description: 'Available tracks in your library',
    },
    {
      name: 'Tracks Sold',
      value: stats.totalTracksSold,
      icon: ShoppingCart,
      color: 'bg-green-500',
      description: 'Total number of tracks sold',
    },
    {
      name: 'Total Profit',
      value: `৳${stats.totalProfit.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-indigo-500',
      description: 'Total revenue from track sales',
    },
    {
      name: 'Gallery Images',
      value: stats.totalImages,
      icon: Image,
      color: 'bg-purple-500',
      description: 'Images in your gallery',
    },
    {
      name: 'Unread Messages',
      value: stats.unreadContacts || 0,
      icon: Mail,
      color: 'bg-red-500',
      description: 'Unread contact messages',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back! Here's an overview of your content and sales.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </CardTitle>
                <div className={`${stat.color} rounded-md p-2`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Track Sales Overview</CardTitle>
            <CardDescription>
              Summary of your track sales and revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Tracks Available
                </span>
                <span className="text-lg font-semibold">
                  {stats.totalTracks}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Tracks Sold
                </span>
                <span className="text-lg font-semibold text-green-600">
                  {stats.totalTracksSold}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium text-foreground">
                  Total Profit
                </span>
                <span className="text-xl font-bold text-indigo-600">
                  ৳{stats.totalProfit.toFixed(2)}
                </span>
              </div>
              {stats.totalTracks > 0 && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">
                    Average Price per Track
                  </span>
                  <span className="text-sm font-semibold">
                    $
                    {(stats.totalProfit / stats.totalTracksSold || 0).toFixed(
                      2,
                    )}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Overview</CardTitle>
            <CardDescription>Your content library statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Music Tracks
                </span>
                <span className="text-lg font-semibold">
                  {stats.totalTracks}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Gallery Images
                </span>
                <span className="text-lg font-semibold text-purple-600">
                  {stats.totalImages}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Pricing Plans
                </span>
                <span className="text-lg font-semibold">
                  {stats.totalPricingPlans}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium text-foreground">
                  Total Content Items
                </span>
                <span className="text-xl font-bold">
                  {stats.totalTracks +
                    stats.totalImages +
                    stats.totalPricingPlans}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Inbox</CardTitle>
            <CardDescription>Manage contact form submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Contacts
                </span>
                <span className="text-lg font-semibold">
                  {stats.totalContacts || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Unread Messages
                </span>
                <span className="text-lg font-semibold text-orange-600">
                  {stats.unreadContacts || 0}
                </span>
              </div>
              <div className="pt-2 border-t">
                <Link to="/dashboard/contacts">
                  <Button variant="outline" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    View Inbox
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link to="/dashboard/payment-history">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                Payment History & Analytics
              </CardTitle>
              <CardDescription>
                View sales statistics, profit distribution, and payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Payment History
              </Button>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
