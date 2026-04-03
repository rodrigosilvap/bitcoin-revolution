import { Link } from '@/navigation';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';

export async function HeroSection() {
  const t = await getTranslations('home');

  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-20 lg:py-32">
      {/* Subtle orange glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text */}
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground lg:text-6xl">
              {t('title')}
            </h1>
            <p className="text-lg text-muted-foreground lg:text-xl">{t('subtitle')}</p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/blog">{t('getStarted')}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/blog">{t('learnMore')}</Link>
              </Button>
            </div>
          </div>

          {/* Hero image — dark/light variants via CSS */}
          <div className="flex justify-center">
            <Image
              src="/images/icons/hero2.png"
              alt="Bitcoin"
              width={480}
              height={480}
              priority
              className="block dark:block"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
