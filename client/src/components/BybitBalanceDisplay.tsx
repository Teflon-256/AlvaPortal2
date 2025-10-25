import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface BybitBalance {
  coin: string;
  walletBalance: string;
  availableBalance: string;
  usdValue: string;
}

interface BybitBalanceDisplayProps {
  accountId: string;
  className?: string;
}

export function BybitBalanceDisplay({ accountId, className }: BybitBalanceDisplayProps) {
  const { data, isLoading, error, refetch } = useQuery<{ balances: BybitBalance[] }>({
    queryKey: ['/api/bybit/balance', accountId],
    refetchInterval: 30000, // Refetch every 30 seconds for live data
  });

  if (isLoading) {
    return (
      <Card className={cn("border-blue-500/20", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-500" />
            Account Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-red-500/20", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-red-500" />
            Account Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-red-500/10 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription>
              Unable to fetch balances. This is normal - balances are fetched from your browser (not our servers) 
              to avoid IP restrictions. Please ensure your API keys have proper permissions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const balances = data?.balances || [];
  const totalUsdValue = balances.reduce((sum, b) => sum + parseFloat(b.usdValue || '0'), 0);

  // Filter out balances with zero wallet balance
  const nonZeroBalances = balances.filter(b => parseFloat(b.walletBalance) > 0);

  return (
    <Card className={cn("border-blue-500/20", className)} data-testid="card-bybit-balances">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-500" />
          Account Balances
        </CardTitle>
        <CardDescription>
          Real-time wallet balances from your Bybit account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {nonZeroBalances.length === 0 ? (
          <Alert className="bg-yellow-500/10 border-yellow-500/30">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription>
              No balances found. Your Bybit account appears to be empty or the API keys don't have proper permissions.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {/* Total Balance */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-500" />
                  <span className="text-sm text-muted-foreground">Total Balance (USD)</span>
                </div>
                <div className="text-2xl font-bold" data-testid="text-total-balance">
                  ${totalUsdValue.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Individual Coin Balances */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Assets</h4>
              <div className="space-y-2">
                {nonZeroBalances.map((balance) => (
                  <div
                    key={balance.coin}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    data-testid={`balance-${balance.coin.toLowerCase()}`}
                  >
                    <div className="space-y-1">
                      <div className="font-semibold">{balance.coin}</div>
                      <div className="text-xs text-muted-foreground">
                        Available: {parseFloat(balance.availableBalance).toFixed(8)}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-mono text-sm">
                        {parseFloat(balance.walletBalance).toFixed(8)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${parseFloat(balance.usdValue || '0').toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Notice */}
            <Alert className="bg-blue-500/10 border-blue-500/30">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-xs">
                Balances update every 30 seconds. Real-time data from Bybit Unified Trading Account.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
