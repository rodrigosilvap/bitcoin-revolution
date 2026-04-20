import type { Metadata } from 'next';
import { Link } from '@/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Coins,
  Layers,
  Globe2,
  Shield,
  Clock,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Cpu,
  Network,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Learn Bitcoin — Fundamentals, Security & Monetary Properties',
  description:
    'Understand how Bitcoin works, why it matters, and its core monetary properties. Your starting point for Bitcoin education.',
};

const MONETARY_PROPERTIES = [
  {
    icon: Coins,
    title: 'Scarcity',
    desc: 'Only 21 million BTC will ever exist. New supply is programmatically cut in half every ~4 years (halving), making Bitcoin predictably scarce — unlike any fiat currency.',
  },
  {
    icon: Layers,
    title: 'Divisibility',
    desc: 'Each Bitcoin can be divided into 100,000,000 satoshis (sats). This makes it practical for any transaction size — from buying coffee to transferring billions.',
  },
  {
    icon: Globe2,
    title: 'Portability',
    desc: 'A seed phrase (12–24 words) lets you carry any amount of Bitcoin across any border, with no permission needed. Try doing that with gold or bank transfers.',
  },
  {
    icon: Shield,
    title: 'Durability',
    desc: 'Bitcoin exists as data secured by cryptography and replicated across tens of thousands of nodes worldwide. It cannot rust, burn, or decay.',
  },
  {
    icon: CheckCircle2,
    title: 'Verifiability',
    desc: 'Anyone can independently verify any transaction or balance on the public blockchain using open-source software. No trust required — math is the auditor.',
  },
  {
    icon: Clock,
    title: 'Censorship Resistance',
    desc: 'No government, bank, or corporation can freeze or confiscate your Bitcoin if you hold your own keys. Transactions are permissionless by design.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Cpu,
    title: 'You broadcast a transaction',
    desc: 'When you send Bitcoin, you sign the transaction with your private key and broadcast it to the peer-to-peer network of ~18,000+ nodes.',
  },
  {
    step: '02',
    icon: Network,
    title: 'Miners compete to include it',
    desc: 'Miners bundle pending transactions into a block and race to solve a cryptographic puzzle (proof of work). The winner earns new BTC + transaction fees.',
  },
  {
    step: '03',
    icon: Layers,
    title: 'The block is added to the chain',
    desc: 'Each new block references the previous one, forming an immutable chain. Changing any past block would require redoing all the work that came after — economically infeasible.',
  },
  {
    step: '04',
    icon: CheckCircle2,
    title: 'Confirmation builds trust',
    desc: 'After 6 confirmations (~60 minutes), a transaction is considered irreversible. For small amounts, even 1–2 confirmations is typically sufficient.',
  },
];

const SECURITY_BASICS = [
  {
    title: 'Your keys = your coins',
    desc: 'A Bitcoin wallet is really just a key manager. If you hold your private key (or seed phrase), you own the coins. If someone else holds them (an exchange), they own them.',
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Seed phrase is everything',
    desc: '12 or 24 words generated when you create a wallet. Write them on paper (or metal), store offline, never photograph or type them. Anyone with these words can spend your Bitcoin.',
    color: 'bg-amber-500/10 text-amber-500',
  },
  {
    title: 'Hardware wallets for savings',
    desc: 'For anything beyond spending money, use a hardware wallet (Ledger, Trezor, Coldcard). It keeps your private key offline, immune to software attacks.',
    color: 'bg-green-500/10 text-green-500',
  },
];

const BLOG_LINKS = [
  { href: '/blog/why-bitcoin-best-money', label: 'Why Bitcoin Is the Best Money' },
  { href: '/blog/decentralized-secure-network', label: 'A True Decentralized Secure Money' },
  { href: '/blog/bitcoin-store-of-value', label: 'Bitcoin as a Store of Value' },
  { href: '/blog/blockchain-technology-explained', label: 'Blockchain Technology Explained' },
];

