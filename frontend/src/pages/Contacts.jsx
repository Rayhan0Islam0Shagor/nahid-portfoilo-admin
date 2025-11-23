import { useState, useEffect, useCallback } from 'react';
import { contactsAPI } from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Eye, Phone, User, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'read', 'unread'
  const [selectedContact, setSelectedContact] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  });

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const filters = {
        limit: pagination.limit,
        page: pagination.page,
      };

      if (filter === 'read') {
        filters.isRead = true;
      } else if (filter === 'unread') {
        filters.isRead = false;
      }

      const result = await contactsAPI.getAll(filters);

      if (result.success) {
        setContacts(result.data.contacts || []);
        setPagination((prev) => ({
          ...prev,
          total: result.data.pagination?.total || 0,
          totalPages: result.data.pagination?.totalPages || 0,
        }));

        // Fetch stats separately to get total and unread counts
        const [allResult, unreadResult, readResult] = await Promise.all([
          contactsAPI.getAll({ limit: 1, page: 1 }),
          contactsAPI.getAll({ isRead: false, limit: 1, page: 1 }),
          contactsAPI.getAll({ isRead: true, limit: 1, page: 1 }),
        ]);

        if (allResult.success && unreadResult.success && readResult.success) {
          setStats({
            total: allResult.data.pagination?.total || 0,
            unread: unreadResult.data.pagination?.total || 0,
            read: readResult.data.pagination?.total || 0,
          });
        }
      } else {
        setError(result.message || 'Failed to fetch contacts');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  }, [filter, pagination.limit, pagination.page]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleViewContact = async (id) => {
    try {
      const result = await contactsAPI.getById(id);
      if (result.success) {
        setSelectedContact(result.data);
        setIsDialogOpen(true);
        // Refresh list to update read status
        fetchContacts();
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch contact details');
    }
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
    <div className="p-6">
      <div className="mb-8">
        <h1 className="flex gap-2 items-center text-3xl font-bold text-gray-900">
          <Mail className="w-8 h-8" />
          Inbox
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage and view all contact form submissions
        </p>
      </div>

      {/* Stats and Filter Tabs */}
      <div className="mb-6 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Contacts
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Mail className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Unread Messages
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.unread}
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Read Messages</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.read}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => {
              setFilter('all');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          >
            All ({stats.total})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            onClick={() => {
              setFilter('unread');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          >
            Unread ({stats.unread})
          </Button>
          <Button
            variant={filter === 'read' ? 'default' : 'outline'}
            onClick={() => {
              setFilter('read');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          >
            Read ({stats.read})
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-800 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      ) : contacts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="mx-auto mb-4 w-12 h-12 text-gray-400" />
            <p className="text-gray-600">No contacts found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {contacts.map((contact) => (
              <Card
                key={contact._id}
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  !contact.isRead ? 'border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => handleViewContact(contact._id)}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4 justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2 items-center">
                        <h3 className="text-lg font-semibold">
                          {contact.subject}
                        </h3>
                        {!contact.isRead && (
                          <Badge variant="default" className="bg-blue-500">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex gap-1 items-center">
                          <User className="w-4 h-4" />
                          <span>{contact.name}</span>
                        </div>
                        <div className="flex gap-1 items-center">
                          <Mail className="w-4 h-4" />
                          <span>{contact.email}</span>
                        </div>
                        <div className="flex gap-1 items-center">
                          <Phone className="w-4 h-4" />
                          <span>{contact.phoneNumber}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {contact.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(contact.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewContact(contact._id);
                        }}
                        title="View message"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} (
                {pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
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

      {/* Contact Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex gap-2 items-center">
              <MessageSquare className="w-5 h-5" />
              {selectedContact?.subject}
            </DialogTitle>
            <DialogDescription>Contact details and message</DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedContact.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedContact.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedContact.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <p className="font-medium">
                    {formatDate(selectedContact.createdAt)}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Subject</Label>
                <p className="font-medium">{selectedContact.subject}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Message</Label>
                <p className="mt-2 text-sm whitespace-pre-wrap">
                  {selectedContact.message}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contacts;
