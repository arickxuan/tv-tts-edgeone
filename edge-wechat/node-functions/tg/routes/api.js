import { Router } from 'express';
import multer from 'multer';
import { apiAuth } from '../middleware/apiAuth.js';
import { config } from '../config/index.js';
import * as storage from '../services/storage.js';
import { normalizeKey } from '../utils/path.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.tg.maxUploadBytes },
});

const router = Router();

router.get('/ping', (_req, res) => {
  res.send('pong');
});

router.post('/api/upload', apiAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '缺少 file 字段' });
    }
    const bucket = req.body.bucket || config.storage.defaultBucket;
    let key = req.body.key || req.body.path || req.file.originalname;
    key = normalizeKey(key);
    const result = await storage.putObject({
      bucket,
      key,
      body: req.file.buffer,
      contentType: req.file.mimetype || 'application/octet-stream',
    });
    res.json({
      ok: true,
      bucket: result.bucket,
      key: result.key,
      etag: result.etag,
      size: result.size,
      contentType: result.contentType,
      url: `/api/files/${result.key}`,
    });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message, code: err.code });
  }
});

router.get('/api/list', apiAuth, async (req, res) => {
  try {
    const bucket = req.query.bucket || config.storage.defaultBucket;
    const prefix = req.query.prefix || '';
    const delimiter = req.query.delimiter ?? '/';
    const maxKeys = Number(req.query.maxKeys || 1000);
    const result = await storage.listObjects({
      bucket,
      prefix,
      delimiter,
      maxKeys,
      continuationToken: req.query.continuationToken || '',
    });
    res.json({ ok: true, bucket, ...result });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message, code: err.code });
  }
});

function pathKey(req) {
  const raw = req.params.key;
  if (Array.isArray(raw)) return normalizeKey(raw.join('/'));
  return normalizeKey(raw || '');
}

async function handleFileGet(req, res) {
  try {
    const bucket = req.query.bucket || config.storage.defaultBucket;
    const key = pathKey(req);
    if (!key) {
      return res.status(400).json({ error: '缺少文件路径' });
    }
    if (req.method === 'HEAD') {
      const meta = await storage.headObject({ bucket, key });
      res.setHeader('Content-Type', meta.contentType);
      res.setHeader('Content-Length', String(meta.size));
      res.setHeader('ETag', `"${meta.etag}"`);
      res.setHeader('Last-Modified', new Date(meta.mtime).toUTCString());
      return res.status(200).end();
    }
    const { body, meta } = await storage.getObject({ bucket, key });
    res.setHeader('Content-Type', meta.contentType);
    res.setHeader('Content-Length', String(body.length));
    res.setHeader('ETag', `"${meta.etag}"`);
    res.setHeader('Last-Modified', new Date(meta.mtime).toUTCString());
    res.status(200).send(body);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message, code: err.code });
  }
}

router.get('/api/files/*key', handleFileGet);
router.head('/api/files/*key', handleFileGet);

router.delete('/api/files/*key', apiAuth, async (req, res) => {
  try {
    const bucket = req.query.bucket || config.storage.defaultBucket;
    const key = pathKey(req);
    const recursive = req.query.recursive === '1' || req.query.recursive === 'true';
    const result = await storage.deleteObject({ bucket, key, recursive });
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message, code: err.code });
  }
});

router.put('/api/mkdir/*key', apiAuth, async (req, res) => {
  try {
    const bucket = req.query.bucket || req.body?.bucket || config.storage.defaultBucket;
    const key = pathKey(req);
    const result = await storage.ensureDir({ bucket, key });
    res.json({ ok: true, ...result });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message, code: err.code });
  }
});

export default router;
