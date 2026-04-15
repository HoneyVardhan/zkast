import { useState, useEffect } from "react";
import { Wallet, Trophy, BarChart3, Activity, Edit2, Check, Coins, Plus } from "lucide-react";
import { getUserProfile, updateUsername, type UserProfile, type UserActivity } from "@/lib/market-store";
import { shortenAddress, formatAddress } from "@/lib/wallet-utils";
import { useWallet } from "@txnlab/use-wallet-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TransactionHistory } from "@/components/TransactionHistory";
import { AddFundsModal } from "@/components/AddFundsModal";
import { useAuth } from "@/hooks/useAuth";


export default function Profile() {
  const { activeAccount } = useWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [fundsOpen, setFundsOpen] = useState(false);

  const reload = async () => {
    const p = await getUserProfile();
    setProfile(p);
    setNameInput(p.username);
    setTransactions([]); // Mocked
  };

  useEffect(() => {
    reload();
  }, [activeAccount]);

  const handleSave = async () => {
    await updateUsername(nameInput);
    const p = await getUserProfile();
    setProfile(p);
    setEditing(false);
  };

  if (!profile) return null;

  const winRate = profile.totalPredictions > 0
    ? Math.round((profile.wins / profile.totalPredictions) * 100)
    : 0;

  const displayAddress = activeAccount?.address || profile?.walletAddress || "";

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="glass-card p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-2xl bg-primary/8 border border-primary/10 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="h-8 text-sm bg-secondary border-border w-40 rounded-xl"
                />
                <Button size="sm" variant="ghost" onClick={handleSave} className="h-8 w-8 p-0">
                  <Check className="h-4 w-4 text-yes" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{profile.username}</h1>
                <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {shortenAddress(displayAddress)}
            </p>
            {activeAccount && (
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <div className="h-1.5 w-1.5 rounded-full bg-yes" />
                <span className="text-[10px] text-muted-foreground">Connected</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFundsOpen(true)}
                  className="h-5 px-2 text-[10px] rounded-lg gap-0.5 border-primary/15 ml-1"
                >
                  <Plus className="h-2.5 w-2.5" />
                  Add Funds
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBox icon={<BarChart3 className="h-3.5 w-3.5" />} label="Predictions" value={profile.totalPredictions.toString()} />
          <StatBox icon={<Trophy className="h-3.5 w-3.5" />} label="Win Rate" value={`${winRate}%`} />
          <StatBox icon={<Activity className="h-3.5 w-3.5" />} label="Wins" value={profile.wins.toString()} />
          <StatBox icon={<Wallet className="h-3.5 w-3.5" />} label="Volume" value={profile.totalVolume.toLocaleString()} />
        </div>
      </div>

      {/* Transaction History */}
      <div className="glass-card p-6 mb-4">
        <h2 className="text-sm font-semibold mb-4">Transaction History</h2>
        <TransactionHistory transactions={transactions} />
      </div>

      {/* Activity */}
      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold mb-4">Your Activity</h2>
        {(!profile.predictions || profile.predictions.length === 0) ? (
          <div className="text-center py-12">
            <div className="rounded-full bg-secondary w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">No predictions yet. Start voting on markets!</p>
            <Link to="/">
              <Button variant="outline" size="sm" className="rounded-xl border-border">Explore Markets</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {(profile.predictions || []).slice(0, 20).map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm truncate">{p.marketQuestion}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(p.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={`text-[10px] rounded-lg ${p.vote === "YES" ? "border-yes/30 text-yes" : "border-no/30 text-no"}`}>
                    {p.vote} · {p.amount.toLocaleString()}
                  </Badge>
                  {p.result && p.result !== "pending" && (
                    <Badge variant="outline" className={`text-[10px] rounded-lg ${p.result === "win" ? "border-yes/30 text-yes" : "border-no/30 text-no"}`}>
                      {p.result}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddFundsModal open={fundsOpen} onOpenChange={setFundsOpen} />
    </div>
  );
}


function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/50 p-3 text-center border border-border">
      <div className="flex items-center justify-center gap-1 mb-1 text-primary">
        {icon}
        <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm font-bold font-mono">{value}</p>
    </div>
  );
}
