import Fastify from 'fastify';
import cors from '@fastify/cors';
import { priceRoute } from './routes/bitcoin/price.js';
import { marketDataRoute } from './routes/bitcoin/market-data.js';
import { blockchainInfoRoute } from './routes/bitcoin/blockchain-info.js';
import { priceHistoryRoute } from './routes/bitcoin/price-history.js';
import { treasuriesRoute } from './routes/bitcoin/treasuries.js';

const PORT = Number(process.env['PORT'] ?? 3001);
const CORS_ORIGIN = process.env['CORS_ORIGIN'] ?? 'http://localhost:3000';

const app = Fastify({ logger: true });

await app.register(cors, { origin: CORS_ORIGIN });

await app.register(priceRoute);
await app.register(marketDataRoute);
await app.register(blockchainInfoRoute);
await app.register(priceHistoryRoute);
await app.register(treasuriesRoute);

app.get('/health', async () => ({ status: 'ok' }));

try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
