import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { 
  Edit, ExternalLink, Clock, CheckCircle, XCircle, Shield, FileText, Key, Users, 
  TrendingUp, DollarSign, Activity, BarChart3, Wallet, AlertCircle, Download 
} from 'lucide-react';
import { useState } from 'react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { BrokerRequest, WithdrawalRequest, TradingAccount } from '@shared/schema';
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
    enabled: isAuthorizedAdmin,
  });

  const { data: withdrawalRequests = [] } = useQuery({
    queryKey: ['/api/admin/withdrawals'],
    enabled: isAuthorizedAdmin,
  });

  const { data: allClients = [] } = useQuery({
    queryKey: ['/api/admin/clients'],
    enabled: isAuthorizedAdmin,
  });

  const { data: systemStats = {} } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: isAuthorizedAdmin,
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

  const updateWithdrawalMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { 
      id: string; 
      status: string; 
      adminNotes?: string; 
    }) => {
      return await apiRequest('PATCH', `/api/admin/withdrawals/${id}`, { status, adminNotes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawals'] });
      toast({
        title: "Success",
        description: "Withdrawal request updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update withdrawal request",
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2" data-testid="tab-clients">
            <Users className="w-4 h-4" />
            Clients
            <Badge variant="secondary" className="ml-1">{(allClients as any[]).length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="flex items-center gap-2" data-testid="tab-withdrawals">
            <Wallet className="w-4 h-4" />
            Withdrawals
            <Badge variant="secondary" className="ml-1">{(withdrawalRequests as any[]).filter((r: any) => r.status === 'pending').length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="broker-requests" className="flex items-center gap-2" data-testid="tab-broker-requests">
            <FileText className="w-4 h-4" />
            Brokers
          </TabsTrigger>
          <TabsTrigger value="master-account" className="flex items-center gap-2" data-testid="tab-master-account">
            <Key className="w-4 h-4" />
            Master
          </TabsTrigger>
          <TabsTrigger value="copiers" className="flex items-center gap-2" data-testid="tab-copiers">
            <Activity className="w-4 h-4" />
            Copy Trading
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-total-clients">{systemStats.totalClients || 0}</div>
                <p className="text-xs text-muted-foreground">Active trading accounts</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total AUM</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-total-aum">${systemStats.totalAUM?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">Assets under management</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's P&L</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(systemStats.todayPnL || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} data-testid="stat-today-pnl">
                  ${systemStats.todayPnL?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">Across all accounts</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-pending-actions">{systemStats.pendingActions || 0}</div>
                <p className="text-xs text-muted-foreground">Requires attention</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemStats.recentActivity?.slice(0, 5).map((activity: any, idx: number) => (
                    <div key={idx} className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">{new Date(activity.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )) || <p className="text-sm text-muted-foreground">No recent activity</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bybit Connection</span>
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Copy Trading Engine</span>
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />Running
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />Healthy
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Clients</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Accounts</TableHead>
                    <TableHead>Total Balance</TableHead>
                    <TableHead>P&L</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(allClients as any[]).map((client: any) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.email}</TableCell>
                      <TableCell>{client.firstName} {client.lastName}</TableCell>
                      <TableCell>{client.accountCount || 0}</TableCell>
                      <TableCell>${client.totalBalance?.toLocaleString() || '0'}</TableCell>
                      <TableCell className={`${(client.totalPnL || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${client.totalPnL?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(withdrawalRequests as any[]).map((request: any) => (
                    <TableRow key={request.id}>
                      <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{request.userEmail}</TableCell>
                      <TableCell className="font-medium">${request.amount}</TableCell>
                      <TableCell>{request.currency}</TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
                          <Badge variant="outline" className="text-yellow-600">
                            <Clock className="w-3 h-3 mr-1" />Pending
                          </Badge>
                        )}
                        {request.status === 'approved' && (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />Approved
                          </Badge>
                        )}
                        {request.status === 'rejected' && (
                          <Badge variant="outline" className="text-red-600">
                            <XCircle className="w-3 h-3 mr-1" />Rejected
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-green-600"
                              onClick={() => updateWithdrawalMutation.mutate({ 
                                id: request.id, 
                                status: 'approved' 
                              })}
                              data-testid={`approve-withdrawal-${request.id}`}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600"
                              onClick={() => updateWithdrawalMutation.mutate({ 
                                id: request.id, 
                                status: 'rejected' 
                              })}
                              data-testid={`reject-withdrawal-${request.id}`}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

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