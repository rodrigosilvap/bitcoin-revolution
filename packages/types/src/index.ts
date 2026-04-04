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
  prices: { timestamp: number; date: string; price: number }[];
  currency: string;
}

export interface BlockchainInfo {
  marketPrice: number;
  hashRate: number;
  totalFees?: number;
  numberOfTransactions?: number;
  numberOfBlocks: number;
  minutesBetweenBlocks: number;
  difficulty: number;
  nextRetarget: number;
  timestamp: number;
}
