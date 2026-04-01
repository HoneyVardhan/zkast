/**
 * Market Store — Supabase-backed persistence layer
 * Future: Replace with smart contract interactions
 */

import { supabase } from "@/integrations/supabase/client";
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

export interface UserActivity {
  recentlyViewed: string[];
  voteCount: number;
  lastActive: number;
}

// --- Helpers to convert DB rows to app types ---

function dbToMarket(row: any): Market {
  return {
    id: row.id,
    question: row.question,
    category: row.category as MarketCategory,
    totalYes: row.total_yes,
    totalNo: row.total_no,
    createdAt: new Date(row.created_at).getTime(),
    status: row.status as MarketStatus,
    resolvedOutcome: row.resolved_outcome as "YES" | "NO" | undefined,
    sparklineData: Array.isArray(row.sparkline_data) ? row.sparkline_data : JSON.parse(row.sparkline_data || "[]"),
  };
}

// --- Markets ---

export async function getAllMarkets(): Promise<Market[]> {
  const { data, error } = await supabase
    .from("markets")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load markets:", error);
    return [];
  }
  return (data || []).map(dbToMarket);
}

export async function getTrendingMarkets(): Promise<Market[]> {
  const { data, error } = await supabase
    .from("markets")
    .select("*")
    .eq("status", "active")
    .order("total_yes", { ascending: false })
    .limit(3);
  if (error) return [];
  return (data || []).map(dbToMarket);
}

export async function getMarketById(id: string): Promise<Market | undefined> {
  const { data, error } = await supabase
    .from("markets")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return undefined;
  return dbToMarket(data);
}

export async function createMarket(question: string, category: MarketCategory = "crypto"): Promise<Market> {
  const sparkline = [50, 50, 50, 50, 50];
  const { data, error } = await supabase
    .from("markets")
    .insert({
      question: question.trim(),
      category,
      sparkline_data: sparkline,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return dbToMarket(data);
}

export async function placeVote(marketId: string, vote: "YES" | "NO", amount: number): Promise<Vote> {
  const timestamp = Date.now();
  const hashedVote = hashVote(vote, amount, timestamp);
  const zkProof = generateZKProof(vote, amount, timestamp);

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in to vote");

  // Insert vote
  const { data: voteData, error: voteError } = await supabase
    .from("votes")
    .insert({
      market_id: marketId,
      user_id: user.id,
      hashed_vote: hashedVote,
      zk_proof: zkProof,
      vote_direction: vote,
      amount,
    })
    .select()
    .single();
  if (voteError) throw new Error(voteError.message);

  // Update market totals
  const market = await getMarketById(marketId);
  if (!market) throw new Error("Market not found");

  const newYes = vote === "YES" ? market.totalYes + amount : market.totalYes;
  const newNo = vote === "NO" ? market.totalNo + amount : market.totalNo;
  const newPct = Math.round((newYes / (newYes + newNo)) * 100);
  const newSparkline = [...market.sparklineData.slice(-14), newPct];

  await supabase
    .from("markets")
    .update({
      total_yes: newYes,
      total_no: newNo,
      sparkline_data: newSparkline,
    })
    .eq("id", marketId);

  // Update profile
  await supabase
    .from("profiles")
    .update({
      total_predictions: (await getProfileStats(user.id)).totalPredictions + 1,
      total_volume: (await getProfileStats(user.id)).totalVolume + amount,
    })
    .eq("user_id", user.id);

  return {
    id: voteData.id,
    marketId: voteData.market_id,
    hashedVote: voteData.hashed_vote,
    zkProof: voteData.zk_proof,
    timestamp: new Date(voteData.created_at).getTime(),
  };
}

async function getProfileStats(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("total_predictions, total_volume")
    .eq("user_id", userId)
    .maybeSingle();
  return {
    totalPredictions: data?.total_predictions || 0,
    totalVolume: data?.total_volume || 0,
  };
}

// --- Percentages ---

export function getMarketPercentages(market: Market) {
  const total = market.totalYes + market.totalNo;
  if (total === 0) return { yes: 50, no: 50, total: 0 };
  return {
    yes: Math.round((market.totalYes / total) * 100),
    no: Math.round((market.totalNo / total) * 100),
    total,
  };
}

export async function getMarketVotes(marketId: string): Promise<Vote[]> {
  const { data, error } = await supabase
    .from("votes")
    .select("*")
    .eq("market_id", marketId);
  if (error) return [];
  return (data || []).map((v) => ({
    id: v.id,
    marketId: v.market_id,
    hashedVote: v.hashed_vote,
    zkProof: v.zk_proof,
    timestamp: new Date(v.created_at).getTime(),
  }));
}

// --- User Activity (still localStorage for lightweight tracking) ---

const ACTIVITY_KEY = "zk_user_activity";

export function getUserActivity(): UserActivity {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '{"recentlyViewed":[],"voteCount":0,"lastActive":0}');
  } catch {
    return { recentlyViewed: [], voteCount: 0, lastActive: 0 };
  }
}

