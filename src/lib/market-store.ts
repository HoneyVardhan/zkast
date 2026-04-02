/**
 * Market Store — localStorage-backed persistence layer
 * Replacing Supabase for a fully client-side experience.
 */
import { hashVote, generateZKProof } from "./zkProof";

export type MarketCategory = "crypto" | "sports" | "politics" | "technology";
export type MarketStatus = "active" | "resolved";

export interface Market {
  id: string;
  question: string;
  category: MarketCategory;
  totalYes: number;
  totalNo: number;
  createdAt: number;
  status: MarketStatus;
  resolvedOutcome?: "YES" | "NO";
  sparklineData: number[];
}

export interface Vote {
  id: string;
  marketId: string;
  hashedVote: string;
  zkProof: string;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  userId: string;
  username: string;
  walletAddress: string;
  totalPredictions: number;
  wins: number;
  losses: number;
  totalVolume: number;
  predictions: UserPrediction[];
}

export interface UserPrediction {
  marketId: string;
  marketQuestion: string;
  vote: "YES" | "NO";
  amount: number;
  timestamp: number;
  result?: "win" | "loss" | "pending";
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  walletAddress: string;
  winRate: number;
  totalPredictions: number;
  totalWinnings: number;
  rank: number;
}

export interface MarketStats {
  totalMarkets: number;
  totalVolume: number;
  activeMarkets: number;
}

export async function getStats(): Promise<MarketStats> {
  const markets = await getAllMarkets();
  const totalVolume = markets.reduce((sum, m) => sum + m.totalYes + m.totalNo, 0);
  return {
    totalMarkets: markets.length,
    totalVolume,
    activeMarkets: markets.filter((m) => m.status === "active").length,
  };
}

export interface UserActivity {

  recentlyViewed: string[];
  voteCount: number;
  lastActive: number;
}

const MARKETS_KEY = "zk_markets";
const VOTES_KEY = "zk_votes";
const PROFILES_KEY = "zk_profiles";
const LEADERBOARD_KEY = "zk_leaderboard";
const ACTIVITY_KEY = "zk_user_activity";

// --- Persistence Helpers ---

