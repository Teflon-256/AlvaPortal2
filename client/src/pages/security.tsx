import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, ShieldCheck, Copy, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
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

  // Fetch user data
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  // Setup 2FA mutation
  const setupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/2fa/setup');
      return response;
    },
    onSuccess: (data) => {
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setSetupDialogOpen(true);
    },
    onError: () => {
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
              {user?.twoFactorEnabled ? (
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
            {user?.twoFactorEnabled ? (
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
                Scan the QR code with your authenticator app
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* QR Code */}
              <div className="flex justify-center p-4 bg-white rounded-lg">
                {qrCode && <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" data-testid="img-2fa-qr" />}
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
      </div>
    </div>
  );
}