export function trackView(marketId: string) {
  const activity = getUserActivity();
  activity.recentlyViewed = [marketId, ...activity.recentlyViewed.filter(id => id !== marketId)].slice(0, 10);
  activity.lastActive = Date.now();
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
}

// --- User Profile ---

export async function getUserProfile(): Promise<UserProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      id: "",
      userId: "",
      username: "Guest",
      walletAddress: "",
      totalPredictions: 0,
      wins: 0,
      losses: 0,
      totalVolume: 0,
      predictions: [],
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Get user's vote history
  const { data: votes } = await supabase
    .from("votes")
    .select("*, markets(question, status, resolved_outcome)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const predictions: UserPrediction[] = (votes || []).map((v: any) => {
    const market = v.markets;
    const result: "win" | "loss" | "pending" =
      market?.status === "resolved"
        ? market.resolved_outcome === v.vote_direction ? "win" : "loss"
        : "pending";
    return {
      marketId: v.market_id,
      marketQuestion: market?.question || "Unknown",
      vote: v.vote_direction as "YES" | "NO",
      amount: v.amount,
      timestamp: new Date(v.created_at).getTime(),
      result,
    };
  });

  return {
    id: profile?.id || "",
    userId: user.id,
    username: profile?.username || "User",
    walletAddress: profile?.wallet_address || "",
    totalPredictions: profile?.total_predictions || 0,
    wins: profile?.wins || 0,
    losses: profile?.losses || 0,
    totalVolume: profile?.total_volume || 0,
    predictions,
  };
}

export async function updateUsername(name: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("profiles")
    .update({ username: name.trim() })
    .eq("user_id", user.id);
}

// --- Leaderboard ---

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("leaderboard_entries")
    .select("*")
    .order("total_winnings", { ascending: false })
    .limit(15);
  if (error || !data || data.length === 0) {
    // Seed if empty
    return await seedLeaderboard();
  }
  return data.map((e) => ({
    id: e.id,
    username: e.username,
    walletAddress: e.wallet_address,
    winRate: e.win_rate,
    totalPredictions: e.total_predictions,
    totalWinnings: e.total_winnings,
    rank: e.rank,
  }));
}

function generateWalletAddress(): string {
  const chars = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * 16)];
  return addr;
}

function generateUsername(): string {
  const prefixes = ["Alpha", "Sigma", "Delta", "Omega", "Zen", "Neo", "Flux", "Apex", "Nova", "Vex"];
  const suffixes = ["Trader", "Whale", "Degen", "Sage", "Wolf", "Bull", "Bear", "Hawk", "Fox", "Ape"];
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
}

