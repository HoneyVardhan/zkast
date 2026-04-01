import { Link, useLocation } from "react-router-dom";
import { Plus, Trophy, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { WalletButton } from "./WalletButton";
import { useAuth } from "@/hooks/useAuth";
import zkastLogo from "/zkast-logo.png";

export function Navbar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navItems = [
    { path: "/", label: "Markets" },
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src={zkastLogo} alt="ZKast" className="h-7 w-7" />
          <span className="text-base font-bold tracking-tight">ZKast</span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={location.pathname === item.path ? "secondary" : "ghost"}
                size="sm"
                className="rounded-xl text-xs font-medium gap-1.5 h-8"
              >
                {item.icon && <item.icon className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            </Link>
          ))}
          <Link to="/create">
            <Button variant="outline" size="sm" className="rounded-xl text-xs font-medium gap-1.5 h-8 border-border">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Create</span>
            </Button>
          </Link>
          <WalletButton />
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="rounded-xl text-xs h-8 text-muted-foreground hover:text-destructive gap-1"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
