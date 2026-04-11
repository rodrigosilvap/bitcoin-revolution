'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  RefreshCw, Download, ExternalLink, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Newspaper, Info, FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { exportSourcesCsv, DEFAULT_SOURCES } from '@/lib/news-sources';
import type { NewsItem, NewsResponse, SourceStatus } from '@/app/api/bitcoin/news/route';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Range = 'today' | 'week' | 'all';
type Category = 'all' | 'news' | 'analysis' | 'technical' | 'regulation';

function fmtDate(ts: number): string {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - ts) / 86_400_000);
  if (diffDays === 0) return `Today ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  if (diffDays === 1) return `Yesterday ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function dayKey(ts: number): string {
  if (!ts) return 'Unknown date';
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - ts) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

const CATEGORY_COLORS: Record<string, string> = {
  news:       'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
  analysis:   'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20',
  technical:  'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20',
  regulation: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20',
};

const PAGE_SIZE = 30;

// ─── Source status bar ────────────────────────────────────────────────────────

function SourceBar({ statuses }: { statuses: SourceStatus[] }) {
  const ok = statuses.filter(s => s.fetchedOk).length;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-muted-foreground mr-1">{ok}/{statuses.length} sources:</span>
      {statuses.map(s => (
        <span
          key={s.id}
          title={s.fetchedOk ? `${s.name}: ${s.count} items` : `${s.name}: failed`}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
            s.fetchedOk
              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
              : 'bg-red-500/10 text-red-500 line-through opacity-60'
          }`}
        >
          {s.fetchedOk
            ? <CheckCircle2 className="h-3 w-3" />
            : <XCircle className="h-3 w-3" />
          }
          {s.name}
        </span>
      ))}
    </div>
  );
}

// ─── Sheets panel ─────────────────────────────────────────────────────────────

interface SheetsPanelProps {
  sheetUrl: string;
  onSheetUrl: (url: string) => void;
  onLoad: () => void;
  loading: boolean;
}

function SheetsPanel({ sheetUrl, onSheetUrl, onLoad, loading }: SheetsPanelProps) {
  const [open, setOpen] = useState(false);

  function downloadCsv() {
    const csv = exportSourcesCsv(DEFAULT_SOURCES);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bitcoin-news-sources.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card>
      <button
        className="flex w-full items-center justify-between px-5 py-4 text-sm font-medium text-left"
        onClick={() => setOpen(v => !v)}
      >
        <span className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Custom Sources via Google Sheets
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <CardContent className="flex flex-col gap-4 pt-0 pb-5">
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3 w-3 shrink-0" />
            Export the default list below, upload to Google Sheets, customize it, then paste the public share URL.
          </p>

          <div className="rounded-md bg-muted px-4 py-3 text-xs font-mono text-muted-foreground space-y-0.5">
            <p className="font-semibold text-foreground mb-1">Required CSV columns:</p>
            <p>name, category, rssUrl, siteUrl</p>
            <p>category: <span className="text-foreground">news | analysis | technical | regulation</span></p>
          </div>

          <Button variant="outline" size="sm" onClick={downloadCsv} className="gap-1.5 self-start">
            <Download className="h-3.5 w-3.5" />
            Download default source list (CSV)
          </Button>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium">Google Sheets share URL</label>
            <div className="flex gap-2">
              <Input
                value={sheetUrl}
                onChange={e => onSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/…"
                className="text-xs"
              />
              <Button size="sm" onClick={onLoad} disabled={loading || !sheetUrl.trim()}>
                {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Load'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              In Google Sheets: Share → Anyone with the link → Viewer → Copy link
            </p>
          </div>

          {sheetUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="self-start text-destructive hover:text-destructive text-xs"
              onClick={() => onSheetUrl('')}
            >
              Clear (revert to default sources)
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ─── News item card ───────────────────────────────────────────────────────────

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-2 rounded-lg border border-border bg-card px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30"
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {item.title}
          </p>
        </div>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
      </div>

      {item.excerpt && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {item.excerpt}
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="text-xs px-1.5 py-0 font-medium">
          {item.sourceName}
        </Badge>
        <Badge
          variant="secondary"
          className={`text-xs px-1.5 py-0 ${CATEGORY_COLORS[item.category] ?? ''}`}
        >
          {item.category}
        </Badge>
        {item.publishedAt > 0 && (
          <span className="text-xs text-muted-foreground/60 ml-auto">{fmtDate(item.publishedAt)}</span>
        )}
      </div>
    </a>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NewsDigest() {
  const t = useTranslations('newsCrawler');

  const [range, setRange]             = useState<Range>('week');
  const [category, setCategory]       = useState<Category>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sheetUrl, setSheetUrl]       = useState('');
  const [pendingSheetUrl, setPendingSheetUrl] = useState('');
  const [data, setData]               = useState<NewsResponse | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [page, setPage]               = useState(1);

  const fetchNews = useCallback(async (r: Range, sheet: string) => {
    setLoading(true);
    setError(null);
    setPage(1);
    try {
      const params = new URLSearchParams({ range: r });
      if (sheet.trim()) params.set('sheetUrl', sheet.trim());
      const res = await fetch(`/api/bitcoin/news?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as NewsResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load news');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNews('week', ''); }, [fetchNews]);

  function handleRangeChange(r: Range) {
    setRange(r);
    fetchNews(r, sheetUrl);
  }

  function handleLoadSheet() {
    setSheetUrl(pendingSheetUrl);
    fetchNews(range, pendingSheetUrl);
  }

  function handleClearSheet() {
    setPendingSheetUrl('');
    setSheetUrl('');
    fetchNews(range, '');
  }

  // Unique source names for filter
  const sourceNames = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.items.map(i => i.sourceName))).sort();
  }, [data]);

  // Filtered items
  const filtered = useMemo(() => {
    if (!data) return [];
    return data.items.filter(item => {
      if (category !== 'all' && item.category !== category) return false;
      if (sourceFilter !== 'all' && item.sourceName !== sourceFilter) return false;
      return true;
    });
  }, [data, category, sourceFilter]);

  // Paginated
  const visible = filtered.slice(0, page * PAGE_SIZE);

  // Group by day
  const grouped = useMemo(() => {
    const groups = new Map<string, NewsItem[]>();
    for (const item of visible) {
      const key = dayKey(item.publishedAt);
      const arr = groups.get(key) ?? [];
      arr.push(item);
      groups.set(key, arr);
    }
    return Array.from(groups.entries());
  }, [visible]);

  // Markdown export
  function exportMarkdown() {
    const dateLabel = range === 'today' ? `Today, ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` :
                      range === 'week'  ? `Week of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` :
                      'All time';
    let md = `# Bitcoin News Digest — ${dateLabel}\n\n`;
    md += `*Generated by Bitcoin Revolution · ${new Date().toISOString().split('T')[0]}*\n\n`;

    for (const [day, items] of grouped) {
      md += `## ${day}\n\n`;
      for (const item of items) {
        md += `- **[${item.title}](${item.url})** *(${item.sourceName} · ${item.category})*\n`;
        if (item.excerpt) md += `  ${item.excerpt}\n`;
        md += '\n';
      }
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bitcoin-news-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const okCount = data?.sources.filter(s => s.fetchedOk).length ?? 0;
  const totalCount = data?.sources.length ?? 0;

  return (
    <div className="flex flex-col gap-5">

      {/* ── Controls ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Range */}
        <div className="flex rounded-lg border overflow-hidden">
          {(['today', 'week', 'all'] as Range[]).map(r => (
            <button
              key={r}
              onClick={() => handleRangeChange(r)}
              disabled={loading}
              className={`px-3 py-1.5 text-sm font-medium transition ${
                range === r
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              {r === 'today' ? t('rangeToday') : r === 'week' ? t('rangeWeek') : t('rangeAll')}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <select
          value={category}
          onChange={e => setCategory(e.target.value as Category)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="all">{t('categoryAll')}</option>
          <option value="news">News</option>
          <option value="analysis">Analysis</option>
          <option value="technical">Technical</option>
          <option value="regulation">Regulation</option>
        </select>

        {/* Source filter */}
        {sourceNames.length > 0 && (
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="all">{t('allSources')}</option>
            {sourceNames.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}

        <div className="ml-auto flex gap-2">
          {data && filtered.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportMarkdown} className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              {t('exportMd')}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => fetchNews(range, sheetUrl)} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {data ? new Date(data.fetchedAt).toLocaleTimeString() : t('refresh')}
          </Button>
        </div>
      </div>

      {/* ── Source status ───────────────────────────────────────────── */}
      {data && <SourceBar statuses={data.sources} />}

      {/* ── Google Sheets panel ─────────────────────────────────────── */}
      <SheetsPanel
        sheetUrl={pendingSheetUrl}
        onSheetUrl={v => { setPendingSheetUrl(v); if (!v) handleClearSheet(); }}
        onLoad={handleLoadSheet}
        loading={loading}
      />

      {/* ── Error ───────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ── Loading skeleton ────────────────────────────────────────── */}
      {loading && !data && (
        <div className="flex flex-col gap-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="rounded-lg border border-border px-4 py-3 flex flex-col gap-2 animate-pulse">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty ───────────────────────────────────────────────────── */}
      {!loading && data && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <Newspaper className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">{t('noItems')}</p>
          {okCount === 0 && (
            <p className="text-xs text-muted-foreground/60">
              {t('allSourcesFailed')}
            </p>
          )}
        </div>
      )}

      {/* ── News feed grouped by day ────────────────────────────────── */}
      {!loading && grouped.length > 0 && (
        <div className="flex flex-col gap-6">
          {grouped.map(([day, items]) => (
            <div key={day}>
              <div className="mb-3 flex items-center gap-3">
                <h3 className="text-sm font-semibold">{day}</h3>
                <span className="text-xs text-muted-foreground">{items.length} articles</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="flex flex-col gap-2">
                {items.map(item => <NewsCard key={item.id} item={item} />)}
              </div>
            </div>
          ))}

          {/* Load more */}
          {visible.length < filtered.length && (
            <Button variant="outline" onClick={() => setPage(p => p + 1)} className="mx-auto">
              {t('loadMore', { count: Math.min(PAGE_SIZE, filtered.length - visible.length) })}
            </Button>
          )}

          <p className="text-center text-xs text-muted-foreground">
            {t('showing', { visible: visible.length, total: filtered.length })}
            {category !== 'all' || sourceFilter !== 'all' ? ` (filtered from ${data?.items.length ?? 0})` : ''}
          </p>
        </div>
      )}

      {/* ── Disclaimer ──────────────────────────────────────────────── */}
      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3 w-3 shrink-0" />
        {t('disclaimer', { count: totalCount })}
      </p>
    </div>
  );
}
