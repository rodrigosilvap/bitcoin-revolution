import type { FastifyInstance } from 'fastify';
import { cache } from '../../cache.js';
import { fetchPrice } from '../../services/coingecko.js';

const TTL = 60; // seconds

export async function priceRoute(app: FastifyInstance) {
  app.get('/bitcoin/price', async (request, reply) => {
    const query = request.query as { currency?: string; currencies?: string };
    const vsCurrencies = query.currencies
      ? query.currencies.toLowerCase()
      : (query.currency ?? 'USD').toLowerCase();

    const cacheKey = `price:${vsCurrencies}`;
    const cached = cache.get(cacheKey);
    if (cached) return reply.send(cached);

    try {
      const result = await fetchPrice(vsCurrencies);
      // Single-currency: unwrap to flat object
      const keys = Object.keys(result);
      const response = query.currencies ? result : result[keys[0]!]!;
      cache.set(cacheKey, response, TTL);
      return reply.send(response);
    } catch (error) {
      app.log.error(error, '[GET /bitcoin/price]');
      return reply.status(502).send({ error: 'Failed to fetch price' });
    }
  });
}
