import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertCircle } from "lucide-react";

export default function Verify2FA() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [code, setCode] = useState("");

  const verifyMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest('POST', '/api/2fa/login-verify', { token });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Verification Successful",
        description: "You have been authenticated.",
      });
      // Redirect to dashboard after successful verification
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Invalid Code",
        description: "The verification code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
      setCode("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      verifyMutation.mutate(code);
    }
  };

  const handleLogout = async () => {
    await apiRequest('POST', '/api/logout');
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Card className="bg-zinc-900 border-zinc-800 w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16 text-cyan-400" />
          </div>
          <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="bg-zinc-800 border-zinc-700 text-center text-3xl tracking-widest"
                maxLength={6}
                autoFocus
                data-testid="input-2fa-code"
              />
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-blue-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Open your authenticator app (Google Authenticator, Authy, etc.) to get your code
              </p>
            </div>

            <Button
              type="submit"
              disabled={code.length !== 6 || verifyMutation.isPending}
              className="w-full bg-cyan-500 hover:bg-cyan-600"
              data-testid="button-verify-2fa"
            >
              {verifyMutation.isPending ? "Verifying..." : "Verify"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              className="w-full"
              data-testid="button-logout"
            >
              Cancel & Logout
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
