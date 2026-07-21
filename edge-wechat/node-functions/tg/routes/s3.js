import { Router } from 'express';
import crypto from 'crypto';
import { s3Auth, captureRawBody } from '../middleware/s3Auth.js';
import * as storage from '../services/storage.js';
import { normalizeKey } from '../utils/path.js';
import {
  s3Error,
  s3ListBuckets,
  s3ListObjectsV2,
  s3DeleteResult,
  parseXml,
} from '../utils/xml.js';

const router = Router();

function rid(req) {
  return req.s3RequestId || crypto.randomUUID();
}

function sendErr(res, req, status, code, message, resource) {
  res.status(status)
    .type('application/xml')
    .set('x-amz-request-id', rid(req))
    .send(s3Error({ code, message, resource, requestId: rid(req) }));
}

function setObjectHeaders(res, meta, req) {
  res.set('x-amz-request-id', rid(req));
  res.set('ETag', `"${meta.etag}"`);
  res.set('Content-Type', meta.contentType || 'application/octet-stream');
  res.set('Last-Modified', new Date(meta.mtime).toUTCString());
  if (meta.size != null) res.set('Content-Length', String(meta.size));
}

// Capture body before auth for PUT/POST
router.use(captureRawBody);
router.use(s3Auth);

// ListBuckets: GET /
router.get('/', async (req, res) => {
  try {
    const buckets = await storage.listBuckets();
    res.type('application/xml').set('x-amz-request-id', rid(req)).send(s3ListBuckets(buckets));
  } catch (err) {
    sendErr(res, req, 500, 'InternalError', err.message);
  }
});

// Bucket or object operations
router.all('/:bucket', async (req, res) => {
  const bucket = req.params.bucket;
  try {
    if (req.method === 'PUT') {
      // CreateBucket
      await storage.createBucket(bucket);
      return res.status(200).set('x-amz-request-id', rid(req)).end();
    }
    if (req.method === 'DELETE') {
      await storage.deleteBucket(bucket);
      return res.status(204).set('x-amz-request-id', rid(req)).end();
    }
    if (req.method === 'GET' || req.method === 'HEAD') {
      // ListObjects / ListObjectsV2 or DeleteObjects is POST
      if (req.query['list-type'] === '2' || req.query.prefix != null || req.query.delimiter != null || Object.keys(req.query).length === 0) {
        const result = await storage.listObjects({
          bucket,
          prefix: req.query.prefix || '',
          delimiter: req.query.delimiter || '',
          maxKeys: Number(req.query['max-keys'] || 1000),
          continuationToken: req.query['continuation-token'] || '',
        });
        if (req.method === 'HEAD') {
          return res.status(200).set('x-amz-request-id', rid(req)).end();
        }
        const xml = s3ListObjectsV2({
          bucket,
          prefix: req.query.prefix || '',
          delimiter: req.query.delimiter || '',
          maxKeys: Number(req.query['max-keys'] || 1000),
          ...result,
        });
        return res.type('application/xml').set('x-amz-request-id', rid(req)).send(xml);
      }
    }
    if (req.method === 'POST' && req.query.delete !== undefined) {
      return handleDeleteObjects(req, res, bucket);
    }
    sendErr(res, req, 405, 'MethodNotAllowed', 'Method not allowed', `/${bucket}`);
  } catch (err) {
    const status = err.status || 500;
    sendErr(res, req, status, err.code || 'InternalError', err.message, `/${bucket}`);
  }
});

async function handleDeleteObjects(req, res, bucket) {
  try {
    const xml = (req.bodyBuffer || req.rawBody || Buffer.alloc(0)).toString('utf8');
    const parsed = parseXml(xml);
    const del = parsed.Delete || {};
    let objects = del.Object || [];
    if (!Array.isArray(objects)) objects = [objects];
    const deleted = [];
    const errors = [];
    for (const obj of objects) {
      const key = obj.Key;
      try {
        await storage.deleteObject({ bucket, key, recursive: true });
        deleted.push({ key });
      } catch (e) {
        errors.push({ key, code: e.code || 'InternalError', message: e.message });
      }
    }
    res.type('application/xml').set('x-amz-request-id', rid(req)).send(s3DeleteResult({ deleted, errors }));
  } catch (err) {
    sendErr(res, req, 500, 'InternalError', err.message, `/${bucket}`);
  }
}

function objectKey(req) {
  const raw = req.params.key;
  if (Array.isArray(raw)) return normalizeKey(raw.join('/'));
  return normalizeKey(raw || '');
}

router.all('/:bucket/*key', async (req, res) => {
  const bucket = req.params.bucket;
  const key = objectKey(req);
  const resource = `/${bucket}/${key}`;

  try {
    if (req.method === 'PUT') {
      const body = req.bodyBuffer || req.rawBody || Buffer.alloc(0);
      const contentType = req.headers['content-type'] || 'application/octet-stream';
      // backend 来自 bucket 配置（数据库），不接受 query/header
      const result = await storage.putObject({ bucket, key, body, contentType });
      return res
        .status(200)
        .set('x-amz-request-id', rid(req))
        .set('ETag', `"${result.etag}"`)
        .set('x-tgfs-backend', result.backend || '')
        .end();
    }

    if (req.method === 'GET') {
      const { body, meta } = await storage.getObject({ bucket, key });
      setObjectHeaders(res, meta, req);
      res.set('Content-Length', String(body.length));
      return res.status(200).send(body);
    }

    if (req.method === 'HEAD') {
      const meta = await storage.headObject({ bucket, key });
      setObjectHeaders(res, meta, req);
      return res.status(200).end();
    }

    if (req.method === 'DELETE') {
      await storage.deleteObject({ bucket, key, recursive: true });
      return res.status(204).set('x-amz-request-id', rid(req)).end();
    }

    sendErr(res, req, 405, 'MethodNotAllowed', 'Method not allowed', resource);
  } catch (err) {
    const status = err.status || 500;
    const code = err.code || (status === 404 ? 'NoSuchKey' : 'InternalError');
    sendErr(res, req, status, code, err.message, resource);
  }
});

export default router;
