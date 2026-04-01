import { Link } from "react-router-dom";
import { TrendingUp, CheckCircle2 } from "lucide-react";
import { Market, getMarketPercentages } from "@/lib/api";
import { Sparkline } from "./Sparkline";
import { Badge } from "./ui/badge";

interface MarketCardProps {
  market: Market;
  trending?: boolean;
}

const categoryColors: Record<string, string> = {
  crypto: "text-primary",
  sports: "text-yes",
  politics: "text-accent",
  technology: "text-muted-foreground",
};

export function MarketCard({ market, trending }: MarketCardProps) {
  const { yes, no, total } = getMarketPercentages(market);
  const isResolved = market.status === "resolved";

  return (
    <Link to={`/market/${market.id}`}>
      <div className="glass-card p-5 cursor-pointer group animate-fade-in h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            {isResolved ? (
              <Badge variant="outline" className="text-[10px] h-5 border-yes/30 text-yes gap-1 rounded-lg">
                <CheckCircle2 className="h-3 w-3" />
                {market.resolvedOutcome}
              </Badge>
            ) : trending ? (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-accent" />
                <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">Trending</span>
              </div>
            ) : <div />}
          </div>
          <span className={`text-[10px] font-medium uppercase tracking-wider ${categoryColors[market.category] || "text-muted-foreground"}`}>
            {market.category}
          </span>
        </div>

        <h3 className="font-semibold text-sm text-foreground mb-3 leading-relaxed line-clamp-2 group-hover:text-primary transition-colors duration-200 flex-1">
          {market.question}
        </h3>

        {market.sparklineData && market.sparklineData.length > 1 && (
          <div className="mb-3 opacity-50 group-hover:opacity-100 transition-opacity">
            <Sparkline data={market.sparklineData} height={28} />
          </div>
        )}

        <div>
          <div className="relative h-1 rounded-full overflow-hidden bg-secondary mb-3">
            <div
              className="absolute inset-y-0 left-0 bg-yes rounded-full progress-animated"
              style={{ width: `${yes}%` }}
            />
          </div>

          <div className="flex justify-between text-xs mb-3">
            <span className="text-yes font-medium">Yes {yes}%</span>
            <span className="text-no font-medium">No {no}%</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border">
            <span className="font-mono">{total.toLocaleString()} pool</span>
            <span>{new Date(market.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
