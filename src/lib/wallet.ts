/**
 * Wallet Service — Simulates Web3 wallet connection
 * Future: Replace with ethers.js / wagmi for real MetaMask integration
 */

const WALLET_KEY = "zk_wallet";

export interface WalletState {
  connected: boolean;
  address: string;
  balance: number;
  chainId: number;
}

function generateAddress(): string {
  const chars = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * 16)];
  return addr;
}

function loadWallet(): WalletState | null {
  try {
    const stored = localStorage.getItem(WALLET_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveWallet(wallet: WalletState) {
  localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
}

export function getWallet(): WalletState | null {
  return loadWallet();
}

/**
 * Connect wallet — detect MetaMask or simulate
 * Future: Replace with window.ethereum request
 */
export async function connectWallet(): Promise<WalletState> {
  const existing = loadWallet();
  if (existing?.connected) return existing;

  let address: string;
  let chainId = 1;

  // Check for MetaMask
  if (typeof window !== "undefined" && (window as any).ethereum) {
    try {
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });
      address = accounts[0];
      const chainHex = await (window as any).ethereum.request({
        method: "eth_chainId",
      });
      chainId = parseInt(chainHex, 16);
    } catch {
      // MetaMask rejected — fall back to simulated
      address = generateAddress();
    }
  } else {
    // No MetaMask — simulate
    address = generateAddress();
  }

  const wallet: WalletState = {
    connected: true,
    address,
    balance: 10000,
    chainId,
  };
  saveWallet(wallet);
  return wallet;
}

export function disconnectWallet() {
  localStorage.removeItem(WALLET_KEY);
}

export function deductBalance(amount: number): boolean {
  const wallet = loadWallet();
  if (!wallet || !wallet.connected) return false;
  if (wallet.balance < amount) return false;
  wallet.balance -= amount;
  saveWallet(wallet);
  return true;
}

export function addBalance(amount: number) {
  const wallet = loadWallet();
  if (!wallet) return;
  wallet.balance += amount;
  saveWallet(wallet);
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
