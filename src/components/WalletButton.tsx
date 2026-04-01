import { useState, useEffect } from "react";
import { Wallet, LogOut, Coins, Plus } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { connectWallet, disconnectWallet, getWallet, shortenAddress, type WalletState } from "@/lib/wallet";
import { AddFundsModal } from "./AddFundsModal";
import { toast } from "sonner";

export function WalletButton() {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [fundsOpen, setFundsOpen] = useState(false);

  useEffect(() => {
    setWallet(getWallet());
  }, []);

  const handleConnect = async () => {
    try {
      const w = await connectWallet();
      setWallet(w);
      toast.success("Wallet connected");
    } catch {
      toast.error("Failed to connect wallet");
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setWallet(null);
    toast("Wallet disconnected");
  };

  useEffect(() => {
    const onUpdate = () => setWallet(getWallet());
    window.addEventListener("focus", onUpdate);
    window.addEventListener("wallet-update", onUpdate);
    return () => {
      window.removeEventListener("focus", onUpdate);
      window.removeEventListener("wallet-update", onUpdate);
    };
  }, []);

  if (!wallet?.connected) {
    return (
      <Button
        size="sm"
        onClick={handleConnect}
        className="gradient-primary text-primary-foreground gap-1.5 rounded-lg font-medium"
      >
        <Wallet className="h-3.5 w-3.5" />
        Connect
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-lg text-xs font-mono gap-1.5 border-primary/20 hover:border-primary/40">
            <div className="h-2 w-2 rounded-full bg-yes" />
            {shortenAddress(wallet.address)}
            <span className="text-muted-foreground">·</span>
            <span className="text-primary flex items-center gap-0.5">
              <Coins className="h-3 w-3" />
              {wallet.balance.toLocaleString()}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="text-xs font-mono text-muted-foreground" disabled>
            Chain ID: {wallet.chainId}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setFundsOpen(true)} className="text-xs gap-2">
            <Plus className="h-3.5 w-3.5" />
            Add Funds
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDisconnect} className="text-xs gap-2 text-destructive">
            <LogOut className="h-3.5 w-3.5" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AddFundsModal open={fundsOpen} onOpenChange={setFundsOpen} />
    </>
  );
}
