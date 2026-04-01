/**
 * API Layer — Off-chain implementation backed by Supabase
 * Future: Replace with smart contract interactions.
 */

import {
  getAllMarkets as storeGetAllMarkets,
  getTrendingMarkets as storeGetTrendingMarkets,
  getMarketById as storeGetMarketById,
  createMarket as storeCreateMarket,
  placeVote as storePlaceVote,
  getMarketPercentages,
  getMarketVotes,
  getUserActivity,
  getUserProfile as storeGetUserProfile,
  updateUsername as storeUpdateUsername,
  getLeaderboard as storeGetLeaderboard,
  trackView,
  seedDemoData,
  type Market,
  type MarketCategory,
  type MarketStatus,
  type Vote,
  type UserActivity,
  type UserProfile,
  type LeaderboardEntry,
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
  if (!validation.valid) return { success: false, error: validation.error };
  try {
    const market = await storeCreateMarket(question.trim(), category);
    return { success: true, data: market };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create market" };
  }
}

export async function apiPlaceVote(marketId: string, vote: "YES" | "NO", amount: number): Promise<ApiResponse<Vote>> {
  const idCheck = validateMarketId(marketId);
  if (!idCheck.valid) return { success: false, error: idCheck.error };
  const amtCheck = validateVoteAmount(amount);
  if (!amtCheck.valid) return { success: false, error: amtCheck.error };
  if (vote !== "YES" && vote !== "NO") return { success: false, error: "Vote must be YES or NO" };

  try {
    const voteRecord = await storePlaceVote(marketId, vote, amount);
    return { success: true, data: voteRecord };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to place vote" };
  }
}

export async function apiGetAllMarkets(): Promise<ApiResponse<Market[]>> {
  try {
    await seedDemoData();
    const markets = await storeGetAllMarkets();
    return { success: true, data: markets };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to load markets" };
  }
}

export async function apiGetTrendingMarkets(): Promise<ApiResponse<Market[]>> {
  try {
    const markets = await storeGetTrendingMarkets();
    return { success: true, data: markets };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to load trending" };
  }
}

export async function apiGetMarket(id: string): Promise<ApiResponse<Market>> {
  const idCheck = validateMarketId(id);
  if (!idCheck.valid) return { success: false, error: idCheck.error };
  try {
    const market = await storeGetMarketById(id);
    if (!market) return { success: false, error: "Market not found" };
    trackView(id);
    return { success: true, data: market };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to load market" };
  }
}

export async function getStats(): Promise<MarketStats> {
  const markets = await storeGetAllMarkets();
  const totalVolume = markets.reduce((sum, m) => sum + m.totalYes + m.totalNo, 0);
  return {
    totalMarkets: markets.length,
    totalVolume,
    activeMarkets: markets.filter(m => m.status === "active").length,
  };
}

export async function getAnalytics(market: Market): Promise<MarketAnalytics> {
  const stats = getMarketPercentages(market);
  const confidence = Math.max(stats.yes, stats.no);
  const votes = await getMarketVotes(market.id);
  const recentVotes = votes.filter(v => v.timestamp > Date.now() - 86400000).length;
  let volatility: "low" | "medium" | "high" = "low";
  const diff = Math.abs(stats.yes - stats.no);
  if (diff < 20) volatility = "high";
  else if (diff < 40) volatility = "medium";
  return { confidence, volatility, recentVotes };
}

export async function getUserProfile(): Promise<UserProfile> {
  return storeGetUserProfile();
}

export async function updateUsername(name: string): Promise<void> {
  await storeUpdateUsername(name);
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return storeGetLeaderboard();
}

export {
  getMarketPercentages,
  getUserActivity,
  type Market,
  type MarketCategory,
  type MarketStatus,
  type Vote,
  type UserActivity,
  type UserProfile,
  type LeaderboardEntry,
};
