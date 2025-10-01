import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink } from "lucide-react";

// Form schema
const tradingAccountSchema = z.object({
  broker: z.enum(['exness', 'bybit', 'binance', 'other']),
  brokerName: z.string().optional(),
}).refine((data) => {
  if (data.broker === 'other') {
    return data.brokerName && data.brokerName.length > 0;
  }
  return true;
}, {
  message: "Broker name is required for other brokers",
  path: ["brokerName"],
});

type TradingAccountForm = z.infer<typeof tradingAccountSchema>;

interface TradingAccountFormProps {
  onSuccess: () => void;
}

// Copy trading links mapping
const copyTradingLinks = {
  exness: "https://social-trading.exness.com/strategy/227918123/a/trdqjrdq?sharer=trader",
  bybit: "https://finestel.com/app/copy-trading/U42AN0-S37396",
  binance: "https://finestel.com/app/copy-trading/SS98X3-S66396"
};

export function TradingAccountForm({ onSuccess }: TradingAccountFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedBroker, setSelectedBroker] = useState<string>("");

  const form = useForm<TradingAccountForm>({
    resolver: zodResolver(tradingAccountSchema),
    defaultValues: {
      broker: undefined,
      brokerName: "",
    },
  });

  // Submit broker request mutation
  const submitBrokerMutation = useMutation({
    mutationFn: async (data: { brokerName: string }) => {
      const response = await fetch("/api/broker-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit broker request");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('success'),
        description: "Broker request submitted successfully. Our team will review it.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      onSuccess();
    },
    onError: (error: any) => {
      console.error("Broker request error:", error);
      toast({
        title: t('error'),
        description: error.message || "Failed to submit broker request",
        variant: "destructive",
      });
    },
  });

  const handleBrokerSelect = (broker: string) => {
    setSelectedBroker(broker);
    form.setValue('broker', broker as any);
  };

  const handleCopyTradingConnect = (broker: string) => {
    const link = copyTradingLinks[broker as keyof typeof copyTradingLinks];
    if (link) {
      window.open(link, '_blank');
      onSuccess();
    }
  };

  const onSubmit = (data: TradingAccountForm) => {
    if (data.broker === 'other' && data.brokerName) {
      submitBrokerMutation.mutate({ brokerName: data.brokerName });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="broker"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('selectBroker')}</FormLabel>
              <Select 
                onValueChange={handleBrokerSelect} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger data-testid="broker-select">
                    <SelectValue placeholder={t('selectBroker')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="exness" data-testid="broker-exness">Exness</SelectItem>
                  <SelectItem value="bybit" data-testid="broker-bybit">Bybit</SelectItem>
                  <SelectItem value="binance" data-testid="broker-binance">Binance</SelectItem>
                  <SelectItem value="other" data-testid="broker-other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedBroker && selectedBroker !== 'other' && (
          <div className="space-y-4">
            <div className="p-4 bg-muted/20 rounded-lg border border-border">
              <h4 className="font-medium mb-2">Copy Trading Integration</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your {selectedBroker} account to our copy trading system for automated trading.
              </p>
              <Button
                type="button"
                onClick={() => handleCopyTradingConnect(selectedBroker)}
                className="w-full bg-primary hover:bg-primary/90"
                data-testid="connect-copy-trading"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('connectCopyTradingAccount')}
              </Button>
            </div>
          </div>
        )}

        {selectedBroker === 'other' && (
          <FormField
            control={form.control}
            name="brokerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('nameOfBroker')}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter broker name" 
                    {...field} 
                    data-testid="broker-name-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {selectedBroker === 'other' && (
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={submitBrokerMutation.isPending}
            data-testid="submit-broker-request"
          >
            {submitBrokerMutation.isPending ? t('loading') : t('submitBroker')}
          </Button>
        )}
      </form>
    </Form>
  );
}