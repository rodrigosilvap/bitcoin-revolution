import type { Metadata } from 'next';
import { getTranslations, getLocale } from 'next-intl/server';
import { getAllPosts } from '@/lib/blog';
import { BlogPostCard } from '@/components/blog/BlogPostCard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('blog');
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function BlogPage() {
  const t = await getTranslations('blog');
  const locale = await getLocale();
  const posts = getAllPosts(locale);

  return (
    <div className="container py-12">
      <div className="mb-10">
        <h1 className="mb-3 text-4xl font-bold">{t('title')}</h1>
        <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">{t('postNotFound')}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
