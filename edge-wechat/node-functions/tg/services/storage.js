import crypto from 'crypto';
import { getRedisClient } from '../redis/index.js';
import { config } from '../config/index.js';
import * as tg from './telegram.js';
import {
  normalizeKey,
  parentDir,
  baseName,
  joinKey,
  asPrefix,
  metaKey,
  childrenKey,
  BUCKETS_KEY,
} from '../utils/path.js';

function etagOf(buf) {
  return crypto.createHash('md5').update(buf).digest('hex');
}

function parseMeta(hash) {
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

async function ensureBucket(redis, bucket) {
  await redis.sadd(BUCKETS_KEY, bucket);
}

async function linkChild(redis, bucket, key) {
  const name = baseName(key);
  if (!name) return;
  const parent = parentDir(key);
  await redis.sadd(childrenKey(bucket, parent), name);

  let cur = parent;
  while (cur) {
    const mk = metaKey(bucket, cur);
    const exists = await redis.exists(mk);
    if (!exists) {
      await redis.hset(mk, {
        isDir: '1',
        size: '0',
        contentType: 'application/x-directory',
        etag: '',
        mtime: new Date().toISOString(),
        fileId: '',
        messageId: '',
      });
    }
    const pname = baseName(cur);
    const pparent = parentDir(cur);
    await redis.sadd(childrenKey(bucket, pparent), pname);
    cur = pparent;
  }
}

async function unlinkChild(redis, bucket, key) {
  const name = baseName(key);
  if (!name) return;
  const parent = parentDir(key);
  await redis.srem(childrenKey(bucket, parent), name);
}

export async function listBuckets() {
  const redis = await getRedisClient();
  const names = await redis.smembers(BUCKETS_KEY);
  if (!names.includes(config.storage.defaultBucket)) {
    await redis.sadd(BUCKETS_KEY, config.storage.defaultBucket);
    names.push(config.storage.defaultBucket);
  }
  return names.sort().map((name) => ({
    name,
    creationDate: new Date(0).toISOString(),
  }));
}

export async function createBucket(bucket) {
  const redis = await getRedisClient();
  await ensureBucket(redis, bucket);
  return { name: bucket };
}

export async function deleteBucket(bucket) {
  const redis = await getRedisClient();
  const children = await redis.smembers(childrenKey(bucket, ''));
  if (children.length > 0) {
    const err = new Error('BucketNotEmpty');
    err.code = 'BucketNotEmpty';
    err.status = 409;
    throw err;
  }
  await redis.srem(BUCKETS_KEY, bucket);
  await redis.del(childrenKey(bucket, ''));
}

export async function headObject({ bucket, key }) {
  const redis = await getRedisClient();
  const k = normalizeKey(key);
  const hash = await redis.hgetall(metaKey(bucket, k));
  const meta = parseMeta(hash);
  if (!meta) {
    const err = new Error('NoSuchKey');
    err.code = 'NoSuchKey';
    err.status = 404;
    throw err;
  }
  return { ...meta, key: k, bucket };
}

export async function getObject({ bucket, key }) {
  const meta = await headObject({ bucket, key });
  if (meta.isDir) {
    const err = new Error('IsADirectory');
    err.code = 'IsADirectory';
    err.status = 400;
    throw err;
  }
  if (!meta.fileId) {
    const err = new Error('NoSuchKey');
    err.code = 'NoSuchKey';
    err.status = 404;
    throw err;
  }
  const body = await tg.downloadByFileId(meta.fileId);
  return { body, meta };
}

export async function putObject({ bucket, key, body, contentType, caption }) {
  const redis = await getRedisClient();
  const k = normalizeKey(key);
  if (!k) {
    const err = new Error('Invalid key');
    err.status = 400;
    throw err;
  }

  await ensureBucket(redis, bucket);

  let oldMeta = null;
  try {
    oldMeta = await headObject({ bucket, key: k });
  } catch {
    oldMeta = null;
  }

  const buf = Buffer.isBuffer(body) ? body : Buffer.from(body);
  const filename = baseName(k) || 'file.bin';
  const ct = contentType || 'application/octet-stream';
  const captionText = caption || `${bucket}/${k}`;

  const uploaded = await tg.uploadBuffer(buf, filename, ct, captionText);
  const etag = etagOf(buf);
  const mtime = new Date().toISOString();

  await redis.hset(metaKey(bucket, k), {
    fileId: uploaded.fileId,
    messageId: String(uploaded.messageId),
    size: String(uploaded.fileSize),
    contentType: ct,
    etag,
    mtime,
    isDir: '0',
  });
  await linkChild(redis, bucket, k);

  if (oldMeta?.messageId && oldMeta.messageId !== uploaded.messageId) {
    await tg.deleteMessage(oldMeta.messageId);
  }

  return {
    bucket,
    key: k,
    etag,
    size: uploaded.fileSize,
    contentType: ct,
    mtime,
    fileId: uploaded.fileId,
    messageId: uploaded.messageId,
  };
}

export async function ensureDir({ bucket, key }) {
  const redis = await getRedisClient();
  const k = normalizeKey(key);
  if (!k) {
    await ensureBucket(redis, bucket);
    return { bucket, key: '', isDir: true };
  }

  await ensureBucket(redis, bucket);

  let existing = null;
  try {
    existing = await headObject({ bucket, key: k });
  } catch {
    existing = null;
  }
  if (existing && !existing.isDir) {
    const err = new Error('Conflict: path is a file');
    err.code = 'Conflict';
    err.status = 409;
    throw err;
  }

  await redis.hset(metaKey(bucket, k), {
    fileId: '',
    messageId: '',
    size: '0',
    contentType: 'application/x-directory',
    etag: '',
    mtime: new Date().toISOString(),
    isDir: '1',
  });
  await linkChild(redis, bucket, k);
  return { bucket, key: k, isDir: true };
}

export async function deleteObject({ bucket, key, recursive = false }) {
  const redis = await getRedisClient();
  const k = normalizeKey(key);

  let meta;
  try {
    meta = await headObject({ bucket, key: k });
  } catch (err) {
    if (err.code === 'NoSuchKey') return { deleted: false };
    throw err;
  }

  if (meta.isDir) {
    const kids = await redis.smembers(childrenKey(bucket, k));
    if (kids.length && !recursive) {
      const err = new Error('DirectoryNotEmpty');
      err.code = 'DirectoryNotEmpty';
      err.status = 409;
      throw err;
    }
    for (const name of kids) {
      await deleteObject({ bucket, key: joinKey(k, name), recursive: true });
    }
    await redis.del(childrenKey(bucket, k));
  } else if (meta.messageId) {
    await tg.deleteMessage(meta.messageId);
  }

  await redis.del(metaKey(bucket, k));
  await unlinkChild(redis, bucket, k);
  return { deleted: true, key: k };
}

export async function copyObject({ srcBucket, srcKey, destBucket, destKey }) {
  const src = await headObject({ bucket: srcBucket, key: srcKey });
  if (src.isDir) {
    const err = new Error('Cannot copy directory with copyObject');
    err.status = 400;
    throw err;
  }

  const redis = await getRedisClient();
  const dk = normalizeKey(destKey);
  await ensureBucket(redis, destBucket);

  await redis.hset(metaKey(destBucket, dk), {
    fileId: src.fileId,
    messageId: String(src.messageId || ''),
    size: String(src.size),
    contentType: src.contentType,
    etag: src.etag,
    mtime: new Date().toISOString(),
    isDir: '0',
  });
  await linkChild(redis, destBucket, dk);

  return { bucket: destBucket, key: dk, etag: src.etag, size: src.size };
}

export async function moveObject({ srcBucket, srcKey, destBucket, destKey }) {
  await copyObject({ srcBucket, srcKey, destBucket, destKey });
  const redis = await getRedisClient();
  const sk = normalizeKey(srcKey);
  await redis.del(metaKey(srcBucket, sk));
  await unlinkChild(redis, srcBucket, sk);
  return { bucket: destBucket, key: normalizeKey(destKey) };
}

/**
 * List objects under prefix. delimiter '/' yields CommonPrefixes.
 */
export async function listObjects({
  bucket,
  prefix = '',
  delimiter = '',
  maxKeys = 1000,
  continuationToken = '',
}) {
  const redis = await getRedisClient();
  await ensureBucket(redis, bucket);

  const pfx = prefix ? normalizeKey(prefix) : '';
  const collected = [];
  const prefixes = new Set();

  if (delimiter === '/') {
    let listDir = '';
    if (!pfx) {
      listDir = '';
    } else if (prefix.endsWith('/')) {
      listDir = pfx;
    } else {
      try {
        const m = await headObject({ bucket, key: pfx });
        listDir = m.isDir ? pfx : parentDir(pfx);
      } catch {
        listDir = parentDir(pfx);
      }
    }

    const names = await redis.smembers(childrenKey(bucket, listDir));
    for (const name of names.sort()) {
      const full = joinKey(listDir, name);
      if (pfx && !prefix.endsWith('/')) {
        if (!full.startsWith(pfx) && full !== pfx) continue;
      }

      let meta;
      try {
        meta = await headObject({ bucket, key: full });
      } catch {
        continue;
      }

      if (meta.isDir) {
        prefixes.add(asPrefix(full));
      } else {
        collected.push({
          key: full,
          lastModified: meta.mtime,
          etag: meta.etag,
          size: meta.size,
        });
      }
    }
  } else {
    async function walkAll(dir) {
      const names = await redis.smembers(childrenKey(bucket, dir));
      for (const name of names.sort()) {
        const full = joinKey(dir, name);
        let meta;
        try {
          meta = await headObject({ bucket, key: full });
        } catch {
          continue;
        }
        if (meta.isDir) {
          await walkAll(full);
        } else if (!pfx || full.startsWith(pfx)) {
          collected.push({
            key: full,
            lastModified: meta.mtime,
            etag: meta.etag,
            size: meta.size,
          });
        }
      }
    }
    await walkAll('');
  }

  collected.sort((a, b) => a.key.localeCompare(b.key));
  const commonPrefixes = [...prefixes].sort();

  const offset = continuationToken ? Number(continuationToken) || 0 : 0;
  const combined = [
    ...commonPrefixes.map((cp) => ({ type: 'prefix', value: cp })),
    ...collected.map((c) => ({ type: 'content', value: c })),
  ];
  const page = combined.slice(offset, offset + maxKeys);
  const nextOffset = offset + maxKeys;
  const isTruncated = nextOffset < combined.length;

  return {
    contents: page.filter((x) => x.type === 'content').map((x) => x.value),
    commonPrefixes: page.filter((x) => x.type === 'prefix').map((x) => x.value),
    isTruncated,
    nextContinuationToken: isTruncated ? String(nextOffset) : undefined,
    keyCount: page.length,
  };
}

export async function listChildren({ bucket, key }) {
  const redis = await getRedisClient();
  const k = normalizeKey(key);
  const names = await redis.smembers(childrenKey(bucket, k));
  const items = [];
  for (const name of names.sort()) {
    const full = joinKey(k, name);
    try {
      const meta = await headObject({ bucket, key: full });
      items.push({ key: full, ...meta });
    } catch {
      // skip
    }
  }
  return items;
}
