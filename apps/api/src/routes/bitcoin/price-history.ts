import type { FastifyInstance } from 'fastify';
import { cache } from '../../cache.js';
import { fetchPriceHistory } from '../../services/coingecko.js';

const TTL = 300;

export async function priceHistoryRoute(app: FastifyInstance) {
  app.get('/bitcoin/price-history', async (request, reply) => {
    const query = request.query as { days?: string; currency?: string };
    const days = query.days ?? '7';
    const currency = (query.currency ?? 'USD').toUpperCase();

    const cacheKey = `price-history:${days}:${currency}`;
    const cached = cache.get(cacheKey);
    if (cached) return reply.send(cached);

    try {
      const data = await fetchPriceHistory(days, currency);
      cache.set(cacheKey, data, TTL);
      return reply.send(data);
    } catch (error) {
      app.log.error(error, '[GET /bitcoin/price-history]');
      return reply.status(502).send({ error: 'Failed to fetch price history' });
    }
  });
}
