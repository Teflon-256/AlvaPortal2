import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Activity, DollarSign, TrendingUp } from "lucide-react";

export function CopierManagement() {
  const { data: copiers, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/copiers"],
    refetchInterval: 30000,
  });

  // Calculate stats from real backend data
  const realCopiers = copiers || [];
  const stats = {
    totalCopiers: realCopiers.length,
    activeCopiers: realCopiers.filter((c: any) => c.copyStatus === 'active').length,
    totalCapital: realCopiers.reduce((sum: number, c: any) => sum + parseFloat(c.tradingCapital || '0'), 0).toFixed(2),
    totalPnL: realCopiers.reduce((sum: number, c: any) => sum + parseFloat(c.totalPnL || '0'), 0).toFixed(2),
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Copiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <p className="text-2xl font-bold" data-testid="text-total-copiers">
                {stats.totalCopiers}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Copiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              <p className="text-2xl font-bold text-green-500" data-testid="text-active-copiers">
                {stats.activeCopiers}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Capital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <p className="text-2xl font-bold" data-testid="text-total-capital">
                ${stats.totalCapital}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <p className="text-2xl font-bold text-green-500" data-testid="text-total-pnl">
                +${stats.totalPnL}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Copiers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Copier Accounts</CardTitle>
          <CardDescription>
            Manage all users who are copy trading from the master account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : realCopiers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Email</TableHead>
                  <TableHead>Trading Capital</TableHead>
                  <TableHead>Max Risk %</TableHead>
                  <TableHead>Current Balance</TableHead>
                  <TableHead>Total P&L</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Connected Since</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {realCopiers.map((copier: any, index: number) => {
                  const pnl = parseFloat(copier.totalPnL || '0');
                  return (
                    <TableRow key={copier.id} data-testid={`row-copier-${index}`}>
                      <TableCell className="font-medium">{copier.email || 'N/A'}</TableCell>
                      <TableCell>${parseFloat(copier.tradingCapital || '0').toLocaleString()}</TableCell>
                      <TableCell>{copier.maxRisk || '0'}%</TableCell>
                      <TableCell>${parseFloat(copier.currentBalance || '0').toLocaleString()}</TableCell>
                      <TableCell className={pnl >= 0 ? "text-green-500" : "text-red-500"}>
                        {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={copier.copyStatus === 'active' ? 'default' : 'secondary'}
                          data-testid={`badge-status-${index}`}
                        >
                          {copier.copyStatus || 'inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {copier.connectedAt ? new Date(copier.connectedAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8" data-testid="text-no-copiers">
              No copier accounts connected yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
