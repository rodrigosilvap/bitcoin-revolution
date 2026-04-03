import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { getAllSlugs, getPostBySlug, markdownToHtml } from '@/lib/blog';
import { BlogPostContent } from '@/components/blog/BlogPostContent';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

interface Props {
  params: { slug: string; locale: string };
}

export async function generateStaticParams() {
  const locales = ['en', 'pt-BR'];
  return locales.flatMap((locale) =>
    getAllSlugs(locale).map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale;
  const slugs = getAllSlugs(locale);
  if (!slugs.includes(params.slug)) {
    const enSlugs = getAllSlugs('en');
    if (!enSlugs.includes(params.slug)) return {};
  }
  const post = getPostBySlug(params.slug, locale);
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: [post.image] },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const t = await getTranslations('blog');
  const locale = params.locale;

  const allSlugs = getAllSlugs(locale);
  const enSlugs = getAllSlugs('en');
  if (!allSlugs.includes(params.slug) && !enSlugs.includes(params.slug)) {
    notFound();
  }

  const post = getPostBySlug(params.slug, locale);
  const html = await markdownToHtml(post.content);
  const isExternal = post.image.startsWith('http');

  return (
    <div className="container py-12">
      <Button variant="ghost" asChild className="mb-8 -ml-2">
        <Link href="/blog">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToBlog')}
        </Link>
      </Button>

      <article className="mx-auto max-w-3xl">
        {/* Hero image */}
        {post.image && (
          <div className="relative mb-8 h-64 w-full overflow-hidden rounded-xl bg-muted md:h-80">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
              unoptimized={isExternal}
            />
          </div>
        )}

        {/* Meta */}
        <div className="mb-6 flex items-center gap-3">
          <Badge variant="outline" className="text-primary border-primary/40">
            {post.date}
          </Badge>
        </div>

        <h1 className="mb-8 text-3xl font-bold leading-tight md:text-4xl">{post.title}</h1>

        <BlogPostContent html={html} />
      </article>
    </div>
  );
}