function load<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function save(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- Markets ---

export async function getAllMarkets(): Promise<Market[]> {
  const markets = load<Market[]>(MARKETS_KEY);
  if (!markets || markets.length === 0) {
    await seedDemoData();
    return load<Market[]>(MARKETS_KEY) || [];
  }
  return markets.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getTrendingMarkets(): Promise<Market[]> {
  const markets = await getAllMarkets();
  return markets
    .filter(m => m.status === "active")
    .sort((a, b) => b.totalYes - a.totalYes)
    .slice(0, 3);
}

export async function getMarketById(id: string): Promise<Market | undefined> {
  const markets = await getAllMarkets();
  return markets.find(m => m.id === id);
}

export async function createMarket(question: string, category: MarketCategory = "crypto"): Promise<Market> {
  const markets = await getAllMarkets();
  const newMarket: Market = {
    id: crypto.randomUUID(),
    question: question.trim(),
    category,
    totalYes: 0,
    totalNo: 0,
    createdAt: Date.now(),
    status: "active",
    sparklineData: [50, 50, 50, 50, 50],
  };
  markets.push(newMarket);
  save(MARKETS_KEY, markets);
  return newMarket;
}

export async function placeVote(marketId: string, vote: "YES" | "NO", amount: number): Promise<Vote> {
  const timestamp = Date.now();
  const hashedVote = hashVote(vote, amount, timestamp);
  const zkProof = generateZKProof(vote, amount, timestamp);

  // In a real app we'd get the user from auth but here we just simulate
  const profile = await getUserProfile();

  const votes = load<any[]>(VOTES_KEY) || [];
  const newVote = {
    id: crypto.randomUUID(),
    market_id: marketId,
    user_id: profile.userId || "guest",
    hashed_vote: hashedVote,
    zk_proof: zkProof,
    vote_direction: vote,
    amount,
    created_at: new Date(timestamp).toISOString(),
  };
  votes.push(newVote);
  save(VOTES_KEY, votes);

  // Update market totals
  const markets = await getAllMarkets();
  const market = markets.find(m => m.id === marketId);
  if (market) {
    market.totalYes = vote === "YES" ? market.totalYes + amount : market.totalYes;
    market.totalNo = vote === "NO" ? market.totalNo + amount : market.totalNo;
    const newPct = Math.round((market.totalYes / (market.totalYes + market.totalNo)) * 100);
    market.sparklineData = [...market.sparklineData.slice(-14), newPct];
    save(MARKETS_KEY, markets);
  }

  // Update profile
  if (profile.userId) {
    const profiles = load<any>(PROFILES_KEY) || {};
    const userProfile = profiles[profile.userId] || { total_predictions: 0, total_volume: 0 };
    userProfile.total_predictions += 1;
    userProfile.total_volume += amount;
    profiles[profile.userId] = userProfile;
    save(PROFILES_KEY, profiles);
  }

  return {
    id: newVote.id,
    marketId: newVote.market_id,
    hashedVote: newVote.hashed_vote,
    zkProof: newVote.zk_proof,
    timestamp,
  };
}

export async function getMarketVotes(marketId: string): Promise<Vote[]> {
  const votes = load<Vote[]>(VOTES_KEY) || [];
  return votes.filter((v) => v.marketId === marketId);
}


export function getMarketPercentages(market: Market) {
  const total = market.totalYes + market.totalNo;
  if (total === 0) return { yes: 50, no: 50, total: 0 };
  return {
    yes: Math.round((market.totalYes / total) * 100),
    no: Math.round((market.totalNo / total) * 100),
    total,
  };
}


export function getUserActivity(): UserActivity {
  return load<UserActivity>(ACTIVITY_KEY) || { recentlyViewed: [], voteCount: 0, lastActive: 0 };
}

export function trackView(marketId: string) {
  const activity = getUserActivity();
  activity.recentlyViewed = [marketId, ...activity.recentlyViewed.filter(id => id !== marketId)].slice(0, 10);
  activity.lastActive = Date.now();
  save(ACTIVITY_KEY, activity);
}

// --- User Profile ---

export async function getUserProfile(): Promise<UserProfile> {
  // Try to get active account from another mechanism if needed, but for store we just look at profiles
  // This is a simplified version
  return {
    id: "user-1",
    userId: "user-1",
    username: "User",
    walletAddress: "",
    totalPredictions: 0,
    wins: 0,
    losses: 0,
    totalVolume: 0,
    predictions: [],
  };
}

export async function updateUsername(name: string) {
  // Mocked for now
}

// --- Leaderboard ---

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  let leaderboard = load<LeaderboardEntry[]>(LEADERBOARD_KEY);
  if (!leaderboard) {
    leaderboard = await seedLeaderboard();
  }
  return leaderboard;
}

async function seedLeaderboard(): Promise<LeaderboardEntry[]> {
  const entries = Array.from({ length: 15 }, (_, i) => {
    const preds = 50 + Math.floor(Math.random() * 200);
    const winRate = 45 + Math.floor(Math.random() * 40);
    return {
      id: crypto.randomUUID(),
      username: `Trader${i+1}`,
      walletAddress: `0x${Math.random().toString(16).slice(2, 10)}...`,
      winRate,
      totalPredictions: preds,
      totalWinnings: Math.floor(preds * (winRate / 100) * (200 + Math.random() * 800)),
      rank: i + 1,
    };
  });
  entries.sort((a, b) => b.totalWinnings - a.totalWinnings);
  entries.forEach((e, i) => (e.rank = i + 1));
  save(LEADERBOARD_KEY, entries);
  return entries;
}

// --- Seed Demo Markets ---

function generateSparkline(yes: number, no: number): number[] {
  const total = yes + no;
  if (total === 0) return Array(15).fill(50);
  const finalPct = Math.round((yes / total) * 100);
  const points: number[] = [];
  let current = 50;
  for (let i = 0; i < 15; i++) {
    const progress = i / 14;
    const target = 50 + (finalPct - 50) * progress;
    current = target + (Math.random() - 0.5) * 15;
    points.push(Math.max(5, Math.min(95, Math.round(current))));
  }
  points[14] = finalPct;
  return points;
}

export async function seedDemoData() {
  const demos = [
    { q: "Will Bitcoin reach $200K by end of 2026?", cat: "crypto", yes: 15000, no: 8500 },
    { q: "Will Ethereum exceed $10K in 2026?", cat: "crypto", yes: 7200, no: 12300 },
    { q: "Will India win the Cricket World Cup 2027?", cat: "sports", yes: 14000, no: 11000 },
    { q: "Will AI achieve AGI by 2028?", cat: "technology", yes: 9800, no: 15500 },
  ];

  const markets: Market[] = demos.map((d) => ({
    id: crypto.randomUUID(),
    question: d.q,
    category: d.cat as MarketCategory,
    totalYes: d.yes,
    totalNo: d.no,
    createdAt: Date.now(),
    status: "active",
    sparklineData: generateSparkline(d.yes, d.no),
  }));

  save(MARKETS_KEY, markets);
}
