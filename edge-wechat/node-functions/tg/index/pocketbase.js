import PocketBase from 'pocketbase';
import { config } from '../config/index.js';
import { normalizeKey, parentDir, baseName } from '../utils/path.js';

const BUCKETS = 'tgfs_buckets';
const OBJECTS = 'tgfs_objects';

function defaultBackend() {
  const b = String(config.storage.blobBackend || 'github').toLowerCase();
  return b === 'telegram' || b === 'tg' ? 'telegram' : 'github';
}

let pbInstance = null;
let authAt = 0;

async function getPb() {
  if (!config.pocketbase.url) {
    throw new Error('POCKETBASE_URL 未配置');
  }
  if (!pbInstance) {
    pbInstance = new PocketBase(config.pocketbase.url);
    pbInstance.autoCancellation(false);
  }

  if (Date.now() - authAt > 10 * 60 * 1000 || !pbInstance.authStore.isValid) {
    const { adminEmail, adminPassword, authToken } = config.pocketbase;
    if (authToken) {
      pbInstance.authStore.save(authToken, null);
    } else if (adminEmail && adminPassword) {
      await pbInstance.collection('_superusers').authWithPassword(adminEmail, adminPassword);
    } else {
      throw new Error('PocketBase 需配置 POCKETBASE_AUTH_TOKEN 或 ADMIN 账号');
    }
    authAt = Date.now();
  }
  return pbInstance;
}

function escapeFilter(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function fromRecord(rec) {
  if (!rec) return null;
  return {
    fileId: rec.file_id || '',
    messageId: rec.message_id != null && rec.message_id !== '' ? Number(rec.message_id) : null,
    size: Number(rec.size || 0),
    contentType: rec.content_type || 'application/octet-stream',
    etag: rec.etag || '',
    mtime: rec.mtime || new Date().toISOString(),
    isDir: !!rec.is_dir,
    backend: rec.backend || '',
    sha: rec.sha || '',
    _id: rec.id,
  };
}

async function findObject(pb, bucket, key) {
  const k = normalizeKey(key);
  const filter = `bucket="${escapeFilter(bucket)}" && key="${escapeFilter(k)}"`;
  try {
    return await pb.collection(OBJECTS).getFirstListItem(filter);
  } catch (err) {
    if (err?.status === 404) return null;
    throw err;
  }
}

async function findBucket(pb, name) {
  try {
    return await pb.collection(BUCKETS).getFirstListItem(`name="${escapeFilter(name)}"`);
  } catch (err) {
    if (err?.status === 404) return null;
    throw err;
  }
}

/**
 * tgfs_buckets: name, creation_date, backend(text 可选)
 * tgfs_objects: ... + backend, sha
 */
export function createPocketBaseIndex() {
  return {
    name: 'pocketbase',

    async ensureBucket(bucket, opts = {}) {
      const pb = await getPb();
      const existing = await findBucket(pb, bucket);
      if (!existing) {
        const payload = {
          name: bucket,
          creation_date: new Date().toISOString(),
          backend: opts.backend || defaultBackend(),
        };
        try {
          await pb.collection(BUCKETS).create(payload);
        } catch (err) {
          if (err?.status === 400) {
            delete payload.backend;
            await pb.collection(BUCKETS).create(payload);
          } else {
            throw err;
          }
        }
      } else if (opts.backend) {
        await this.setBucketConfig(bucket, { backend: opts.backend });
      }
    },

    async getBucketConfig(bucket) {
      const pb = await getPb();
      const rec = await findBucket(pb, bucket);
      if (!rec) {
        return { name: bucket, backend: defaultBackend(), creationDate: '' };
      }
      return {
        name: rec.name,
        backend: rec.backend || defaultBackend(),
        creationDate: rec.creation_date || '',
      };
    },

    async setBucketConfig(bucket, { backend } = {}) {
      const pb = await getPb();
      const rec = await findBucket(pb, bucket);
      if (!rec) {
        await this.ensureBucket(bucket, { backend });
        return this.getBucketConfig(bucket);
      }
      const payload = {};
      if (backend) payload.backend = backend;
      if (Object.keys(payload).length) {
        try {
          await pb.collection(BUCKETS).update(rec.id, payload);
        } catch (err) {
          if (err?.status !== 400) throw err;
        }
      }
      return this.getBucketConfig(bucket);
    },

    async listBuckets() {
      const pb = await getPb();
      const list = await pb.collection(BUCKETS).getFullList({ sort: 'name' });
      return list.map((r) => r.name);
    },

    async deleteBucket(bucket) {
      const pb = await getPb();
      const rec = await findBucket(pb, bucket);
      if (rec) {
        await pb.collection(BUCKETS).delete(rec.id);
      }
    },

    async getMeta(bucket, key) {
      const pb = await getPb();
      const rec = await findObject(pb, bucket, key);
      return fromRecord(rec);
    },

    async setMeta(bucket, key, meta) {
      const pb = await getPb();
      const k = normalizeKey(key);
      const payload = {
        bucket,
        key: k,
        parent: parentDir(k),
        name: baseName(k),
        file_id: meta.fileId || '',
        message_id: meta.messageId != null ? Number(meta.messageId) || 0 : 0,
        size: Number(meta.size || 0),
        content_type: meta.contentType || 'application/octet-stream',
        etag: meta.etag || '',
        mtime: meta.mtime || new Date().toISOString(),
        is_dir: !!meta.isDir,
        backend: meta.backend || '',
        sha: meta.sha || '',
      };

      const existing = await findObject(pb, bucket, k);
      try {
        if (existing) {
          await pb.collection(OBJECTS).update(existing.id, payload);
        } else {
          await pb.collection(OBJECTS).create(payload);
        }
      } catch (err) {
        if (err?.status === 400 && (payload.backend != null || payload.sha != null)) {
          delete payload.backend;
          delete payload.sha;
          if (existing) {
            await pb.collection(OBJECTS).update(existing.id, payload);
          } else {
            await pb.collection(OBJECTS).create(payload);
          }
        } else {
          throw err;
        }
      }
    },

    async deleteMeta(bucket, key) {
      const pb = await getPb();
      const rec = await findObject(pb, bucket, key);
      if (rec) {
        await pb.collection(OBJECTS).delete(rec.id);
      }
    },

    async listChildNames(bucket, dir) {
      const pb = await getPb();
      const parent = normalizeKey(dir);
      const filter = `bucket="${escapeFilter(bucket)}" && parent="${escapeFilter(parent)}"`;
      const list = await pb.collection(OBJECTS).getFullList({
        filter,
        fields: 'name',
        sort: 'name',
      });
      return list.map((r) => r.name).filter(Boolean);
    },

    async addChild() {},
    async removeChild() {},
    async clearChildren() {},

    async linkPath(bucket, key) {
      const k = normalizeKey(key);
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
        cur = parentDir(cur);
      }
    },

    async unlinkPath() {},
  };
}
