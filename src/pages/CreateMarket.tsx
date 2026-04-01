import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createMarket } from "@/lib/market-store";
import { toast } from "sonner";

export default function CreateMarket() {
  const [question, setQuestion] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) {
      toast.error("Please enter a question");
      return;
    }
    if (trimmed.length < 10) {
      toast.error("Question must be at least 10 characters");
      return;
    }
    const market = createMarket(trimmed);
    toast.success("Market created!");
    navigate(`/market/${market.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-xl animate-slide-up">
      <div className="glass rounded-2xl p-8">
        <div className="flex items-center gap-2.5 mb-6">
          <Sparkles className="h-6 w-6 text-accent" />
          <h1 className="text-2xl font-bold">Create Market</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Prediction Question
            </label>
            <Input
              placeholder="Will Bitcoin reach $200K by end of 2026?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={200}
              className="bg-secondary border-glass-border/50 text-foreground placeholder:text-muted-foreground focus:ring-accent"
            />
            <p className="text-xs text-muted-foreground mt-1.5">{question.length}/200</p>
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary text-primary-foreground neon-glow font-semibold"
            size="lg"
          >
            Create Market
          </Button>
        </form>
      </div>
    </div>
  );
}
