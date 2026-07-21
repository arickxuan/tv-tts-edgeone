import crypto from 'crypto';
import { config } from '../config/index.js';
import { getIndexBackend } from '../index/index.js';
import { getBlobBackend, blobForMeta, normalizeBlobName, defaultBlobName } from './blob/index.js';
import {
  normalizeKey,
  parentDir,
  joinKey,
  asPrefix,
} from '../utils/path.js';

function etagOf(buf) {
  return crypto.createHash('md5').update(buf).digest('hex');
}

function notFound() {
  const err = new Error('NoSuchKey');
  err.code = 'NoSuchKey';
  err.status = 404;
  return err;
}

export async function listBuckets() {
  const index = getIndexBackend();
  let names = await index.listBuckets();
  if (!names.includes(config.storage.defaultBucket)) {
    await index.ensureBucket(config.storage.defaultBucket);
    names = await index.listBuckets();
    if (!names.includes(config.storage.defaultBucket)) {
      names.push(config.storage.defaultBucket);
    }
  }
  const sorted = names.sort();
  return Promise.all(
    sorted.map(async (name) => {
      const cfg = await index.getBucketConfig(name);
      return {
        name,
        creationDate: cfg.creationDate || new Date(0).toISOString(),
        backend: cfg.backend || defaultBlobName(),
      };
    }),
  );
}

export async function createBucket(bucket, { backend } = {}) {
  const index = getIndexBackend();
  await index.ensureBucket(bucket, backend ? { backend } : {});
  return index.getBucketConfig(bucket);
}

export async function getBucket(bucket) {
  const index = getIndexBackend();
  await index.ensureBucket(bucket);
  return index.getBucketConfig(bucket);
}

export async function setBucketBackend(bucket, backend) {
  const index = getIndexBackend();
  const name = normalizeBlobName(backend) || defaultBlobName();
  return index.setBucketConfig(bucket, { backend: name });
}

/**
 * Resolve upload backend: explicit override > bucket config in DB > env default.
 */
async function resolveBackend(bucket, override) {
  const fromReq = normalizeBlobName(override);
  if (fromReq) return fromReq;
  const index = getIndexBackend();
  await index.ensureBucket(bucket);
  const cfg = await index.getBucketConfig(bucket);
  return normalizeBlobName(cfg.backend) || defaultBlobName();
}

export async function deleteBucket(bucket) {
  const index = getIndexBackend();
  const children = await index.listChildNames(bucket, '');
  if (children.length > 0) {
    const err = new Error('BucketNotEmpty');
    err.code = 'BucketNotEmpty';
    err.status = 409;
    throw err;
  }
  await index.deleteBucket(bucket);
}

export async function headObject({ bucket, key }) {
  const index = getIndexBackend();
  const k = normalizeKey(key);
  const meta = await index.getMeta(bucket, k);
  if (!meta) throw notFound();
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
  if (!meta.fileId) throw notFound();
  const body = await blobForMeta(meta).get(meta);
  return { body, meta };
}

export async function putObject({ bucket, key, body, contentType, caption, backend }) {
  const index = getIndexBackend();
  const resolvedBackend = await resolveBackend(bucket, backend);
  const blob = getBlobBackend(resolvedBackend);
  const k = normalizeKey(key);
  if (!k) {
    const err = new Error('Invalid key');
    err.status = 400;
    throw err;
  }

  await index.ensureBucket(bucket);

  let oldMeta = null;
  try {
    oldMeta = await headObject({ bucket, key: k });
  } catch {
    oldMeta = null;
  }

  // 覆盖写入同路径时，仅当目标后端相同才传 existingMeta（github 需要 sha）
  const existingForPut =
    oldMeta && (oldMeta.backend || '') === blob.name ? oldMeta : null;

  const buf = Buffer.isBuffer(body) ? body : Buffer.from(body);
  const ct = contentType || 'application/octet-stream';

  const uploaded = await blob.put({
    bucket,
    key: k,
    body: buf,
    contentType: ct,
    caption: caption || `${bucket}/${k}`,
    existingMeta: existingForPut,
  });
  const etag = etagOf(buf);
  const mtime = new Date().toISOString();

  await index.setMeta(bucket, k, {
    fileId: uploaded.fileId,
    messageId: uploaded.messageId,
    size: uploaded.size,
    contentType: ct,
    etag,
    mtime,
    isDir: false,
    backend: uploaded.backend,
    sha: uploaded.sha || '',
  });
  await index.linkPath(bucket, k);

  if (oldMeta && !oldMeta.isDir) {
    const sameBlob =
      oldMeta.backend === uploaded.backend &&
      oldMeta.fileId === uploaded.fileId &&
      String(oldMeta.messageId || '') === String(uploaded.messageId || '');
    if (!sameBlob && (oldMeta.fileId || oldMeta.messageId)) {
      await blobForMeta(oldMeta).remove(oldMeta);
    }
  }

  return {
    bucket,
    key: k,
    etag,
    size: uploaded.size,
    contentType: ct,
    mtime,
    fileId: uploaded.fileId,
    messageId: uploaded.messageId,
    backend: uploaded.backend,
  };
}

