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
  github: {
    token: process.env.GITHUB_TOKEN || '',
    owner: process.env.GITHUB_OWNER || '',
    repo: process.env.GITHUB_REPO || '',
    branch: process.env.GITHUB_BRANCH || 'main',
    // 空字符串表示无前缀；未设置时默认 tgfs
    pathPrefix: process.env.GITHUB_PATH_PREFIX !== undefined
      ? process.env.GITHUB_PATH_PREFIX
      : 'tgfs',
    apiBase: process.env.GITHUB_API_BASE || 'https://api.github.com',
    // Contents API 实际上限约 100MB
    maxUploadBytes: Number(process.env.GITHUB_MAX_UPLOAD_BYTES || 100 * 1024 * 1024),
  },
  api: {
    token: process.env.TGFS_API_TOKEN || '',
  },
  storage: {
    defaultBucket: process.env.TGFS_DEFAULT_BUCKET || 'default',
    // redis | pocketbase
    indexBackend: process.env.TGFS_INDEX_BACKEND || '',
    // telegram | github；空则默认 github。上传可用参数 backend 覆盖
    blobBackend: process.env.TGFS_BLOB_BACKEND || 'github',
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
