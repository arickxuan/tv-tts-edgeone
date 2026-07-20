import { config } from '../config/index.js';

export function apiAuth(req, res, next) {
  const token = config.api.token;
  if (!token) {
    return res.status(500).json({ error: 'TGFS_API_TOKEN 未配置' });
  }

  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const apiKey = req.headers['x-api-key'];

  if (bearer === token || apiKey === token) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized' });
}
