import { getRedisClient } from '../redis/index.js';
import { config } from '../config/index.js';
import {
  normalizeKey,
  parentDir,
  baseName,
  metaKey,
  childrenKey,
  bucketConfigKey,
  BUCKETS_KEY,
} from '../utils/path.js';

function defaultBackend() {
  const b = String(config.storage.blobBackend || 'github').toLowerCase();
  return b === 'telegram' || b === 'tg' ? 'telegram' : 'github';
}

function toStored(meta) {
  return {
    fileId: meta.fileId || '',
    messageId: meta.messageId != null && meta.messageId !== '' ? String(meta.messageId) : '',
    size: String(meta.size ?? 0),
    contentType: meta.contentType || 'application/octet-stream',
    etag: meta.etag || '',
    mtime: meta.mtime || new Date().toISOString(),
    isDir: meta.isDir ? '1' : '0',
    backend: meta.backend || '',
    sha: meta.sha || '',
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
    backend: hash.backend || '',
    sha: hash.sha || '',
  };
}

export function createRedisIndex() {
  return {
    name: 'redis',

    async ensureBucket(bucket, opts = {}) {
      const redis = await getRedisClient();
      await redis.sadd(BUCKETS_KEY, bucket);
      const key = bucketConfigKey(bucket);
      const exists = await redis.exists(key);
      if (!exists) {
        await redis.hset(key, {
          backend: opts.backend || defaultBackend(),
          creationDate: new Date().toISOString(),
        });
      } else if (opts.backend) {
        await redis.hset(key, { backend: opts.backend });
      }
    },

    async getBucketConfig(bucket) {
      const redis = await getRedisClient();
      const hash = await redis.hgetall(bucketConfigKey(bucket));
      if (!hash || !Object.keys(hash).length) {
        return { name: bucket, backend: defaultBackend(), creationDate: '' };
      }
      return {
        name: bucket,
        backend: hash.backend || defaultBackend(),
        creationDate: hash.creationDate || '',
      };
    },

    async setBucketConfig(bucket, { backend } = {}) {
      const redis = await getRedisClient();
      await redis.sadd(BUCKETS_KEY, bucket);
      const key = bucketConfigKey(bucket);
      const patch = {};
      if (backend) patch.backend = backend;
      if (!(await redis.exists(key))) {
        patch.creationDate = new Date().toISOString();
        if (!patch.backend) patch.backend = defaultBackend();
      }
      if (Object.keys(patch).length) {
        await redis.hset(key, patch);
      }
      return this.getBucketConfig(bucket);
    },

    async listBuckets() {
      const redis = await getRedisClient();
      return (await redis.smembers(BUCKETS_KEY)).sort();
    },

    async deleteBucket(bucket) {
      const redis = await getRedisClient();
      await redis.srem(BUCKETS_KEY, bucket);
      await redis.del(childrenKey(bucket, ''));
      await redis.del(bucketConfigKey(bucket));
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
