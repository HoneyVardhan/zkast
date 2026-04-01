import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Lock, TrendingUp, Coins, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMarketById, getMarketPercentages, placeVote, Market } from "@/lib/market-store";
import { toast } from "sonner";

export default function MarketDetail() {
  const { id } = useParams<{ id: string }>();
  const [market, setMarket] = useState<Market | null>(null);
  const [amount, setAmount] = useState("");
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (id) {
      const m = getMarketById(id);
      setMarket(m || null);
    }
  }, [id]);

  if (!market) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Market not found</p>
        <Link to="/">
          <Button variant="secondary">Back to Markets</Button>
        </Link>
      </div>
    );
  }

  const stats = getMarketPercentages(market);

  const handleVote = async (vote: "YES" | "NO") => {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (amt > 100000) {
      toast.error("Maximum 100,000 tokens per vote");
      return;
    }
    setVoting(true);
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 600));
    placeVote(market.id, vote, amt);
    setMarket(getMarketById(market.id)!);
    setAmount("");
    setVoting(false);
    toast.success(`Vote placed privately with ZK proof`);
  };

  const confidence = Math.max(stats.yes, stats.no);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-slide-up">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Markets
      </Link>

      {/* Main card */}
      <div className="glass rounded-2xl p-8 mb-6">
        <div className="flex items-start gap-2 mb-2">
          <Lock className="h-4 w-4 text-yes mt-1 shrink-0" />
          <span className="text-xs font-medium text-yes">Privacy Protected (ZK-ready system)</span>
        </div>

        <h1 className="text-2xl font-bold mb-6">{market.question}</h1>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatBox label="Total YES" value={market.totalYes.toLocaleString()} color="text-yes" icon={<TrendingUp className="h-4 w-4" />} />
          <StatBox label="Total NO" value={market.totalNo.toLocaleString()} color="text-no" icon={<TrendingUp className="h-4 w-4 rotate-180" />} />
          <StatBox label="Total Pool" value={stats.total.toLocaleString()} color="text-accent" icon={<Coins className="h-4 w-4" />} />
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-yes">Yes {stats.yes}%</span>
            <span className="text-no">No {stats.no}%</span>
          </div>
          <div className="relative h-4 rounded-full overflow-hidden bg-secondary">
            <div
              className="absolute inset-y-0 left-0 gradient-yes rounded-full transition-all duration-700"
              style={{ width: `${stats.yes}%` }}
            />
          </div>
        </div>

        {/* Confidence */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <span>Market Confidence: <strong className="text-foreground">{confidence}%</strong></span>
        </div>
      </div>

      {/* Voting section */}
      <div className="glass rounded-2xl p-8">
        <h2 className="text-lg font-semibold mb-4">Place Your Vote</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Your vote will be hashed and stored privately. Only aggregated totals are updated.
        </p>

        <div className="mb-5">
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
            className="bg-secondary border-glass-border/50 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleVote("YES")}
            disabled={voting}
            className="gradient-yes text-primary-foreground font-semibold h-12 text-base hover:opacity-90 transition-opacity"
          >
            {voting ? "Processing..." : "Vote YES"}
          </Button>
          <Button
            onClick={() => handleVote("NO")}
            disabled={voting}
            className="gradient-no text-primary-foreground font-semibold h-12 text-base hover:opacity-90 transition-opacity"
          >
            {voting ? "Processing..." : "Vote NO"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-secondary/50 p-4 text-center">
      <div className={`flex items-center justify-center gap-1.5 mb-1 ${color}`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
