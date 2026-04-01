import { useEffect, useState } from "react";
import { Trophy, Medal, TrendingUp } from "lucide-react";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEntries(getLeaderboard());
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl mb-2" />
        ))}
      </div>
    );
  }

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3, 10);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3.5 py-1.5 mb-3 text-xs font-medium text-primary border border-primary/10">
          <Trophy className="h-3 w-3" />
          Leaderboard
        </div>
        <h1 className="text-2xl font-bold">Top Predictors</h1>
        <p className="text-[11px] text-muted-foreground/50 mt-2">ZKast Leaderboard</p>
        <p className="text-sm text-muted-foreground mt-1">Ranked by total winnings</p>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {top3.map((entry, i) => (
          <div
            key={entry.id}
            className={`glass-card p-4 text-center ${i === 0 ? "ring-1 ring-primary/15" : ""}`}
          >
            <div className="mb-2">
              {i === 0 ? (
                <Trophy className="h-6 w-6 text-primary mx-auto" />
              ) : i === 1 ? (
                <Medal className="h-5 w-5 text-muted-foreground mx-auto" />
              ) : (
                <Medal className="h-5 w-5 text-accent mx-auto" />
              )}
            </div>
            <p className="font-semibold text-sm truncate">{entry.username}</p>
            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
              {formatAddress(entry.walletAddress)}
            </p>
            <div className="mt-3 space-y-1">
              <p className="text-xs text-muted-foreground">
                Win Rate: <span className="text-yes font-medium">{entry.winRate}%</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Preds: <span className="text-foreground font-medium">{entry.totalPredictions}</span>
              </p>
              <p className="text-sm font-bold font-mono text-primary">
                {entry.totalWinnings.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Rest */}
      <div className="glass-card divide-y divide-border">
        {rest.map((entry) => (
          <div key={entry.id} className="flex items-center gap-4 px-5 py-3.5">
            <span className="text-sm font-bold font-mono text-muted-foreground w-6 text-center">
              {entry.rank}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{entry.username}</p>
              <p className="text-[10px] font-mono text-muted-foreground">
                {entry.walletAddress.slice(0, 6)}...{entry.walletAddress.slice(-4)}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold font-mono">{entry.totalWinnings.toLocaleString()}</p>
              <div className="flex items-center gap-1 justify-end">
                <TrendingUp className="h-3 w-3 text-yes" />
                <span className="text-[10px] text-yes font-medium">{entry.winRate}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
