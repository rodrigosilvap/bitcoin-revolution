'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'pt-BR', label: 'Português' },
];

export function LanguageSwitch() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    // Replace locale prefix in the path
    let newPath = pathname;
    if (pathname.startsWith(`/${locale}`)) {
      newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    } else {
      // English (no prefix) → add pt-BR prefix
      newPath = `/${newLocale}${pathname}`;
    }
    // English is the default locale — strip its prefix
    if (newLocale === 'en') {
      newPath = newPath.replace(/^\/en/, '') || '/';
    }
    router.push(newPath);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Switch language">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map(({ code, label }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => switchLocale(code)}
            className={locale === code ? 'font-semibold text-primary' : ''}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
