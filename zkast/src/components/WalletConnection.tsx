import { useWallet } from "@txnlab/use-wallet-react";
import { WalletButton } from "@txnlab/use-wallet-ui-react";
import { shortenAddress } from "@/lib/wallet-utils";
import { Button } from "./ui/button";
import { LogOut, Wallet, Loader2, AlertCircle } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "./ui/dropdown-menu";
import { toast } from "sonner";

export function WalletConnection() {
  const { 
    activeAccount, 
    activeWallet, 
    isReady, 
    status 
  } = useWallet();

  const handleDisconnect = async () => {
    try {
      if (activeWallet) {
        await activeWallet.disconnect();
        toast.success("Wallet disconnected");
      }
    } catch (error) {
      console.error("Disconnect error:", error);
      toast.error("Failed to disconnect");
    }
  };

  if (!isReady) {
    return (
      <Button variant="outline" size="sm" disabled className="rounded-xl h-8 px-3">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      </Button>
    );
  }

  if (activeAccount) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl h-8 px-3 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 group transition-all"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-yes animate-pulse" />
            <span className="text-[10px] font-mono font-bold">
              {shortenAddress(activeAccount.address)}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-background/95 backdrop-blur-xl border-border shadow-2xl">
          <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-2 pb-2">
            Wallet Connected
          </DropdownMenuLabel>
          <div className="px-2 py-3 mb-2 rounded-xl bg-secondary/50 border border-border">
            <p className="text-[10px] text-muted-foreground mb-1">Active Address</p>
            <p className="text-xs font-mono break-all leading-relaxed">
              {activeAccount.address}
            </p>
          </div>
          <DropdownMenuSeparator className="bg-border/50" />
          <DropdownMenuItem 
            onClick={handleDisconnect}
            className="rounded-lg gap-2.5 text-no focus:text-no focus:bg-no/10 cursor-pointer h-10 mt-1"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="wui-custom-trigger">
      <WalletButton />
    </div>
  );
}
