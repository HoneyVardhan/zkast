import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiCreateMarket } from "@/lib/api";
import { toast } from "sonner";

export default function CreateMarket() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await apiCreateMarket(question);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error || "Failed to create market");
      return;
    }
    toast.success("Market created successfully!");
    navigate(`/market/${result.data!.id}`);
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
            disabled={loading}
            className="w-full gradient-primary text-primary-foreground neon-glow font-semibold"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Create Market"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
