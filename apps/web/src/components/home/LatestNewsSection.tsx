import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ExternalLink, Rss } from 'lucide-react';
import type { NewsItem } from '@/app/api/bitcoin/news/route';

interface LatestNewsSectionProps {
  news: NewsItem[];
}

const CATEGORY_COLORS: Record<string, string> = {
  news: 'bg-blue-500/10 text-blue-500',
  analysis: 'bg-purple-500/10 text-purple-500',
  technical: 'bg-green-500/10 text-green-500',
  regulation: 'bg-amber-500/10 text-amber-500',
};

const CATEGORY_PLACEHOLDER: Record<string, string> = {
  news: 'from-blue-500/20 to-blue-900/20',
  analysis: 'from-purple-500/20 to-purple-900/20',
  technical: 'from-green-500/20 to-green-900/20',
  regulation: 'from-amber-500/20 to-amber-900/20',
};

function formatDate(ts: number): string {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export async function LatestNewsSection({ news }: LatestNewsSectionProps) {
  const t = await getTranslations('home');

  if (news.length === 0) return null;

  return (
    <section className="py-24">
      <div className="container">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="w-fit border-primary/40 text-primary">
              NEWS
            </Badge>
            <h2 className="text-3xl font-bold">{t('newsTitle')}</h2>
            <p className="max-w-xl text-muted-foreground">{t('newsSubtitle')}</p>
          </div>
          <Link
            href="/tools/news-crawler"
            className="shrink-0 text-sm font-medium text-primary hover:underline"
          >
            {t('newsSeeAll')} →
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="h-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                {/* Image or placeholder */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                  {item.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={undefined}
                    />
                  ) : (
                    <div
                      className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${CATEGORY_PLACEHOLDER[item.category] ?? 'from-muted to-muted/50'}`}
                    >
                      <Rss className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                  {/* Category pill overlaid on image */}
                  {item.category && (
                    <span
                      className={`absolute left-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm ${CATEGORY_COLORS[item.category] ?? 'bg-muted/80 text-muted-foreground'}`}
                    >
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="flex flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {item.sourceName}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-semibold leading-snug line-clamp-3 transition-colors group-hover:text-primary">
                    {item.title}
                  </h3>

                  {item.excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.excerpt}</p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-1">
                    <span className="text-[10px] text-muted-foreground">{formatDate(item.publishedAt)}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
