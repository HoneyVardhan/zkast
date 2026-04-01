import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">ZK Market</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Privacy-first decentralized prediction markets · ZK-ready architecture
          </p>
        </div>
      </div>
    </footer>
  );
}
