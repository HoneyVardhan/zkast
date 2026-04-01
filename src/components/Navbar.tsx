import { Link, useLocation } from "react-router-dom";
import { Shield, Plus, Trophy, User } from "lucide-react";
import { Button } from "./ui/button";
import { WalletButton } from "./WalletButton";

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
            <Button variant={location.pathname === "/" ? "secondary" : "ghost"} size="sm" className="rounded-lg text-sm font-medium">
              Markets
            </Button>
          </Link>
          <Link to="/leaderboard">
            <Button variant={location.pathname === "/leaderboard" ? "secondary" : "ghost"} size="sm" className="rounded-lg text-sm font-medium gap-1">
              <Trophy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant={location.pathname === "/profile" ? "secondary" : "ghost"} size="sm" className="rounded-lg text-sm font-medium gap-1">
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
          </Link>
          <Link to="/create">
            <Button variant="outline" size="sm" className="rounded-lg font-medium gap-1 border-border text-muted-foreground hover:text-foreground">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Create</span>
            </Button>
          </Link>
          <WalletButton />
        </div>
      </div>
    </nav>
  );
}
