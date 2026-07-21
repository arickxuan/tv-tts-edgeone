import crypto from 'crypto';
import { config } from '../config/index.js';
import { getIndexBackend } from '../index/index.js';
import * as tg from './telegram.js';
import {
  normalizeKey,
  parentDir,
  baseName,
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
  return names.sort().map((name) => ({
    name,
    creationDate: new Date(0).toISOString(),
  }));
}

export async function createBucket(bucket) {
  const index = getIndexBackend();
  await index.ensureBucket(bucket);
  return { name: bucket };
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
  const body = await tg.downloadByFileId(meta.fileId);
  return { body, meta };
}

export async function putObject({ bucket, key, body, contentType, caption }) {
  const index = getIndexBackend();
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

  const buf = Buffer.isBuffer(body) ? body : Buffer.from(body);
  const filename = baseName(k) || 'file.bin';
  const ct = contentType || 'application/octet-stream';
  const captionText = caption || `${bucket}/${k}`;

  const uploaded = await tg.uploadBuffer(buf, filename, ct, captionText);
  const etag = etagOf(buf);
  const mtime = new Date().toISOString();

  await index.setMeta(bucket, k, {
    fileId: uploaded.fileId,
    messageId: uploaded.messageId,
    size: uploaded.fileSize,
    contentType: ct,
    etag,
    mtime,
    isDir: false,
  });
  await index.linkPath(bucket, k);

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
  } else if (meta.messageId) {
    await tg.deleteMessage(meta.messageId);
  }

  await index.deleteMeta(bucket, k);
  await index.unlinkPath(bucket, k);
  return { deleted: true, key: k };
}

export async function copyObject({ srcBucket, srcKey, destBucket, destKey }) {
  const index = getIndexBackend();
  const src = await headObject({ bucket: srcBucket, key: srcKey });
  if (src.isDir) {
    const err = new Error('Cannot copy directory with copyObject');
    err.status = 400;
    throw err;
  }

  const dk = normalizeKey(destKey);
  await index.ensureBucket(destBucket);

  await index.setMeta(destBucket, dk, {
    fileId: src.fileId,
    messageId: src.messageId,
    size: src.size,
    contentType: src.contentType,
    etag: src.etag,
    mtime: new Date().toISOString(),
    isDir: false,
  });
  await index.linkPath(destBucket, dk);

  return { bucket: destBucket, key: dk, etag: src.etag, size: src.size };
}

export async function moveObject({ srcBucket, srcKey, destBucket, destKey }) {
  const index = getIndexBackend();
  await copyObject({ srcBucket, srcKey, destBucket, destKey });
  const sk = normalizeKey(srcKey);
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