export async function ensureDir({ bucket, key }) {
  const index = getIndexBackend();
  const k = normalizeKey(key);
  if (!k) {
    await index.ensureBucket(bucket);
    return { bucket, key: '', isDir: true };
  }

  await index.ensureBucket(bucket);

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

  await index.setMeta(bucket, k, {
    fileId: '',
    messageId: null,
    size: 0,
    contentType: 'application/x-directory',
    etag: '',
    mtime: new Date().toISOString(),
    isDir: true,
    backend: '',
    sha: '',
  });
  await index.linkPath(bucket, k);
  return { bucket, key: k, isDir: true };
}

export async function deleteObject({ bucket, key, recursive = false }) {
  const index = getIndexBackend();
  const k = normalizeKey(key);

  let meta;
  try {
    meta = await headObject({ bucket, key: k });
  } catch (err) {
    if (err.code === 'NoSuchKey') return { deleted: false };
    throw err;
  }

  if (meta.isDir) {
    const kids = await index.listChildNames(bucket, k);
    if (kids.length && !recursive) {
      const err = new Error('DirectoryNotEmpty');
      err.code = 'DirectoryNotEmpty';
      err.status = 409;
      throw err;
    }
    for (const name of kids) {
      await deleteObject({ bucket, key: joinKey(k, name), recursive: true });
    }
    await index.clearChildren(bucket, k);
  } else {
    await blobForMeta(meta).remove(meta);
  }

  await index.deleteMeta(bucket, k);
  await index.unlinkPath(bucket, k);
  return { deleted: true, key: k };
}

export async function copyObject({ srcBucket, srcKey, destBucket, destKey, backend }) {
  const index = getIndexBackend();
  const src = await headObject({ bucket: srcBucket, key: srcKey });
  if (src.isDir) {
    const err = new Error('Cannot copy directory with copyObject');
    err.status = 400;
    throw err;
  }

  const dk = normalizeKey(destKey);
  await index.ensureBucket(destBucket);

  const srcBlob = blobForMeta(src);
  const destBlob = getBlobBackend(await resolveBackend(destBucket, backend));

  if (srcBlob.name === 'telegram' && destBlob.name === 'telegram') {
    await index.setMeta(destBucket, dk, {
      fileId: src.fileId,
      messageId: src.messageId,
      size: src.size,
      contentType: src.contentType,
      etag: src.etag,
      mtime: new Date().toISOString(),
      isDir: false,
      backend: 'telegram',
      sha: '',
    });
    await index.linkPath(destBucket, dk);
    return { bucket: destBucket, key: dk, etag: src.etag, size: src.size, backend: 'telegram' };
  }

  const body = await srcBlob.get(src);
  let oldDest = null;
  try {
    oldDest = await headObject({ bucket: destBucket, key: dk });
  } catch {
    oldDest = null;
  }
  const existingForPut =
    oldDest && (oldDest.backend || '') === destBlob.name ? oldDest : null;
  const uploaded = await destBlob.put({
    bucket: destBucket,
    key: dk,
    body,
    contentType: src.contentType,
    existingMeta: existingForPut,
  });
  await index.setMeta(destBucket, dk, {
    fileId: uploaded.fileId,
    messageId: uploaded.messageId,
    size: uploaded.size,
    contentType: src.contentType,
    etag: src.etag,
    mtime: new Date().toISOString(),
    isDir: false,
    backend: uploaded.backend,
    sha: uploaded.sha || '',
  });
  await index.linkPath(destBucket, dk);
  return { bucket: destBucket, key: dk, etag: src.etag, size: uploaded.size, backend: uploaded.backend };
}

export async function moveObject({ srcBucket, srcKey, destBucket, destKey }) {
  const index = getIndexBackend();
  const src = await headObject({ bucket: srcBucket, key: srcKey });
  await copyObject({ srcBucket, srcKey, destBucket, destKey });
  const sk = normalizeKey(srcKey);

  const dest = await headObject({ bucket: destBucket, key: destKey });
  const sharedTelegram =
    (src.backend || 'telegram') === 'telegram' &&
    (dest.backend || 'telegram') === 'telegram' &&
    src.fileId === dest.fileId;

  if (!sharedTelegram) {
    await blobForMeta(src).remove(src);
  }

  await index.deleteMeta(srcBucket, sk);
  await index.unlinkPath(srcBucket, sk);
  return { bucket: destBucket, key: normalizeKey(destKey) };
}

export async function listObjects({
  bucket,
  prefix = '',
  delimiter = '',
  maxKeys = 1000,
  continuationToken = '',
}) {
  const index = getIndexBackend();
  await index.ensureBucket(bucket);

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

    const names = await index.listChildNames(bucket, listDir);
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
      const names = await index.listChildNames(bucket, dir);
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
  const index = getIndexBackend();
  const k = normalizeKey(key);
  const names = await index.listChildNames(bucket, k);
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
