import dotenv from 'dotenv';

dotenv.config();

function normalizeApiBase(raw) {
  let base = String(raw || '').trim().replace(/\/+$/, '');
  if (!base) base = 'https://api.telegram.org';
  if (!/^https?:\/\//i.test(base)) {
    base = `https://${base}`;
  }
  return base;
}

export const config = {
  tg: {
    botToken: process.env.TG_BOT_TOKEN || '',
    chatId: process.env.TG_CHAT_ID || '',
    // Bot API 根域名，可换成代理，如 https://tg-proxy.example.com
    // 默认 https://api.telegram.org
    apiBase: normalizeApiBase(process.env.TG_API_BASE || process.env.TG_PROXY_DOMAIN || 'https://api.telegram.org'),
    // Bot upload limit ~50MB; getFile download ~20MB
    maxUploadBytes: Number(process.env.TG_MAX_UPLOAD_BYTES || 50 * 1024 * 1024),
    maxDownloadBytes: Number(process.env.TG_MAX_DOWNLOAD_BYTES || 20 * 1024 * 1024),
  },
  redis: {
    uri: process.env.UPSTASH_REDIS_URI || '',
  },
  pocketbase: {
    url: process.env.POCKETBASE_URL || '',
    adminEmail: process.env.POCKETBASE_ADMIN_EMAIL || '',
    adminPassword: process.env.POCKETBASE_ADMIN_PASSWORD || '',
    authToken: process.env.POCKETBASE_AUTH_TOKEN || '',
  },
  api: {
    token: process.env.TGFS_API_TOKEN || '',
  },
  storage: {
    defaultBucket: process.env.TGFS_DEFAULT_BUCKET || 'default',
    // redis | pocketbase  （空则：有 Redis URI 用 redis，否则有 PB URL 用 pocketbase）
    indexBackend: process.env.TGFS_INDEX_BACKEND || '',
  },
  s3: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    region: process.env.S3_REGION || 'us-east-1',
  },
  dav: {
    user: process.env.DAV_USER || '',
    pass: process.env.DAV_PASS || '',
  },
};

export default config;
