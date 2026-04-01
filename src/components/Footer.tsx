import { Shield, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-glass-border/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            <span className="font-semibold gradient-text">ZK Market</span>
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Privacy-first decentralized prediction markets.
            Your votes are cryptographically protected — only aggregated totals are visible.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-yes" />
            <span>Privacy Protected (ZK-ready system)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
