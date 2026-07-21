import PocketBase from 'pocketbase';
import { config } from '../config/index.js';
import { normalizeKey, parentDir, baseName } from '../utils/path.js';

const BUCKETS = 'tgfs_buckets';
const OBJECTS = 'tgfs_objects';

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

  // Re-auth every 10 minutes
  if (Date.now() - authAt > 10 * 60 * 1000 || !pbInstance.authStore.isValid) {
    const { adminEmail, adminPassword, authToken } = config.pocketbase;
    if (authToken) {
      pbInstance.authStore.save(authToken, null);
    } else if (adminEmail && adminPassword) {
      // PB >=0.23: admins → _superusers（admins 仍为别名）
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
 * PocketBase collections (create in Admin UI):
 *
 * tgfs_buckets:
 *   name (text, required, unique)
 *   creation_date (text)
 *
 * tgfs_objects:
 *   bucket (text, required)
 *   key (text, required) — full object path
 *   parent (text) — parent directory path ('' for root)
 *   name (text) — basename
 *   file_id (text)
 *   message_id (number)
 *   size (number)
 *   content_type (text)
 *   etag (text)
 *   mtime (text)
 *   is_dir (bool)
 *   unique index: (bucket, key)
 */
export function createPocketBaseIndex() {
  return {
    name: 'pocketbase',

    async ensureBucket(bucket) {
      const pb = await getPb();
      const existing = await findBucket(pb, bucket);
      if (!existing) {
        await pb.collection(BUCKETS).create({
          name: bucket,
          creation_date: new Date().toISOString(),
        });
      }
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
      };

      const existing = await findObject(pb, bucket, k);
      if (existing) {
        await pb.collection(OBJECTS).update(existing.id, payload);
      } else {
        await pb.collection(OBJECTS).create(payload);
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

    // Children derived from parent field; no-ops kept for interface parity
    async addChild() {},
    async removeChild() {},
    async clearChildren() {},

    async linkPath(bucket, key) {
      const k = normalizeKey(key);
      // Ensure ancestor dir records exist
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

    async unlinkPath() {
      // parent relation is on the deleted record itself
    },
  };
}
