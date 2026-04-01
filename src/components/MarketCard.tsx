import { Link } from "react-router-dom";
import { TrendingUp, Users } from "lucide-react";
import { Market, getMarketPercentages } from "@/lib/market-store";

interface MarketCardProps {
  market: Market;
  trending?: boolean;
}

export function MarketCard({ market, trending }: MarketCardProps) {
  const { yes, no, total } = getMarketPercentages(market);

  return (
    <Link to={`/market/${market.id}`}>
      <div className="glass rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] glass-hover cursor-pointer group animate-slide-up">
        {trending && (
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp className="h-3.5 w-3.5 text-neon-pink" />
            <span className="text-xs font-medium text-neon-pink">Trending</span>
          </div>
        )}

        <h3 className="font-semibold text-foreground mb-4 leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {market.question}
        </h3>

        {/* Progress bar */}
        <div className="relative h-2.5 rounded-full overflow-hidden bg-secondary mb-3">
          <div
            className="absolute inset-y-0 left-0 gradient-yes rounded-full transition-all duration-500"
            style={{ width: `${yes}%` }}
          />
        </div>

        <div className="flex justify-between text-sm mb-3">
          <span className="text-yes font-medium">Yes {yes}%</span>
          <span className="text-no font-medium">No {no}%</span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-glass-border/30">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>Pool: {total.toLocaleString()} tokens</span>
          </div>
          <span>{new Date(market.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}
