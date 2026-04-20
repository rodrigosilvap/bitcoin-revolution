import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/navigation';
import { ThemeToggle } from './ThemeToggle';
import { MobileMenu } from './MobileMenu';
import { LanguageSwitch } from './LanguageSwitch';
import { HeaderBtcPrice } from './HeaderBtcPrice';

export async function Header() {
  const t = await getTranslations();

  const guideLinks = [
    { href: '/learn', label: t('nav.learn') },
    { href: '/buy', label: t('nav.buy') },
    { href: '/secure', label: t('nav.secure') },
  ];

  const mainLinks = [
    { href: '/blog', label: t('nav.blog') },
    { href: '/tools', label: t('nav.tools') },
  ];

  const allLinks = [...guideLinks, ...mainLinks];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          <Image src="/images/icons/logo.png" alt="Bitcoin" width={28} height={28} />
          <span className="hidden text-lg sm:block">{t('header.logo')}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {guideLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {label}
            </Link>
          ))}

          {/* Divider */}
          <span className="mx-1 h-4 w-px bg-border" />

          {mainLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
            links={allLinks}
          />
        </div>
      </div>
    </header>
  );
}
