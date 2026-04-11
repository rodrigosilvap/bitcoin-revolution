import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import {
  DEFAULT_SOURCES, sheetsShareToCsvUrl, parseCsvSources,
  type NewsSource,
} from '@/lib/news-sources';

export const revalidate = 1800; // 30 min

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  sourceName: string;
  sourceId: string;
  category: string;
  publishedAt: number;
}

export interface SourceStatus {
  id: string;
  name: string;
  fetchedOk: boolean;
  count: number;
}

export interface NewsResponse {
  items: NewsItem[];
  sources: SourceStatus[];
  fetchedAt: number;
  range: string;
  totalBeforeFilter: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

function toExcerpt(text: string, max = 220): string {
  const clean = stripHtml(text);
  return clean.length <= max ? clean : clean.slice(0, max).trimEnd() + '…';
}

function hashUrl(url: string): string {
  let h = 0;
  for (let i = 0; i < url.length; i++) { h = (Math.imul(31, h) + url.charCodeAt(i)) | 0; }
  return Math.abs(h).toString(36);
}

function parseDate(raw: string | undefined): number {
  if (!raw) return 0;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

// ─── RSS fetcher ──────────────────────────────────────────────────────────────

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

async function fetchFeed(source: NewsSource): Promise<NewsItem[]> {
  const res = await fetch(source.rssUrl, {
    signal: AbortSignal.timeout(6000),
    headers: { 'User-Agent': 'BitcoinRevolution/1.0 (+https://bitcoin-revolution.app)' },
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  const feed = parser.parse(xml) as Record<string, unknown>;

  // Handle RSS 2.0 and Atom
  let items: Record<string, unknown>[] = [];

  const rss = feed['rss'] as Record<string, unknown> | undefined;
  if (rss) {
    const channel = rss['channel'] as Record<string, unknown>;
    const raw = channel?.['item'];
    items = Array.isArray(raw) ? raw : raw ? [raw] : [];
  }

  const atomFeed = feed['feed'] as Record<string, unknown> | undefined;
  if (atomFeed) {
    const raw = atomFeed['entry'];
    items = Array.isArray(raw) ? raw : raw ? [raw] : [];
  }

  return items.map(item => {
    const title = stripHtml(String(item['title'] ?? '')).trim();

    // URL — RSS uses <link>, Atom uses <link> attr or string
    let url = '';
    const linkField = item['link'];
    if (typeof linkField === 'string') url = linkField.trim();
    else if (typeof linkField === 'object' && linkField !== null) {
      url = String((linkField as Record<string, unknown>)['@_href'] ?? (linkField as Record<string, unknown>)['#text'] ?? '');
    }

    // Description / summary
    const descRaw = item['description'] ?? item['summary'] ?? item['content:encoded'] ?? '';
    const excerpt = toExcerpt(String(descRaw));

    // Date
    const dateRaw = item['pubDate'] ?? item['published'] ?? item['updated'] ?? item['dc:date'];
    const publishedAt = parseDate(String(dateRaw ?? ''));

    return {
      id: hashUrl(url || title),
      title,
      excerpt,
      url,
      sourceName: source.name,
      sourceId: source.id,
      category: source.category,
      publishedAt,
    } satisfies NewsItem;
  }).filter(i => i.title && i.url);
}

// ─── Google Sheets CSV loader ─────────────────────────────────────────────────

async function loadSheetSources(sheetUrl: string): Promise<NewsSource[]> {
  const csvUrl = sheetsShareToCsvUrl(sheetUrl);
  if (!csvUrl) return DEFAULT_SOURCES;
  const res = await fetch(csvUrl, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return DEFAULT_SOURCES;
  const csv = await res.text();
  const parsed = parseCsvSources(csv);
  return parsed.length > 0 ? parsed : DEFAULT_SOURCES;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range    = searchParams.get('range') ?? 'week';
  const sheetUrl = searchParams.get('sheetUrl');

  const sources = sheetUrl ? await loadSheetSources(sheetUrl) : DEFAULT_SOURCES;

  const now = Date.now();
  const cutoff =
    range === 'today' ? now - 24 * 60 * 60 * 1000 :
    range === 'week'  ? now - 7  * 24 * 60 * 60 * 1000 :
    0;

  const results = await Promise.allSettled(sources.map(s => fetchFeed(s)));

  const statuses: SourceStatus[] = [];
  let allItems: NewsItem[] = [];

  for (let i = 0; i < sources.length; i++) {
    const res = results[i];
    const source = sources[i];
    if (res.status === 'fulfilled') {
      statuses.push({ id: source.id, name: source.name, fetchedOk: true, count: res.value.length });
      allItems = allItems.concat(res.value);
    } else {
      statuses.push({ id: source.id, name: source.name, fetchedOk: false, count: 0 });
    }
  }

  const totalBeforeFilter = allItems.length;

  // Deduplicate by URL
  const seen = new Set<string>();
  allItems = allItems.filter(item => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });

  // Filter by date range
  if (cutoff > 0) {
    allItems = allItems.filter(item => item.publishedAt >= cutoff);
  }

  // Sort newest first
  allItems.sort((a, b) => b.publishedAt - a.publishedAt);

  const response: NewsResponse = {
    items: allItems,
    sources: statuses,
    fetchedAt: now,
    range,
    totalBeforeFilter,
  };

  return NextResponse.json(response);
}
