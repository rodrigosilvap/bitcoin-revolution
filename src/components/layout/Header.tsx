import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitch } from './LanguageSwitch';
import { HeaderBtcPrice } from './HeaderBtcPrice';

export async function Header() {
  const t = await getTranslations();

  const navLinks = [
    { href: '/blog', label: t('nav.blog') },
    { href: '/tools', label: t('nav.tools') },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          <Image src="/images/icons/btc_logo.png" alt="Bitcoin" width={28} height={28} />
          <span className="hidden text-lg sm:block">{t('header.logo')}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <HeaderBtcPrice />
          <ThemeToggle />
          <LanguageSwitch />

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label={t('header.toggleMenu')}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{t('header.logo')}</SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-4">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-lg font-medium text-foreground hover:text-primary"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
