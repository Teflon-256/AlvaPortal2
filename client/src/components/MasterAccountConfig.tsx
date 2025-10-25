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
import { Loader2, Key, User, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const masterAccountSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  apiSecret: z.string().min(1, "API Secret is required"),
  transferUserId: z.string().optional(),
});

type MasterAccountForm = z.infer<typeof masterAccountSchema>;

export function MasterAccountConfig() {
  const { toast } = useToast();
  const [showApiSecret, setShowApiSecret] = useState(false);

  const { data: masterAccountStatus } = useQuery({
    queryKey: ["/api/admin/master-account"],
  });

  const isConnected = masterAccountStatus?.configured || false;

  const form = useForm<MasterAccountForm>({
    resolver: zodResolver(masterAccountSchema),
    defaultValues: {
      apiKey: "",
      apiSecret: "",
      transferUserId: masterAccountStatus?.transferUserId || "",
    },
  });

  const saveMasterAccountMutation = useMutation({
    mutationFn: async (data: MasterAccountForm) => {
      const response = await apiRequest("POST", "/api/admin/master-account", {
        apiKey: data.apiKey,
        apiSecret: data.apiSecret,
        transferUserId: data.transferUserId || "",
      });

      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Success!",
        description: data.message || "Master account configured successfully! All copiers will now receive trades from this account.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/master-account"] });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Configuration Failed",
        description: error.message || "Failed to save master account configuration",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MasterAccountForm) => {
    saveMasterAccountMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-500" />
                Master Trading Account
              </CardTitle>
              <CardDescription>
                Configure the master Bybit account that copiers will follow
              </CardDescription>
            </div>
            {isConnected && (
              <Badge variant="default" className="flex items-center gap-1" data-testid="badge-master-connected">
                <CheckCircle className="w-3 h-3" />
                Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Master Account API Key</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter master Bybit API Key"
                        data-testid="input-master-api-key"
                      />
                    </FormControl>
                    <FormDescription>
                      API key for the master trading account
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiSecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Master Account API Secret</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showApiSecret ? "text" : "password"}
                          placeholder="Enter master Bybit API Secret"
                          data-testid="input-master-api-secret"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2"
                          onClick={() => setShowApiSecret(!showApiSecret)}
                          data-testid="button-toggle-master-secret"
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
                name="transferUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profit Transfer User ID (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder="Enter Bybit User ID for profit transfers (optional)"
                          className="pl-9"
                          data-testid="input-transfer-user-id"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Optional: Your Bybit User ID where 50% profit share will be automatically transferred (in USDT)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  <p className="font-semibold">Important:</p>
                  <p>The master account will be used for copy trading. All connected copier accounts will mirror trades from this account.</p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={saveMasterAccountMutation.isPending}
                data-testid="button-save-master-config"
              >
                {saveMasterAccountMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Configuration...
                  </>
                ) : (
                  "Save Master Account Configuration"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
