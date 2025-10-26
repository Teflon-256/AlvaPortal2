import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BybitBalanceDisplay } from "@/components/BybitBalanceDisplay";

interface BybitDashboardProps {
  accountId: string;
}

interface BybitPosition {
  symbol: string;
  side: string;
  size: string;
  entryPrice: string;
  markPrice: string;
  leverage: string;
  unrealizedPnl: string;
  positionValue: string;
}

export function BybitDashboard({ accountId }: BybitDashboardProps) {
  const { data: positionsData, isLoading: positionsLoading } = useQuery<{ positions: BybitPosition[] }>({
    queryKey: ["/api/bybit/positions", accountId],
    refetchInterval: 30000,
  });

  const positions = positionsData?.positions || [];

  return (
    <div className="space-y-6">
      {/* Balances - Using dedicated component with auto-refresh */}
      <BybitBalanceDisplay accountId={accountId} />

      {/* Open Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
        </CardHeader>
        <CardContent>
          {positionsLoading ? (
            <Skeleton className="h-32" />
          ) : positions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Entry Price</TableHead>
                  <TableHead>Mark Price</TableHead>
                  <TableHead>Leverage</TableHead>
                  <TableHead className="text-right">Unrealized P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position, index) => {
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
              No open positions
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
