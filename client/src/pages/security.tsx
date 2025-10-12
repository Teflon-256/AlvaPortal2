import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, ShieldCheck, Copy, CheckCircle2, ArrowLeft, Eye, EyeOff, Smartphone, RefreshCw, Clock } from "lucide-react";
import { Link } from "wouter";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SecurityPage() {
  const { toast } = useToast();
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [copied, setCopied] = useState(false);
  
  // 2FA Testing state
  const [currentCode, setCurrentCode] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [testCode, setTestCode] = useState("");
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; message: string } | null>(null);

  // Fetch user data
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  const userData = user as any;

  // Setup 2FA mutation
  const setupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/2fa/setup') as any;
      console.log('2FA setup response:', response);
      return response;
    },
    onSuccess: (data: any) => {
      console.log('2FA setup success - QR code length:', data.qrCode?.length, 'Secret:', data.secret);
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setSetupDialogOpen(true);
    },
    onError: (error) => {
      console.error('2FA setup error:', error);
      toast({
        title: "Error",
        description: "Failed to setup 2FA. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Verify 2FA mutation
  const verifyMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest('POST', '/api/2fa/verify', { secret, token });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setSetupDialogOpen(false);
      setVerificationCode("");
      setSecret("");
      setQrCode("");
      toast({
        title: "Success",
        description: "Two-factor authentication has been enabled successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Invalid Code",
        description: "The verification code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Disable 2FA mutation
  const disableMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest('POST', '/api/2fa/disable', { token });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setDisableDialogOpen(false);
      setDisableCode("");
      toast({
        title: "Success",
        description: "Two-factor authentication has been disabled.",
      });
    },
    onError: () => {
      toast({
        title: "Invalid Code",
        description: "The verification code you entered is incorrect.",
        variant: "destructive",
      });
    },
  });

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied",
      description: "Secret key copied to clipboard",
    });
  };

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      verifyMutation.mutate(verificationCode);
    }
  };

  const handleDisable = () => {
    if (disableCode.length === 6) {
      disableMutation.mutate(disableCode);
    }
  };

  // Fetch current 2FA code mutation
  const fetchCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/generate-2fa') as any;
      return response;
    },
    onSuccess: (data: any) => {
      setCurrentCode(data.code);
      setTimeRemaining(data.timeRemaining);
    },
    onError: (error: any) => {
      console.error('Failed to fetch 2FA code:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch code. Please ensure 2FA is enabled.",
        variant: "destructive",
      });
    },
  });

  // Verify test code mutation
  const verifyTestMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest('POST', '/api/verify-2fa', { code }) as any;
      return response;
    },
    onSuccess: (data: any) => {
      setVerifyResult(data);
      toast({
        title: data.valid ? "Success!" : "Invalid Code",
        description: data.message,
        variant: data.valid ? "default" : "destructive",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to verify code",
        variant: "destructive",
      });
    },
  });

  // Auto-refresh code when time expires and when 2FA is enabled
  useEffect(() => {
    if (userData?.twoFactorEnabled && timeRemaining <= 0) {
      fetchCodeMutation.mutate();
    }
  }, [timeRemaining, userData?.twoFactorEnabled]);

  // Countdown timer
  useEffect(() => {
    if (currentCode && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentCode, timeRemaining]);

  const handleTestVerify = () => {
    if (testCode.length === 6) {
      verifyTestMutation.mutate(testCode);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-cyan-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-cyan-400 hover:text-cyan-300" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Security Settings</h1>
          <p className="text-gray-400">Manage your account security and authentication</p>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              {userData?.twoFactorEnabled ? (
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              ) : (
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              )}
              Two-Factor Authentication (2FA)
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userData?.twoFactorEnabled ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 sm:p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-400">2FA is enabled</p>
                    <p className="text-xs text-gray-400">Your account is protected with two-factor authentication</p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setDisableDialogOpen(true)}
                  data-testid="button-disable-2fa"
                  className="w-full sm:w-auto"
                >
                  Disable 2FA
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  Two-factor authentication adds an extra layer of security by requiring a code from your authenticator app in addition to your password.
                </p>
                <Button
                  onClick={() => setupMutation.mutate()}
                  disabled={setupMutation.isPending}
                  data-testid="button-enable-2fa"
                  className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600"
                >
                  {setupMutation.isPending ? "Setting up..." : "Enable 2FA"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Setup 2FA Dialog */}
        <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
              <DialogDescription className="text-gray-400">
                Open your authenticator app to scan the QR code below
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Supported Apps */}
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <p className="text-sm text-gray-300 mb-2 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  Supported Authenticator Apps:
                </p>
                <ul className="text-xs text-gray-400 space-y-1 ml-6 list-disc">
                  <li>Google Authenticator (Android, iOS)</li>
                  <li>Microsoft Authenticator (Android, iOS)</li>
                  <li>Authy (Android, iOS, Desktop)</li>
                  <li>1Password (Cross-platform)</li>
                  <li>Any TOTP-compatible app</li>
                </ul>
              </div>

              {/* QR Code */}
              <div className="flex justify-center p-4 bg-white rounded-lg">
                {qrCode ? (
                  <img 
                    src={qrCode} 
                    alt="2FA QR Code" 
                    className="w-48 h-48" 
                    data-testid="img-2fa-qr"
                    onError={(e) => {
                      console.error('QR code failed to load:', e);
                      toast({
                        title: "QR Code Error",
                        description: "Failed to load QR code. Please use the manual entry key below.",
                        variant: "destructive"
                      });
                    }}
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-gray-400">
                    Loading QR code...
                  </div>
                )}
              </div>

              {/* Manual Entry */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-400">Or enter this code manually:</Label>
                <div className="flex gap-2">
                  <Input
                    value={secret}
                    readOnly
                    className="bg-zinc-800 border-zinc-700 font-mono text-sm"
                    data-testid="input-2fa-secret"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopySecret}
                    className="flex-shrink-0"
                    data-testid="button-copy-secret"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Verification */}
              <div className="space-y-2">
                <Label htmlFor="verification-code">Enter verification code from your app:</Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="bg-zinc-800 border-zinc-700 text-center text-2xl tracking-wider"
                  maxLength={6}
                  data-testid="input-verification-code"
                />
              </div>

              <div className="flex gap-2 flex-col sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSetupDialogOpen(false);
                    setVerificationCode("");
                  }}
                  className="w-full sm:flex-1"
                  data-testid="button-cancel-setup"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={verificationCode.length !== 6 || verifyMutation.isPending}
                  className="w-full sm:flex-1 bg-cyan-500 hover:bg-cyan-600"
                  data-testid="button-verify-2fa"
                >
                  {verifyMutation.isPending ? "Verifying..." : "Verify & Enable"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Disable 2FA Dialog */}
        <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter your authenticator code to confirm
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-3 sm:p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-400">
                  Warning: Disabling 2FA will make your account less secure.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="disable-code">Enter verification code:</Label>
                <Input
                  id="disable-code"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="bg-zinc-800 border-zinc-700 text-center text-2xl tracking-wider"
                  maxLength={6}
                  data-testid="input-disable-code"
                />
              </div>

              <div className="flex gap-2 flex-col sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDisableDialogOpen(false);
                    setDisableCode("");
                  }}
                  className="w-full sm:flex-1"
                  data-testid="button-cancel-disable"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisable}
                  disabled={disableCode.length !== 6 || disableMutation.isPending}
                  className="w-full sm:flex-1"
                  data-testid="button-confirm-disable"
                >
                  {disableMutation.isPending ? "Disabling..." : "Disable 2FA"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Privacy Preferences Card */}
        <Card className="bg-zinc-900 border-zinc-800 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              Privacy Settings
            </CardTitle>
            <CardDescription>
              Control how your account information is displayed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {userData?.balancesHidden ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-cyan-400" />
                  )}
                  <Label htmlFor="hide-balances" className="font-medium cursor-pointer">
                    Hide Balances
                  </Label>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Replace all balance amounts with ****
                </p>
              </div>
              <Switch
                id="hide-balances"
                checked={userData?.balancesHidden || false}
                onCheckedChange={async (checked) => {
                  try {
                    await apiRequest('PATCH', '/api/preferences', { balancesHidden: checked });
                    queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
                    toast({
                      title: "Preferences Updated",
                      description: checked ? "Balances are now hidden" : "Balances are now visible",
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to update preference",
                      variant: "destructive",
                    });
                  }
                }}
                data-testid="switch-hide-balances"
              />
            </div>
          </CardContent>
        </Card>

        {/* 2FA Testing Component - Only show when 2FA is enabled */}
        {userData?.twoFactorEnabled && (
          <Card className="bg-zinc-900 border-zinc-800 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                2FA Code Generator & Tester
              </CardTitle>
              <CardDescription>
                Test your two-factor authentication setup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current TOTP Code Display */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-400">Current TOTP Code:</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchCodeMutation.mutate()}
                    disabled={fetchCodeMutation.isPending}
                    data-testid="button-refresh-code"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${fetchCodeMutation.isPending ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl font-mono font-bold text-cyan-400 tracking-wider mb-2" data-testid="text-current-code">
                      {currentCode || "------"}
                    </div>
                    {currentCode && (
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span data-testid="text-time-remaining">Expires in {timeRemaining}s</span>
                      </div>
                    )}
                  </div>
                </div>

                {!currentCode && (
                  <Button
                    onClick={() => fetchCodeMutation.mutate()}
                    disabled={fetchCodeMutation.isPending}
                    className="w-full bg-cyan-500 hover:bg-cyan-600"
                    data-testid="button-generate-code"
                  >
                    {fetchCodeMutation.isPending ? "Generating..." : "Generate Code"}
                  </Button>
                )}
              </div>

              {/* Code Verification Tester */}
              <div className="space-y-3 pt-6 border-t border-zinc-800">
                <Label className="text-sm text-gray-400">Test Code Verification:</Label>
                <div className="flex gap-2">
                  <Input
                    value={testCode}
                    onChange={(e) => {
                      setTestCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setVerifyResult(null);
                    }}
                    placeholder="Enter 6-digit code"
                    className="bg-zinc-800 border-zinc-700 text-center text-xl tracking-wider"
                    maxLength={6}
                    data-testid="input-test-code"
                  />
                  <Button
                    onClick={handleTestVerify}
                    disabled={testCode.length !== 6 || verifyTestMutation.isPending}
                    className="bg-cyan-500 hover:bg-cyan-600 whitespace-nowrap"
                    data-testid="button-verify-test-code"
                  >
                    {verifyTestMutation.isPending ? "Verifying..." : "Verify"}
                  </Button>
                </div>

                {verifyResult && (
                  <div className={`p-3 rounded-lg border ${
                    verifyResult.valid 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-red-500/10 border-red-500/20'
                  }`}>
                    <p className={`text-sm flex items-center gap-2 ${
                      verifyResult.valid ? 'text-green-400' : 'text-red-400'
                    }`} data-testid="text-verify-result">
                      {verifyResult.valid ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                      {verifyResult.message}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-400">
                  <strong>Note:</strong> This feature is for testing purposes. In production, codes should be generated 
                  by your authenticator app (Google Authenticator, Authy, etc.) and verified through the login process.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
