import type { FastifyInstance } from 'fastify';
import { cache } from '../../cache.js';
import { fetchTreasuries } from '../../services/coingecko.js';

const TTL = 300; // 5 minutes — treasury data changes infrequently
const CACHE_KEY = 'treasuries';

export async function treasuriesRoute(app: FastifyInstance) {
  app.get('/bitcoin/treasuries', async (_request, reply) => {
    const cached = cache.get(CACHE_KEY);
    if (cached) return reply.send(cached);

    try {
      const data = await fetchTreasuries();
      cache.set(CACHE_KEY, data, TTL);
      return reply.send(data);
    } catch (error) {
      app.log.error(error, '[GET /bitcoin/treasuries]');
      return reply.status(502).send({ error: 'Failed to fetch treasury data' });
    }
  });
}
