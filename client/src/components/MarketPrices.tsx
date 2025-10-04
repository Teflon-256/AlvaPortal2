import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface MarketData {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
}

export function MarketPrices() {
  const { data: markets, isLoading } = useQuery<MarketData[]>({
    queryKey: ['/api/market-prices'],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 4 * 60 * 1000, // Consider data stale after 4 minutes
  });

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold gradient-text mb-2">Live Market Prices</h2>
        <p className="text-muted-foreground">Real-time quotes from global markets</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} className="premium-card animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {markets?.map((market) => {
            const isPositive = !market.change.startsWith("-");
            return (
              <Card
                key={market.symbol}
                className="premium-card hover:shadow-lg transition-shadow cursor-pointer"
                data-testid={`market-${market.symbol.toLowerCase()}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">{market.name}</div>
                      <div className="text-xs text-muted-foreground">{market.symbol}</div>
                    </div>
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="text-lg font-bold mb-1">{market.price}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={isPositive ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                      {market.change}
                    </span>
                    <span className={isPositive ? "text-green-500" : "text-red-500"}>
                      {market.changePercent}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Prices are indicative and may differ from actual trading prices. Updated every 5 minutes.
        </p>
      </div>
    </div>
  );
}
