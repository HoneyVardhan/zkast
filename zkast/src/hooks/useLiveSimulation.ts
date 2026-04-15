import { useEffect } from "react";
import { getAllMarkets, MARKETS_KEY } from "@/lib/market-store";

/**
 * Hook to simulate live market activity by randomly updating totals.
 * This makes the demo feel alive without real backend events.
 */
export function useLiveSimulation() {
  useEffect(() => {
    const interval = setInterval(async () => {
      const markets = await getAllMarkets();
      if (!markets || markets.length === 0) return;

      // Select 1-2 random active markets to update
      const updateCount = Math.random() > 0.7 ? 2 : 1;
      
      let changed = false;
      for (let i = 0; i < updateCount; i++) {
        const index = Math.floor(Math.random() * markets.length);
        const market = markets[index];
        
        if (market.status === "active") {
          const side = Math.random() > 0.5 ? "YES" : "NO";
          const amount = Math.floor(Math.random() * 50) + 5;
          
          if (side === "YES") {
            market.totalYes = (market.totalYes || 0) + amount;
          } else {
            market.totalNo = (market.totalNo || 0) + amount;
          }
          
          // Update sparkline
          const total = market.totalYes + market.totalNo;
          const newPct = Math.round((market.totalYes / total) * 100);
          if (Array.isArray(market.sparklineData)) {
            market.sparklineData = [...market.sparklineData.slice(-14), newPct];
          }
          
          changed = true;
          console.log(`[Simulation] Updated market: ${market.question} (+${amount} ${side})`);
        }
      }

      if (changed) {
        localStorage.setItem(MARKETS_KEY, JSON.stringify(markets));
        // We trigger a custom event so components can listen if they don't use reactive state for everything
        window.dispatchEvent(new CustomEvent("markets-updated"));
      }
    }, 20000); // Every 20 seconds

    return () => clearInterval(interval);
  }, []);
}
