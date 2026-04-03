import { createNavigation } from 'next-intl/navigation';

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales: ['en', 'pt-BR'] as const,
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});
