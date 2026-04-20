import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
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
              <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {item.sourceName}
                    </Badge>
                    {item.category && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[item.category] ?? 'bg-muted text-muted-foreground'}`}
                      >
                        {item.category}
                      </span>
                    )}
                  </div>

                  <h3 className="flex-1 text-sm font-semibold leading-snug line-clamp-3 transition-colors group-hover:text-primary">
                    {item.title}
                  </h3>

                  {item.excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.excerpt}</p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-1">
                    <span className="text-[10px] text-muted-foreground">{formatDate(item.publishedAt)}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
