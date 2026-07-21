import { config } from '../../config/index.js';
import { createTelegramBlob } from './telegram.js';
import { createGithubBlob } from './github.js';

const cache = new Map();

/**
 * Normalize backend name.
 * @returns {'github'|'telegram'|null}
 */
export function normalizeBlobName(name) {
  if (name == null || name === '') return null;
  const n = String(name).trim().toLowerCase();
  if (n === 'github' || n === 'gh') return 'github';
  if (n === 'telegram' || n === 'tg') return 'telegram';
  return null;
}

/**
 * Default blob backend from env. Empty TGFS_BLOB_BACKEND → github.
 */
export function defaultBlobName() {
  return normalizeBlobName(config.storage.blobBackend) || 'github';
}

/**
 * Resolve blob driver.
 * @param {string} [name] - request override; empty → TGFS_BLOB_BACKEND (default github)
 */
export function getBlobBackend(name) {
  const resolved = normalizeBlobName(name) || defaultBlobName();

  if (cache.has(resolved)) return cache.get(resolved);

  let blob;
  if (resolved === 'github') {
    blob = createGithubBlob();
  } else {
    blob = createTelegramBlob();
  }
  cache.set(resolved, blob);
  return blob;
}

/**
 * Resolve blob driver for an existing object.
 * Legacy records without backend field still fall back to telegram if file looks like TG,
 * otherwise use recorded backend or default.
 */
export function blobForMeta(meta) {
  if (meta?.backend) {
    return getBlobBackend(meta.backend);
  }
  // 旧数据无 backend：有 messageId 视为 telegram，否则跟默认
  if (meta?.messageId) {
    return getBlobBackend('telegram');
  }
  return getBlobBackend(defaultBlobName());
}

export function resetBlobBackend() {
  cache.clear();
}
