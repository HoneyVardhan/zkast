import { hashVote, generateZKProof } from "./zkProof";

export interface Market {
  id: string;
  question: string;
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

export function createMarket(question: string): Market {
  const markets = loadMarkets();
  const market: Market = {
    id: crypto.randomUUID(),
    question: question.trim(),
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

  // Update aggregated totals only
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

// Seed demo data if empty
export function seedDemoData() {
  if (loadMarkets().length > 0) return;
  const demos = [
    { q: "Will Bitcoin reach $200K by end of 2026?", yes: 15000, no: 8500 },
    { q: "Will Ethereum transition to full sharding by 2027?", yes: 7200, no: 12300 },
    { q: "Will a major country adopt a CBDC in 2026?", yes: 22000, no: 5500 },
    { q: "Will AI agents trade autonomously on-chain by 2027?", yes: 18000, no: 9000 },
    { q: "Will zero-knowledge proofs become standard in DeFi?", yes: 30000, no: 4200 },
  ];
  const markets: Market[] = demos.map((d) => ({
    id: crypto.randomUUID(),
    question: d.q,
    totalYes: d.yes,
    totalNo: d.no,
    createdAt: Date.now() - Math.random() * 86400000 * 7,
  }));
  saveMarkets(markets);
}
