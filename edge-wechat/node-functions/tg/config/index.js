import dotenv from 'dotenv';

dotenv.config();

export const config = {
  tg: {
    botToken: process.env.TG_BOT_TOKEN || '',
    chatId: process.env.TG_CHAT_ID || '',
    // Bot upload limit ~50MB; getFile download ~20MB
    maxUploadBytes: Number(process.env.TG_MAX_UPLOAD_BYTES || 50 * 1024 * 1024),
    maxDownloadBytes: Number(process.env.TG_MAX_DOWNLOAD_BYTES || 20 * 1024 * 1024),
  },
  redis: {
    uri: process.env.UPSTASH_REDIS_URI || '',
  },
  api: {
    token: process.env.TGFS_API_TOKEN || '',
  },
  storage: {
    defaultBucket: process.env.TGFS_DEFAULT_BUCKET || 'default',
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
