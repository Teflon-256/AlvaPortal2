import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Key, DollarSign, AlertTriangle } from "lucide-react";

const bybitConnectionSchema = z.object({
  accountId: z.string().min(1, "Account ID is required"),
  apiKey: z.string().min(1, "API Key is required"),
  apiSecret: z.string().min(1, "API Secret is required"),
  tradingCapital: z.string().optional(),
  maxRiskPercentage: z.string().optional(),
});

type BybitConnectionForm = z.infer<typeof bybitConnectionSchema>;

interface BybitConnectionFormProps {
  accountId: string;
  onSuccess: () => void;
}

export function BybitConnectionForm({ accountId, onSuccess }: BybitConnectionFormProps) {
  const { toast } = useToast();
  const [showApiSecret, setShowApiSecret] = useState(false);

  const form = useForm<BybitConnectionForm>({
    resolver: zodResolver(bybitConnectionSchema),
    defaultValues: {
      accountId,
      apiKey: "",
      apiSecret: "",
      tradingCapital: "",
      maxRiskPercentage: "2.00",
    },
  });

  const connectMutation = useMutation({
    mutationFn: async (data: BybitConnectionForm) => {
      return await apiRequest("/api/bybit/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bybit account connected successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      form.reset();
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect Bybit account",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BybitConnectionForm) => {
    connectMutation.mutate(data);
  };

  return (
    <Card className="border-blue-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-500" />
          Connect Bybit API
        </CardTitle>
        <CardDescription>
          Enter your Bybit API credentials to enable real-time data sync and copy trading
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
          <div className="text-sm text-yellow-600 dark:text-yellow-400">
            <p className="font-semibold">Security Notice:</p>
            <p>Your API keys are encrypted and stored securely. Make sure to enable IP whitelist and set appropriate permissions (Read-only for data, Trade for copy trading).</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your Bybit API Key"
                      data-testid="input-bybit-api-key"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Secret</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showApiSecret ? "text" : "password"}
                        placeholder="Enter your Bybit API Secret"
                        data-testid="input-bybit-api-secret"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2"
                        onClick={() => setShowApiSecret(!showApiSecret)}
                        data-testid="button-toggle-secret"
                      >
                        {showApiSecret ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tradingCapital"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trading Capital (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="Amount you want to allocate for trading"
                        className="pl-9"
                        data-testid="input-trading-capital"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Specify the amount you want to use for copy trading
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
                  <FormLabel>Max Risk Percentage</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="2.00"
                        data-testid="input-max-risk"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Maximum total exposure across all trades
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={connectMutation.isPending}
              data-testid="button-connect-bybit"
            >
              {connectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Bybit Account"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
