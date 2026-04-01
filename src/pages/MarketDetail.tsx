import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Lock, TrendingUp, Coins, ShieldCheck, Loader2, Activity, BarChart3, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/Sparkline";
import { apiGetMarket, apiPlaceVote, getMarketPercentages, getAnalytics, type Market } from "@/lib/api";
import { toast } from "sonner";

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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Skeleton className="h-6 w-32 mb-6 rounded-lg" />
        <Skeleton className="h-64 rounded-xl mb-4" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
        <p className="text-muted-foreground mb-4 text-sm">Market not found</p>
        <Link to="/">
          <Button variant="secondary" className="rounded-lg text-sm">Back to Markets</Button>
        </Link>
      </div>
    );
  }

  const stats = getMarketPercentages(market);
  const analytics = getAnalytics(market);
  const isResolved = market.status === "resolved";

  const volatilityColor = {
    low: "text-yes",
    medium: "text-yellow-400",
    high: "text-no",
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
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-fade-in">
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      {/* Main card */}
      <div className="glass-card rounded-xl p-5 md:p-6 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            {isResolved ? (
              <Badge variant="outline" className="text-[10px] h-5 border-yes/30 text-yes gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Resolved: {market.resolvedOutcome}
              </Badge>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-yes" />
                <span className="text-[10px] font-medium text-yes uppercase tracking-wider">Privacy Protected</span>
              </>
            )}
          </div>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {market.category}
          </span>
        </div>

        <h1 className="text-xl md:text-2xl font-bold mb-4 leading-snug">{market.question}</h1>

        {/* Sparkline */}
        {market.sparklineData && market.sparklineData.length > 1 && (
          <div className="mb-6 p-3 rounded-lg bg-secondary/30 border border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">YES % Trend</p>
            <Sparkline data={market.sparklineData} height={48} />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          <MiniStat label="YES" value={market.totalYes.toLocaleString()} color="text-yes" icon={<TrendingUp className="h-3.5 w-3.5" />} />
          <MiniStat label="NO" value={market.totalNo.toLocaleString()} color="text-no" icon={<TrendingUp className="h-3.5 w-3.5 rotate-180" />} />
          <MiniStat label="Pool" value={stats.total.toLocaleString()} color="text-primary" icon={<Coins className="h-3.5 w-3.5" />} />
          <MiniStat label="Confidence" value={`${analytics.confidence}%`} color="text-primary" icon={<ShieldCheck className="h-3.5 w-3.5" />} />
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-medium mb-1.5">
            <span className="text-yes">Yes {stats.yes}%</span>
            <span className="text-no">No {stats.no}%</span>
          </div>
          <div className="relative h-2 rounded-full overflow-hidden bg-secondary">
            <div
              className="absolute inset-y-0 left-0 bg-yes rounded-full progress-animated transition-all duration-500"
              style={{ width: `${stats.yes}%` }}
            />
          </div>
        </div>

        {/* Analytics */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Activity className={`h-3.5 w-3.5 ${volatilityColor[analytics.volatility]}`} />
            <span>Volatility: <strong className={volatilityColor[analytics.volatility]}>{analytics.volatility}</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
            <span>Recent: <strong className="text-foreground">{analytics.recentVotes}</strong></span>
          </div>
        </div>
      </div>

      {/* Voting */}
      {!isResolved && (
        <div className="glass-card rounded-xl p-5 md:p-6">
          <h2 className="text-sm font-semibold mb-1">Place Your Vote</h2>
          <p className="text-xs text-muted-foreground mb-5">
            Your vote is hashed and stored privately. Only totals are updated.
          </p>

          <div className="mb-4">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Stake Amount
            </label>
            <Input
              type="number"
              placeholder="Enter amount..."
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max="100000"
              className="bg-secondary border-border rounded-lg h-10 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleVote("YES")}
              disabled={voting}
              className="gradient-yes text-primary-foreground font-semibold h-10 rounded-lg neon-glow-yes"
            >
              {voting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vote YES"}
            </Button>
            <Button
              onClick={() => handleVote("NO")}
              disabled={voting}
              className="gradient-no text-primary-foreground font-semibold h-10 rounded-lg neon-glow-no"
            >
              {voting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vote NO"}
            </Button>
          </div>
        </div>
      )}

      {isResolved && (
        <div className="glass-card rounded-xl p-5 md:p-6 text-center">
          <CheckCircle2 className="h-8 w-8 text-yes mx-auto mb-2" />
          <h2 className="text-sm font-semibold mb-1">Market Resolved</h2>
          <p className="text-xs text-muted-foreground">
            This market has been resolved with outcome: <strong className="text-yes">{market.resolvedOutcome}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-secondary/50 p-3 text-center border border-border">
      <div className={`flex items-center justify-center gap-1 mb-1 ${color}`}>
        {icon}
        <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
      </div>
      <p className={`text-sm font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}
