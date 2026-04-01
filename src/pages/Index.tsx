import { useEffect, useState } from "react";
import { TrendingUp, Shield, Activity, BarChart3, Layers, Lock } from "lucide-react";
import { apiGetAllMarkets, apiGetTrendingMarkets, getStats, type Market, type MarketStats } from "@/lib/api";
import { MarketCard } from "@/components/MarketCard";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

export default function Index() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [trending, setTrending] = useState<Market[]>([]);
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [allRes, trendRes] = await Promise.all([
        apiGetAllMarkets(),
        apiGetTrendingMarkets(),
      ]);
      if (allRes.success && allRes.data) setMarkets(allRes.data);
      if (trendRes.success && trendRes.data) setTrending(trendRes.data);
      setStats(getStats());
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-14 animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary/80 px-4 py-1.5 mb-5 text-xs font-medium text-accent border border-glass-border/30 border-glow">
          <Shield className="h-3.5 w-3.5" />
          Privacy Protected (ZK-ready system)
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 gradient-text tracking-tight leading-tight">
          Prediction Markets
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-base md:text-lg leading-relaxed">
          Stake your conviction privately. Only aggregated results are visible — your vote stays hidden.
        </p>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-12 animate-fade-in">
          <DashStat icon={<Layers className="h-4 w-4" />} label="Total Markets" value={stats.totalMarkets.toString()} />
          <DashStat icon={<BarChart3 className="h-4 w-4" />} label="Total Volume" value={stats.totalVolume.toLocaleString()} />
          <DashStat icon={<Activity className="h-4 w-4" />} label="Active Markets" value={stats.activeMarkets.toString()} />
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : markets.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Trending */}
          {trending.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <div className="relative">
                  <TrendingUp className="h-5 w-5 text-neon-pink" />
                  <div className="absolute inset-0 blur-md bg-neon-pink/30" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Trending Markets</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {trending.map((m) => (
                  <MarketCard key={m.id} market={m} trending />
                ))}
              </div>
            </section>
          )}

          {/* All Markets */}
          <section className="mb-14">
            <h2 className="text-xl font-bold mb-6 tracking-tight">All Markets</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {markets.map((m) => (
                <MarketCard key={m.id} market={m} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* How It Works */}
      <section className="mb-14 animate-fade-in">
        <h2 className="text-xl font-bold mb-6 text-center tracking-tight">How It Works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { step: "01", title: "Create a Market", desc: "Define a yes-or-no prediction question for the community." },
            { step: "02", title: "Vote with Stake", desc: "Place your YES or NO vote with a token stake amount." },
            { step: "03", title: "View Results", desc: "Only aggregated totals are shown — individual votes stay private." },
          ].map((s, i) => (
            <div key={s.step} className="glass-card rounded-2xl p-6 text-center" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-3xl font-bold gradient-text mb-3">{s.step}</div>
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy Layer */}
      <section className="mb-10 animate-fade-in">
        <div className="glass-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-5">
          <div className="shrink-0 relative">
            <div className="rounded-2xl bg-accent/10 p-4">
              <Lock className="h-8 w-8 text-accent" />
            </div>
            <div className="absolute inset-0 bg-accent/10 rounded-2xl blur-xl" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Privacy Layer</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Votes are stored as cryptographic hashes. No individual data is exposed.
              Only aggregated totals update the market — your conviction remains private.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function DashStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass-card rounded-2xl p-4 md:p-5 text-center">
      <div className="flex items-center justify-center gap-1.5 text-accent mb-1.5">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl md:text-2xl font-bold">{value}</p>
    </div>
  );
}
