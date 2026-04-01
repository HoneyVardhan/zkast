import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiCreateMarket, type MarketCategory } from "@/lib/api";
import { toast } from "sonner";

const CATEGORIES: { value: MarketCategory; label: string }[] = [
  { value: "crypto", label: "Crypto" },
  { value: "sports", label: "Sports" },
  { value: "politics", label: "Politics" },
  { value: "technology", label: "Tech" },
];

export default function CreateMarket() {
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState<MarketCategory>("crypto");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await apiCreateMarket(question, category);
    setLoading(false);

    if (!result.success) {
      toast.error(result.error || "Failed to create market");
      return;
    }
    toast.success("Market created successfully!");
    navigate(`/market/${result.data!.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg animate-fade-in">
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Create Market</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Prediction Question
            </label>
            <Input
              placeholder="Will Bitcoin reach $200K by end of 2026?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={200}
              className="bg-secondary border-border rounded-xl h-11 text-sm"
            />
            <p className="text-[10px] text-muted-foreground mt-1.5">{question.length}/200</p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Category
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((c) => (
                <Button
                  key={c.value}
                  type="button"
                  size="sm"
                  variant={category === c.value ? "default" : "outline"}
                  onClick={() => setCategory(c.value)}
                  className={`rounded-full text-xs h-7 px-3.5 ${category === c.value ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}
                >
                  {c.label}
                </Button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-semibold rounded-xl h-11 text-sm"
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
