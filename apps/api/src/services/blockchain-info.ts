import type { BlockchainInfo } from '@seventy-capital/types';

export async function fetchBlockchainInfo(): Promise<BlockchainInfo> {
  const res = await fetch('https://blockchain.info/stats?format=json');
  if (!res.ok) throw new Error(`Blockchain.info error: ${res.status}`);
  const data = await res.json() as Record<string, number>;

  return {
    marketPrice: data['market_price_usd'],
    hashRate: data['hash_rate'],
    totalFees: data['total_fees_btc'],
    numberOfTransactions: data['n_tx'],
    numberOfBlocks: data['n_blocks_total'],
    minutesBetweenBlocks: data['minutes_between_blocks'],
    nextRetarget: data['nextretarget'],
    difficulty: data['difficulty'],
    timestamp: (data['timestamp'] ?? 0) * 1000,
  };
}
