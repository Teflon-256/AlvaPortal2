import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Key, BookOpen, ChevronLeft, ChevronRight, X, AlertCircle, Info, Copy, Check, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import guideImage1 from "@assets/1_1761212185690.webp";
import guideImage2 from "@assets/2_1761215729879.png";
import guideImage3 from "@assets/3_1761215755322.webp";
import guideImage4 from "@assets/4_1761216422229.png";
import guideImage5 from "@assets/5_1761216433452.png";
import guideImage6 from "@assets/6_1761216770009.png";
import guideImage7 from "@assets/7_1761217086906.png";

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

  const guideImages: string[] = [
    guideImage1,
    guideImage2,
    guideImage3,
    guideImage4,
    guideImage5,
    guideImage6,
    guideImage7,
  ];

  const form = useForm<BybitConnectionForm>({
    resolver: zodResolver(bybitConnectionSchema),
    defaultValues: {
      apiKey: "",
      apiSecret: "",
    },
  });

  const [isValidated, setIsValidated] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');

  const validateMutation = useMutation({
    mutationFn: async (data: BybitConnectionForm) => {
      const response = await apiRequest("POST", "/api/copy-trading/validate-key", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setIsValidated(true);
        setValidationStatus('success');
        toast({
          title: "✓ API Key Validated",
          description: "Your Bybit API credentials are valid!",
        });
      } else {
        setValidationStatus('error');
        toast({
          title: "Validation Failed",
          description: data.error || "Invalid API credentials",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      setValidationStatus('error');
      toast({
        title: "Validation Error",
        description: error.message || "Failed to validate API credentials",
        variant: "destructive",
      });
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
      setIsValidated(false);
      setValidationStatus('idle');
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

  const handleValidate = () => {
    const formData = form.getValues();
    if (!formData.apiKey || !formData.apiSecret) {
      toast({
        title: "Missing Fields",
        description: "Please enter both API Key and API Secret",
        variant: "destructive",
      });
      return;
    }
    setValidationStatus('validating');
    validateMutation.mutate(formData);
  };

  const onSubmit = (data: BybitConnectionForm) => {
    if (!isValidated) {
      toast({
        title: "Validation Required",
        description: "Please validate your API credentials first",
        variant: "destructive",
      });
      return;
    }
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
          <Alert className="mb-6 bg-red-500/10 border-red-500/30">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-sm">
              <div className="space-y-2">
                <p className="font-semibold text-red-600 dark:text-red-400">🔒 Important Security Notice</p>
                <p className="text-muted-foreground">
                  Keep them secure and <strong className="text-foreground">never share them with anyone</strong>.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground text-xs">
                  <li>Click <strong className="text-foreground">"Guide"</strong> button below for step-by-step instructions</li>
                  <li>Enable <strong className="text-foreground">"Read-Write"</strong> permissions and <strong className="text-foreground">"Unified Trading"</strong></li>
                  <li>Your keys are encrypted and stored securely on our platform</li>
                </ul>
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

              <div className="space-y-3 pt-2 pb-4">
                <Button
                  type="button"
                  variant={validationStatus === 'success' ? 'default' : 'outline'}
                  className={`w-full ${validationStatus === 'success' ? 'bg-green-600 hover:bg-green-700 border-green-500' : ''}`}
                  onClick={handleValidate}
                  disabled={validateMutation.isPending || validationStatus === 'success'}
                  data-testid="button-validate-api"
                >
                  {validateMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span>Validating...</span>
                    </div>
                  ) : validationStatus === 'success' ? (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>API Key Validated</span>
                    </div>
                  ) : (
                    "Validate API Key"
                  )}
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    disabled={connectMutation.isPending || !isValidated}
                    data-testid="button-connect-bybit"
                  >
                    {connectMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        <span>Connecting...</span>
                      </div>
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
