/**
 * API Layer — Off-chain implementation
 * 
 * This module provides a consistent API interface for the prediction market.
 * All functions return standardized ApiResponse objects.
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
  seedDemoData,
  type Market,
  type Vote,
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

// This function will be replaced by smart contract interaction
export async function apiCreateMarket(question: string): Promise<ApiResponse<Market>> {
  const validation = validateQuestion(question);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  try {
    const market = storeCreateMarket(question.trim());
    return { success: true, data: market };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create market" };
  }
}

// This function will be replaced by smart contract interaction
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
    // Simulate network/proof-generation latency
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
    activeMarkets: markets.length, // Future: filter by expiry
  };
}

export { getMarketPercentages, type Market, type Vote };
