import { cache } from '../cache.js';

const SHARES_Q_KEY = 'edgar-shares-quarterly';
const SHARES_A_KEY = 'edgar-shares-annual';
const TICKERS_KEY = 'sec-tickers';
const DAY_TTL = 86_400; // 24 hours

type CikSharesMap = Record<number, number>;
type TickerCikMap = Record<string, number>;

async function fetchEdgarFrame(frameId: string, tag: string): Promise<CikSharesMap> {
  const url = `https://data.sec.gov/api/xbrl/frames/us-gaap/${tag}/shares/${frameId}.json`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'bitcoin-revolution/1.0 contact@bitcoin-revolution.io' },
  });
  if (!res.ok) return {};
  const data = await res.json() as { data: Array<{ cik: number; val: number }> };
  const map: CikSharesMap = {};
  for (const row of data.data) {
    map[row.cik] = row.val;
  }
  return map;
}

async function getSharesMap(): Promise<CikSharesMap> {
  const quarterly = cache.get<CikSharesMap>(SHARES_Q_KEY);
  const annual = cache.get<CikSharesMap>(SHARES_A_KEY);
  if (quarterly && annual) return { ...annual, ...quarterly };

  // Fetch in parallel: quarterly CommonStockSharesOutstanding + annual WeightedAverage fallback
  const [qMap, aMap] = await Promise.all([
    fetchEdgarFrame('CY2025Q4I', 'CommonStockSharesOutstanding').catch(() => ({} as CikSharesMap)),
    fetchEdgarFrame('CY2025', 'WeightedAverageNumberOfSharesOutstandingBasic').catch(() => ({} as CikSharesMap)),
  ]);

  cache.set(SHARES_Q_KEY, qMap, DAY_TTL);
  cache.set(SHARES_A_KEY, aMap, DAY_TTL);
  return { ...aMap, ...qMap }; // quarterly takes precedence
}

async function getTickerCikMap(): Promise<TickerCikMap> {
  const cached = cache.get<TickerCikMap>(TICKERS_KEY);
  if (cached) return cached;

  const res = await fetch('https://www.sec.gov/files/company_tickers.json', {
    headers: { 'User-Agent': 'bitcoin-revolution/1.0 contact@bitcoin-revolution.io' },
  });
  if (!res.ok) return {};

  const data = await res.json() as Record<string, { cik_str: number; ticker: string }>;
  const map: TickerCikMap = {};
  for (const entry of Object.values(data)) {
    map[entry.ticker.toUpperCase()] = entry.cik_str;
  }
  cache.set(TICKERS_KEY, map, DAY_TTL);
  return map;
}

async function fetchPrice(ticker: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
    );
    if (!res.ok) return null;
    const d = await res.json() as {
      chart: { result?: Array<{ meta: { regularMarketPrice: number } }> };
    };
    return d.chart?.result?.[0]?.meta?.regularMarketPrice ?? null;
  } catch {
    return null;
  }
}

/** Converts CoinGecko symbol format (e.g. "MSTR.US") to a bare US ticker or null for non-US stocks */
function toUsTicker(geckoSymbol: string): string | null {
  const parts = geckoSymbol.split('.');
  if (parts.length < 2) return null;
  if (parts[parts.length - 1] === 'US') return parts[0].toUpperCase();
  return null;
}

/**
 * Given a list of CoinGecko company symbols, fetches live stock market caps
 * (price × shares outstanding) for US-listed companies using Yahoo Finance + SEC EDGAR.
 * Returns a map of geckoSymbol → market cap USD.
 */
export async function fetchMarketCaps(symbols: string[]): Promise<Record<string, number>> {
  const symbolTickerPairs = symbols
    .map(s => ({ symbol: s, ticker: toUsTicker(s) }))
    .filter((x): x is { symbol: string; ticker: string } => x.ticker !== null);

  if (symbolTickerPairs.length === 0) return {};

  const uniqueTickers = [...new Set(symbolTickerPairs.map(x => x.ticker))];

  const [[sharesMap, tickerCikMap], prices] = await Promise.all([
    Promise.all([getSharesMap(), getTickerCikMap()]),
    Promise.allSettled(uniqueTickers.map(fetchPrice)).then(results => {
      const m: Record<string, number> = {};
      uniqueTickers.forEach((t, i) => {
        const r = results[i];
        if (r.status === 'fulfilled' && r.value != null) m[t] = r.value;
      });
      return m;
    }),
  ]);

  const result: Record<string, number> = {};
  for (const { symbol, ticker } of symbolTickerPairs) {
    const price = prices[ticker];
    if (price == null) continue;
    const cik = tickerCikMap[ticker];
    if (cik == null) continue;
    const shares = sharesMap[cik];
    if (shares == null) continue;
    result[symbol] = price * shares;
  }
  return result;
}
