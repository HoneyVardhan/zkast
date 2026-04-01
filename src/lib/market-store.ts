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

const MARKETS_KEY = "zk_markets";
const VOTES_KEY = "zk_votes";
const ACTIVITY_KEY = "zk_user_activity";
const PROFILE_KEY = "zk_user_profile";
const LEADERBOARD_KEY = "zk_leaderboard";

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

// Generate random wallet address
function generateWalletAddress(): string {
  const chars = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * 16)];
  return addr;
}

// Generate random username
function generateUsername(): string {
  const prefixes = ["Alpha", "Sigma", "Delta", "Omega", "Zen", "Neo", "Flux", "Apex", "Nova", "Vex"];
  const suffixes = ["Trader", "Whale", "Degen", "Sage", "Wolf", "Bull", "Bear", "Hawk", "Fox", "Ape"];
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
}

export function getUserProfile(): UserProfile {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const profile: UserProfile = {
    id: crypto.randomUUID(),
    username: generateUsername(),
    walletAddress: generateWalletAddress(),
    totalPredictions: 0,
    wins: 0,
    losses: 0,
    totalVolume: 0,
    predictions: [],
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

function saveProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function updateUsername(name: string) {
  const profile = getUserProfile();
  profile.username = name.trim() || profile.username;
  saveProfile(profile);
}

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return seedLeaderboard();
}

function seedLeaderboard(): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = Array.from({ length: 15 }, (_, i) => {
    const preds = 50 + Math.floor(Math.random() * 200);
    const winRate = 45 + Math.floor(Math.random() * 40);
    return {
      id: crypto.randomUUID(),
      username: generateUsername(),
      walletAddress: generateWalletAddress(),
      winRate,
      totalPredictions: preds,
      totalWinnings: Math.floor(preds * (winRate / 100) * (200 + Math.random() * 800)),
      rank: 0,
    };
  });
  entries.sort((a, b) => b.totalWinnings - a.totalWinnings);
  entries.forEach((e, i) => (e.rank = i + 1));
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  return entries;
}

export function getAllMarkets(): Market[] {
  return loadMarkets().sort((a, b) => b.createdAt - a.createdAt);
}

export function getTrendingMarkets(): Market[] {
  return loadMarkets()
    .filter(m => m.status === "active")
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
    status: "active",
    sparklineData: [50, 50, 50, 50, 50],
  };
  markets.push(market);
  saveMarkets(markets);
  return market;
}

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
  // Update sparkline
  const m = markets[idx];
  const newPct = Math.round((m.totalYes / (m.totalYes + m.totalNo)) * 100);
  markets[idx].sparklineData = [...m.sparklineData.slice(-14), newPct];
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

  // Track activity & profile
  const activity = getUserActivity();
  activity.voteCount += 1;
  activity.lastActive = Date.now();
  saveActivity(activity);

  const profile = getUserProfile();
  profile.totalPredictions += 1;
  profile.totalVolume += amount;
  const market = markets[idx];
  // Simulate win/loss for resolved markets
  const result: "pending" | "win" | "loss" = market.status === "resolved"
    ? (market.resolvedOutcome === vote ? "win" : "loss")
    : "pending";
  if (result === "win") profile.wins += 1;
  if (result === "loss") profile.losses += 1;
  profile.predictions.unshift({
    marketId,
    marketQuestion: market.question,
    vote,
    amount,
    timestamp,
    result,
  });
  saveProfile(profile);

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
  const markets: Market[] = demos.map((d) => ({
    id: crypto.randomUUID(),
    question: d.q,
    category: d.cat,
    totalYes: d.yes,
    totalNo: d.no,
    createdAt: Date.now() - Math.random() * 86400000 * 30,
    status: d.resolved ? "resolved" as MarketStatus : "active" as MarketStatus,
    resolvedOutcome: d.outcome,
    sparklineData: generateSparkline(d.yes, d.no),
  }));
  saveMarkets(markets);
}