export default function LearnPage() {
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
              STEP 1 — LEARN
            </Badge>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight lg:text-6xl">
              Understanding Bitcoin
            </h1>
            <p className="text-xl text-muted-foreground">
              Bitcoin is more than a digital currency — it is a new form of money engineered to be
              scarce, borderless, and censorship-resistant. Start here.
            </p>
          </div>
        </div>
      </section>

      {/* What is Bitcoin */}
      <section className="border-y border-border bg-card py-20">
        <div className="container max-w-4xl">
          <div className="flex flex-col gap-3">
            <Badge variant="outline" className="w-fit border-primary/40 text-primary">
              THE BASICS
            </Badge>
            <h2 className="text-3xl font-bold">What is Bitcoin?</h2>
          </div>
          <div className="mt-8 grid gap-6 text-muted-foreground lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <p className="leading-relaxed">
                Bitcoin is a <strong className="text-foreground">peer-to-peer digital currency</strong> launched
                in 2009 by the pseudonymous Satoshi Nakamoto. It operates without any central authority
                — no central bank, no company, no government.
              </p>
              <p className="leading-relaxed">
                Transactions are recorded on a public ledger called the <strong className="text-foreground">blockchain</strong>,
                maintained by a global network of computers. Anyone can participate, verify, and audit
                the entire history of Bitcoin.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <p className="leading-relaxed">
                Bitcoin&apos;s monetary policy is encoded in its software: a fixed supply of{' '}
                <strong className="text-foreground">21 million coins</strong>, issued on a declining
                schedule that halves every 210,000 blocks (~4 years). No entity can change this.
              </p>
              <p className="leading-relaxed">
                Unlike gold, Bitcoin is infinitely divisible (down to 1 satoshi = 0.00000001 BTC),
                instantly transferable worldwide, and cryptographically verifiable — combining the
                scarcity of gold with the utility of digital payments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Monetary Properties */}
      <section className="py-20">
        <div className="container">
          <div className="mb-10 flex flex-col gap-3">
            <Badge variant="outline" className="w-fit border-primary/40 text-primary">
              MONETARY PROPERTIES
            </Badge>
            <h2 className="text-3xl font-bold">Why Bitcoin is Sound Money</h2>
            <p className="max-w-2xl text-muted-foreground">
              Sound money must satisfy a strict set of properties. Bitcoin meets all of them — most
              better than gold or fiat currency.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MONETARY_PROPERTIES.map(({ icon: Icon, title, desc }) => (
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

      {/* How it works */}
      <section className="border-y border-border bg-card py-20">
        <div className="container max-w-4xl">
          <div className="mb-10 flex flex-col gap-3">
            <Badge variant="outline" className="w-fit border-primary/40 text-primary">
              HOW IT WORKS
            </Badge>
            <h2 className="text-3xl font-bold">From Transaction to Confirmation</h2>
            <p className="max-w-2xl text-muted-foreground">
              Every Bitcoin transaction follows the same path through a decentralized network of nodes
              and miners. Here&apos;s what happens when you send BTC.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex gap-5">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="w-px flex-1 bg-border" />
                </div>
                <div className="pb-6">
                  <span className="font-mono text-xs text-muted-foreground">{step}</span>
                  <h3 className="mb-1 mt-0.5 font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bitcoin vs Fiat */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <div className="mb-8 flex flex-col gap-3">
            <Badge variant="outline" className="w-fit border-primary/40 text-primary">
              COMPARISON
            </Badge>
            <h2 className="text-3xl font-bold">Bitcoin vs. Traditional Money</h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-4 text-left font-semibold">Property</th>
                  <th className="p-4 text-center font-semibold text-primary">Bitcoin</th>
                  <th className="p-4 text-center font-semibold text-muted-foreground">Fiat Currency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ['Supply', 'Fixed — 21M max', 'Unlimited — printed at will'],
                  ['Inflation', 'Programmatic, declining to 0', 'Unpredictable, political'],
                  ['Custody', 'Self-custody possible', 'Requires a bank'],
                  ['Borders', 'No restrictions', 'Capital controls, SWIFT delays'],
                  ['Censorship', 'Permissionless', 'Accounts can be frozen'],
                  ['Auditing', 'Fully transparent', 'Opaque central bank'],
                  ['Divisibility', '0.00000001 BTC (satoshi)', 'Usually 2 decimal places'],
                ].map(([prop, btc, fiat]) => (
                  <tr key={prop} className="hover:bg-muted/20">
                    <td className="p-4 font-medium">{prop}</td>
                    <td className="p-4 text-center text-green-500">{btc}</td>
                    <td className="p-4 text-center text-muted-foreground">{fiat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Security basics */}
      <section className="border-y border-border bg-card py-20">
        <div className="container max-w-4xl">
          <div className="mb-8 flex flex-col gap-3">
            <Badge variant="outline" className="w-fit border-primary/40 text-primary">
              SECURITY BASICS
            </Badge>
            <h2 className="text-3xl font-bold">Protecting What You Own</h2>
            <p className="max-w-2xl text-muted-foreground">
              Bitcoin&apos;s greatest strength is also its responsibility: you are your own bank.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {SECURITY_BASICS.map(({ title, desc, color }) => (
              <Card key={title} className="h-full">
                <CardContent className="flex flex-col gap-3 p-6">
                  <div className={`w-fit rounded-lg px-2.5 py-1 text-xs font-semibold ${color}`}>
                    {title}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Deep dive blog */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <div className="mb-8 flex flex-col gap-3">
            <Badge variant="outline" className="w-fit border-primary/40 text-primary">
              DEEP DIVES
            </Badge>
            <h2 className="text-3xl font-bold">Continue Reading</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {BLOG_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="group">
                <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA to next step */}
      <section className="border-t border-border bg-card py-20">
        <div className="container max-w-2xl text-center">
          <h2 className="mb-3 text-2xl font-bold">Ready to Buy Your First Bitcoin?</h2>
          <p className="mb-8 text-muted-foreground">
            Now that you understand the fundamentals, learn how to safely purchase Bitcoin.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/buy">
                How to Buy Bitcoin <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/tools/price-converter">Price Converter</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
