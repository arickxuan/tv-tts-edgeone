import crypto from 'crypto';
import { config } from '../config/index.js';
import { s3Error } from '../utils/xml.js';

function hmac(key, data) {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest();
}

function hashSha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function encodeRfc3986(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

function canonicalQuery(query) {
  const pairs = [];
  for (const [k, v] of Object.entries(query || {})) {
    if (k === 'X-Amz-Signature') continue;
    const values = Array.isArray(v) ? v : [v];
    for (const val of values) {
      pairs.push([encodeRfc3986(k), encodeRfc3986(val == null ? '' : String(val))]);
    }
  }
  pairs.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0));
  return pairs.map(([k, v]) => `${k}=${v}`).join('&');
}

function getHeader(req, name) {
  const lower = name.toLowerCase();
  const val = req.headers[lower];
  return val == null ? undefined : Array.isArray(val) ? val[0] : val;
}

function signingKey(secret, dateStamp, region, service) {
  const kDate = hmac(`AWS4${secret}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, 'aws4_request');
}

function parseAuthHeader(auth) {
  // AWS4-HMAC-SHA256 Credential=AKID/date/region/service/aws4_request, SignedHeaders=..., Signature=...
  if (!auth || !auth.startsWith('AWS4-HMAC-SHA256 ')) return null;
  const rest = auth.slice('AWS4-HMAC-SHA256 '.length);
  const parts = {};
  for (const piece of rest.split(', ')) {
    const eq = piece.indexOf('=');
    if (eq < 0) continue;
    parts[piece.slice(0, eq)] = piece.slice(eq + 1);
  }
  if (!parts.Credential || !parts.SignedHeaders || !parts.Signature) return null;
  const credParts = parts.Credential.split('/');
  if (credParts.length < 5) return null;
  return {
    accessKeyId: credParts[0],
    dateStamp: credParts[1],
    region: credParts[2],
    service: credParts[3],
    signedHeaders: parts.SignedHeaders.split(';').map((h) => h.toLowerCase()),
    signature: parts.Signature,
  };
}

function buildCanonicalRequest(req, signedHeaders, payloadHash) {
  const method = req.method.toUpperCase();
  // Use originalUrl path without mount stripping issues — req.path is relative to mount
  const path = req.originalUrl.split('?')[0];
  // When mounted at /s3, canonical URI should be the path as client signed it.
  // Clients typically sign path as /bucket/key or /s3/bucket/key depending on endpoint.
  // We use the full path from originalUrl.
  const canonicalUri = path
    .split('/')
    .map((seg) => encodeRfc3986(decodeURIComponent(seg || '')))
    .join('/')
    .replace(/\/+/g, '/') || '/';

  // Prefer path that starts with /
  const uri = canonicalUri.startsWith('/') ? canonicalUri : `/${canonicalUri}`;

  const query = { ...req.query };
  const canonicalQs = canonicalQuery(query);

  const headerLines = [];
  for (const h of signedHeaders) {
    let value = getHeader(req, h);
    if (h === 'host' && !value) {
      value = req.headers.host;
    }
    if (value == null) value = '';
    // Collapse whitespace
    value = String(value).trim().replace(/\s+/g, ' ');
    headerLines.push(`${h}:${value}`);
  }

  const canonicalHeaders = `${headerLines.join('\n')}\n`;
  const signedHeadersStr = signedHeaders.join(';');

  return [
    method,
    uri,
    canonicalQs,
    canonicalHeaders,
    signedHeadersStr,
    payloadHash,
  ].join('\n');
}

/**
 * Capture raw body for SigV4 payload hash when needed.
 * Attach via express.json verify / raw middleware beforehand.
 */
export function s3Auth(req, res, next) {
  const requestId = crypto.randomUUID();
  req.s3RequestId = requestId;

  try {
    const accessKey = config.s3.accessKeyId;
    const secret = config.s3.secretAccessKey;
    if (!accessKey || !secret) {
      res.status(500).type('application/xml').send(
        s3Error({ code: 'InternalError', message: 'S3 credentials not configured', requestId }),
      );
      return;
    }

    const authHeader = getHeader(req, 'authorization');
    const amzAlgo = req.query['X-Amz-Algorithm'];

    let accessKeyId;
    let dateStamp;
    let region;
    let service;
    let signedHeaders;
    let signature;
    let amzDate;

    if (authHeader) {
      const parsed = parseAuthHeader(authHeader);
      if (!parsed) {
        res.status(403).type('application/xml').send(
          s3Error({ code: 'AccessDenied', message: 'Invalid Authorization header', requestId }),
        );
        return;
      }
      ({ accessKeyId, dateStamp, region, service, signedHeaders, signature } = parsed);
      amzDate = getHeader(req, 'x-amz-date') || `${dateStamp}T000000Z`;
    } else if (amzAlgo === 'AWS4-HMAC-SHA256') {
      // Presigned URL
      const cred = String(req.query['X-Amz-Credential'] || '');
      const credParts = cred.split('/');
      if (credParts.length < 5) {
        res.status(403).type('application/xml').send(
          s3Error({ code: 'AccessDenied', message: 'Invalid X-Amz-Credential', requestId }),
        );
        return;
      }
      accessKeyId = credParts[0];
      dateStamp = credParts[1];
      region = credParts[2];
      service = credParts[3];
      signedHeaders = String(req.query['X-Amz-SignedHeaders'] || 'host').split(';');
      signature = String(req.query['X-Amz-Signature'] || '');
      amzDate = String(req.query['X-Amz-Date'] || `${dateStamp}T000000Z`);

      const expires = Number(req.query['X-Amz-Expires'] || 0);
      if (expires > 0) {
        // Basic expiry check from amzDate
        const y = Number(amzDate.slice(0, 4));
        const mo = Number(amzDate.slice(4, 6)) - 1;
        const d = Number(amzDate.slice(6, 8));
        const h = Number(amzDate.slice(9, 11));
        const mi = Number(amzDate.slice(11, 13));
        const s = Number(amzDate.slice(13, 15));
        const signedAt = Date.UTC(y, mo, d, h, mi, s);
        if (Date.now() > signedAt + expires * 1000) {
          res.status(403).type('application/xml').send(
            s3Error({ code: 'AccessDenied', message: 'Request has expired', requestId }),
          );
          return;
        }
      }
    } else {
      res.status(403).type('application/xml').send(
        s3Error({ code: 'AccessDenied', message: 'Missing Authorization', requestId }),
      );
      return;
    }

    if (accessKeyId !== accessKey) {
      res.status(403).type('application/xml').send(
        s3Error({ code: 'InvalidAccessKeyId', message: 'The AWS Access Key Id you provided does not exist', requestId }),
      );
      return;
    }

    const payloadHash =
      getHeader(req, 'x-amz-content-sha256') ||
      (req.rawBody ? hashSha256(req.rawBody) : 'UNSIGNED-PAYLOAD');

    // For presigned GET, payload is UNSIGNED-PAYLOAD typically
    const effectiveHash = amzAlgo ? (getHeader(req, 'x-amz-content-sha256') || 'UNSIGNED-PAYLOAD') : payloadHash;

    const canonicalRequest = buildCanonicalRequest(req, signedHeaders, effectiveHash);
    const canonicalRequestHash = hashSha256(canonicalRequest);
    const scope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, canonicalRequestHash].join('\n');
    const key = signingKey(secret, dateStamp, region, service);
    const expected = crypto.createHmac('sha256', key).update(stringToSign, 'utf8').digest('hex');

    if (expected !== signature) {
      // Retry with UNSIGNED-PAYLOAD if body hash mismatch common case
      if (effectiveHash !== 'UNSIGNED-PAYLOAD' && !amzAlgo) {
        const cr2 = buildCanonicalRequest(req, signedHeaders, 'UNSIGNED-PAYLOAD');
        const st2 = ['AWS4-HMAC-SHA256', amzDate, scope, hashSha256(cr2)].join('\n');
        const exp2 = crypto.createHmac('sha256', key).update(st2, 'utf8').digest('hex');
        if (exp2 === signature) {
          return next();
        }
      }
      console.warn('SigV4 mismatch', { canonicalRequest, stringToSign, expected, signature });
      res.status(403).type('application/xml').send(
        s3Error({
          code: 'SignatureDoesNotMatch',
          message: 'The request signature we calculated does not match the signature you provided',
          requestId,
        }),
      );
      return;
    }

    return next();
  } catch (err) {
    console.error('s3Auth error', err);
    res.status(500).type('application/xml').send(
      s3Error({ code: 'InternalError', message: err.message, requestId }),
    );
  }
}

/**
 * Middleware to buffer raw body for PUT and store on req.rawBody / req.bodyBuffer.
 */
export function captureRawBody(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE' || req.method === 'OPTIONS') {
    return next();
  }
  if (Buffer.isBuffer(req.body)) {
    req.rawBody = req.body;
    req.bodyBuffer = req.body;
    return next();
  }
  if (req.readableEnded) {
    req.rawBody = Buffer.alloc(0);
    req.bodyBuffer = req.rawBody;
    return next();
  }

  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    req.rawBody = Buffer.concat(chunks);
    req.bodyBuffer = req.rawBody;
    next();
  });
  req.on('error', next);
}
