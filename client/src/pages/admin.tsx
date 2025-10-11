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
  TrendingUp, DollarSign, Activity, BarChart3, Wallet, AlertCircle, Download, LogOut 
} from 'lucide-react';
import { useState } from 'react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { BrokerRequest, WithdrawalRequest, TradingAccount } from '@shared/schema';
import { MasterAccountConfig } from '@/components/MasterAccountConfig';
import { CopierManagement } from '@/components/CopierManagement';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<BrokerRequest | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [editClientDialogOpen, setEditClientDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editCountry, setEditCountry] = useState('');

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

  const { data: brokerStats = [] } = useQuery({
    queryKey: ['/api/admin/broker-stats'],
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
        return <Badge variant="outline" className="border-yellow-500 text-yellow-400 bg-yellow-500/10"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="border-red-500 text-red-400 bg-red-500/10"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline" className="border-cyan-500 text-cyan-400">{status || 'pending'}</Badge>;
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

  const updateClientMutation = useMutation({
    mutationFn: async ({ userId, firstName, lastName, country }: { 
      userId: string; 
      firstName: string; 
      lastName: string; 
      country: string; 
    }) => {
      return await apiRequest('PATCH', `/api/admin/users/${userId}`, { firstName, lastName, country });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clients'] });
      setEditClientDialogOpen(false);
      setSelectedClient(null);
      setEditFirstName('');
      setEditLastName('');
      setEditCountry('');
      toast({
        title: "Success",
        description: "Client information updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update client information",
        variant: "destructive",
      });
    },
  });

  const handleEditClient = (client: any) => {
    setSelectedClient(client);
    setEditFirstName(client.firstName || '');
    setEditLastName(client.lastName || '');
    setEditCountry(client.country || '');
    setEditClientDialogOpen(true);
  };

  const handleSubmitClientUpdate = () => {
    if (!selectedClient || !editFirstName || !editLastName || !editCountry) return;
    
    updateClientMutation.mutate({
      userId: selectedClient.id,
      firstName: editFirstName,
      lastName: editLastName,
      country: editCountry
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <svg 
              className="w-16 h-16 animate-spin mx-auto" 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="40" stroke="hsl(217,100%,70%)" strokeWidth="3" fill="none" opacity="0.2" />
              <path 
                d="M 50 10 A 40 40 0 0 1 90 50" 
                stroke="hsl(217,100%,70%)" 
                strokeWidth="3" 
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="text-2xl font-mono text-cyan-400">LOADING ADMIN PORTAL...</div>
        </div>
      </div>
    );
  }

  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(hsl(217,100%,70%) 1px, transparent 1px),
              linear-gradient(90deg, hsl(217,100%,70%) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite'
          }} />
        </div>
        
        <Card className="max-w-md bg-zinc-900/50 border-2 border-cyan-500/30 backdrop-blur-sm relative z-10">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-black" />
            </div>
            <h2 className="text-2xl font-mono font-bold text-cyan-400 mb-2">ACCESS RESTRICTED</h2>
            <p className="text-zinc-400 mb-4">
              This admin panel is only accessible to authorized administrators.
            </p>
            <p className="text-sm text-zinc-500 mb-6">
              Contact support if you believe you should have access.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-mono font-bold"
              data-testid="return-home"
            >
              RETURN TO HOME
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <svg 
              className="w-16 h-16 animate-spin mx-auto" 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="40" stroke="hsl(217,100%,70%)" strokeWidth="3" fill="none" opacity="0.2" />
              <path 
                d="M 50 10 A 40 40 0 0 1 90 50" 
                stroke="hsl(217,100%,70%)" 
                strokeWidth="3" 
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="text-2xl font-mono text-cyan-400">LOADING DATA...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(hsl(217,100%,70%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(217,100%,70%) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }} />
      </div>

      <div className="container mx-auto p-6 space-y-6 relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              ADMIN DASHBOARD
            </h1>
            <div className="text-cyan-400 font-mono text-sm tracking-widest mt-2">SYSTEM CONTROL PANEL</div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
              className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-mono"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              LOGOUT
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-zinc-900/50 border-2 border-cyan-500/30 p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-black font-mono" data-testid="tab-overview">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-black font-mono" data-testid="tab-clients">
              <Users className="w-4 h-4" />
              Clients
              <Badge variant="secondary" className="ml-1 bg-cyan-500 text-black">{(allClients as any[]).length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-black font-mono" data-testid="tab-withdrawals">
              <Wallet className="w-4 h-4" />
              Withdrawals
              <Badge variant="secondary" className="ml-1 bg-cyan-500 text-black">{(withdrawalRequests as any[]).filter((r: any) => r.status === 'pending').length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="broker-requests" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-black font-mono" data-testid="tab-broker-requests">
              <FileText className="w-4 h-4" />
              Brokers
            </TabsTrigger>
            <TabsTrigger value="master-account" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-black font-mono" data-testid="tab-master-account">
              <Key className="w-4 h-4" />
              Master
            </TabsTrigger>
            <TabsTrigger value="copiers" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-black font-mono" data-testid="tab-copiers">
              <Activity className="w-4 h-4" />
              Copy Trading
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-zinc-900/50 border-2 border-cyan-500/30 hover:border-cyan-500 transition-all backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-mono text-cyan-400">Total Clients</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Users className="h-5 w-5 text-black" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-mono font-bold text-white" data-testid="stat-total-clients">{(systemStats as any).totalClients || 0}</div>
                  <p className="text-xs text-zinc-500 font-mono tracking-wider">ACTIVE TRADING ACCOUNTS</p>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900/50 border-2 border-cyan-500/30 hover:border-cyan-500 transition-all backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-mono text-cyan-400">Total AUM</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-black" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-mono font-bold text-white" data-testid="stat-total-aum">${(systemStats as any).totalAUM?.toLocaleString() || '0'}</div>
                  <p className="text-xs text-zinc-500 font-mono tracking-wider">ASSETS UNDER MANAGEMENT</p>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900/50 border-2 border-cyan-500/30 hover:border-cyan-500 transition-all backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-mono text-cyan-400">Today's P&L</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-black" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-mono font-bold ${((systemStats as any).todayPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`} data-testid="stat-today-pnl">
                    ${(systemStats as any).todayPnL?.toLocaleString() || '0'}
                  </div>
                  <p className="text-xs text-zinc-500 font-mono tracking-wider">ACROSS ALL ACCOUNTS</p>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900/50 border-2 border-cyan-500/30 hover:border-cyan-500 transition-all backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-mono text-cyan-400">Pending Actions</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-black" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-mono font-bold text-white" data-testid="stat-pending-actions">{(systemStats as any).pendingActions || 0}</div>
                  <p className="text-xs text-zinc-500 font-mono tracking-wider">REQUIRES ATTENTION</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-zinc-900/50 border-2 border-cyan-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-mono text-cyan-400">RECENT ACTIVITY</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(systemStats as any).recentActivity?.slice(0, 5).map((activity: any, idx: number) => (
                      <div key={idx} className="flex items-center border-l-2 border-cyan-500 pl-4">
                        <div className="space-y-1">
                          <p className="text-sm font-mono text-white leading-none">{activity.description}</p>
                          <p className="text-xs text-zinc-500 font-mono">{new Date(activity.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )) || <p className="text-sm text-zinc-500 font-mono">NO RECENT ACTIVITY</p>}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-2 border-cyan-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-mono text-cyan-400">SYSTEM HEALTH</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono text-white">Bybit Connection</span>
                      <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10 font-mono">
                        <CheckCircle className="w-3 h-3 mr-1" />ACTIVE
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono text-white">Copy Trading Engine</span>
                      <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10 font-mono">
                        <CheckCircle className="w-3 h-3 mr-1" />RUNNING
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono text-white">Database</span>
                      <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10 font-mono">
                        <CheckCircle className="w-3 h-3 mr-1" />HEALTHY
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-zinc-900/50 border-2 border-cyan-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-mono text-cyan-400">BROKER STATISTICS</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-cyan-500/30">
                      <TableHead className="text-cyan-400 font-mono">BROKER</TableHead>
                      <TableHead className="text-cyan-400 font-mono">ACCOUNTS</TableHead>
                      <TableHead className="text-cyan-400 font-mono">TOTAL BALANCE</TableHead>
                      <TableHead className="text-cyan-400 font-mono">P&L</TableHead>
                      <TableHead className="text-cyan-400 font-mono">DEPOSITS</TableHead>
                      <TableHead className="text-cyan-400 font-mono">WITHDRAWALS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(brokerStats as any[]).map((broker: any) => (
                      <TableRow key={broker.broker} className="border-cyan-500/30 hover:bg-cyan-500/5">
                        <TableCell className="font-mono text-white uppercase">{broker.broker}</TableCell>
                        <TableCell className="font-mono text-white">{broker.accountCount || 0}</TableCell>
                        <TableCell className="font-mono text-white">${broker.totalBalance?.toLocaleString() || '0'}</TableCell>
                        <TableCell className={`font-mono ${(broker.totalPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${broker.totalPnL?.toLocaleString() || '0'}
                        </TableCell>
                        <TableCell className="font-mono text-cyan-400">
                          ${broker.totalDeposits?.toLocaleString() || '0'}
                        </TableCell>
                        <TableCell className="font-mono text-orange-400">
                          ${broker.totalWithdrawals?.toLocaleString() || '0'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(brokerStats as any[]).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center font-mono text-zinc-500 py-8">
                          NO BROKER DATA AVAILABLE
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="mt-6">
            <Card className="bg-zinc-900/50 border-2 border-cyan-500/30 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-mono text-cyan-400">ALL CLIENTS</CardTitle>
                  <Button variant="outline" size="sm" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-mono">
                    <Download className="w-4 h-4 mr-2" />
                    EXPORT CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-cyan-500/30">
                      <TableHead className="text-cyan-400 font-mono">EMAIL</TableHead>
                      <TableHead className="text-cyan-400 font-mono">NAME</TableHead>
                      <TableHead className="text-cyan-400 font-mono">ACCOUNTS</TableHead>
                      <TableHead className="text-cyan-400 font-mono">BALANCE</TableHead>
                      <TableHead className="text-cyan-400 font-mono">P&L</TableHead>
                      <TableHead className="text-cyan-400 font-mono">DEPOSITS</TableHead>
                      <TableHead className="text-cyan-400 font-mono">WITHDRAWALS</TableHead>
                      <TableHead className="text-cyan-400 font-mono">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(allClients as any[]).map((client: any) => (
                      <TableRow key={client.id} className="border-cyan-500/30 hover:bg-cyan-500/5">
                        <TableCell className="font-mono text-white">{client.email}</TableCell>
                        <TableCell className="font-mono text-white">{client.firstName} {client.lastName}</TableCell>
                        <TableCell className="font-mono text-white">{client.accountCount || 0}</TableCell>
                        <TableCell className="font-mono text-white">${client.totalBalance?.toLocaleString() || '0'}</TableCell>
                        <TableCell className={`font-mono ${(client.totalPnL || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${client.totalPnL?.toLocaleString() || '0'}
                        </TableCell>
                        <TableCell className="font-mono text-cyan-400">
                          ${client.totalDeposits?.toLocaleString() || '0'}
                        </TableCell>
                        <TableCell className="font-mono text-orange-400">
                          ${client.totalWithdrawals?.toLocaleString() || '0'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClient(client)}
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                            data-testid={`button-edit-client-${client.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-6">
            <Card className="bg-zinc-900/50 border-2 border-cyan-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-mono text-cyan-400">WITHDRAWAL REQUESTS</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-cyan-500/30">
                      <TableHead className="text-cyan-400 font-mono">DATE</TableHead>
                      <TableHead className="text-cyan-400 font-mono">CLIENT</TableHead>
                      <TableHead className="text-cyan-400 font-mono">AMOUNT</TableHead>
                      <TableHead className="text-cyan-400 font-mono">CURRENCY</TableHead>
                      <TableHead className="text-cyan-400 font-mono">STATUS</TableHead>
                      <TableHead className="text-cyan-400 font-mono">ACTIONS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(withdrawalRequests as any[]).map((request: any) => (
                      <TableRow key={request.id} className="border-cyan-500/30 hover:bg-cyan-500/5">
                        <TableCell className="font-mono text-white">{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-mono text-white">{request.userEmail}</TableCell>
                        <TableCell className="font-mono text-white">${request.amount}</TableCell>
                        <TableCell className="font-mono text-white">{request.currency}</TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-400 bg-yellow-500/10 font-mono">
                              <Clock className="w-3 h-3 mr-1" />PENDING
                            </Badge>
                          )}
                          {request.status === 'approved' && (
                            <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10 font-mono">
                              <CheckCircle className="w-3 h-3 mr-1" />APPROVED
                            </Badge>
                          )}
                          {request.status === 'rejected' && (
                            <Badge variant="outline" className="border-red-500 text-red-400 bg-red-500/10 font-mono">
                              <XCircle className="w-3 h-3 mr-1" />REJECTED
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-green-500 text-green-400 hover:bg-green-500/10 font-mono"
                                onClick={() => updateWithdrawalMutation.mutate({ 
                                  id: request.id, 
                                  status: 'approved' 
                                })}
                                data-testid={`approve-withdrawal-${request.id}`}
                              >
                                APPROVE
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-500 text-red-400 hover:bg-red-500/10 font-mono"
                                onClick={() => updateWithdrawalMutation.mutate({ 
                                  id: request.id, 
                                  status: 'rejected' 
                                })}
                                data-testid={`reject-withdrawal-${request.id}`}
                              >
                                REJECT
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
                <Card className="bg-zinc-900/50 border-2 border-cyan-500/30 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="text-zinc-500 font-mono">NO BROKER REQUESTS FOUND</div>
                  </CardContent>
                </Card>
              ) : (
                (brokerRequests as BrokerRequest[]).map((request: BrokerRequest) => (
                  <Card key={request.id} className="bg-zinc-900/50 border-2 border-cyan-500/30 hover:border-cyan-500 transition-all backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 font-mono text-cyan-400">
                          <span>BROKER REQUEST - {request.brokerName}</span>
                          {getStatusBadge(request.status)}
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateRequest(request)}
                          className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-mono"
                          data-testid={`edit-request-${request.id}`}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          UPDATE
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="font-mono text-cyan-400">USER ID</Label>
                          <div className="text-sm text-white font-mono" data-testid={`user-id-${request.id}`}>
                            {request.userId}
                          </div>
                        </div>
                        <div>
                          <Label className="font-mono text-cyan-400">SUBMITTED</Label>
                          <div className="text-sm text-white font-mono">
                            {new Date(request.createdAt!).toLocaleDateString()} at{' '}
                            {new Date(request.createdAt!).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="font-mono text-cyan-400">BROKER NAME</Label>
                        <div className="text-sm text-white font-mono" data-testid={`broker-name-${request.id}`}>
                          {request.brokerName}
                        </div>
                      </div>

                      {request.adminNotes && (
                        <div>
                          <Label className="font-mono text-cyan-400">ADMIN NOTES</Label>
                          <div className="text-sm whitespace-pre-wrap p-3 bg-black/50 border border-cyan-500/30 rounded-md text-white font-mono" data-testid={`admin-notes-${request.id}`}>
                            {request.adminNotes}
                          </div>
                        </div>
                      )}

                      {request.updatedAt && request.updatedAt !== request.createdAt && (
                        <div>
                          <Label className="font-mono text-cyan-400">LAST UPDATED</Label>
                          <div className="text-sm text-white font-mono">
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
          <DialogContent className="bg-zinc-900 border-2 border-cyan-500/30" data-testid="update-request-dialog">
            <DialogHeader>
              <DialogTitle className="font-mono text-cyan-400">UPDATE BROKER REQUEST</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status" className="font-mono text-cyan-400">STATUS</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="bg-black border-cyan-500/30 text-white font-mono" data-testid="status-select">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-cyan-500/30">
                      <SelectItem value="pending" className="font-mono">Pending</SelectItem>
                      <SelectItem value="approved" className="font-mono">Approved</SelectItem>
                      <SelectItem value="rejected" className="font-mono">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="adminNotes" className="font-mono text-cyan-400">ADMIN NOTES</Label>
                  <Textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes for this request..."
                    className="bg-black border-cyan-500/30 text-white font-mono"
                    rows={4}
                    data-testid="admin-notes-input"
                  />
                </div>
                
                <div className="flex gap-3 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setUpdateDialogOpen(false)}
                    className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-mono"
                    data-testid="cancel-update"
                  >
                    CANCEL
                  </Button>
                  <Button 
                    onClick={handleSubmitUpdate}
                    disabled={updateRequestMutation.isPending}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-mono font-bold"
                    data-testid="submit-update"
                  >
                    {updateRequestMutation.isPending ? 'UPDATING...' : 'UPDATE REQUEST'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={editClientDialogOpen} onOpenChange={setEditClientDialogOpen}>
          <DialogContent className="bg-zinc-900 border-2 border-cyan-500/30" data-testid="edit-client-dialog">
            <DialogHeader>
              <DialogTitle className="font-mono text-cyan-400">EDIT CLIENT INFORMATION</DialogTitle>
            </DialogHeader>
            {selectedClient && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName" className="font-mono text-cyan-400">FIRST NAME</Label>
                  <Input
                    id="firstName"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    placeholder="First name"
                    className="bg-black border-cyan-500/30 text-white font-mono"
                    data-testid="input-edit-firstname"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName" className="font-mono text-cyan-400">LAST NAME</Label>
                  <Input
                    id="lastName"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    placeholder="Last name"
                    className="bg-black border-cyan-500/30 text-white font-mono"
                    data-testid="input-edit-lastname"
                  />
                </div>

                <div>
                  <Label htmlFor="country" className="font-mono text-cyan-400">COUNTRY</Label>
                  <Input
                    id="country"
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    placeholder="Country"
                    className="bg-black border-cyan-500/30 text-white font-mono"
                    data-testid="input-edit-country"
                  />
                </div>
                
                <div className="flex gap-3 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setEditClientDialogOpen(false)}
                    className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-mono"
                    data-testid="button-cancel-edit-client"
                  >
                    CANCEL
                  </Button>
                  <Button 
                    onClick={handleSubmitClientUpdate}
                    disabled={updateClientMutation.isPending || !editFirstName || !editLastName || !editCountry}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-mono font-bold"
                    data-testid="button-submit-edit-client"
                  >
                    {updateClientMutation.isPending ? 'UPDATING...' : 'UPDATE CLIENT'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <style>{`
        @keyframes grid-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
      `}</style>
    </div>
  );
}
