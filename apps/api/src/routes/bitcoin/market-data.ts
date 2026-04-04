import type { FastifyInstance } from 'fastify';
import { cache } from '../../cache.js';
import { fetchMarketData } from '../../services/coingecko.js';

const TTL = 60;
const CACHE_KEY = 'market-data';

export async function marketDataRoute(app: FastifyInstance) {
  app.get('/bitcoin/market-data', async (_request, reply) => {
    const cached = cache.get(CACHE_KEY);
    if (cached) return reply.send(cached);

    try {
      const data = await fetchMarketData();
      cache.set(CACHE_KEY, data, TTL);
      return reply.send(data);
    } catch (error) {
      app.log.error(error, '[GET /bitcoin/market-data]');
      return reply.status(502).send({ error: 'Failed to fetch market data' });
    }
  });
}
