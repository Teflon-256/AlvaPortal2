import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Wallet, Settings as SettingsIcon, Activity } from "lucide-react";
import { BybitConnectionForm } from "@/components/BybitConnectionForm";
import { BybitDashboard } from "@/components/BybitDashboard";
import { CopyTradingSettings } from "@/components/CopyTradingSettings";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import alvaCapitalLogo from "@assets/image_1759129583507.png";
import { performLogout } from "@/lib/logout";

export default function BybitPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Check if user has Bybit account connected
  const { data: dashboardData } = useQuery<any>({
    queryKey: ["/api/dashboard"],
  });

  const bybitAccount = dashboardData?.tradingAccounts?.find(
    (account: any) => account.broker === 'bybit'
  );

  const handleLogout = () => {
    performLogout();
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(hsl(217,100%,70%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(217,100%,70%) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }} />
      </div>
      
      {/* Navigation */}
      <nav className="bg-black/80 backdrop-blur-md border-b border-cyan-500/30 sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <img 
                  src={alvaCapitalLogo} 
                  alt="AlvaCapital Logo" 
                  className="w-10 h-10 object-contain"
                  data-testid="logo-image"
                />
                <span className="text-2xl font-mono font-bold text-cyan-400" data-testid="nav-logo">ALVA CAPITAL</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user?.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                    data-testid="user-avatar"
                  />
                )}
                <span className="text-sm font-medium" data-testid="user-name">
                  {user?.firstName || user?.email}
                </span>
              </div>
              <Button 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-mono font-bold"
                onClick={handleLogout}
                data-testid="logout-button"
              >
                LOGOUT
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">BY</span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold" data-testid="page-title">Bybit Trading</h1>
              <p className="text-muted-foreground">Manage your Bybit account and copy trading settings</p>
            </div>
          </div>
        </div>

        {!bybitAccount ? (
          <Card className="bg-zinc-900/50 border-2 border-cyan-500/30 backdrop-blur-sm relative z-10">
            <CardHeader>
              <CardTitle className="font-mono text-cyan-400">CONNECT BYBIT ACCOUNT</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-400 mb-6 font-mono">
                Connect your Bybit account to start copy trading and track your performance.
              </p>
              <BybitConnectionForm />
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="dashboard" className="w-full relative z-10">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-zinc-900/50 border-2 border-cyan-500/30 p-1">
              <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-black font-mono" data-testid="tab-dashboard">
                <Wallet className="w-4 h-4" />
                DASHBOARD
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-black font-mono" data-testid="tab-settings">
                <SettingsIcon className="w-4 h-4" />
                SETTINGS
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-black font-mono" data-testid="tab-performance">
                <Activity className="w-4 h-4" />
                PERFORMANCE
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <BybitDashboard accountId={bybitAccount.id} />
            </TabsContent>

            <TabsContent value="settings">
              <CopyTradingSettings
                accountId={bybitAccount.id}
                currentStatus={bybitAccount.copyStatus}
                currentCapital={bybitAccount.balance}
                currentMaxRisk="2.00"
              />
            </TabsContent>

            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Detailed performance analytics coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      <style>{`
        @keyframes grid-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
      `}</style>
    </div>
  );
}
