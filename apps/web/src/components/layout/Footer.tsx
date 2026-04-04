import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';
import { Separator } from '@/components/ui/separator';

export async function Footer() {
  const t = await getTranslations();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <Image src="/images/icons/logo.png" alt="Bitcoin" width={24} height={24} />
              <span className="text-foreground">{t('header.logo')}</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t('home.subtitle')}
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-3 font-semibold text-foreground">{t('footer.resources')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/blog" className="hover:text-primary transition-colors">{t('nav.blog')}</Link></li>
              <li><Link href="/tools" className="hover:text-primary transition-colors">{t('nav.tools')}</Link></li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="mb-3 font-semibold text-foreground">{t('nav.tools')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/tools/market-data" className="hover:text-primary transition-colors">{t('tools.marketData')}</Link></li>
              <li><Link href="/tools/price-converter" className="hover:text-primary transition-colors">{t('tools.priceConverter')}</Link></li>
              <li><Link href="/tools/dca-simulator" className="hover:text-primary transition-colors">{t('tools.dcaSimulator')}</Link></li>
              <li><Link href="/tools/address-validator" className="hover:text-primary transition-colors">{t('tools.addressValidator')}</Link></li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <p className="text-center text-sm text-muted-foreground">{t('footer.copyright')}</p>
      </div>
    </footer>
  );
}
