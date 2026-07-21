import { config } from '../config/index.js';
import { createRedisIndex } from './redis.js';
import { createPocketBaseIndex } from './pocketbase.js';

let cached = null;

/**
 * Resolve index backend: redis | pocketbase
 * Default: redis if UPSTASH_REDIS_URI set, else pocketbase if POCKETBASE_URL set.
 */
export function getIndexBackend() {
  if (cached) return cached;

  const backend = (config.storage.indexBackend || '').toLowerCase();

  if (backend === 'pocketbase' || backend === 'pb') {
    cached = createPocketBaseIndex();
  } else if (backend === 'redis') {
    cached = createRedisIndex();
  } else if (config.pocketbase.url && !config.redis.uri) {
    cached = createPocketBaseIndex();
  } else {
    cached = createRedisIndex();
  }

  return cached;
}

export function resetIndexBackend() {
  cached = null;
}
