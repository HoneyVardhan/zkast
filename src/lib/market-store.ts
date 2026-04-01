import { hashVote, generateZKProof } from "./zkProof";

export type MarketCategory = "crypto" | "sports" | "politics" | "technology";

export interface Market {
  id: string;
  question: string;
  category: MarketCategory;
  totalYes: number;
  totalNo: number;
  createdAt: number;
}

export interface Vote {
  id: string;
  marketId: string;
  hashedVote: string;
  zkProof: string;
  timestamp: number;
}

const MARKETS_KEY = "zk_markets";
const VOTES_KEY = "zk_votes";
const ACTIVITY_KEY = "zk_user_activity";

export interface UserActivity {
  recentlyViewed: string[];
  voteCount: number;
  lastActive: number;
}

function loadMarkets(): Market[] {
  try {
    return JSON.parse(localStorage.getItem(MARKETS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveMarkets(markets: Market[]) {
  localStorage.setItem(MARKETS_KEY, JSON.stringify(markets));
}

function loadVotes(): Vote[] {
  try {
    return JSON.parse(localStorage.getItem(VOTES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveVotes(votes: Vote[]) {
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}

export function getUserActivity(): UserActivity {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '{"recentlyViewed":[],"voteCount":0,"lastActive":0}');
  } catch {
    return { recentlyViewed: [], voteCount: 0, lastActive: 0 };
  }
}

function saveActivity(activity: UserActivity) {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
}

export function trackView(marketId: string) {
  const activity = getUserActivity();
  activity.recentlyViewed = [marketId, ...activity.recentlyViewed.filter(id => id !== marketId)].slice(0, 10);
  activity.lastActive = Date.now();
  saveActivity(activity);
}

export function getAllMarkets(): Market[] {
  return loadMarkets().sort((a, b) => b.createdAt - a.createdAt);
}

export function getTrendingMarkets(): Market[] {
  return loadMarkets()
    .sort((a, b) => (b.totalYes + b.totalNo) - (a.totalYes + a.totalNo))
    .slice(0, 3);
}

export function getMarketById(id: string): Market | undefined {
  return loadMarkets().find((m) => m.id === id);
}

export function createMarket(question: string, category: MarketCategory = "crypto"): Market {
  const markets = loadMarkets();
  const market: Market = {
    id: crypto.randomUUID(),
    question: question.trim(),
    category,
    totalYes: 0,
    totalNo: 0,
    createdAt: Date.now(),
  };
  markets.push(market);
  saveMarkets(markets);
  return market;
}

export function placeVote(marketId: string, vote: "YES" | "NO", amount: number): Vote {
  const markets = loadMarkets();
  const idx = markets.findIndex((m) => m.id === marketId);
  if (idx === -1) throw new Error("Market not found");

  const timestamp = Date.now();
  const hashedVote = hashVote(vote, amount, timestamp);
  const zkProof = generateZKProof(vote, amount, timestamp);

  if (vote === "YES") {
    markets[idx].totalYes += amount;
  } else {
    markets[idx].totalNo += amount;
  }
  saveMarkets(markets);

  const voteRecord: Vote = {
    id: crypto.randomUUID(),
    marketId,
    hashedVote,
    zkProof,
    timestamp,
  };
  const votes = loadVotes();
  votes.push(voteRecord);
  saveVotes(votes);

  // Track activity
  const activity = getUserActivity();
  activity.voteCount += 1;
  activity.lastActive = Date.now();
  saveActivity(activity);

  return voteRecord;
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

export function getMarketVotes(marketId: string): Vote[] {
  return loadVotes().filter(v => v.marketId === marketId);
}

export function seedDemoData() {
  if (loadMarkets().length > 0) return;
  const demos: { q: string; cat: MarketCategory; yes: number; no: number }[] = [
    { q: "Will Bitcoin reach $200K by end of 2026?", cat: "crypto", yes: 15000, no: 8500 },
    { q: "Will Ethereum transition to full sharding by 2027?", cat: "crypto", yes: 7200, no: 12300 },
    { q: "Will a major country adopt a CBDC in 2026?", cat: "crypto", yes: 22000, no: 5500 },
    { q: "Will AI agents trade autonomously on-chain by 2027?", cat: "technology", yes: 18000, no: 9000 },
    { q: "Will zero-knowledge proofs become standard in DeFi?", cat: "crypto", yes: 30000, no: 4200 },
    { q: "Will India win the Cricket World Cup 2027?", cat: "sports", yes: 14000, no: 11000 },
    { q: "Will AI replace 30% of jobs by 2030?", cat: "technology", yes: 25000, no: 19000 },
    { q: "Will the US pass federal crypto regulation in 2026?", cat: "politics", yes: 16500, no: 7800 },
    { q: "Will Solana flip Ethereum in TVL by 2027?", cat: "crypto", yes: 8900, no: 21000 },
    { q: "Will quantum computing break RSA encryption by 2030?", cat: "technology", yes: 5600, no: 28000 },
    { q: "Will a third party win a US state in 2028?", cat: "politics", yes: 3200, no: 31000 },
    { q: "Will Formula 1 add a race in Africa by 2028?", cat: "sports", yes: 9800, no: 6700 },
  ];
  const markets: Market[] = demos.map((d) => ({
    id: crypto.randomUUID(),
    question: d.q,
    category: d.cat,
    totalYes: d.yes,
    totalNo: d.no,
    createdAt: Date.now() - Math.random() * 86400000 * 14,
  }));
  saveMarkets(markets);
}
