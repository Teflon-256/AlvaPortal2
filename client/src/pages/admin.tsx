import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Edit, ExternalLink, Clock, CheckCircle, XCircle, Shield, FileText, Key, Users } from 'lucide-react';
import { useState } from 'react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { BrokerRequest } from '@shared/schema';
import { MasterAccountConfig } from '@/components/MasterAccountConfig';
import { CopierManagement } from '@/components/CopierManagement';

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<BrokerRequest | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Check if user is authorized to access admin panel
  const authorizedAdminEmails = ['sahabyoona@gmail.com', 'mihhaa2p@gmail.com'];
  const isAuthorizedAdmin = Boolean(user?.email && authorizedAdminEmails.includes(user.email));

  const { data: brokerRequests = [], isLoading } = useQuery({
    queryKey: ['/api/broker-requests'],
    enabled: isAuthorizedAdmin, // Only fetch data if user is authorized
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status, adminNotes }: { 
      requestId: string; 
      status: string; 
      adminNotes?: string; 
    }) => {
      return await apiRequest('PATCH', `/api/broker-requests/${requestId}`, { status, adminNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/broker-requests'] });
      setUpdateDialogOpen(false);
      setSelectedRequest(null);
      setNewStatus('');
      setAdminNotes('');
      toast({
        title: "Success",
        description: "Broker request updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update broker request",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status || 'pending'}</Badge>;
    }
  };

  const handleUpdateRequest = (request: BrokerRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status || 'pending');
    setAdminNotes(request.adminNotes || '');
    setUpdateDialogOpen(true);
  };

  const handleSubmitUpdate = () => {
    if (!selectedRequest || !newStatus) return;
    
    updateRequestMutation.mutate({
      requestId: selectedRequest.id,
      status: newStatus,
      adminNotes: adminNotes || undefined
    });
  };

  if (authLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  if (!isAuthorizedAdmin) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Access Restricted</h2>
              <p className="text-muted-foreground mb-4">
                This admin panel is only accessible to authorized administrators.
              </p>
              <p className="text-sm text-muted-foreground">
                Contact support if you believe you should have access.
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                className="mt-4"
                data-testid="return-home"
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <Tabs defaultValue="broker-requests" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="broker-requests" className="flex items-center gap-2" data-testid="tab-broker-requests">
            <FileText className="w-4 h-4" />
            Broker Requests
            <Badge variant="secondary" className="ml-1">{(brokerRequests as BrokerRequest[]).length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="master-account" className="flex items-center gap-2" data-testid="tab-master-account">
            <Key className="w-4 h-4" />
            Master Account
          </TabsTrigger>
          <TabsTrigger value="copiers" className="flex items-center gap-2" data-testid="tab-copiers">
            <Users className="w-4 h-4" />
            Copier Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="broker-requests" className="mt-6">
          <div className="grid gap-6">
        {(brokerRequests as BrokerRequest[]).length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">No broker requests found</div>
            </CardContent>
          </Card>
        ) : (
          (brokerRequests as BrokerRequest[]).map((request: BrokerRequest) => (
            <Card key={request.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span>Broker Request - {request.brokerName}</span>
                    {getStatusBadge(request.status)}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateRequest(request)}
                    data-testid={`edit-request-${request.id}`}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Update
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">User ID</Label>
                    <div className="text-sm text-muted-foreground" data-testid={`user-id-${request.id}`}>
                      {request.userId}
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold">Submitted</Label>
                    <div className="text-sm text-muted-foreground">
                      {new Date(request.createdAt!).toLocaleDateString()} at{' '}
                      {new Date(request.createdAt!).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="font-semibold">Broker Name</Label>
                  <div className="text-sm" data-testid={`broker-name-${request.id}`}>
                    {request.brokerName}
                  </div>
                </div>

                {request.adminNotes && (
                  <div>
                    <Label className="font-semibold">Admin Notes</Label>
                    <div className="text-sm whitespace-pre-wrap p-3 bg-muted rounded-md" data-testid={`admin-notes-${request.id}`}>
                      {request.adminNotes}
                    </div>
                  </div>
                )}

                {request.updatedAt && request.updatedAt !== request.createdAt && (
                  <div>
                    <Label className="font-semibold">Last Updated</Label>
                    <div className="text-sm text-muted-foreground">
                      {new Date(request.updatedAt).toLocaleDateString()} at{' '}
                      {new Date(request.updatedAt).toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
          </div>
        </TabsContent>

        <TabsContent value="master-account" className="mt-6">
          <MasterAccountConfig />
        </TabsContent>

        <TabsContent value="copiers" className="mt-6">
          <CopierManagement />
        </TabsContent>
      </Tabs>

      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent data-testid="update-request-dialog">
          <DialogHeader>
            <DialogTitle>Update Broker Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger data-testid="status-select">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="adminNotes">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Add notes about this request..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="min-h-24"
                  data-testid="admin-notes-input"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setUpdateDialogOpen(false)}
                  data-testid="cancel-update"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitUpdate}
                  disabled={updateRequestMutation.isPending || !newStatus}
                  data-testid="submit-update"
                >
                  {updateRequestMutation.isPending ? "Updating..." : "Update Request"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}