import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useEffect } from "react";
import { useLocation } from "wouter";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import Bybit from "@/pages/bybit";
import FAQ from "@/pages/faq";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import ProfileSetup from "@/pages/profile-setup";
import Security from "@/pages/security";
import CopyTrading from "@/pages/copy-trading";
import Verify2FA from "@/pages/verify-2fa";
import "@/i18n";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Check if 2FA verification is required and redirect
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const userData = user as any;
      
      // If user requires 2FA verification and not already on verify page
      if (userData.requires2FA && location !== '/verify-2fa') {
        setLocation('/verify-2fa');
      }
      
      // 2FA is now optional - users can enable it from Security settings if they want
    }
  }, [user, isAuthenticated, isLoading, location, setLocation]);

  return (
    <Switch>
      {/* Public routes accessible regardless of authentication */}
      <Route path="/faq" component={FAQ} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/verify-2fa" component={Verify2FA} />
      <Route path="/admin" component={Admin} />
      
      {/* Authentication-based routes */}
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          {/* Profile setup route for users without country */}
          <Route path="/profile-setup" component={ProfileSetup} />
          
          {/* Security page - accessible for 2FA setup */}
          <Route path="/security" component={Security} />
          
          {/* Main app routes */}
          <Route path="/" component={Home} />
          <Route path="/bybit" component={Bybit} />
          <Route path="/copy-trading" component={CopyTrading} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
