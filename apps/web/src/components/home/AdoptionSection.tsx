import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BTC_ETFS } from '@/lib/etf-data';
import { ArrowRight, Building2, Landmark } from 'lucide-react';
import type { TreasuryData } from '@/lib/services/bitcoin-service';

interface AdoptionSectionProps {
  treasury: TreasuryData | null;
}

function HoldingsBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-border">
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${pct.toFixed(1)}%` }}
      />
    </div>
  );
}

function HoldingRow({
  ticker,
  name,
  meta,
  holdings,
  max,
}: {
  ticker: string;
  name: string;
  meta: string;
  holdings: number;
  max: number;
}) {
  return (
    <div className="flex flex-col gap-2 py-3 border-b border-border/50 last:border-0">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="font-mono text-sm font-bold text-primary">{ticker}</span>
          <span className="mx-1.5 text-border">·</span>
          <span className="text-xs text-muted-foreground truncate">{name}</span>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold tabular-nums">{holdings.toLocaleString('en-US')}</p>
          <p className="text-[10px] text-muted-foreground">{meta}</p>
        </div>
      </div>
      <HoldingsBar value={holdings} max={max} />
    </div>
  );
}

export async function AdoptionSection({ treasury }: AdoptionSectionProps) {
  const t = await getTranslations('home');

  const topEtfs = BTC_ETFS.slice(0, 5);
  const etfMax = topEtfs[0].btcHoldings;
  const etfTotal = topEtfs.reduce((s, e) => s + e.btcHoldings, 0);

  const topCompanies = treasury?.companies.slice(0, 5) ?? [];
  const companyMax = topCompanies[0]?.totalHoldings ?? 1;
  const companyTotal = treasury?.totalHoldings ?? 0;

  return (
    <section className="py-24">
      <div className="container">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-3 max-w-2xl">
          <Badge variant="outline" className="w-fit border-primary/40 text-primary">
            INSTITUTIONAL ADOPTION
          </Badge>
          <h2 className="text-3xl font-bold leading-tight">{t('adoptionTitle')}</h2>
          <p className="text-muted-foreground">{t('adoptionSubtitle')}</p>
        </div>

        {/* Stats + CTAs */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <div className="rounded-xl border border-border bg-card px-5 py-3">
            <p className="font-mono text-xl font-extrabold text-primary">
              {etfTotal.toLocaleString('en-US')} BTC
            </p>
            <p className="text-xs text-muted-foreground">held in spot ETFs</p>
          </div>
          {companyTotal > 0 && (
            <div className="rounded-xl border border-border bg-card px-5 py-3">
              <p className="font-mono text-xl font-extrabold text-primary">
                {companyTotal.toLocaleString('en-US')} BTC
              </p>
              <p className="text-xs text-muted-foreground">held by public companies</p>
            </div>
          )}
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link href="/tools/etf-comparison">
                <Landmark className="h-3.5 w-3.5" />
                {t('adoptionViewTool')}
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link href="/tools/btc-treasuries">
                <Building2 className="h-3.5 w-3.5" />
                BTC Treasuries
              </Link>
            </Button>
          </div>
        </div>

        {/* Two-column holdings table */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Spot ETFs */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Landmark className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Spot Bitcoin ETFs</h3>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                Top {topEtfs.length}
              </Badge>
            </div>
            <div>
              {topEtfs.map((etf) => (
                <HoldingRow
                  key={etf.ticker}
                  ticker={etf.ticker}
                  name={etf.name}
                  meta={etf.issuer}
                  holdings={etf.btcHoldings}
                  max={etfMax}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">Total (top {topEtfs.length})</span>
              <span className="font-mono text-sm font-bold text-primary">
                {etfTotal.toLocaleString('en-US')} BTC
              </span>
            </div>
          </div>

          {/* Corporate Treasuries */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-amber-500" />
              <h3 className="font-semibold">Corporate Treasuries</h3>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {topCompanies.length > 0 ? `Top ${topCompanies.length}` : 'Live data'}
              </Badge>
            </div>
            {topCompanies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Building2 className="mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Treasury data unavailable — check back shortly.
                </p>
                <Button variant="outline" size="sm" asChild className="mt-4 gap-2">
                  <Link href="/tools/btc-treasuries">
                    <ArrowRight className="h-3.5 w-3.5" />
                    View Full List
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div>
                  {topCompanies.map((company) => (
                    <HoldingRow
                      key={company.symbol}
                      ticker={company.symbol}
                      name={company.name}
                      meta={company.country}
                      holdings={company.totalHoldings}
                      max={companyMax}
                    />
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">
                    Total (top {topCompanies.length})
                  </span>
                  <span className="font-mono text-sm font-bold text-amber-500">
                    {topCompanies
                      .reduce((s, c) => s + c.totalHoldings, 0)
                      .toLocaleString('en-US')}{' '}
                    BTC
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
