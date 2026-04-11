import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  BarChart2, ArrowLeftRight, TrendingUp, Building2,
  Key, Shield, Layers,
  Search, QrCode, Activity, Share2, PieChart, Briefcase,
  ChevronRight, Gauge, Newspaper,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('tools');
  return { title: t('title'), description: t('subtitle') };
}

interface ToolEntry { href: string; icon: LucideIcon; titleKey: string; descKey: string; }
interface Accent    { strip: string; icon: string; badge: string; }
interface Category  { labelKey: string; accent: Accent; tools: ToolEntry[]; }

const categories: Category[] = [
  {
    labelKey: 'categoryMarket',
    accent: {
      strip: 'from-amber-500 to-orange-500',
      icon:  'bg-amber-500/10 text-amber-500 group-hover/card:bg-amber-500/20',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20',
    },
    tools: [
      { href: '/tools/market-data',     icon: BarChart2,      titleKey: 'marketData',    descKey: 'marketDataDesc'    },
      { href: '/tools/price-converter', icon: ArrowLeftRight, titleKey: 'priceConverter', descKey: 'priceConverterDesc' },
      { href: '/tools/dca-simulator',   icon: TrendingUp,     titleKey: 'dcaSimulator',  descKey: 'dcaSimulatorDesc'  },
      { href: '/tools/btc-treasuries',  icon: Building2,  titleKey: 'btcTreasuries', descKey: 'btcTreasuriesDesc' },
      { href: '/tools/etf-comparison',   icon: PieChart,   titleKey: 'etfComparison',   descKey: 'etfComparisonDesc'   },
      { href: '/tools/portfolio-tracker', icon: Briefcase, titleKey: 'portfolioTracker', descKey: 'portfolioTrackerDesc' },
      { href: '/tools/market-signals',    icon: Gauge,     titleKey: 'marketSignals',    descKey: 'marketSignalsDesc'    },
    ],
  },
  {
    labelKey: 'categoryWallet',
    accent: {
      strip: 'from-violet-500 to-purple-500',
      icon:  'bg-violet-500/10 text-violet-500 group-hover/card:bg-violet-500/20',
      badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-violet-500/20',
    },
    tools: [
      { href: '/tools/bip39-seed',             icon: Key,    titleKey: 'bip39Seed',        descKey: 'bip39SeedDesc'        },
      { href: '/tools/address-validator',       icon: Shield, titleKey: 'addressValidator', descKey: 'addressValidatorDesc' },
      { href: '/tools/xpub-address-generator', icon: Layers, titleKey: 'xpubGenerator',    descKey: 'xpubGeneratorDesc'    },
    ],
  },
  {
    labelKey: 'categoryBlockchain',
    accent: {
      strip: 'from-sky-500 to-blue-500',
      icon:  'bg-sky-500/10 text-sky-500 group-hover/card:bg-sky-500/20',
      badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-sky-500/20',
    },
    tools: [
      { href: '/tools/block-explorer',   icon: Search,   titleKey: 'blockExplorer',   descKey: 'blockExplorerDesc'   },
      { href: '/tools/payment-uri',      icon: QrCode,   titleKey: 'paymentUri',      descKey: 'paymentUriDesc'      },
      { href: '/tools/payment-monitor',  icon: Activity, titleKey: 'paymentMonitor',  descKey: 'paymentMonitorDesc'  },
      { href: '/tools/checkout-creator', icon: Share2,     titleKey: 'checkoutCreator', descKey: 'checkoutCreatorDesc' },
      { href: '/tools/news-crawler',     icon: Newspaper,  titleKey: 'newsCrawler',     descKey: 'newsCrawlerDesc'     },
    ],
  },
];

export default async function ToolsPage() {
  const t = await getTranslations('tools');
  const tStr = t as unknown as (key: string) => string;

  return (
    <div className="container py-12">
      <div className="mb-14">
        <h1 className="mb-3 text-4xl font-bold">{t('title')}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">{t('subtitle')}</p>
      </div>

      <div className="space-y-16">
        {categories.map(({ labelKey, accent, tools }) => (
          <section key={labelKey}>
            {/* Section header */}
            <div className="mb-8 flex items-center gap-3">
              <h2 className="text-xl font-semibold tracking-tight">{tStr(labelKey)}</h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${accent.badge}`}>
                {tools.length}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map(({ href, icon: Icon, titleKey, descKey }) => (
                <Link key={href} href={href} className="group/card">
                  <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/5">
                    {/* Accent strip — visible on hover */}
                    <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r opacity-0 transition-opacity duration-200 group-hover/card:opacity-100 ${accent.strip}`} />

                    <div className="flex flex-col gap-5 p-6">
                      {/* Icon */}
                      <div className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors duration-200 ${accent.icon}`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Text */}
                      <div className="flex-1 space-y-1.5">
                        <h3 className="font-semibold leading-snug transition-colors duration-150 group-hover/card:text-primary">
                          {tStr(titleKey)}
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {tStr(descKey)}
                        </p>
                      </div>

                      {/* CTA row */}
                      <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground/50 transition-all duration-150 group-hover/card:gap-1.5 group-hover/card:text-primary">
                        Open tool
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
