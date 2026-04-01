/**
 * API Layer — Off-chain implementation
 * 
 * Future: This entire module will be replaced by smart contract interactions.
 * Each function maps to a contract method:
 *   - createMarket → PredictionMarket.createMarket(question)
 *   - placeVote → PredictionMarket.vote(marketId, hashedVote, zkProof)
 *   - getMarkets → PredictionMarket.getMarkets()
 * 
 * This section will connect to MetaMask for transaction signing.
 */

import {
  getAllMarkets,
  getTrendingMarkets,
  getMarketById,
  createMarket as storeCreateMarket,
  placeVote as storePlaceVote,
  getMarketPercentages,
  getMarketVotes,
  getUserActivity,
  trackView,
  seedDemoData,
  type Market,
  type MarketCategory,
  type Vote,
  type UserActivity,
} from "./market-store";
import { validateQuestion, validateVoteAmount, validateMarketId } from "./validation";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface MarketStats {
  totalMarkets: number;
  totalVolume: number;
  activeMarkets: number;
}

export interface MarketAnalytics {
  confidence: number;
  volatility: "low" | "medium" | "high";
  recentVotes: number;
}

export async function apiCreateMarket(question: string, category: MarketCategory = "crypto"): Promise<ApiResponse<Market>> {
  const validation = validateQuestion(question);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  try {
    const market = storeCreateMarket(question.trim(), category);
    return { success: true, data: market };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create market" };
  }
}

export async function apiPlaceVote(
  marketId: string,
  vote: "YES" | "NO",
  amount: number
): Promise<ApiResponse<Vote>> {
  const idCheck = validateMarketId(marketId);
  if (!idCheck.valid) return { success: false, error: idCheck.error };

  const amtCheck = validateVoteAmount(amount);
  if (!amtCheck.valid) return { success: false, error: amtCheck.error };

  if (vote !== "YES" && vote !== "NO") {
    return { success: false, error: "Vote must be YES or NO" };
  }

  try {
    await new Promise((r) => setTimeout(r, 500));
    const voteRecord = storePlaceVote(marketId, vote, amount);
    return { success: true, data: voteRecord };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to place vote" };
  }
}

export async function apiGetAllMarkets(): Promise<ApiResponse<Market[]>> {
  try {
    seedDemoData();
    return { success: true, data: getAllMarkets() };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to load markets" };
  }
}

export async function apiGetTrendingMarkets(): Promise<ApiResponse<Market[]>> {
  try {
    return { success: true, data: getTrendingMarkets() };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to load trending" };
  }
}

export async function apiGetMarket(id: string): Promise<ApiResponse<Market>> {
  const idCheck = validateMarketId(id);
  if (!idCheck.valid) return { success: false, error: idCheck.error };

  try {
    const market = getMarketById(id);
    if (!market) return { success: false, error: "Market not found" };
    trackView(id);
    return { success: true, data: market };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to load market" };
  }
}

export function getStats(): MarketStats {
  const markets = getAllMarkets();
  const totalVolume = markets.reduce((sum, m) => sum + m.totalYes + m.totalNo, 0);
  return {
    totalMarkets: markets.length,
    totalVolume,
    activeMarkets: markets.length,
  };
}

export function getAnalytics(market: Market): MarketAnalytics {
  const stats = getMarketPercentages(market);
  const confidence = Math.max(stats.yes, stats.no);
  const votes = getMarketVotes(market.id);
  const recentVotes = votes.filter(v => v.timestamp > Date.now() - 86400000).length;
  
  let volatility: "low" | "medium" | "high" = "low";
  const diff = Math.abs(stats.yes - stats.no);
  if (diff < 20) volatility = "high";
  else if (diff < 40) volatility = "medium";

  return { confidence, volatility, recentVotes };
}

export { getMarketPercentages, getUserActivity, type Market, type MarketCategory, type Vote, type UserActivity };
