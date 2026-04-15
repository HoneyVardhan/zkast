export function shortenAddress(address?: string | null | any): string {
  if (typeof address !== "string" || address.length < 10) {
    return "Connect Wallet";
  }
  
  try {
    // Standard Algorand address shortening (6...6)
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  } catch (e) {
    console.error("Error formatting address:", e);
    return "Connect Wallet";
  }
}

export function formatAddress(address?: string | null | any): string {
  return shortenAddress(address);
}
