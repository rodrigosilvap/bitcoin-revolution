import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeftRight, BarChart2, TrendingUp, Shield, Search, Key, ChevronRight } from 'lucide-react';

const TOOLS = [
  {
    icon: BarChart2,
    href: '/tools/market-data',
    labelKey: 'marketData',
    descKey: 'marketDataDesc',
    iconBg: 'bg-gradient-to-br from-orange-500/20 to-amber-500/20',
    iconColor: 'text-orange-500',
  },
  {
    icon: ArrowLeftRight,
    href: '/tools/price-converter',
    labelKey: 'priceConverter',
    descKey: 'priceConverterDesc',
    iconBg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-500',
  },
  {
    icon: TrendingUp,
    href: '/tools/dca-simulator',
    labelKey: 'dcaSimulator',
    descKey: 'dcaSimulatorDesc',
    iconBg: 'bg-gradient-to-br from-emerald-500/20 to-green-500/20',
    iconColor: 'text-emerald-500',
  },
  {
    icon: Shield,
    href: '/tools/address-validator',
    labelKey: 'addressValidator',
    descKey: 'addressValidatorDesc',
    iconBg: 'bg-gradient-to-br from-violet-500/20 to-purple-500/20',
    iconColor: 'text-violet-500',
  },
  {
    icon: Search,
    href: '/tools/block-explorer',
    labelKey: 'blockExplorer',
    descKey: 'blockExplorerDesc',
    iconBg: 'bg-gradient-to-br from-sky-500/20 to-indigo-500/20',
    iconColor: 'text-sky-500',
  },
  {
    icon: Key,
    href: '/tools/bip39-seed',
    labelKey: 'bip39Seed',
    descKey: 'bip39SeedDesc',
    iconBg: 'bg-gradient-to-br from-rose-500/20 to-pink-500/20',
    iconColor: 'text-rose-500',
  },
] as const;

export async function ToolsShowcaseSection() {
  const t = await getTranslations('home');
  const tTools = await getTranslations('tools');

  return (
    <section className="border-y border-border bg-card py-24">
      <div className="container">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="w-fit border-primary/40 text-primary">
              TOOLS
            </Badge>
            <h2 className="text-3xl font-bold">{t('toolsTitle')}</h2>
            <p className="max-w-xl text-muted-foreground">{t('toolsSubtitle')}</p>
          </div>
          <Link
            href="/tools"
            className="shrink-0 text-sm font-medium text-primary hover:underline"
          >
            {t('toolsViewAll')} →
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map(({ icon: Icon, href, labelKey, descKey, iconBg, iconColor }) => (
            <Link key={href} href={href} className="group">
              <Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {tTools(labelKey)}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {tTools(descKey)}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 text-sm font-medium ${iconColor}`}>
                    {t('toolsOpen')}
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
