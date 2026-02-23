export function formatPrice(price: number): string {
  if (price >= 1e9) return `$${(price / 1e9).toFixed(2)}B`;
  if (price >= 1e6) return `$${(price / 1e6).toFixed(2)}M`;
  if (price >= 1e3) return `$${(price / 1e3).toFixed(2)}K`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toExponential(2)}`;
}

export function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
  if (cap >= 1e3) return `$${(cap / 1e3).toFixed(2)}K`;
  return `$${cap.toFixed(0)}`;
}
