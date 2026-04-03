'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';
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
    router.replace(pathname, { locale: newLocale });
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
