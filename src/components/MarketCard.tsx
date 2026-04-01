import { Link } from "react-router-dom";
import { TrendingUp, Users } from "lucide-react";
import { Market, getMarketPercentages } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface MarketCardProps {
  market: Market;
  trending?: boolean;
}

const categoryColors: Record<string, string> = {
  crypto: "bg-neon-blue/15 text-neon-blue border-neon-blue/30",
  sports: "bg-neon-green/15 text-neon-green border-neon-green/30",
  politics: "bg-neon-pink/15 text-neon-pink border-neon-pink/30",
  technology: "bg-neon-purple/15 text-neon-purple border-neon-purple/30",
};

export function MarketCard({ market, trending }: MarketCardProps) {
  const { yes, no, total } = getMarketPercentages(market);

  return (
    <Link to={`/market/${market.id}`}>
      <div className="glass-card rounded-2xl p-5 cursor-pointer group animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          {trending ? (
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <TrendingUp className="h-3.5 w-3.5 text-neon-pink" />
                <div className="absolute inset-0 blur-md bg-neon-pink/30" />
              </div>
              <span className="text-xs font-semibold text-neon-pink tracking-wide uppercase">Trending</span>
            </div>
          ) : <div />}
          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-full border ${categoryColors[market.category] || ""}`}>
            {market.category}
          </Badge>
        </div>

        <h3 className="font-semibold text-foreground mb-4 leading-snug line-clamp-2 group-hover:text-accent transition-colors duration-300">
          {market.question}
        </h3>

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
