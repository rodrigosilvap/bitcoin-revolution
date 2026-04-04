export interface PriceData {
  price: number;
  currency: string;
  change24h: number;
  lastUpdated: number;
}

export interface MarketData {
  currentPrice: { usd: number; eur: number };
  marketCap: { usd: number };
  totalVolume: { usd: number };
  priceChange24h: { percentage: number; usd: number };
  high24h: { usd: number };
  low24h: { usd: number };
  lastUpdated: string;
}

export interface PriceHistory {
  prices: { timestamp: number; date: Date; price: number }[];
  currency: string;
}

export interface BlockchainInfo {
  marketPrice: number;
  hashRate: number;
  numberOfBlocks: number;
  minutesBetweenBlocks: number;
  difficulty: number;
  nextRetarget: number;
  timestamp: number;
}

const BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

export async function fetchBitcoinPrice(currency = 'USD'): Promise<PriceData> {
  return apiFetch<PriceData>(`${BASE}/bitcoin/price?currency=${currency}`);
}

export async function fetchBitcoinPrices(
  currencies: string[],
): Promise<Record<string, PriceData>> {
  return apiFetch<Record<string, PriceData>>(
    `${BASE}/bitcoin/price?currencies=${currencies.join(',')}`,
  );
}

export async function fetchMarketData(): Promise<MarketData> {
  return apiFetch<MarketData>(`${BASE}/bitcoin/market-data`);
}

export async function fetchPriceHistory(days: string, currency = 'USD'): Promise<PriceHistory> {
  return apiFetch<PriceHistory>(
    `${BASE}/bitcoin/price-history?days=${days}&currency=${currency}`,
  );
}

export async function fetchBlockchainInfo(): Promise<BlockchainInfo> {
  return apiFetch<BlockchainInfo>(`${BASE}/bitcoin/blockchain-info`);
}
