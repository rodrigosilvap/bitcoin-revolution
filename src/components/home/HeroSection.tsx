import { Link } from '@/navigation';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';

export async function HeroSection() {
  const t = await getTranslations('home');

  return (
    <section className="border-b border-border bg-background py-24 lg:py-36">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text */}
          <div className="flex flex-col gap-6">
            <span className="w-fit rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Bitcoin
            </span>
            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-foreground lg:text-7xl">
              {t('title')}
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">{t('subtitle')}</p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/blog">{t('getStarted')}</Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link href="/blog">{t('learnMore')}</Link>
              </Button>
            </div>
          </div>

          {/* Hero image */}
          <div className="flex justify-center opacity-90">
            <Image
              src="/images/icons/hero2.png"
              alt="Bitcoin"
              width={420}
              height={420}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
