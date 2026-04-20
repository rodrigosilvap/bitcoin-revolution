import type { Metadata } from 'next';
import { Link } from '@/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield,
  Key,
  Lock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Cpu,
  Wifi,
  WifiOff,
  FileText,
  EyeOff,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'How to Secure Bitcoin — Self-Custody & Seed Phrase Guide',
  description:
    'Learn how to protect your Bitcoin with hardware wallets, seed phrase best practices, and self-custody strategies. Not your keys, not your coins.',
};

const WALLET_TYPES = [
  {
    icon: Wifi,
    title: 'Hot Wallet (Software)',
    examples: 'Electrum, BlueWallet, Muun',
    best: 'Spending money & small amounts',
    risk: 'Connected to the internet — vulnerable to malware',
    color: 'border-amber-500/30 bg-amber-500/5',
    badge: 'Convenient',
    badgeColor: 'bg-amber-500/10 text-amber-500',
  },
  {
    icon: Cpu,
    title: 'Hardware Wallet (Cold)',
    examples: 'Ledger Nano X, Trezor Model T, Coldcard',
    best: 'Savings & long-term storage',
    risk: 'Requires physical access — safer but less convenient',
    color: 'border-green-500/30 bg-green-500/5',
    badge: 'Recommended',
    badgeColor: 'bg-green-500/10 text-green-500',
  },
  {
    icon: WifiOff,
    title: 'Air-Gapped / Paper Wallet',
    examples: 'Coldcard (air-gapped), paper wallet',
    best: 'Maximum security for large holdings',
    risk: 'Complex to set up correctly — best for advanced users',
    color: 'border-primary/30 bg-primary/5',
    badge: 'Advanced',
    badgeColor: 'bg-primary/10 text-primary',
  },
];

const SEED_STEPS = [
  {
    num: '01',
    title: 'Generate offline',
    desc: 'Create your seed phrase on a hardware wallet or trusted offline device. Never generate it on an internet-connected phone or computer.',
  },
  {
    num: '02',
    title: 'Write it down immediately',
    desc: 'Write all 12 or 24 words in order on the provided recovery card. Use pen, not pencil. Write clearly — you may be reading this in an emergency.',
  },
  {
    num: '03',
    title: 'Verify the words',
    desc: 'Most devices will quiz you on your seed phrase after setup. Do not skip this. This confirms you wrote it down correctly.',
  },
  {
    num: '04',
    title: 'Store it safely offline',
    desc: 'Keep it in a fireproof safe or a bank safety deposit box. Consider a metal backup (Cryptosteel, Bilodal) for fire and water resistance.',
  },
  {
    num: '05',
    title: 'Never store digitally',
    desc: "Never photograph it, email it, type it into any website or app, or store it in cloud storage or a password manager. Ever.",
  },
  {
    num: '06',
    title: 'Consider geographic distribution',
    desc: 'For large amounts, keep copies in two separate physical locations. If one is destroyed (fire, flood), you can still recover.',
  },
];

const CHECKLIST = [
  { text: 'I use a hardware wallet for savings above $1,000', critical: true },
  { text: 'My seed phrase is written on paper (or metal) and stored offline', critical: true },
  { text: "I've verified my seed phrase against the recovery quiz", critical: true },
  { text: 'My seed phrase is NOT stored in any phone, email, or cloud service', critical: true },
  { text: 'I use a unique strong password + 2FA on every exchange account', critical: false },
  { text: "I verify recipient addresses character-by-character before sending", critical: false },
  { text: 'I keep my wallet firmware and software up to date', critical: false },
  { text: 'I have a plan for inheritance (trusted person knows how to access)', critical: false },
];

const HARDWARE_WALLETS = [
  {
    name: 'Ledger Nano X',
    price: '~$149',
    best: 'Best for beginners — Bluetooth, mobile app, easy UI.',
    note: 'Closed-source secure element. Reputable company.',
  },
  {
    name: 'Trezor Model T',
    best: 'Best open-source option — fully auditable firmware.',
    price: '~$179',
    note: 'No secure element, but fully open source. Strong community.',
  },
  {
    name: 'Coldcard Mk4',
    best: 'Best for advanced users — air-gap capable, paranoid security.',
    price: '~$149',
    note: 'Bitcoin-only. Steep learning curve but gold standard for security.',
  },
];

