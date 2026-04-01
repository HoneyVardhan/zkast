import { useEffect, useState } from "react";
import { TrendingUp, Shield } from "lucide-react";
import { getAllMarkets, getTrendingMarkets, seedDemoData, Market } from "@/lib/market-store";
import { MarketCard } from "@/components/MarketCard";
import { EmptyState } from "@/components/EmptyState";

export default function Index() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [trending, setTrending] = useState<Market[]>([]);

  useEffect(() => {
    seedDemoData();
    setMarkets(getAllMarkets());
    setTrending(getTrendingMarkets());
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-12 animate-slide-up">
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 mb-4 text-xs font-medium text-accent">
          <Shield className="h-3.5 w-3.5" />
          Privacy Protected (ZK-ready system)
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3 gradient-text">
          Prediction Markets
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Stake your conviction privately. Only aggregated results are visible — your vote stays hidden.
        </p>
      </div>

      {markets.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Trending */}
          {trending.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="h-5 w-5 text-neon-pink" />
                <h2 className="text-lg font-semibold">Trending Markets</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {trending.map((m) => (
                  <MarketCard key={m.id} market={m} trending />
                ))}
              </div>
            </section>
          )}

          {/* All Markets */}
          <section>
            <h2 className="text-lg font-semibold mb-5">All Markets</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {markets.map((m) => (
                <MarketCard key={m.id} market={m} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
