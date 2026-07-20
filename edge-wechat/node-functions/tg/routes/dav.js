import { Router } from 'express';
import { davAuth } from '../middleware/davAuth.js';
import { captureRawBody } from '../middleware/s3Auth.js';
import * as storage from '../services/storage.js';
import { normalizeKey, baseName } from '../utils/path.js';
import { config } from '../config/index.js';
import { davMultistatus } from '../utils/xml.js';

const router = Router();

function hrefFor(req, bucket, key) {
  const prefix = req.baseUrl || '/dav';
  if (key) {
    return `${prefix}/${bucket}/${normalizeKey(key)}`.replace(/\/+/g, '/');
  }
  return `${prefix}/${bucket}/`.replace(/\/+/g, '/');
}

function httpDate(iso) {
  return new Date(iso || Date.now()).toUTCString();
}

router.use(davAuth);

router.options('/:bucket', (_req, res) => {
  res.set({
    DAV: '1, 2',
    Allow: 'OPTIONS, GET, HEAD, PUT, DELETE, PROPFIND, MKCOL, COPY, MOVE',
    'MS-Author-Via': 'DAV',
  });
  res.status(200).end();
});

router.options('/:bucket/*key', (_req, res) => {
  res.set({
    DAV: '1, 2',
    Allow: 'OPTIONS, GET, HEAD, PUT, DELETE, PROPFIND, MKCOL, COPY, MOVE',
    'MS-Author-Via': 'DAV',
  });
  res.status(200).end();
});

function objectKey(req) {
  const raw = req.params.key;
  if (Array.isArray(raw)) return normalizeKey(raw.join('/'));
  return normalizeKey(raw || '');
}

async function propfind(req, res, bucket, key) {
  const depth = req.headers.depth || '1';
  const responses = [];

  // Self
  let selfMeta = null;
  if (!key) {
    selfMeta = {
      isDir: true,
      mtime: new Date().toISOString(),
      contentType: 'application/x-directory',
      size: 0,
      etag: '',
    };
  } else {
    try {
      selfMeta = await storage.headObject({ bucket, key });
    } catch {
      return res.status(404).send('Not Found');
    }
  }

  responses.push({
    href: hrefFor(req, bucket, key) + (selfMeta.isDir && !hrefFor(req, bucket, key).endsWith('/') ? '/' : ''),
    displayname: key ? baseName(key) : bucket,
    isCollection: !!selfMeta.isDir,
    contentLength: selfMeta.size,
    contentType: selfMeta.contentType,
    etag: selfMeta.etag,
    lastModified: httpDate(selfMeta.mtime),
    status: '200 OK',
  });

  if (depth !== '0' && selfMeta.isDir) {
    const children = await storage.listChildren({ bucket, key });
    for (const child of children) {
      const childHref = hrefFor(req, bucket, child.key) + (child.isDir ? '/' : '');
      responses.push({
        href: childHref,
        displayname: baseName(child.key),
        isCollection: !!child.isDir,
        contentLength: child.size,
        contentType: child.contentType,
        etag: child.etag,
        lastModified: httpDate(child.mtime),
        status: '200 OK',
      });
    }
  }

  res.status(207).type('application/xml; charset=utf-8').send(davMultistatus(responses));
}

router.use(captureRawBody);

// Bucket root
router.all('/:bucket', async (req, res) => {
  const bucket = req.params.bucket;
  try {
    if (req.method === 'PROPFIND') {
      await storage.createBucket(bucket);
      return propfind(req, res, bucket, '');
    }
    if (req.method === 'MKCOL') {
      await storage.createBucket(bucket);
      return res.status(201).end();
    }
    if (req.method === 'GET') {
      return res.status(200).type('text/plain').send(`WebDAV bucket: ${bucket}\n`);
    }
    res.status(405).send('Method Not Allowed');
  } catch (err) {
    res.status(err.status || 500).send(err.message);
  }
});

router.all('/:bucket/*key', async (req, res) => {
  const bucket = req.params.bucket;
  const key = objectKey(req);
  const rawParam = Array.isArray(req.params.key) ? req.params.key.join('/') : (req.params.key || '');
  const wantsDir = String(rawParam).endsWith('/');

  try {
    if (req.method === 'PROPFIND') {
      if (wantsDir || !key) {
        try {
          await storage.headObject({ bucket, key });
        } catch {
          await storage.ensureDir({ bucket, key });
        }
      }
      return propfind(req, res, bucket, key);
    }

    if (req.method === 'MKCOL') {
      try {
        await storage.headObject({ bucket, key });
        return res.status(405).send('Already exists');
      } catch {
        // ok
      }
      await storage.ensureDir({ bucket, key });
      return res.status(201).end();
    }

    if (req.method === 'PUT') {
      const body = req.bodyBuffer || req.rawBody || Buffer.alloc(0);
      const contentType = req.headers['content-type'] || 'application/octet-stream';
      await storage.putObject({ bucket, key, body, contentType });
      return res.status(201).end();
    }

    if (req.method === 'GET') {
      const { body, meta } = await storage.getObject({ bucket, key });
      res.set('Content-Type', meta.contentType);
      res.set('Content-Length', String(body.length));
      if (meta.etag) res.set('ETag', `"${meta.etag}"`);
      res.set('Last-Modified', httpDate(meta.mtime));
      return res.status(200).send(body);
    }

    if (req.method === 'HEAD') {
      const meta = await storage.headObject({ bucket, key });
      res.set('Content-Type', meta.contentType);
      res.set('Content-Length', String(meta.size));
      if (meta.etag) res.set('ETag', `"${meta.etag}"`);
      res.set('Last-Modified', httpDate(meta.mtime));
      return res.status(200).end();
    }

    if (req.method === 'DELETE') {
      await storage.deleteObject({ bucket, key, recursive: true });
      return res.status(204).end();
    }

    if (req.method === 'COPY' || req.method === 'MOVE') {
      const destHeader = req.headers.destination;
      if (!destHeader) {
        return res.status(400).send('Missing Destination header');
      }
      let destUrl;
      try {
        destUrl = new URL(destHeader, `http://${req.headers.host}`);
      } catch {
        return res.status(400).send('Invalid Destination');
      }
      // Expect path like /dav/{bucket}/...
      let destPath = destUrl.pathname;
      const davIdx = destPath.indexOf('/dav/');
      if (davIdx >= 0) {
        destPath = destPath.slice(davIdx + 5);
      } else if (req.baseUrl && destPath.startsWith(req.baseUrl)) {
        destPath = destPath.slice(req.baseUrl.length).replace(/^\//, '');
      } else {
        destPath = destPath.replace(/^\//, '');
      }
      const segs = destPath.split('/').filter(Boolean);
      const destBucket = segs.shift() || config.storage.defaultBucket;
      const destKey = normalizeKey(segs.join('/'));

      if (req.method === 'COPY') {
        await storage.copyObject({
          srcBucket: bucket,
          srcKey: key,
          destBucket,
          destKey,
        });
        return res.status(201).end();
      }
      await storage.moveObject({
        srcBucket: bucket,
        srcKey: key,
        destBucket,
        destKey,
      });
      return res.status(201).end();
    }

    res.status(405).send('Method Not Allowed');
  } catch (err) {
    res.status(err.status || 500).send(err.message);
  }
});

export default router;
