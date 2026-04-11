export type NewsCategory = 'news' | 'analysis' | 'technical' | 'regulation';

export interface NewsSource {
  id: string;
  name: string;
  category: NewsCategory;
  rssUrl: string;
  siteUrl: string;
}

export const DEFAULT_SOURCES: NewsSource[] = [
  { id: 'bitcoin-magazine', name: 'Bitcoin Magazine',  category: 'news',       rssUrl: 'https://bitcoinmagazine.com/.rss/full/',  siteUrl: 'https://bitcoinmagazine.com'  },
  { id: 'coindesk',         name: 'CoinDesk',          category: 'news',       rssUrl: 'https://feeds.feedburner.com/CoinDesk',   siteUrl: 'https://coindesk.com'          },
  { id: 'cointelegraph',    name: 'Cointelegraph',     category: 'news',       rssUrl: 'https://cointelegraph.com/rss',           siteUrl: 'https://cointelegraph.com'     },
  { id: 'decrypt',          name: 'Decrypt',           category: 'news',       rssUrl: 'https://decrypt.co/feed',                 siteUrl: 'https://decrypt.co'            },
  { id: 'theblock',         name: 'The Block',         category: 'analysis',   rssUrl: 'https://www.theblock.co/rss.xml',         siteUrl: 'https://theblock.co'           },
  { id: 'bitcoinist',       name: 'Bitcoinist',        category: 'news',       rssUrl: 'https://bitcoinist.com/feed/',            siteUrl: 'https://bitcoinist.com'        },
  { id: 'newsbtc',          name: 'NewsBTC',           category: 'news',       rssUrl: 'https://www.newsbtc.com/feed/',           siteUrl: 'https://newsbtc.com'           },
  { id: 'cryptoslate',      name: 'CryptoSlate',       category: 'analysis',   rssUrl: 'https://cryptoslate.com/feed/',           siteUrl: 'https://cryptoslate.com'       },
  { id: 'bitcoin-com-news', name: 'Bitcoin.com News',  category: 'news',       rssUrl: 'https://news.bitcoin.com/feed/',          siteUrl: 'https://news.bitcoin.com'      },
  { id: 'ambcrypto',        name: 'AMBCrypto',         category: 'news',       rssUrl: 'https://ambcrypto.com/feed/',             siteUrl: 'https://ambcrypto.com'         },
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
    }];
  });
}
