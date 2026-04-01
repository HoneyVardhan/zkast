import { Link, useLocation } from "react-router-dom";
import { Shield, Plus } from "lucide-react";
import { Button } from "./ui/button";

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold tracking-tight">ZK Market</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <Link to="/">
            <Button
              variant={location.pathname === "/" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-lg text-sm font-medium"
            >
              Markets
            </Button>
          </Link>
          <Link to="/create">
            <Button size="sm" className="gradient-primary text-primary-foreground gap-1.5 rounded-lg font-medium">
              <Plus className="h-3.5 w-3.5" />
              Create
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
