import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HeroSection } from '@/components/home/HeroSection';
import { WhyBitcoinSection } from '@/components/home/WhyBitcoinSection';
import { GetStartedSection } from '@/components/home/GetStartedSection';
import { NewsletterSection } from '@/components/home/NewsletterSection';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home');
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhyBitcoinSection />
      <GetStartedSection />
      <NewsletterSection />
    </>
  );
}
