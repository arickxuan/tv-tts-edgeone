import { config } from '../config/index.js';

export function davAuth(req, res, next) {
  const user = config.dav.user;
  const pass = config.dav.pass;
  if (!user || !pass) {
    return res.status(500).send('DAV_USER/DAV_PASS 未配置');
  }

  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="tgfs"');
    return res.status(401).send('Unauthorized');
  }

  let decoded;
  try {
    decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  } catch {
    res.setHeader('WWW-Authenticate', 'Basic realm="tgfs"');
    return res.status(401).send('Unauthorized');
  }

  const idx = decoded.indexOf(':');
  const u = idx >= 0 ? decoded.slice(0, idx) : decoded;
  const p = idx >= 0 ? decoded.slice(idx + 1) : '';

  if (u === user && p === pass) {
    return next();
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="tgfs"');
  return res.status(401).send('Unauthorized');
}
