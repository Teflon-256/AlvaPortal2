import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Activity, DollarSign, TrendingUp } from "lucide-react";

export function CopierManagement() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/copiers"],
    refetchInterval: 30000,
  });

  // Mock data for development - replace with real API when available
  const copiers = [
    {
      id: "1",
      email: "user1@example.com",
      tradingCapital: "5000.00",
      maxRisk: "2.00",
      copyStatus: "active",
      currentBalance: "5250.00",
      totalPnL: "250.00",
      connectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      email: "user2@example.com",
      tradingCapital: "10000.00",
      maxRisk: "1.50",
      copyStatus: "active",
      currentBalance: "10450.00",
      totalPnL: "450.00",
      connectedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const stats = {
    totalCopiers: copiers.length,
    activeCopiers: copiers.filter(c => c.copyStatus === 'active').length,
    totalCapital: copiers.reduce((sum, c) => sum + parseFloat(c.tradingCapital), 0).toFixed(2),
    totalPnL: copiers.reduce((sum, c) => sum + parseFloat(c.totalPnL), 0).toFixed(2),
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
          ) : copiers.length > 0 ? (
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
                {copiers.map((copier, index) => {
                  const pnl = parseFloat(copier.totalPnL);
                  return (
                    <TableRow key={copier.id} data-testid={`row-copier-${index}`}>
                      <TableCell className="font-medium">{copier.email}</TableCell>
                      <TableCell>${parseFloat(copier.tradingCapital).toLocaleString()}</TableCell>
                      <TableCell>{copier.maxRisk}%</TableCell>
                      <TableCell>${parseFloat(copier.currentBalance).toLocaleString()}</TableCell>
                      <TableCell className={pnl >= 0 ? "text-green-500" : "text-red-500"}>
                        {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={copier.copyStatus === 'active' ? 'default' : 'secondary'}
                          data-testid={`badge-status-${index}`}
                        >
                          {copier.copyStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(copier.connectedAt).toLocaleDateString()}
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
