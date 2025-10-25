import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, DollarSign, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BybitBalanceDisplay } from "@/components/BybitBalanceDisplay";

interface BybitDashboardProps {
  accountId: string;
}

export function BybitDashboard({ accountId }: BybitDashboardProps) {
  const { t } = useTranslation();

  const { data: balances, isLoading: balancesLoading } = useQuery({
    queryKey: ["/api/bybit/balance", accountId],
    refetchInterval: 30000, // Polling every 30 seconds
  });

  const { data: positions, isLoading: positionsLoading } = useQuery({
    queryKey: ["/api/bybit/positions", accountId],
    refetchInterval: 30000,
  });

  const { data: performance, isLoading: performanceLoading } = useQuery({
    queryKey: ["/api/bybit/performance", accountId],
    refetchInterval: 30000,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/bybit/transactions", accountId],
    refetchInterval: 60000, // Polling every 60 seconds
  });

  if (balancesLoading || performanceLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const totalBalance = performance?.totalBalance || "0.00";
  const totalEquity = performance?.totalEquity || "0.00";
  const unrealizedPnl = parseFloat(performance?.totalUnrealizedPnl || "0");
  const roi = parseFloat(performance?.roi || "0");

  return (
    <div className="space-y-6">
      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("Total Balance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <p className="text-2xl font-bold" data-testid="text-total-balance">
                ${totalBalance}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("Total Equity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <p className="text-2xl font-bold" data-testid="text-total-equity">
                ${totalEquity}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("Unrealized P&L")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {unrealizedPnl >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <p
                className={`text-2xl font-bold ${
                  unrealizedPnl >= 0 ? "text-green-500" : "text-red-500"
                }`}
                data-testid="text-unrealized-pnl"
              >
                ${unrealizedPnl >= 0 ? "+" : ""}
                {unrealizedPnl.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("ROI")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {roi >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <p
                className={`text-2xl font-bold ${
                  roi >= 0 ? "text-green-500" : "text-red-500"
                }`}
                data-testid="text-roi"
              >
                {roi >= 0 ? "+" : ""}
                {roi}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balances */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Wallet Balances")}</CardTitle>
        </CardHeader>
        <CardContent>
          {balancesLoading ? (
            <Skeleton className="h-32" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Coin")}</TableHead>
                  <TableHead>{t("Wallet Balance")}</TableHead>
                  <TableHead>{t("Available")}</TableHead>
                  <TableHead className="text-right">{t("USD Value")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balances?.balances?.map((balance: any, index: number) => (
                  <TableRow key={index} data-testid={`row-balance-${index}`}>
                    <TableCell className="font-medium">{balance.coin}</TableCell>
                    <TableCell>{parseFloat(balance.walletBalance).toFixed(8)}</TableCell>
                    <TableCell>
                      {balance.availableBalance && balance.availableBalance !== "" 
                        ? parseFloat(balance.availableBalance).toFixed(8)
                        : parseFloat(balance.walletBalance).toFixed(8)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${parseFloat(balance.usdValue).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Open Positions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Open Positions")}</CardTitle>
        </CardHeader>
        <CardContent>
          {positionsLoading ? (
            <Skeleton className="h-32" />
          ) : positions?.positions?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Symbol")}</TableHead>
                  <TableHead>{t("Side")}</TableHead>
                  <TableHead>{t("Size")}</TableHead>
                  <TableHead>{t("Entry Price")}</TableHead>
                  <TableHead>{t("Mark Price")}</TableHead>
                  <TableHead>{t("Leverage")}</TableHead>
                  <TableHead className="text-right">{t("Unrealized P&L")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.positions.map((position: any, index: number) => {
                  const pnl = parseFloat(position.unrealizedPnl);
                  return (
                    <TableRow key={index} data-testid={`row-position-${index}`}>
                      <TableCell className="font-medium">{position.symbol}</TableCell>
                      <TableCell>
                        <Badge
                          variant={position.side === "Buy" ? "default" : "destructive"}
                          data-testid={`badge-side-${index}`}
                        >
                          {position.side}
                        </Badge>
                      </TableCell>
                      <TableCell>{position.size}</TableCell>
                      <TableCell>${parseFloat(position.entryPrice).toFixed(2)}</TableCell>
                      <TableCell>${parseFloat(position.markPrice).toFixed(2)}</TableCell>
                      <TableCell>{position.leverage}x</TableCell>
                      <TableCell
                        className={`text-right ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}
                        data-testid={`text-pnl-${index}`}
                      >
                        ${pnl >= 0 ? "+" : ""}
                        {pnl.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8" data-testid="text-no-positions">
              {t("No open positions")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Recent Transactions")}</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <Skeleton className="h-32" />
          ) : transactions?.transactions?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Coin")}</TableHead>
                  <TableHead>{t("Type")}</TableHead>
                  <TableHead className="text-right">{t("Amount")}</TableHead>
                  <TableHead className="text-right">{t("Time")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.transactions.slice(0, 10).map((tx: any, index: number) => (
                  <TableRow key={tx.id} data-testid={`row-transaction-${index}`}>
                    <TableCell className="font-medium">{tx.coin}</TableCell>
                    <TableCell>{tx.type}</TableCell>
                    <TableCell className="text-right">{parseFloat(tx.amount).toFixed(8)}</TableCell>
                    <TableCell className="text-right">
                      {new Date(tx.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8" data-testid="text-no-transactions">
              {t("No transactions found")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
