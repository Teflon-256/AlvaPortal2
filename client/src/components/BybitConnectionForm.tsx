import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Key, BookOpen, ChevronLeft, ChevronRight, X, AlertCircle, Info, Copy, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const bybitConnectionSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  apiSecret: z.string().min(1, "API Secret is required"),
});

type BybitConnectionForm = z.infer<typeof bybitConnectionSchema>;

interface BybitConnectionFormProps {
  onSuccess?: () => void;
}

export function BybitConnectionForm({ onSuccess }: BybitConnectionFormProps) {
  const { toast } = useToast();
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copiedIP, setCopiedIP] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const guideImages: string[] = [];
  
  const STATIC_IP = "13.61.122.170";
  const BYBIT_API_LINK = "https://www.bybit.com/app/user/api-management";

  const handleCopyIP = () => {
    navigator.clipboard.writeText(STATIC_IP);
    setCopiedIP(true);
    setTimeout(() => setCopiedIP(false), 2000);
    toast({
      title: "Copied!",
      description: "IP address copied to clipboard",
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(BYBIT_API_LINK);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast({
      title: "Copied!",
      description: "Bybit API link copied to clipboard",
    });
  };

  const form = useForm<BybitConnectionForm>({
    resolver: zodResolver(bybitConnectionSchema),
    defaultValues: {
      apiKey: "",
      apiSecret: "",
    },
  });

  const connectMutation = useMutation({
    mutationFn: async (data: BybitConnectionForm) => {
      const response = await apiRequest("POST", "/api/bybit/connect", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bybit account connected successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      form.reset();
      onSuccess?.();
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

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : guideImages.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < guideImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
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
          <Alert className="mb-6 bg-blue-500/10 border-blue-500/30">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-sm">
              <div className="space-y-3">
                <p className="font-semibold text-blue-600 dark:text-blue-400">📍 IP Whitelist Configuration</p>
                <div className="space-y-2 text-muted-foreground">
                  <p className="font-medium text-foreground">When creating or editing your Bybit API key:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li className="flex items-center gap-2">
                      <span>Go to Bybit API Management:</span>
                      <a href={BYBIT_API_LINK} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                        bybit.com/app/user/api-management
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={handleCopyLink}
                        data-testid="button-copy-api-link"
                      >
                        {copiedLink ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </li>
                    <li>IP with permissions granted to access the BybitAPI:</li>
                  </ol>
                  <div className="bg-muted/50 p-3 rounded-md border border-border mt-2 flex items-center justify-between">
                    <code className="text-sm font-mono text-blue-600 dark:text-blue-400">{STATIC_IP}</code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyIP}
                      data-testid="button-copy-ip"
                      className="h-8"
                    >
                      {copiedIP ? (
                        <>
                          <Check className="h-4 w-4 mr-1 text-green-500" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
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

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1"
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
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGuide(true)}
                  data-testid="button-guide"
                  className="px-3"
                >
                  <BookOpen className="w-4 h-4 mr-1" />
                  Guide
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bybit Connection Guide</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={() => setShowGuide(false)}
              data-testid="button-close-guide"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          {guideImages.length > 0 ? (
            <div className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={guideImages[currentImageIndex]}
                  alt={`Guide step ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain"
                  data-testid={`guide-image-${currentImageIndex}`}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousImage}
                  disabled={guideImages.length <= 1}
                  data-testid="button-previous-image"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                
                <span className="text-sm text-muted-foreground" data-testid="text-image-counter">
                  {currentImageIndex + 1} / {guideImages.length}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextImage}
                  disabled={guideImages.length <= 1}
                  data-testid="button-next-image"
                >
                  Forward
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <p>No guide images available yet.</p>
              <p className="text-sm mt-2">Images will be added soon.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
