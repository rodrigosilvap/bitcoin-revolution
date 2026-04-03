import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/blog/blog.html', destination: '/blog', permanent: true },
      { source: '/blog/blog-post.html', destination: '/blog', permanent: true },
      { source: '/tools/tools.html', destination: '/tools', permanent: true },
      { source: '/tools/market-data.html', destination: '/tools/market-data', permanent: true },
      { source: '/tools/price-converter.html', destination: '/tools/price-converter', permanent: true },
      { source: '/tools/dca-simulator.html', destination: '/tools/dca-simulator', permanent: true },
      { source: '/tools/address-validator.html', destination: '/tools/address-validator', permanent: true },
      { source: '/tools/bip39-seed.html', destination: '/tools/bip39-seed', permanent: true },
      { source: '/tools/btc-treasuries.html', destination: '/tools/btc-treasuries', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
