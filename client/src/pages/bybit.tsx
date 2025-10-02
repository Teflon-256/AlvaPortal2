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
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
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
                <span className="text-xl font-serif font-bold gradient-text" data-testid="nav-logo">AlvaCapital</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <ThemeToggle />
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
                variant="outline" 
                onClick={handleLogout}
                data-testid="logout-button"
              >
                Logout
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
          <Card>
            <CardHeader>
              <CardTitle>Connect Bybit Account</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Connect your Bybit account to start copy trading and track your performance.
              </p>
              <BybitConnectionForm />
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="dashboard" className="flex items-center gap-2" data-testid="tab-dashboard">
                <Wallet className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2" data-testid="tab-settings">
                <SettingsIcon className="w-4 h-4" />
                Copy Trading Settings
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2" data-testid="tab-performance">
                <Activity className="w-4 h-4" />
                Performance
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
    </div>
  );
}
