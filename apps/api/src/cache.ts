import NodeCache from 'node-cache';

// Shared cache instance. TTL is set per-key at write time.
export const cache = new NodeCache({ useClones: false });
