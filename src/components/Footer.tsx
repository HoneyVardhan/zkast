import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-xs">ZK Market</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Privacy-first decentralized prediction markets · ZK-ready architecture
          </p>
        </div>
      </div>
    </footer>
  );
}
