import { Link, useLocation } from "react-router-dom";
import { Shield, Plus } from "lucide-react";
import { Button } from "./ui/button";

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 glass border-b border-glass-border/30">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <Shield className="h-7 w-7 text-accent transition-all duration-300 group-hover:drop-shadow-[0_0_8px_hsl(var(--accent)/0.6)]" />
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="text-xl font-bold gradient-text tracking-tight">ZK Market</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/">
            <Button
              variant={location.pathname === "/" ? "secondary" : "ghost"}
              size="sm"
              className="text-secondary-foreground rounded-xl font-medium"
            >
              Markets
            </Button>
          </Link>
          <Link to="/create">
            <Button size="sm" className="gradient-primary text-primary-foreground gap-1.5 neon-glow rounded-xl font-semibold">
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
