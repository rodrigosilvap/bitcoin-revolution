export type NewsCategory = 'news' | 'analysis' | 'technical' | 'regulation';

export interface NewsSource {
  id: string;
  name: string;
  category: NewsCategory;
  rssUrl: string;
  siteUrl: string;
  /**
   * When true the source is Bitcoin-focused and items are not title-filtered.
   * When false (default) only items whose title mentions Bitcoin are kept.
   */
  bitcoinOnly?: boolean;
}

export const DEFAULT_SOURCES: NewsSource[] = [
  // ── Bitcoin-focused publications (no title filter needed) ────────────────
  { id: 'bitcoin-magazine', name: 'Bitcoin Magazine', category: 'news',     rssUrl: 'https://bitcoinmagazine.com/.rss/full/',  siteUrl: 'https://bitcoinmagazine.com', bitcoinOnly: true  },
  { id: 'bitcoinist',       name: 'Bitcoinist',       category: 'news',     rssUrl: 'https://bitcoinist.com/feed/',            siteUrl: 'https://bitcoinist.com',       bitcoinOnly: true  },
  { id: 'newsbtc',          name: 'NewsBTC',          category: 'news',     rssUrl: 'https://www.newsbtc.com/feed/',           siteUrl: 'https://newsbtc.com',          bitcoinOnly: true  },

  // ── Broad crypto sources – Bitcoin keyword filter applied ────────────────
  { id: 'coindesk',         name: 'CoinDesk',         category: 'news',     rssUrl: 'https://feeds.feedburner.com/CoinDesk',   siteUrl: 'https://coindesk.com'          },
  { id: 'cointelegraph',    name: 'Cointelegraph',    category: 'news',     rssUrl: 'https://cointelegraph.com/rss',           siteUrl: 'https://cointelegraph.com'     },
  { id: 'theblock',         name: 'The Block',        category: 'analysis', rssUrl: 'https://www.theblock.co/rss.xml',         siteUrl: 'https://theblock.co'           },
];

export const CSV_HEADER = 'name,category,rssUrl,siteUrl';

export function exportSourcesCsv(sources: NewsSource[] = DEFAULT_SOURCES): string {
  const rows = sources.map(s =>
    [s.name, s.category, s.rssUrl, s.siteUrl]
      .map(v => `"${v.replace(/"/g, '""')}"`)
      .join(',')
  );
  return [CSV_HEADER, ...rows].join('\n');
}

/** Convert a Google Sheets share URL to a CSV export URL */
export function sheetsShareToCsvUrl(shareUrl: string): string | null {
  const match = shareUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) return null;
  return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
}

/** Parse CSV text (from Google Sheets export) into NewsSource entries */
export function parseCsvSources(csv: string): NewsSource[] {
  const lines = csv.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];

  // Detect header row
  const header = lines[0].toLowerCase();
  const startIdx = header.includes('rssurl') || header.includes('rss') ? 1 : 0;

  const VALID_CATEGORIES = new Set<string>(['news', 'analysis', 'technical', 'regulation']);

  return lines.slice(startIdx).flatMap((line, i) => {
    // Naive CSV parse (handles quoted fields)
    const cols: string[] = [];
    let cur = '', inQ = false;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    cols.push(cur.trim());

    const [name, category, rssUrl, siteUrl] = cols;
    if (!name || !rssUrl) return [];
    const cat = (category ?? 'news').toLowerCase();
    return [{
      id: `custom-${i}`,
      name,
      category: VALID_CATEGORIES.has(cat) ? (cat as NewsCategory) : 'news',
      rssUrl,
      siteUrl: siteUrl ?? '',
      // Custom sources default to filtered — safer assumption
      bitcoinOnly: false,
    }];
  });
}
