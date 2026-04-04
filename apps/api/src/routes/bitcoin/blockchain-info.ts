import type { FastifyInstance } from 'fastify';
import { cache } from '../../cache.js';
import { fetchBlockchainInfo } from '../../services/blockchain-info.js';

const TTL = 300;
const CACHE_KEY = 'blockchain-info';

export async function blockchainInfoRoute(app: FastifyInstance) {
  app.get('/bitcoin/blockchain-info', async (_request, reply) => {
    const cached = cache.get(CACHE_KEY);
    if (cached) return reply.send(cached);

    try {
      const data = await fetchBlockchainInfo();
      cache.set(CACHE_KEY, data, TTL);
      return reply.send(data);
    } catch (error) {
      app.log.error(error, '[GET /bitcoin/blockchain-info]');
      return reply.status(502).send({ error: 'Failed to fetch blockchain info' });
    }
  });
}
