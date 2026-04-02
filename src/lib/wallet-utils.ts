export function shortenAddress(address?: string | null): string {
  if (!address || address.length < 10) return "Connect Wallet";
  if (address.startsWith("0x")) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  // Algorand address
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export function formatAddress(address?: string | null): string {
  return shortenAddress(address);
}
