import type { Metadata } from 'next';
import { Link } from '@/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ShieldCheck,
  CreditCard,
  Wallet,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Lock,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'How to Buy Bitcoin — A Step-by-Step Guide',
  description:
    'A practical, beginner-friendly guide to buying your first Bitcoin safely — from choosing an exchange to moving BTC to self-custody.',
};

const STEPS = [
  {
    num: 1,
    icon: Building2,
    title: 'Choose a Regulated Exchange',
    desc: 'Select a reputable, regulated exchange in your country. Look for platforms with a strong security track record, proof of reserves, and regulated status.',
    tips: [
      'Coinbase — beginner-friendly, US-regulated',
      'Kraken — strong security, global coverage',
      'Bitstamp — one of the oldest regulated exchanges',
      'Binance — largest volume, most pairs',
    ],
  },
  {
    num: 2,
    icon: ShieldCheck,
    title: 'Complete Identity Verification (KYC)',
    desc: 'Most regulated exchanges require identity verification to comply with financial regulations. This typically takes 10–30 minutes.',
    tips: [
      'Prepare a government-issued ID (passport or driver\'s license)',
      'Have a selfie or live photo ready',
      'Use your real name and address — it must match your ID',
      'Enable 2FA immediately after account creation',
    ],
  },
  {
    num: 3,
    icon: CreditCard,
    title: 'Fund Your Account',
    desc: 'Deposit fiat currency using your preferred method. Bank transfer usually has the lowest fees. Card payments are faster but more expensive.',
    tips: [
      'Bank transfer (SEPA/ACH): 0–1% fee, 1–3 days',
      'Debit/credit card: 1.5–4% fee, instant',
      'Start small — there\'s no minimum requirement to learn',
      'Check for daily and monthly deposit limits',
    ],
  },
  {
    num: 4,
    icon: TrendingUp,
    title: 'Place Your Order',
    desc: 'Buy Bitcoin using a market order (instant, current price) or a limit order (set your own price and wait). For beginners, a market order is simpler.',
    tips: [
      'Market order: fills immediately at best available price',
      'Limit order: set your price and wait — useful for DCA',
      'Consider spreading purchases over time (DCA strategy)',
      'Use the BTC/USD pair for most liquidity',
    ],
  },
  {
    num: 5,
    icon: Lock,
    title: 'Move to Self-Custody',
    desc: 'Once you buy, withdraw to a wallet you control. Keeping BTC on an exchange is a risk — exchanges have been hacked and gone bankrupt.',
    tips: [
      '"Not your keys, not your coins" — the most important rule',
      'Use a hardware wallet for long-term storage',
      'Keep only what you plan to trade on the exchange',
      'Verify the withdrawal address carefully before sending',
    ],
  },
];

const DCA_VS_LUMP = [
  {
    label: 'Dollar Cost Averaging (DCA)',
    pros: ['Reduces timing risk', 'Builds habit of regular saving', 'Less stressful psychologically', 'Works well in volatile markets'],
    cons: ['May buy at higher average price in bull markets', 'Requires discipline over time'],
    recommended: true,
  },
  {
    label: 'Lump Sum',
    pros: ['Statistically outperforms DCA in trending markets', 'Simpler — one decision', 'Full exposure immediately'],
    cons: ['Higher risk if timing is poor', 'Emotionally harder after a big drop'],
    recommended: false,
  },
];

const WARNINGS = [
  'Never invest more than you can afford to lose entirely.',
  'Bitcoin is highly volatile — 50%+ drawdowns have happened multiple times.',
  'Beware of scams: no one will "double your Bitcoin" or ask for it as payment.',
  'Use hardware wallets and unique strong passwords with 2FA everywhere.',
  "Don't share your seed phrase or private key with anyone — ever.",
];