export default function SecurePage() {
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
              STEP 3 — SECURE
            </Badge>
            <h1 className="mb-5 text-4xl font-extrabold tracking-tight lg:text-6xl">
              Protect Your Bitcoin
            </h1>
            <p className="text-xl text-muted-foreground">
              Bitcoin&apos;s greatest strength is that you can be your own bank. But that power
              comes with responsibility. Learn how to secure your coins properly.
            </p>
          </div>
        </div>
      </section>

      {/* The Golden Rule */}
      <section className="border-y border-border bg-card py-16">
        <div className="container max-w-3xl text-center">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8 lg:p-12">
            <Key className="mx-auto mb-4 h-10 w-10 text-primary" />
            <blockquote className="mb-4 text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
              &ldquo;Not your keys, not your coins.&rdquo;
            </blockquote>
            <p className="text-muted-foreground">
              If you hold Bitcoin on an exchange, you are trusting that company to give it back
              when you ask. Exchanges have been hacked, frozen, and gone bankrupt (FTX, Mt. Gox,
              Celsius). Self-custody removes this counterparty risk entirely.
            </p>
          </div>
        </div>
      </section>

      {/* Wallet types */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <div className="mb-8 flex flex-col gap-3">
            <Badge variant="outline" className="w-fit border-primary/40 text-primary">
              WALLET TYPES
            </Badge>
            <h2 className="text-3xl font-bold">Choosing the Right Wallet</h2>
            <p className="max-w-2xl text-muted-foreground">
              Different wallets suit different purposes. Most people should use a hardware wallet for
              savings and a software wallet for day-to-day spending.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {WALLET_TYPES.map(({ icon: Icon, title, examples, best, risk, color, badge, badgeColor }) => (
              <Card key={title} className={`h-full ${color}`}>
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex items-start justify-between">
                    <Icon className="h-6 w-6 text-foreground" />
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeColor}`}>
                      {badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">{title}</h3>
                    <p className="text-xs text-muted-foreground">{examples}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-1.5 text-xs">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                      <span className="text-muted-foreground">{best}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-xs">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                      <span className="text-muted-foreground">{risk}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Hardware wallet recommendations */}
      <section className="border-y border-border bg-card py-20">
        <div className="container max-w-4xl">
          <div className="mb-8 flex flex-col gap-3">
            <Badge variant="outline" className="w-fit border-primary/40 text-primary">
              HARDWARE WALLETS
            </Badge>
            <h2 className="text-3xl font-bold">Recommended Devices</h2>
            <p className="max-w-2xl text-muted-foreground">
              Always buy hardware wallets directly from the manufacturer. Never buy second-hand or
              from third-party sellers — devices can be tampered with.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {HARDWARE_WALLETS.map(({ name, price, best, note }) => (
              <Card key={name} className="transition-all duration-200 hover:border-primary/40">
                <CardContent className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:gap-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Cpu className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{name}</h3>
                      <span className="font-mono text-sm text-muted-foreground">{price}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{best}</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">{note}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Seed phrase guide */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <div className="mb-10 flex flex-col gap-3">
            <Badge variant="outline" className="w-fit border-primary/40 text-primary">
              SEED PHRASE
            </Badge>
            <h2 className="text-3xl font-bold">Your Seed Phrase — Handle With Care</h2>
            <p className="max-w-2xl text-muted-foreground">
              A seed phrase (12 or 24 BIP39 words) is the master key to all addresses in your wallet.
              Anyone who has it can take your Bitcoin. Follow these steps exactly.
            </p>
          </div>

          {/* Critical warning */}
          <Card className="mb-8 border-red-500/30 bg-red-500/5">
            <CardContent className="flex items-start gap-3 p-5">
              <EyeOff className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-red-500">Never enter your seed phrase online.</strong> No
                legitimate wallet, exchange, or support team will ever ask for it. If any website
                or app asks for your seed phrase, it is a scam.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            {SEED_STEPS.map(({ num, title, desc }) => (
              <div key={num} className="flex gap-5">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="font-mono text-xs font-bold text-primary">{num}</span>
                  </div>
                  <div className="w-px flex-1 bg-border" />
                </div>
                <div className="pb-5">
                  <h3 className="mb-1 font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/tools/bip39-seed">
                <Key className="mr-2 h-4 w-4" />
                BIP39 Seed Tool
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tools/address-validator">Address Validator</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Security checklist */}
      <section className="border-y border-border bg-card py-20">
        <div className="container max-w-4xl">
          <div className="mb-8 flex flex-col gap-3">
            <Badge variant="outline" className="w-fit border-primary/40 text-primary">
              CHECKLIST
            </Badge>
            <h2 className="text-3xl font-bold">Security Checklist</h2>
            <p className="text-muted-foreground">
              Run through this list before considering your Bitcoin setup secure.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {CHECKLIST.map(({ text, critical }) => (
              <div
                key={text}
                className="flex items-start gap-3 rounded-xl border border-border bg-background p-4"
              >
                {critical ? (
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                )}
                <div className="flex flex-1 items-center justify-between gap-3">
                  <span className="text-sm">{text}</span>
                  {critical && (
                    <Badge variant="outline" className="shrink-0 border-primary/30 text-[10px] text-primary">
                      Critical
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced: multi-sig note */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <div className="mb-6 flex flex-col gap-3">
            <Badge variant="outline" className="w-fit border-primary/40 text-primary">
              ADVANCED
            </Badge>
            <h2 className="text-3xl font-bold">Multi-Signature for Large Holdings</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Card>
              <CardContent className="flex flex-col gap-3 p-6">
                <Lock className="h-6 w-6 text-primary" />
                <h3 className="font-semibold">What is Multi-Sig?</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Multi-signature (multi-sig) requires multiple private keys to authorise a
                  transaction — e.g. 2-of-3, meaning any 2 of 3 keys must sign. This eliminates
                  any single point of failure.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-3 p-6">
                <FileText className="h-6 w-6 text-primary" />
                <h3 className="font-semibold">When to use it?</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Consider multi-sig when your Bitcoin holdings exceed an amount you&apos;d be
                  devastated to lose to a single failure — hardware failure, theft, or a compromised
                  seed phrase. Sparrow Wallet + Coldcard is a popular open-source setup.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card py-20">
        <div className="container max-w-2xl text-center">
          <h2 className="mb-3 text-2xl font-bold">You&apos;re Ready</h2>
          <p className="mb-8 text-muted-foreground">
            You&apos;ve learned Bitcoin fundamentals, bought your first coins, and secured them properly.
            Now explore our tools to monitor the market and deepen your knowledge.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/tools">
                Explore Bitcoin Tools <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/blog">Read the Blog</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
