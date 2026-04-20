import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HeroSection } from '@/components/home/HeroSection';
import { HomeMarketSection } from '@/components/home/HomeMarketSection';
import { WhyBitcoinSection } from '@/components/home/WhyBitcoinSection';
import { HalvingCountdown } from '@/components/home/HalvingCountdown';
import { LatestNewsSection } from '@/components/home/LatestNewsSection';
import { FeaturedPostsSection } from '@/components/home/FeaturedPostsSection';
import { AdoptionSection } from '@/components/home/AdoptionSection';
import { ToolsShowcaseSection } from '@/components/home/ToolsShowcaseSection';
import { GetStartedSection } from '@/components/home/GetStartedSection';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { fetchMarketData } from '@/lib/services/bitcoin-service';
import { calculateHalving } from '@/lib/services/halving-service';
import { getAllPosts } from '@/lib/blog';
import type { NewsResponse } from '@/app/api/bitcoin/news/route';
import type { TreasuryData } from '@/lib/services/bitcoin-service';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home');
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

const BASE_URL =
  process.env['NEXT_PUBLIC_APP_URL'] ??
  (process.env['VERCEL_URL'] ? `https://${process.env['VERCEL_URL']}` : 'http://localhost:3000');

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Parallel data fetches — any failure falls back gracefully
  const [market, newsRes, priceHistoryRes, treasuryRes] = await Promise.all([
    fetchMarketData().catch(() => null),
    fetch(`${BASE_URL}/api/bitcoin/news?range=week`, {
      next: { revalidate: 1800 },
    }).catch(() => null),
    fetch(`${BASE_URL}/api/bitcoin/price-history?days=7`, {
      next: { revalidate: 300 },
    }).catch(() => null),
    fetch(`${BASE_URL}/api/bitcoin/treasuries`, {
      next: { revalidate: 300 },
    }).catch(() => null),
  ]);

  const halving = calculateHalving();
  const posts = getAllPosts(locale);

  let news: NewsResponse['items'] = [];
  if (newsRes?.ok) {
    const data = (await newsRes.json()) as NewsResponse;
    news = data.items.slice(0, 6);
  }

  let sparklinePrices: number[] = [];
  if (priceHistoryRes?.ok) {
    const data = await priceHistoryRes.json() as { prices: { price: number }[] };
    // Downsample to ~30 points for a clean sparkline
    const all = data.prices.map((p) => p.price);
    const step = Math.max(1, Math.floor(all.length / 30));
    sparklinePrices = all.filter((_, i) => i % step === 0);
  }

  let treasury: TreasuryData | null = null;
  if (treasuryRes?.ok) {
    treasury = (await treasuryRes.json()) as TreasuryData;
  }

  return (
    <>
      <HeroSection market={market} sparklinePrices={sparklinePrices} />
      <HomeMarketSection initialMarket={market} />
      <WhyBitcoinSection />
      <HalvingCountdown initialHalving={halving} />
      <LatestNewsSection news={news} />
      <FeaturedPostsSection posts={posts.slice(0, 3)} />
      <AdoptionSection treasury={treasury} />
      <ToolsShowcaseSection />
      <GetStartedSection />
      <NewsletterSection />
    </>
  );
}
