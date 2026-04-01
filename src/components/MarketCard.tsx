import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { Market, getMarketPercentages } from "@/lib/api";

interface MarketCardProps {
  market: Market;
  trending?: boolean;
}

const categoryStyles: Record<string, string> = {
  crypto: "text-neon-blue",
  sports: "text-neon-green",
  politics: "text-neon-pink",
  technology: "text-neon-purple",
};

export function MarketCard({ market, trending }: MarketCardProps) {
  const { yes, no, total } = getMarketPercentages(market);

  return (
    <Link to={`/market/${market.id}`}>
      <div className="glass-card rounded-xl p-5 cursor-pointer group animate-fade-in h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          {trending ? (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-neon-pink" />
              <span className="text-[10px] font-semibold text-neon-pink uppercase tracking-wider">Trending</span>
            </div>
          ) : <div />}
          <span className={`text-[10px] font-medium uppercase tracking-wider ${categoryStyles[market.category] || "text-muted-foreground"}`}>
            {market.category}
          </span>
        </div>

        <h3 className="font-semibold text-sm text-foreground mb-4 leading-relaxed line-clamp-2 group-hover:text-primary transition-colors duration-200 flex-1">
          {market.question}
        </h3>

        <div>
          <div className="relative h-1.5 rounded-full overflow-hidden bg-secondary mb-3">
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