async function seedLeaderboard(): Promise<LeaderboardEntry[]> {
  const entries = Array.from({ length: 15 }, (_, i) => {
    const preds = 50 + Math.floor(Math.random() * 200);
    const winRate = 45 + Math.floor(Math.random() * 40);
    return {
      username: generateUsername(),
      wallet_address: generateWalletAddress(),
      win_rate: winRate,
      total_predictions: preds,
      total_winnings: Math.floor(preds * (winRate / 100) * (200 + Math.random() * 800)),
      rank: i + 1,
    };
  });
  entries.sort((a, b) => b.total_winnings - a.total_winnings);
  entries.forEach((e, i) => (e.rank = i + 1));

  const { data, error } = await supabase
    .from("leaderboard_entries")
    .insert(entries)
    .select();

  if (error || !data) {
    return entries.map((e, i) => ({
      id: crypto.randomUUID(),
      username: e.username,
      walletAddress: e.wallet_address,
      winRate: e.win_rate,
      totalPredictions: e.total_predictions,
      totalWinnings: e.total_winnings,
      rank: e.rank,
    }));
  }

  return data.map((e) => ({
    id: e.id,
    username: e.username,
    walletAddress: e.wallet_address,
    winRate: e.win_rate,
    totalPredictions: e.total_predictions,
    totalWinnings: e.total_winnings,
    rank: e.rank,
  }));
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
  // Check if already seeded
  const { count } = await supabase
    .from("markets")
    .select("*", { count: "exact", head: true });
  if (count && count > 0) return;

  const demos: { q: string; cat: MarketCategory; yes: number; no: number; resolved?: boolean; outcome?: "YES" | "NO" }[] = [
    // CRYPTO (22)
    { q: "Will Bitcoin reach $200K by end of 2026?", cat: "crypto", yes: 15000, no: 8500 },
    { q: "Will Ethereum transition to full sharding by 2027?", cat: "crypto", yes: 7200, no: 12300 },
    { q: "Will a major country adopt a CBDC in 2026?", cat: "crypto", yes: 22000, no: 5500, resolved: true, outcome: "YES" },
    { q: "Will zero-knowledge proofs become standard in DeFi?", cat: "crypto", yes: 30000, no: 4200 },
    { q: "Will Solana flip Ethereum in TVL by 2027?", cat: "crypto", yes: 8900, no: 21000 },
    { q: "Will Bitcoin dominance exceed 60% in 2026?", cat: "crypto", yes: 11000, no: 14000, resolved: true, outcome: "NO" },
    { q: "Will Ethereum hit $10K before 2028?", cat: "crypto", yes: 18500, no: 9200 },
    { q: "Will stablecoins surpass $500B market cap?", cat: "crypto", yes: 24000, no: 6800 },
    { q: "Will a DEX surpass Coinbase in daily volume?", cat: "crypto", yes: 5600, no: 19000 },
    { q: "Will NFTs make a major comeback in 2026?", cat: "crypto", yes: 8200, no: 17500 },
    { q: "Will Cardano launch a viral DeFi protocol?", cat: "crypto", yes: 4500, no: 22000 },
    { q: "Will crypto total market cap hit $10T?", cat: "crypto", yes: 13000, no: 11000 },
    { q: "Will Binance regain US market access?", cat: "crypto", yes: 6700, no: 20000 },
    { q: "Will a Bitcoin ETF reach $100B AUM?", cat: "crypto", yes: 19000, no: 7500 },
    { q: "Will Layer 2 fees drop below $0.001?", cat: "crypto", yes: 25000, no: 3200, resolved: true, outcome: "YES" },
    { q: "Will MakerDAO rebrand successfully as Sky?", cat: "crypto", yes: 7800, no: 15000 },
    { q: "Will a DAO manage a Fortune 500 company?", cat: "crypto", yes: 2100, no: 28000 },
    { q: "Will crypto regulation increase globally in 2026?", cat: "crypto", yes: 27000, no: 4000 },
    { q: "Will Ripple win all remaining SEC appeals?", cat: "crypto", yes: 16000, no: 9500 },
    { q: "Will a privacy coin get banned in the EU?", cat: "crypto", yes: 14000, no: 12000 },
    { q: "Will DeFi insurance protocols go mainstream?", cat: "crypto", yes: 9800, no: 13500 },
    { q: "Will Bitcoin mining become carbon neutral by 2030?", cat: "crypto", yes: 11500, no: 16000 },
    // SPORTS (21)
    { q: "Will India win the Cricket World Cup 2027?", cat: "sports", yes: 14000, no: 11000 },
    { q: "Will Formula 1 add a race in Africa by 2028?", cat: "sports", yes: 9800, no: 6700 },
    { q: "Will Messi win another Ballon d'Or?", cat: "sports", yes: 5200, no: 24000, resolved: true, outcome: "NO" },
    { q: "Will IPL expand to 12 teams by 2027?", cat: "sports", yes: 18000, no: 7500 },
    { q: "Will the US win the FIFA World Cup 2026?", cat: "sports", yes: 4800, no: 26000 },
    { q: "Will Usain Bolt's 100m record be broken by 2028?", cat: "sports", yes: 7600, no: 19000 },
    { q: "Will esports be in the 2028 Olympics?", cat: "sports", yes: 15500, no: 10500 },
    { q: "Will LeBron James play until age 42?", cat: "sports", yes: 8900, no: 17000 },
    { q: "Will a female fighter headline a UFC PPV in 2026?", cat: "sports", yes: 20000, no: 6000 },
    { q: "Will Premier League have a $10B TV deal?", cat: "sports", yes: 22000, no: 5500, resolved: true, outcome: "YES" },
    { q: "Will Roger Federer return to competitive tennis?", cat: "sports", yes: 1500, no: 31000 },
    { q: "Will the NBA expand to 32 teams by 2028?", cat: "sports", yes: 16000, no: 8000 },
    { q: "Will cricket be added to the 2032 Olympics?", cat: "sports", yes: 21000, no: 7000 },
    { q: "Will a sub-2hr marathon be officially ratified?", cat: "sports", yes: 12000, no: 14000 },
    { q: "Will Saudi Arabia host the 2034 World Cup?", cat: "sports", yes: 25000, no: 3000 },
    { q: "Will women's football match men's viewership?", cat: "sports", yes: 6800, no: 18000 },
    { q: "Will a new F1 team join the grid by 2027?", cat: "sports", yes: 19000, no: 8500 },
    { q: "Will the NFL expand to Europe by 2030?", cat: "sports", yes: 11000, no: 15500 },
    { q: "Will Virat Kohli retire before 2027?", cat: "sports", yes: 13500, no: 12000 },
    { q: "Will MMA overtake boxing in global revenue?", cat: "sports", yes: 17000, no: 9000 },
    { q: "Will a robot compete in an Olympic sport by 2036?", cat: "sports", yes: 3200, no: 27000 },
    // POLITICS (21)
    { q: "Will the US pass federal crypto regulation in 2026?", cat: "politics", yes: 16500, no: 7800 },
    { q: "Will a third party win a US state in 2028?", cat: "politics", yes: 3200, no: 31000 },
    { q: "Will a new global alliance form by 2030?", cat: "politics", yes: 8000, no: 18000 },
    { q: "Will AI regulation laws pass in the EU by 2027?", cat: "politics", yes: 26000, no: 4500, resolved: true, outcome: "YES" },
    { q: "Will the UN reform its Security Council by 2030?", cat: "politics", yes: 5500, no: 22000 },
    { q: "Will any country leave the EU by 2028?", cat: "politics", yes: 4200, no: 25000 },
    { q: "Will China reunify with Taiwan peacefully?", cat: "politics", yes: 6000, no: 21000 },
    { q: "Will a universal basic income pass in a G7 nation?", cat: "politics", yes: 9500, no: 16000 },
    { q: "Will the US rejoin the Paris Agreement?", cat: "politics", yes: 14000, no: 11000 },
    { q: "Will India become a permanent UN Security Council member?", cat: "politics", yes: 7800, no: 19000 },
    { q: "Will global defense spending exceed $3T in 2026?", cat: "politics", yes: 23000, no: 5000 },
    { q: "Will a woman become US President by 2030?", cat: "politics", yes: 12000, no: 14500 },
    { q: "Will Scotland hold another independence referendum?", cat: "politics", yes: 10500, no: 13000 },
    { q: "Will cannabis be federally legal in the US by 2028?", cat: "politics", yes: 17500, no: 8000 },
    { q: "Will BRICS surpass G7 in combined GDP?", cat: "politics", yes: 15000, no: 11500 },
    { q: "Will a global carbon tax be implemented?", cat: "politics", yes: 4000, no: 24000 },
    { q: "Will space governance treaties be signed by 2030?", cat: "politics", yes: 8500, no: 17000 },
    { q: "Will voter turnout exceed 70% in a US presidential election?", cat: "politics", yes: 6500, no: 20000 },
    { q: "Will the WHO gain enforcement powers?", cat: "politics", yes: 3800, no: 26000 },
    { q: "Will digital IDs become mandatory in any G7 country?", cat: "politics", yes: 19000, no: 7000, resolved: true, outcome: "NO" },
    { q: "Will autonomous weapons be banned by treaty?", cat: "politics", yes: 5000, no: 23000 },
    // TECHNOLOGY (22)
    { q: "Will AI agents trade autonomously on-chain by 2027?", cat: "technology", yes: 18000, no: 9000 },
    { q: "Will AI replace 30% of jobs by 2030?", cat: "technology", yes: 25000, no: 19000 },
    { q: "Will quantum computing break RSA encryption by 2030?", cat: "technology", yes: 5600, no: 28000 },
    { q: "Will AGI be achieved before 2040?", cat: "technology", yes: 14000, no: 16000 },
    { q: "Will self-driving cars be fully legal in 10+ countries?", cat: "technology", yes: 21000, no: 7500, resolved: true, outcome: "YES" },
    { q: "Will brain-computer interfaces go consumer by 2030?", cat: "technology", yes: 11000, no: 15000 },
    { q: "Will 6G networks launch commercially by 2030?", cat: "technology", yes: 17000, no: 9500 },
    { q: "Will humanoid robots be sold for under $20K?", cat: "technology", yes: 8000, no: 19000 },
    { q: "Will fusion energy produce net power by 2035?", cat: "technology", yes: 13000, no: 14000 },
    { q: "Will Apple release AR glasses by 2027?", cat: "technology", yes: 22000, no: 6000 },
    { q: "Will AI-generated content exceed human content online?", cat: "technology", yes: 27000, no: 4500 },
    { q: "Will a tech company hit $5T market cap?", cat: "technology", yes: 20000, no: 8000 },
    { q: "Will coding jobs decline by 50% due to AI?", cat: "technology", yes: 9500, no: 18000 },
    { q: "Will lab-grown meat reach price parity by 2028?", cat: "technology", yes: 7200, no: 20000 },
    { q: "Will solid-state batteries dominate EVs by 2030?", cat: "technology", yes: 16000, no: 10000 },
    { q: "Will open-source AI models outperform closed ones?", cat: "technology", yes: 19500, no: 8500 },
    { q: "Will a major social media platform be decentralized?", cat: "technology", yes: 6500, no: 21000 },
    { q: "Will AI pass the Turing test convincingly by 2027?", cat: "technology", yes: 23000, no: 5500, resolved: true, outcome: "YES" },
    { q: "Will 3D-printed houses become mainstream?", cat: "technology", yes: 10000, no: 16500 },
    { q: "Will personal AI assistants replace smartphones?", cat: "technology", yes: 12500, no: 14500 },
    { q: "Will vertical farming supply 10% of US produce?", cat: "technology", yes: 4800, no: 23000 },
    { q: "Will quantum internet prototypes go live by 2030?", cat: "technology", yes: 8500, no: 18000 },
  ];

  const rows = demos.map((d) => ({
    question: d.q,
    category: d.cat,
    total_yes: d.yes,
    total_no: d.no,
    status: d.resolved ? "resolved" : "active",
    resolved_outcome: d.outcome || null,
    sparkline_data: generateSparkline(d.yes, d.no),
  }));

  await supabase.from("markets").insert(rows);
}
