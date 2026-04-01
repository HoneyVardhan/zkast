import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Badge } from "./ui/badge";
import { type Transaction } from "@/lib/wallet";

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No transactions yet.
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-secondary/30 border border-border"
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center ${
                tx.type === "deposit"
                  ? "bg-yes/10 text-yes"
                  : "bg-no/10 text-no"
              }`}
            >
              {tx.type === "deposit" ? (
                <ArrowDownLeft className="h-3.5 w-3.5" />
              ) : (
                <ArrowUpRight className="h-3.5 w-3.5" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium">
                {tx.type === "deposit" ? "Deposit" : "Bet Placed"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {tx.method && `${tx.method} · `}
                {new Date(tx.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-mono font-semibold ${
                tx.type === "deposit" ? "text-yes" : "text-no"
              }`}
            >
              {tx.type === "deposit" ? "+" : "−"}
              {tx.amount.toLocaleString()}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] border-border"
            >
              {tx.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
