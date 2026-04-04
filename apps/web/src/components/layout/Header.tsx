import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';
import { ThemeToggle } from './ThemeToggle';
import { MobileMenu } from './MobileMenu';
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
          <Image src="/images/icons/logo.png" alt="Bitcoin" width={28} height={28} />
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
          <MobileMenu
            logoLabel={t('header.logo')}
            toggleLabel={t('header.toggleMenu')}
            links={navLinks}
          />
        </div>
      </div>
    </header>
  );
}
