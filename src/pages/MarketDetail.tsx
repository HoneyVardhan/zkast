import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Lock, TrendingUp, Coins, ShieldCheck, Loader2, Activity, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { apiGetMarket, apiPlaceVote, getMarketPercentages, getAnalytics, type Market } from "@/lib/api";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

export default function MarketDetail() {
  const { id } = useParams<{ id: string }>();
  const [market, setMarket] = useState<Market | null>(null);
  const [amount, setAmount] = useState("");
  const [voting, setVoting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMarket = async () => {
    if (!id) return;
    setLoading(true);
    const res = await apiGetMarket(id);
    setMarket(res.success && res.data ? res.data : null);
    setLoading(false);
  };

  useEffect(() => {
    loadMarket();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <Skeleton className="h-8 w-40 mb-6 rounded-xl" />
        <Skeleton className="h-72 rounded-2xl mb-6" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
        <p className="text-muted-foreground mb-4">Market not found</p>
        <Link to="/">
          <Button variant="secondary" className="rounded-xl">Back to Markets</Button>
        </Link>
      </div>
    );
  }

  const stats = getMarketPercentages(market);
  const analytics = getAnalytics(market);

  const chartData = [
    { name: "YES", value: market.totalYes, fill: "hsl(145, 70%, 50%)" },
    { name: "NO", value: market.totalNo, fill: "hsl(0, 72%, 55%)" },
  ];

  const volatilityColor = {
    low: "text-neon-green",
    medium: "text-yellow-400",
    high: "text-neon-pink",
  };

  const handleVote = async (vote: "YES" | "NO") => {
    setVoting(true);
    const result = await apiPlaceVote(market.id, vote, Number(amount));
    setVoting(false);

    if (!result.success) {
      toast.error(result.error || "Vote failed");
      return;
    }

    toast.success("Vote placed privately with ZK proof");
    setAmount("");
    await loadMarket();
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl animate-fade-in">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors duration-300">
        <ArrowLeft className="h-4 w-4" />
        Back to Markets
      </Link>

      {/* Main card */}
      <div className="glass-card rounded-2xl p-6 md:p-8 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-yes shrink-0" />
            <span className="text-xs font-semibold text-yes tracking-wide">Privacy Protected</span>
          </div>
          <Badge variant="outline" className="text-[10px] rounded-full border-glass-border/50 capitalize">
            {market.category}
          </Badge>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-8 leading-snug">{market.question}</h1>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatBox label="Total YES" value={market.totalYes.toLocaleString()} color="text-yes" icon={<TrendingUp className="h-4 w-4" />} />
          <StatBox label="Total NO" value={market.totalNo.toLocaleString()} color="text-no" icon={<TrendingUp className="h-4 w-4 rotate-180" />} />
          <StatBox label="Total Pool" value={stats.total.toLocaleString()} color="text-accent" icon={<Coins className="h-4 w-4" />} />
          <StatBox label="Confidence" value={`${analytics.confidence}%`} color="text-accent" icon={<ShieldCheck className="h-4 w-4" />} />
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex justify-between text-sm font-semibold mb-2">
            <span className="text-yes">Yes {stats.yes}%</span>
            <span className="text-no">No {stats.no}%</span>
          </div>
          <div className="relative h-4 rounded-full overflow-hidden bg-secondary">
            <div
              className="absolute inset-y-0 left-0 gradient-yes rounded-full progress-animated transition-all duration-700"
              style={{ width: `${stats.yes}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>
        </div>

        {/* Analytics row */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1.5">
            <Activity className={`h-4 w-4 ${volatilityColor[analytics.volatility]}`} />
            <span>Volatility: <strong className={volatilityColor[analytics.volatility]}>{analytics.volatility}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-accent" />
            <span>Recent votes: <strong className="text-foreground">{analytics.recentVotes}</strong></span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Vote Distribution</h2>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={40} tick={{ fill: "hsl(220,20%,85%)", fontSize: 13 }} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Voting section */}
      <div className="glass-card rounded-2xl p-6 md:p-8">
        <h2 className="text-lg font-bold mb-2">Place Your Vote</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Your vote will be hashed and stored privately. Only aggregated totals are updated.
        </p>

        <div className="mb-6">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Stake Amount (tokens)
          </label>
          <Input
            type="number"
            placeholder="Enter amount..."
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            max="100000"
            className="bg-secondary border-glass-border/50 text-foreground placeholder:text-muted-foreground rounded-xl h-12"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleVote("YES")}
            disabled={voting}
            className="gradient-yes text-primary-foreground font-bold h-12 text-base rounded-xl neon-glow-yes transition-all duration-300"
          >
            {voting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vote YES"}
          </Button>
          <Button
            onClick={() => handleVote("NO")}
            disabled={voting}
            className="gradient-no text-primary-foreground font-bold h-12 text-base rounded-xl neon-glow-no transition-all duration-300"
          >
            {voting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vote NO"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-secondary/50 p-4 text-center border border-glass-border/20">
      <div className={`flex items-center justify-center gap-1.5 mb-1.5 ${color}`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
