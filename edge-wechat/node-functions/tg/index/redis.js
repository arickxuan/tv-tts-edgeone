import { getRedisClient } from '../redis/index.js';
import {
  normalizeKey,
  parentDir,
  baseName,
  metaKey,
  childrenKey,
  BUCKETS_KEY,
} from '../utils/path.js';

function toStored(meta) {
  return {
    fileId: meta.fileId || '',
    messageId: meta.messageId != null && meta.messageId !== '' ? String(meta.messageId) : '',
    size: String(meta.size ?? 0),
    contentType: meta.contentType || 'application/octet-stream',
    etag: meta.etag || '',
    mtime: meta.mtime || new Date().toISOString(),
    isDir: meta.isDir ? '1' : '0',
  };
}

function fromStored(hash) {
  if (!hash || !Object.keys(hash).length) return null;
  return {
    fileId: hash.fileId || '',
    messageId: hash.messageId ? Number(hash.messageId) : null,
    size: Number(hash.size || 0),
    contentType: hash.contentType || 'application/octet-stream',
    etag: hash.etag || '',
    mtime: hash.mtime || new Date().toISOString(),
    isDir: hash.isDir === '1' || hash.isDir === 1 || hash.isDir === true,
  };
}

export function createRedisIndex() {
  return {
    name: 'redis',

    async ensureBucket(bucket) {
      const redis = await getRedisClient();
      await redis.sadd(BUCKETS_KEY, bucket);
    },

    async listBuckets() {
      const redis = await getRedisClient();
      return (await redis.smembers(BUCKETS_KEY)).sort();
    },

    async deleteBucket(bucket) {
      const redis = await getRedisClient();
      await redis.srem(BUCKETS_KEY, bucket);
      await redis.del(childrenKey(bucket, ''));
    },

    async getMeta(bucket, key) {
      const redis = await getRedisClient();
      const k = normalizeKey(key);
      return fromStored(await redis.hgetall(metaKey(bucket, k)));
    },

    async setMeta(bucket, key, meta) {
      const redis = await getRedisClient();
      const k = normalizeKey(key);
      await redis.hset(metaKey(bucket, k), toStored(meta));
    },

    async deleteMeta(bucket, key) {
      const redis = await getRedisClient();
      await redis.del(metaKey(bucket, normalizeKey(key)));
    },

    async listChildNames(bucket, dir) {
      const redis = await getRedisClient();
      return redis.smembers(childrenKey(bucket, normalizeKey(dir)));
    },

    async addChild(bucket, dir, name) {
      const redis = await getRedisClient();
      if (!name) return;
      await redis.sadd(childrenKey(bucket, normalizeKey(dir)), name);
    },

    async removeChild(bucket, dir, name) {
      const redis = await getRedisClient();
      if (!name) return;
      await redis.srem(childrenKey(bucket, normalizeKey(dir)), name);
    },

    async clearChildren(bucket, dir) {
      const redis = await getRedisClient();
      await redis.del(childrenKey(bucket, normalizeKey(dir)));
    },

    /**
     * Ensure ancestor directory nodes + children links exist.
     */
    async linkPath(bucket, key) {
      const k = normalizeKey(key);
      const name = baseName(k);
      if (!name) return;

      await this.addChild(bucket, parentDir(k), name);

      let cur = parentDir(k);
      while (cur) {
        const existing = await this.getMeta(bucket, cur);
        if (!existing) {
          await this.setMeta(bucket, cur, {
            isDir: true,
            size: 0,
            contentType: 'application/x-directory',
            etag: '',
            mtime: new Date().toISOString(),
            fileId: '',
            messageId: null,
          });
        }
        await this.addChild(bucket, parentDir(cur), baseName(cur));
        cur = parentDir(cur);
      }
    },

    async unlinkPath(bucket, key) {
      const k = normalizeKey(key);
      await this.removeChild(bucket, parentDir(k), baseName(k));
    },
  };
}
