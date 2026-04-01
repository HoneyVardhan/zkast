import { useState } from "react";
import { CreditCard, Landmark, Smartphone, Wallet, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { addBalance, addTransaction } from "@/lib/wallet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const METHODS = [
  { id: "upi", label: "UPI", icon: Smartphone, desc: "Google Pay, PhonePe" },
  { id: "card", label: "Card", icon: CreditCard, desc: "Debit / Credit" },
  { id: "bank", label: "Net Banking", icon: Landmark, desc: "Bank transfer" },
  { id: "crypto", label: "Crypto", icon: Wallet, desc: "ETH, USDC" },
] as const;

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

interface AddFundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFundsModal({ open, onOpenChange }: AddFundsModalProps) {
  const [method, setMethod] = useState<string>("upi");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddFunds = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0 || amt > 100000) {
      toast.error("Enter a valid amount (1 – 100,000)");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));

    addBalance(amt);
    addTransaction({
      type: "deposit",
      amount: amt,
      method: METHODS.find((m) => m.id === method)?.label || method,
      status: "completed",
    });
    window.dispatchEvent(new Event("wallet-update"));

    setLoading(false);
    setAmount("");
    onOpenChange(false);
    toast.success(`${amt.toLocaleString()} tokens added (Demo Mode)`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Add Funds</DialogTitle>
          <DialogDescription className="text-xs">
            Select a payment method and enter amount. This is a demo simulation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          {METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={cn(
                "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all",
                method === m.id
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-secondary/30 hover:border-primary/15"
              )}
            >
              <m.icon className={cn("h-4 w-4 shrink-0", method === m.id ? "text-primary" : "text-muted-foreground")} />
              <div>
                <p className="text-xs font-medium">{m.label}</p>
                <p className="text-[10px] text-muted-foreground">{m.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          {QUICK_AMOUNTS.map((qa) => (
            <Button
              key={qa}
              size="sm"
              variant={amount === String(qa) ? "secondary" : "outline"}
              onClick={() => setAmount(String(qa))}
              className="rounded-xl text-xs h-7 px-3 font-mono border-border flex-1"
            >
              {qa.toLocaleString()}
            </Button>
          ))}
        </div>

        <Input
          type="number"
          placeholder="Custom amount..."
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
          max="100000"
          className="bg-secondary border-border rounded-xl h-10 text-sm"
        />

        <Button
          onClick={handleAddFunds}
          disabled={loading || !amount}
          className="w-full bg-primary text-primary-foreground font-semibold h-10 rounded-xl"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            "Add Funds"
          )}
        </Button>

        <p className="text-[10px] text-muted-foreground text-center">
          Demo mode — no real payments are processed
        </p>
      </DialogContent>
    </Dialog>
  );
}
