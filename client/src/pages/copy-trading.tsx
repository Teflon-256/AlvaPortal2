import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Activity, CheckCircle2, XCircle, Clock, Settings, History, ListTodo, Loader2, AlertCircle, Wifi, WifiOff, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { LogOut, User, ChevronDown } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const apiKeySchema = z.object({
  tradingAccountId: z.string().min(1, "Please select a trading account"),
  apiKey: z.string().min(1, "API key is required"),
  apiSecret: z.string().min(1, "API secret is required"),
  slippageTolerance: z.number().min(0).max(10).default(1),
  maxPositionSize: z.number().min(0).default(10000),
  copyRatio: z.number().min(0).max(1).default(1),
});

type ApiKeyFormData = z.infer<typeof apiKeySchema>;

const settingsSchema = z.object({
  slippageTolerance: z.number().min(0).max(10),
  maxPositionSize: z.number().min(0),
  copyRatio: z.number().min(0).max(1),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function CopyTrading() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [validating, setValidating] = useState(false);

  // Fetch trading accounts
  const { data: accounts = [] } = useQuery({
    queryKey: ['/api/trading-accounts'],
  });

  // Fetch sync status
  const { data: syncStatus, refetch: refetchSyncStatus } = useQuery({
    queryKey: ['/api/copy-trading/sync-status', selectedAccount],
    enabled: !!selectedAccount,
  });

  // Fetch copier settings
  const { data: currentSettings, refetch: refetchSettings } = useQuery({
    queryKey: ['/api/copy-trading/settings', selectedAccount],
    enabled: !!selectedAccount,
  });

  // Fetch mirror history
  const { data: mirrorHistory = [] } = useQuery({
    queryKey: ['/api/copy-trading/mirror-history', selectedAccount],
    enabled: !!selectedAccount,
  });

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/copy-trading/tasks', selectedAccount],
    enabled: !!selectedAccount,
  });

  // API Key Form
  const apiKeyForm = useForm<ApiKeyFormData>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      tradingAccountId: "",
      apiKey: "",
      apiSecret: "",
      slippageTolerance: 1,
      maxPositionSize: 10000,
      copyRatio: 1,
    },
  });

  // Settings Form
  const settingsForm = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    values: currentSettings ? {
      slippageTolerance: currentSettings.slippageTolerance || 1,
      maxPositionSize: currentSettings.maxPositionSize || 10000,
      copyRatio: currentSettings.copyRatio || 1,
    } : {
      slippageTolerance: 1,
      maxPositionSize: 10000,
      copyRatio: 1,
    },
  });

  // Validate API Key
  const validateApiKey = async (apiKey: string, apiSecret: string) => {
    setValidating(true);
    try {
      const result: any = await apiRequest('/api/copy-trading/validate-key', {
        method: 'POST',
        body: JSON.stringify({ apiKey, apiSecret }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (result.valid) {
        toast({
          title: "API Key Valid",
          description: `Account: ${result.accountInfo?.uid || 'N/A'}`,
        });
        return true;
      } else {
        toast({
          title: "Invalid API Key",
          description: result.error || "Please check your credentials",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Validation Failed",
        description: error.message || "Failed to validate API key",
        variant: "destructive",
      });
      return false;
    } finally {
      setValidating(false);
    }
  };

  // Register Copier Mutation
  const registerMutation = useMutation({
    mutationFn: async (data: ApiKeyFormData) => {
      return apiRequest('/api/copy-trading/register-copier', {
        method: 'POST',
        body: JSON.stringify({
          tradingAccountId: data.tradingAccountId,
          apiKey: data.apiKey,
          apiSecret: data.apiSecret,
          settings: {
            slippageTolerance: data.slippageTolerance,
            maxPositionSize: data.maxPositionSize,
            copyRatio: data.copyRatio,
          },
        }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "You are now registered as a copier",
      });
      apiKeyForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/copy-trading/sync-status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/copy-trading/settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register as copier",
        variant: "destructive",
      });
    },
  });

  // Update Settings Mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      return apiRequest(`/api/copy-trading/settings/${selectedAccount}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your copy trading settings have been updated",
      });
      refetchSettings();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const onSubmitApiKey = async (data: ApiKeyFormData) => {
    // Validate first
    const isValid = await validateApiKey(data.apiKey, data.apiSecret);
    if (isValid) {
      registerMutation.mutate(data);
    }
  };

  const onSubmitSettings = (data: SettingsFormData) => {
    updateSettingsMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-cyan-500/20 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              AlvaCapital
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href="/" className="text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                Dashboard
              </Link>
              <Link href="/copy-trading" className="text-sm text-cyan-400">
                Copy Trading
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2" data-testid="button-user-menu">
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">{user?.email}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/security">
                    <User className="w-4 h-4 mr-2" />
                    Profile & Security
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} data-testid="button-logout">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Copy Trading
          </h1>
          <p className="text-muted-foreground">
            Mirror trades from master accounts automatically with advanced risk management
          </p>
        </div>

        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="setup" data-testid="tab-setup">
              <Settings className="w-4 h-4 mr-2" />
              Setup
            </TabsTrigger>
            <TabsTrigger value="status" data-testid="tab-status">
              <Activity className="w-4 h-4 mr-2" />
              Status
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="tasks" data-testid="tab-tasks">
              <ListTodo className="w-4 h-4 mr-2" />
              Tasks
            </TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle>Register as Copier</CardTitle>
                <CardDescription>
                  Submit your Bybit API keys to start copying trades from the master account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...apiKeyForm}>
                  <form onSubmit={apiKeyForm.handleSubmit(onSubmitApiKey)} className="space-y-6">
                    <FormField
                      control={apiKeyForm.control}
                      name="tradingAccountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trading Account</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-account">
                                <SelectValue placeholder="Select a trading account" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {accounts.map((account: any) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.accountName} - {account.broker}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={apiKeyForm.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bybit API Key</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Enter your Bybit API key"
                              data-testid="input-api-key"
                            />
                          </FormControl>
                          <FormDescription>
                            Your API key will be encrypted before storage
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={apiKeyForm.control}
                      name="apiSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bybit API Secret</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Enter your Bybit API secret"
                              data-testid="input-api-secret"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={apiKeyForm.control}
                        name="slippageTolerance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slippage Tolerance (%)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                step="0.1"
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                data-testid="input-slippage"
                              />
                            </FormControl>
                            <FormDescription>Max 10%</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={apiKeyForm.control}
                        name="maxPositionSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Position Size (USDT)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                data-testid="input-max-position"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={apiKeyForm.control}
                        name="copyRatio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Copy Ratio</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                step="0.1"
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                data-testid="input-copy-ratio"
                              />
                            </FormControl>
                            <FormDescription>0.0 to 1.0</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const apiKey = apiKeyForm.getValues("apiKey");
                          const apiSecret = apiKeyForm.getValues("apiSecret");
                          if (apiKey && apiSecret) {
                            validateApiKey(apiKey, apiSecret);
                          } else {
                            toast({
                              title: "Missing Credentials",
                              description: "Please enter both API key and secret",
                              variant: "destructive",
                            });
                          }
                        }}
                        disabled={validating}
                        data-testid="button-validate"
                      >
                        {validating ? (
                          <div className="flex items-center gap-2">
                            <LoadingSpinner size="sm" />
                            <span>Validating...</span>
                          </div>
                        ) : (
                          "Validate API Key"
                        )}
                      </Button>

                      <Button
                        type="submit"
                        disabled={registerMutation.isPending}
                        data-testid="button-register"
                      >
                        {registerMutation.isPending ? (
                          <div className="flex items-center gap-2">
                            <LoadingSpinner size="sm" />
                            <span>Registering...</span>
                          </div>
                        ) : (
                          "Register as Copier"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Status Tab */}
          <TabsContent value="status">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Select Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select onValueChange={setSelectedAccount} value={selectedAccount}>
                    <SelectTrigger data-testid="select-status-account">
                      <SelectValue placeholder="Select a trading account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account: any) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.accountName} - {account.broker}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {selectedAccount && syncStatus && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Sync Status
                      {syncStatus.websocketConnected ? (
                        <Badge variant="default" className="bg-green-500">
                          <Wifi className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <WifiOff className="w-3 h-3 mr-1" />
                          Disconnected
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Sync Method</p>
                        <p className="font-semibold capitalize" data-testid="text-sync-method">
                          {syncStatus.syncMethod || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-semibold capitalize" data-testid="text-sync-status">
                          {syncStatus.syncStatus || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Sync</p>
                        <p className="font-semibold" data-testid="text-last-sync">
                          {syncStatus.lastSyncAt ? format(new Date(syncStatus.lastSyncAt), 'PPpp') : 'Never'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Error</p>
                        <p className="font-semibold text-red-500" data-testid="text-last-error">
                          {syncStatus.lastError || 'None'}
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => refetchSyncStatus()} variant="outline" size="sm" data-testid="button-refresh-status">
                      Refresh Status
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Select Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select onValueChange={setSelectedAccount} value={selectedAccount}>
                    <SelectTrigger data-testid="select-settings-account">
                      <SelectValue placeholder="Select a trading account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account: any) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.accountName} - {account.broker}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {selectedAccount && currentSettings && (
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Management Settings</CardTitle>
                    <CardDescription>
                      Adjust your copy trading parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...settingsForm}>
                      <form onSubmit={settingsForm.handleSubmit(onSubmitSettings)} className="space-y-6">
                        <FormField
                          control={settingsForm.control}
                          name="slippageTolerance"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slippage Tolerance: {field.value}%</FormLabel>
                              <FormControl>
                                <Slider
                                  min={0}
                                  max={10}
                                  step={0.1}
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  data-testid="slider-slippage"
                                />
                              </FormControl>
                              <FormDescription>
                                Maximum allowed price difference when copying trades
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={settingsForm.control}
                          name="maxPositionSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Position Size (USDT)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  data-testid="input-settings-max-position"
                                />
                              </FormControl>
                              <FormDescription>
                                Maximum size for any single position
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={settingsForm.control}
                          name="copyRatio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Copy Ratio: {(field.value * 100).toFixed(0)}%</FormLabel>
                              <FormControl>
                                <Slider
                                  min={0}
                                  max={1}
                                  step={0.05}
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  data-testid="slider-copy-ratio"
                                />
                              </FormControl>
                              <FormDescription>
                                Percentage of master position size to copy
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          disabled={updateSettingsMutation.isPending}
                          data-testid="button-update-settings"
                        >
                          {updateSettingsMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Update Settings"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Select Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select onValueChange={setSelectedAccount} value={selectedAccount}>
                    <SelectTrigger data-testid="select-history-account">
                      <SelectValue placeholder="Select a trading account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account: any) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.accountName} - {account.broker}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {selectedAccount && (
                <Card>
                  <CardHeader>
                    <CardTitle>Trade Mirroring History</CardTitle>
                    <CardDescription>
                      View all trades that were copied to your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {mirrorHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No trade history yet
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Time</TableHead>
                              <TableHead>Symbol</TableHead>
                              <TableHead>Side</TableHead>
                              <TableHead>Size</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mirrorHistory.map((trade: any) => (
                              <TableRow key={trade.id} data-testid={`row-trade-${trade.id}`}>
                                <TableCell>
                                  {format(new Date(trade.createdAt), 'MMM dd, HH:mm:ss')}
                                </TableCell>
                                <TableCell className="font-mono">{trade.symbol}</TableCell>
                                <TableCell>
                                  <Badge variant={trade.side === 'Buy' ? 'default' : 'destructive'}>
                                    {trade.side}
                                  </Badge>
                                </TableCell>
                                <TableCell>{trade.copierQty}</TableCell>
                                <TableCell>${trade.copierPrice}</TableCell>
                                <TableCell>
                                  {trade.mirrorStatus === 'success' ? (
                                    <Badge variant="default" className="bg-green-500">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Success
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive">
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Failed
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Select Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select onValueChange={setSelectedAccount} value={selectedAccount}>
                    <SelectTrigger data-testid="select-tasks-account">
                      <SelectValue placeholder="Select a trading account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account: any) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.accountName} - {account.broker}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {selectedAccount && (
                <Card>
                  <CardHeader>
                    <CardTitle>Task Queue</CardTitle>
                    <CardDescription>
                      Monitor pending and completed copy trading tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tasks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No tasks in queue
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Time</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Symbol</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Priority</TableHead>
                              <TableHead>Retries</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tasks.map((task: any) => (
                              <TableRow key={task.id} data-testid={`row-task-${task.id}`}>
                                <TableCell>
                                  {format(new Date(task.createdAt), 'MMM dd, HH:mm:ss')}
                                </TableCell>
                                <TableCell className="capitalize">{task.taskType}</TableCell>
                                <TableCell className="font-mono">
                                  {JSON.parse(task.taskData).symbol}
                                </TableCell>
                                <TableCell>
                                  {task.status === 'completed' ? (
                                    <Badge variant="default" className="bg-green-500">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Completed
                                    </Badge>
                                  ) : task.status === 'failed' ? (
                                    <Badge variant="destructive">
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Failed
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Pending
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>{task.priority}</TableCell>
                                <TableCell>{task.retryCount}/{task.maxRetries}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