export default function BuyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-background">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(255,102,0,0.10) 0%, transparent 70%)',
          }}
          aria-hidden
        />
        <div className="container relative py-20 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-4 border-primary/40 text-primary">
              STEP 2 — BUY
            </Badge>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight lg:text-6xl">
              Your First Bitcoin
            </h1>
            <p className="text-xl text-muted-foreground">
              A practical, step-by-step guide to buying Bitcoin safely — from picking an exchange
              to moving your coins to self-custody.
            </p>
          </div>
        </div>
      </section>

      {/* Before you buy */}
      <section className="border-y border-border bg-card py-20">
        <div className="container max-w-4xl">
          <div className="mb-8 flex flex-col gap-3">
            <Badge variant="outline" className="w-fit border-primary/40 text-primary">
              BEFORE YOU START
            </Badge>
            <h2 className="text-3xl font-bold">Three Things to Know First</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              { icon: TrendingUp, title: 'Set a clear goal', desc: 'Are you saving long-term (3–5+ years) or trading short-term? Your strategy defines how much risk is appropriate and which tools to use.' },
              { icon: ShieldCheck, title: 'Have a secure wallet ready', desc: "Don't leave Bitcoin on an exchange. Before you buy, set up a wallet so you can withdraw to self-custody as soon as your purchase clears." },
              { icon: AlertTriangle, title: 'Only invest what you can lose', desc: 'Bitcoin is a high-risk, high-volatility asset. Position size relative to your total savings accordingly. Never take debt to buy Bitcoin.' },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="h-full">
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1.5 font-semibold">{title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Step by step */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <div className="mb-10 flex flex-col gap-3">
            <Badge variant="outline" className="w-fit border-primary/40 text-primary">
              STEP BY STEP
            </Badge>
            <h2 className="text-3xl font-bold">How to Buy Bitcoin</h2>
          </div>
          <div className="flex flex-col gap-6">
            {STEPS.map(({ num, icon: Icon, title, desc, tips }) => (
              <Card key={num} className="overflow-hidden">
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:gap-6">
                  <div className="flex shrink-0 items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {num}
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 sm:hidden">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:flex">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                    <ul className="flex flex-col gap-1.5">
                      {tips.map((tip) => (
                        <li key={tip} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                          <span className="text-muted-foreground">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* DCA vs Lump Sum */}
      <section className="border-y border-border bg-card py-20">
        <div className="container max-w-4xl">
          <div className="mb-8 flex flex-col gap-3">
            <Badge variant="outline" className="w-fit border-primary/40 text-primary">
              STRATEGY
            </Badge>
            <h2 className="text-3xl font-bold">DCA vs. Lump Sum</h2>
            <p className="max-w-2xl text-muted-foreground">
              For most people, Dollar Cost Averaging (buying a fixed amount on a regular schedule) reduces
              stress and the risk of bad timing.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {DCA_VS_LUMP.map(({ label, pros, cons, recommended }) => (
              <Card key={label} className={recommended ? 'border-primary/40' : ''}>
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{label}</h3>
                    {recommended && (
                      <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px]">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-green-500">Pros</p>
                      <ul className="flex flex-col gap-1">
                        {pros.map((p) => (
                          <li key={p} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-amber-500">Cons</p>
                      <ul className="flex flex-col gap-1">
                        {cons.map((c) => (
                          <li key={c} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <span className="h-3.5 w-3.5 shrink-0 text-amber-500">—</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/tools/dca-simulator">
                Try the DCA Simulator <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tools/price-converter">Price Converter</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Warnings */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <div className="mb-6 flex flex-col gap-3">
            <Badge variant="outline" className="w-fit border-amber-500/40 text-amber-500">
              IMPORTANT WARNINGS
            </Badge>
            <h2 className="text-3xl font-bold">Stay Safe</h2>
          </div>
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="flex flex-col gap-3 p-6">
              {WARNINGS.map((w) => (
                <div key={w} className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <p className="text-sm text-muted-foreground">{w}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card py-20">
        <div className="container max-w-2xl text-center">
          <h2 className="mb-3 text-2xl font-bold">Bought Your First Bitcoin?</h2>
          <p className="mb-8 text-muted-foreground">
            The next critical step is securing it. Learn how to move Bitcoin to self-custody
            and protect your seed phrase properly.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/secure">
                How to Secure Bitcoin <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/tools/bip39-seed">BIP39 Seed Tool</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
