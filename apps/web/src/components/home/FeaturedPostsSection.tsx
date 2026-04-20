import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';
import { Badge } from '@/components/ui/badge';
import { BlogPostCard } from '@/components/blog/BlogPostCard';
import type { PostMeta } from '@/lib/blog';

interface FeaturedPostsSectionProps {
  posts: PostMeta[];
}

export async function FeaturedPostsSection({ posts }: FeaturedPostsSectionProps) {
  const t = await getTranslations('home');

  return (
    <section className="border-y border-border bg-card py-24">
      <div className="container">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="w-fit border-primary/40 text-primary">
              BLOG
            </Badge>
            <h2 className="text-3xl font-bold">{t('blogTitle')}</h2>
            <p className="max-w-xl text-muted-foreground">{t('blogSubtitle')}</p>
          </div>
          <Link
            href="/blog"
            className="shrink-0 text-sm font-medium text-primary hover:underline"
          >
            {t('blogViewAll')} →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
