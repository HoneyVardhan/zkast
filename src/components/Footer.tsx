import zkastLogo from "/zkast-logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={zkastLogo} alt="ZKast" className="h-5 w-5 opacity-70" />
            <span className="font-semibold text-sm">ZKast</span>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-xs text-muted-foreground">
              Private Prediction Markets
            </p>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">
              A privacy-focused prediction market platform powered by zero-knowledge concepts.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
