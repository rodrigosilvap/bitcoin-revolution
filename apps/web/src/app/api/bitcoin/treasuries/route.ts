import { NextResponse } from 'next/server';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/companies/public_treasury/bitcoin';

export async function GET() {
  try {
    const res = await fetch(COINGECKO_URL, {
      next: { revalidate: 300 }, // cache for 5 minutes at the Next.js layer
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `CoinGecko error: ${res.status}` },
        { status: 502 },
      );
    }

    const raw = await res.json() as {
      total_holdings: number;
      total_value_usd: number;
      market_cap_dominance: number;
      companies: {
        name: string;
        symbol: string;
        country: string;
        total_holdings: number;
        total_entry_value_usd: number;
        total_current_value_usd: number;
        percentage_of_total_supply: number;
      }[];
    };

    const data = {
      totalHoldings: raw.total_holdings,
      totalValueUsd: raw.total_value_usd,
      marketCapDominance: raw.market_cap_dominance,
      fetchedAt: Date.now(),
      companies: raw.companies.map((c) => ({
        name: c.name,
        symbol: c.symbol,
        country: c.country,
        totalHoldings: c.total_holdings,
        totalEntryValueUsd: c.total_entry_value_usd,
        totalCurrentValueUsd: c.total_current_value_usd,
        percentageOfTotalSupply: c.percentage_of_total_supply,
      })),
    };

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch treasury data' },
      { status: 502 },
    );
  }
}
