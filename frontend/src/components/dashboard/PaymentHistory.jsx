import { useState, useEffect } from 'react';
import { dashboardAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';

const PaymentHistoryTable = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPaymentHistory();
  }, [pagination.page, statusFilter]);

  const fetchPaymentHistory = async () => {
    setLoading(true);
    setError('');

    try {
      const filters = {
        limit: pagination.limit,
        page: pagination.page,
      };

      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const result = await dashboardAPI.getPaymentHistory(filters);

      if (result.success) {
        setPayments(result.data.payments || []);
        setPagination((prev) => ({
          ...prev,
          total: result.data.pagination?.total || 0,
          totalPages: result.data.pagination?.totalPages || 0,
        }));
      } else {
        setError(result.message || 'Failed to fetch payment history');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { variant: 'default', className: 'bg-green-500', icon: CheckCircle2 },
      pending: { variant: 'default', className: 'bg-yellow-500', icon: Clock },
      failed: { variant: 'default', className: 'bg-red-500', icon: XCircle },
      refunded: { variant: 'default', className: 'bg-gray-500', icon: RefreshCw },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment History
            </CardTitle>
            <CardDescription>Recent payment transactions</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter('all');
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter('completed');
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              Completed
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter('pending');
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              Pending
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No payment history found</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment._id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{payment.trackTitle}</h3>
                        {getStatusBadge(payment.paymentStatus)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Buyer:</span> {payment.buyerName} ({payment.buyerEmail})
                        </div>
                        <div>
                          <span className="font-medium">Method:</span> {payment.paymentMethod || 'N/A'}
                        </div>
                        {payment.transactionId && (
                          <div>
                            <span className="font-medium">Transaction:</span>{' '}
                            <span className="font-mono text-xs">{payment.transactionId}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-indigo-600">৳{payment.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistoryTable;

