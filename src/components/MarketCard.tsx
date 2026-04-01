import { Link } from "react-router-dom";
import { TrendingUp, Users } from "lucide-react";
import { Market, getMarketPercentages } from "@/lib/api";

interface MarketCardProps {
  market: Market;
  trending?: boolean;
}

export function MarketCard({ market, trending }: MarketCardProps) {
  const { yes, no, total } = getMarketPercentages(market);

  return (
    <Link to={`/market/${market.id}`}>
      <div className="glass-card rounded-2xl p-5 cursor-pointer group animate-fade-in">
        {trending && (
          <div className="flex items-center gap-1.5 mb-3">
            <div className="relative">
              <TrendingUp className="h-3.5 w-3.5 text-neon-pink" />
              <div className="absolute inset-0 blur-md bg-neon-pink/30" />
            </div>
            <span className="text-xs font-semibold text-neon-pink tracking-wide uppercase">Trending</span>
          </div>
        )}

        <h3 className="font-semibold text-foreground mb-4 leading-snug line-clamp-2 group-hover:text-accent transition-colors duration-300">
          {market.question}
        </h3>

        {/* Animated progress bar */}
        <div className="relative h-2.5 rounded-full overflow-hidden bg-secondary mb-3">
          <div
            className="absolute inset-y-0 left-0 gradient-yes rounded-full progress-animated"
            style={{ width: `${yes}%` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>

        <div className="flex justify-between text-sm mb-3">
          <span className="text-yes font-semibold">Yes {yes}%</span>
          <span className="text-no font-semibold">No {no}%</span>
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
