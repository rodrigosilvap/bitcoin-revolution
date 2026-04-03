import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://blockchain.info/stats?format=json', {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`Blockchain.info error: ${res.status}`);

    const data = await res.json();

    return NextResponse.json({
      marketPrice: data.market_price_usd,
      hashRate: data.hash_rate,
      totalFees: data.total_fees_btc,
      numberOfTransactions: data.n_tx,
      numberOfBlocks: data.n_blocks_total,
      minutesBetweenBlocks: data.minutes_between_blocks,
      nextRetarget: data.nextretarget,
      difficulty: data.difficulty,
      timestamp: (data.timestamp ?? 0) * 1000,
    });
  } catch (error) {
    console.error('[/api/bitcoin/blockchain-info]', error);
    return NextResponse.json({ error: 'Failed to fetch blockchain info' }, { status: 502 });
  }
}
