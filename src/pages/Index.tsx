import { useEffect, useState, useMemo } from "react";
import { TrendingUp, Shield, BarChart3, Layers, Lock, Search, Clock } from "lucide-react";
import { apiGetAllMarkets, apiGetTrendingMarkets, getStats, getUserActivity, type Market, type MarketStats, type MarketCategory } from "@/lib/api";
import { MarketCard } from "@/components/MarketCard";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getMarketById } from "@/lib/market-store";

const CATEGORIES: { value: MarketCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "crypto", label: "Crypto" },
  { value: "sports", label: "Sports" },
  { value: "politics", label: "Politics" },
  { value: "technology", label: "Tech" },
];

type SortMode = "latest" | "trending" | "active";

export default function Index() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [trending, setTrending] = useState<Market[]>([]);
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<MarketCategory | "all">("all");
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const [recentlyViewed, setRecentlyViewed] = useState<Market[]>([]);

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

      const activity = getUserActivity();
      const viewed = activity.recentlyViewed
        .map(id => getMarketById(id))
        .filter(Boolean) as Market[];
      setRecentlyViewed(viewed.slice(0, 4));

      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = [...markets];
    if (category !== "all") list = list.filter(m => m.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m => m.question.toLowerCase().includes(q));
    }
    switch (sortMode) {
      case "trending":
      case "active":
        list.sort((a, b) => (b.totalYes + b.totalNo) - (a.totalYes + a.totalNo));
        break;
      case "latest":
      default:
        list.sort((a, b) => b.createdAt - a.createdAt);
    }
    return list;
  }, [markets, category, search, sortMode]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3.5 py-1.5 mb-4 text-xs font-medium text-primary border border-primary/10">
          <Shield className="h-3 w-3" />
          ZK-ready Privacy
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
          Private Prediction Markets
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
          Stake your conviction privately — only aggregated results are visible.
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-10 animate-fade-in">
          <StatCard icon={<Layers className="h-4 w-4" />} label="Markets" value={stats.totalMarkets.toString()} />
          <StatCard icon={<BarChart3 className="h-4 w-4" />} label="Volume" value={stats.totalVolume.toLocaleString()} />
          <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Active" value={stats.activeMarkets.toString()} />
        </div>
      )}

      {loading ? (
        <div className="grid gap-3 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : markets.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Trending */}
          {trending.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-accent" />
                Trending
              </h2>
              <div className="grid gap-3 md:grid-cols-3">
                {trending.map((m) => (
                  <MarketCard key={m.id} market={m} trending />
                ))}
              </div>
            </section>
          )}

          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Recently Viewed
              </h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {recentlyViewed.map((m) => (
                  <MarketCard key={m.id} market={m} />
                ))}
              </div>
            </section>
          )}

          {/* Filters */}
          <section className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search markets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-secondary border-border rounded-xl h-9 text-sm"
                />
              </div>
              <div className="flex gap-1">
                {(["latest", "trending", "active"] as SortMode[]).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={sortMode === s ? "secondary" : "ghost"}
                    onClick={() => setSortMode(s)}
                    className="rounded-xl text-xs capitalize h-9"
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((c) => (
                <Button
                  key={c.value}
                  size="sm"
                  variant={category === c.value ? "default" : "outline"}
                  onClick={() => setCategory(c.value)}
                  className={`rounded-full text-xs h-7 px-3.5 ${category === c.value ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}
                >
                  {c.label}
                </Button>
              ))}
            </div>
          </section>

          {/* Markets Grid */}
          <section className="mb-14">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {category === "all" ? "All Markets" : `${CATEGORIES.find(c => c.value === category)?.label}`}
              </h2>
              <span className="text-xs text-muted-foreground">{filtered.length} markets</span>
            </div>
            {filtered.length === 0 ? (
              <p className="text-muted-foreground text-center py-10 text-sm">No markets found.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((m) => (
                  <MarketCard key={m.id} market={m} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* How It Works */}
      <section className="mb-14 animate-fade-in">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6 text-center">How It Works</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { step: "01", title: "Create a Market", desc: "Define a yes-or-no prediction question." },
            { step: "02", title: "Vote with Stake", desc: "Place your vote with a token amount." },
            { step: "03", title: "View Results", desc: "Only aggregated totals — votes stay private." },
          ].map((s) => (
            <div key={s.step} className="glass-card p-5 text-center">
              <div className="text-2xl font-bold gradient-text mb-2">{s.step}</div>
              <h3 className="font-semibold text-sm mb-1">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="mb-8 animate-fade-in">
        <div className="glass-card p-5 flex items-start gap-4">
          <div className="rounded-xl bg-primary/8 p-2.5 shrink-0 border border-primary/10">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-1">Privacy Layer</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Votes are stored as cryptographic hashes. No individual data is exposed — only aggregated totals update the market. ZK-ready architecture.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass-card p-4 text-center">
      <div className="flex items-center justify-center gap-1.5 text-primary mb-1">
        {icon}
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold font-mono">{value}</p>
    </div>
  );
}
