import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getLocale } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Bitcoin Revolution',
    default: 'Bitcoin Revolution — Learn, Invest, Secure',
  },
  description: 'Learn everything you need to preserve and grow your wealth through Bitcoin.',
  keywords: ['bitcoin', 'cryptocurrency', 'investment', 'blockchain', 'btc'],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
