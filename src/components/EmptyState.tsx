import { Link } from "react-router-dom";
import { BarChart3, Plus } from "lucide-react";
import { Button } from "./ui/button";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-slide-up">
      <div className="rounded-full bg-secondary p-5 mb-6">
        <BarChart3 className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No Markets Yet</h2>
      <p className="text-muted-foreground mb-6 text-center max-w-sm">
        Be the first to create a prediction market and start gathering insights.
      </p>
      <Link to="/create">
        <Button className="gradient-primary text-primary-foreground gap-1.5 neon-glow">
          <Plus className="h-4 w-4" />
          Create Market
        </Button>
      </Link>
    </div>
  );
}
