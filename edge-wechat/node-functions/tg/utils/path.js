/**
 * Normalize object key: strip leading slashes, collapse repeats, reject traversal.
 */
export function normalizeKey(key = '') {
  let k = String(key).replace(/\\/g, '/');
  k = k.replace(/^\/+/, '').replace(/\/+/g, '/');
  if (k.includes('..')) {
    throw new Error('Invalid key: path traversal not allowed');
  }
  if (k.endsWith('/') && k.length > 1) {
    k = k.slice(0, -1);
  }
  return k;
}

/**
 * Parent directory of a key ('' for root).
 */
export function parentDir(key) {
  const k = normalizeKey(key);
  const idx = k.lastIndexOf('/');
  if (idx < 0) return '';
  return k.slice(0, idx);
}

/**
 * Basename of a key.
 */
export function baseName(key) {
  const k = normalizeKey(key);
  const idx = k.lastIndexOf('/');
  return idx < 0 ? k : k.slice(idx + 1);
}

/**
 * Join path segments with /.
 */
export function joinKey(...parts) {
  return normalizeKey(parts.filter(Boolean).join('/'));
}

/**
 * Ensure prefix ends with / when non-empty (for listing).
 */
export function asPrefix(prefix = '') {
  if (!prefix) return '';
  const p = normalizeKey(prefix);
  return p.endsWith('/') ? p : `${p}/`;
}

export function metaKey(bucket, key) {
  return `tgfs:meta:${bucket}/${normalizeKey(key)}`;
}

export function childrenKey(bucket, dir) {
  const d = normalizeKey(dir);
  return d ? `tgfs:children:${bucket}/${d}` : `tgfs:children:${bucket}/`;
}

export const BUCKETS_KEY = 'tgfs:buckets';
