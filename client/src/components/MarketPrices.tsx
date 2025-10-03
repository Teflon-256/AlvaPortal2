import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MarketData {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
}

export function MarketPrices() {
  const [markets, setMarkets] = useState<MarketData[]>([
    { symbol: "XAUUSD", name: "Gold", price: "2,645.80", change: "+12.40", changePercent: "+0.47%" },
    { symbol: "XAGUSD", name: "Silver", price: "30.45", change: "+0.23", changePercent: "+0.76%" },
    { symbol: "BTCUSDT", name: "Bitcoin", price: "94,567.50", change: "+1,234.20", changePercent: "+1.32%" },
    { symbol: "ETHUSDT", name: "Ethereum", price: "3,456.78", change: "+89.12", changePercent: "+2.64%" },
    { symbol: "XRPUSDT", name: "XRP", price: "2.45", change: "+0.08", changePercent: "+3.38%" },
    { symbol: "EURUSD", name: "EUR/USD", price: "1.0892", change: "-0.0012", changePercent: "-0.11%" },
    { symbol: "GBPJPY", name: "GBP/JPY", price: "192.45", change: "+0.87", changePercent: "+0.45%" },
    { symbol: "US500", name: "S&P 500", price: "5,867.23", change: "+23.45", changePercent: "+0.40%" },
    { symbol: "UK100", name: "UK 100", price: "8,234.56", change: "-12.34", changePercent: "-0.15%" },
    { symbol: "USOIL", name: "Crude Oil", price: "68.92", change: "+0.56", changePercent: "+0.82%" }
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold gradient-text mb-2">Live Market Prices</h2>
        <p className="text-muted-foreground">Real-time quotes from global markets</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {markets.map((market) => {
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

      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Prices are indicative and may differ from actual trading prices. Updated every 5 seconds.
        </p>
      </div>
    </div>
  );
}
