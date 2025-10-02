import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Settings, Activity, History } from "lucide-react";

const settingsSchema = z.object({
  tradingCapital: z.string().min(1, "Trading capital is required"),
  maxRiskPercentage: z.string().min(1, "Max risk percentage is required"),
  copyStatus: z.enum(['active', 'inactive', 'paused']),
});

type SettingsForm = z.infer<typeof settingsSchema>;

interface CopyTradingSettingsProps {
  accountId: string;
  currentStatus?: string;
  currentCapital?: string;
  currentMaxRisk?: string;
}

export function CopyTradingSettings({
  accountId,
  currentStatus = 'inactive',
  currentCapital = '',
  currentMaxRisk = '2.00'
}: CopyTradingSettingsProps) {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(currentStatus === 'active');

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      tradingCapital: currentCapital,
      maxRiskPercentage: currentMaxRisk,
      copyStatus: currentStatus as any,
    },
  });

  const { data: actionLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/action-logs"],
    refetchInterval: 30000,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SettingsForm) => {
      return await apiRequest(`/api/trading-accounts/${accountId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Copy trading settings updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const toggleCopyTrading = async (enabled: boolean) => {
    setIsEnabled(enabled);
    const newStatus = enabled ? 'active' : 'inactive';
    form.setValue('copyStatus', newStatus);
    
    await updateSettingsMutation.mutateAsync({
      ...form.getValues(),
      copyStatus: newStatus,
    });
  };

  const onSubmit = (data: SettingsForm) => {
    updateSettingsMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Copy Trading Settings
          </CardTitle>
          <CardDescription>
            Configure your copy trading parameters and risk management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <div className="font-medium">Copy Trading Status</div>
                <div className="text-sm text-muted-foreground">
                  {isEnabled ? "Currently copying master trades" : "Copy trading is disabled"}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={isEnabled ? "default" : "secondary"} data-testid="badge-copy-status">
                  {isEnabled ? "Active" : "Inactive"}
                </Badge>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={toggleCopyTrading}
                  data-testid="switch-copy-trading"
                />
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="tradingCapital"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trading Capital (USDT)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="Enter amount to use for copy trading"
                          data-testid="input-trading-capital-settings"
                        />
                      </FormControl>
                      <FormDescription>
                        Amount allocated for copying master trades
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxRiskPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Risk Percentage</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            placeholder="2.00"
                            data-testid="input-max-risk-settings"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Maximum total exposure across all trades (based on your capital)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={updateSettingsMutation.isPending}
                  data-testid="button-save-settings"
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Settings"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>

      {/* Action Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Action Log
          </CardTitle>
          <CardDescription>
            Track all actions performed in the portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : actionLogs && actionLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actionLogs.slice(0, 20).map((log: any, index: number) => (
                  <TableRow key={log.id} data-testid={`row-action-${index}`}>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell>{log.description}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8" data-testid="text-no-actions">
              No actions recorded yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Profit Transfers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Profit Sharing History
          </CardTitle>
          <CardDescription>
            View all profit splits and transfers (50/50 share)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfitTransfersTable />
        </CardContent>
      </Card>
    </div>
  );
}

function ProfitTransfersTable() {
  const { data: transfers, isLoading } = useQuery({
    queryKey: ["/api/profit-transfers"],
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!transfers || transfers.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8" data-testid="text-no-transfers">
        No profit transfers yet
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Total Profit</TableHead>
          <TableHead>Your Share (50%)</TableHead>
          <TableHead>Platform Share (50%)</TableHead>
          <TableHead>Transfer Amount</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transfers.map((transfer: any, index: number) => (
          <TableRow key={transfer.id} data-testid={`row-transfer-${index}`}>
            <TableCell className="font-medium">
              ${parseFloat(transfer.totalProfit).toFixed(2)}
            </TableCell>
            <TableCell className="text-green-500">
              ${parseFloat(transfer.userShare).toFixed(2)}
            </TableCell>
            <TableCell>
              ${parseFloat(transfer.platformShare).toFixed(2)}
            </TableCell>
            <TableCell>
              ${parseFloat(transfer.transferAmount).toFixed(2)} USDT
            </TableCell>
            <TableCell>
              <Badge variant="outline">{transfer.transferType}</Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  transfer.transferStatus === 'completed'
                    ? 'default'
                    : transfer.transferStatus === 'failed'
                    ? 'destructive'
                    : 'secondary'
                }
                data-testid={`badge-status-${index}`}
              >
                {transfer.transferStatus}
              </Badge>
            </TableCell>
            <TableCell className="text-right text-sm">
              {new Date(transfer.createdAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
