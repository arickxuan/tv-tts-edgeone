import axios from 'axios';
import dns from 'dns/promises';
import { config } from '../../config/index.js';
import { normalizeKey } from '../../utils/path.js';

/** Contents API 对大 JSON body 易 socket hang up；超过此阈值改走 Git Data API */
const CONTENTS_API_MAX = Number(process.env.GITHUB_CONTENTS_MAX_BYTES || 900 * 1024);

function logErr(...args) {
  console.error('[tgfs:github]', ...args);
}

function headers() {
  const token = config.github.token;
  if (!token) throw new Error('GITHUB_TOKEN 未配置');
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'tgfs-edge',
  };
}

function apiRoot() {
  return (config.github.apiBase || 'https://api.github.com').replace(/\/+$/, '');
}

function repoBase() {
  const { owner, repo } = config.github;
  if (!owner || !repo) throw new Error('GITHUB_OWNER / GITHUB_REPO 未配置');
  return `${apiRoot()}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}

function encodeRepoPath(path) {
  return String(path)
    .split('/')
    .filter((s) => s.length > 0)
    .map((seg) => encodeURIComponent(seg))
    .join('/');
}

export function repoPath(bucket, key) {
  const parts = [];
  const prefix = (config.github.pathPrefix || '').replace(/^\/+|\/+$/g, '');
  if (prefix) parts.push(prefix);
  parts.push(bucket, normalizeKey(key));
  return parts.filter(Boolean).join('/');
}

function isFakeIp(address) {
  // Clash/Surge fake-ip 常用 198.18.0.0/15
  const m = String(address).match(/^(\d+)\.(\d+)\./);
  if (!m) return false;
  const a = Number(m[1]);
  const b = Number(m[2]);
  return a === 198 && (b === 18 || b === 19);
}

function looksLikeGithubJson(data, contentType = '') {
  if (typeof data === 'object' && data !== null) return true;
  const ct = String(contentType).toLowerCase();
  if (ct.includes('application/json') || ct.includes('vnd.github')) return true;
  return false;
}

/**
 * Detect proxy hijack: api.github.com → 301 → github.com/...
 */
function assertApiResponse(res, url, action) {
  const ct = res.headers?.['content-type'] || '';
  const loc = res.headers?.location || '';

  if (res.status >= 300 && res.status < 400) {
    const err = new Error(
      `GitHub API 被重定向到 ${loc || '(unknown)'}。` +
        `本机代理/Fake-IP 可能劫持了 api.github.com。` +
        `请让 Clash/Surge 对 api.github.com 直连，或设置可用的 GITHUB_API_BASE。`,
    );
    err.status = 502;
    err.code = 'GitHubProxyHijack';
    throw err;
  }

  if (res.status === 404 && !looksLikeGithubJson(res.data, ct)) {
    const err = new Error(
      `GitHub ${action} 返回非 JSON 的 404（疑似代理劫持或仓库不可达）。` +
        `url=${url} content-type=${ct || 'none'}。` +
        `请检查 GITHUB_OWNER/REPO/TOKEN，以及 api.github.com 网络。`,
    );
    err.status = 502;
    err.code = 'GitHubProxyHijack';
    throw err;
  }

  if (typeof res.data === 'string' && res.data.includes('<!DOCTYPE html>')) {
    const err = new Error(
      `GitHub ${action} 返回了 HTML 页面而非 API JSON，网络/代理异常。url=${url}`,
    );
    err.status = 502;
    err.code = 'GitHubProxyHijack';
    throw err;
  }
}

function formatGhError(err, action) {
  if (err.code === 'GitHubProxyHijack') return err.message;
  const status = err.response?.status;
  const data = err.response?.data;
  const msg = (typeof data === 'object' && data?.message) || err.message;
  const errors = data?.errors ? JSON.stringify(data.errors) : '';
  const code = err.code || '';
  return [
    `GitHub ${action} 失败`,
    status ? `HTTP ${status}` : '',
    code && !status ? code : '',
    msg,
    errors,
  ].filter(Boolean).join(' | ');
}

function wrapGhError(err, action) {
  if (err.code === 'GitHubProxyHijack' || err.code === 'GitHubError') return err;
  const e = new Error(formatGhError(err, action));
  e.status = err.response?.status || err.status || 502;
  e.code = 'GitHubError';
  e.cause = err;
  return e;
}

function isTransient(err) {
  if (err.code === 'GitHubProxyHijack') return false;
  const msg = String(err.message || '').toLowerCase();
  const code = err.code || err.cause?.code;
  return (
    code === 'ECONNRESET' ||
    code === 'ETIMEDOUT' ||
    code === 'EPIPE' ||
    code === 'ECONNABORTED' ||
    msg.includes('socket hang up') ||
    msg.includes('timeout') ||
    err.response?.status === 502 ||
    err.response?.status === 503 ||
    err.response?.status === 504
  );
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function withRetry(label, fn, retries = 3) {
  let last;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      last = err;
      if (i < retries && isTransient(err)) {
        const wait = 800 * (i + 1);
        // retry silently
        await sleep(wait);
        continue;
      }
      throw err;
    }
  }
  throw last;
}

async function ghRequest(method, url, opts = {}) {
  return withRetry(`${method} ${url}`, async () => {
    const res = await axios({
      method,
      url,
      headers: { ...headers(), ...(opts.headers || {}) },
      timeout: opts.timeout ?? 120000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: () => true,
      maxRedirects: 0, // 禁止跟随到 github.com，便于发现代理劫持
      data: opts.data,
      params: opts.params,
      responseType: opts.responseType,
    });

    assertApiResponse(res, url, method);

    if (res.status >= 500) {
      const err = new Error(res.data?.message || `HTTP ${res.status}`);
      err.response = res;
      err.code = 'ECONNRESET';
      throw err;
    }
    return res;
  });
}

let connectivityChecked = false;

async function ensureGithubReachable() {
  if (connectivityChecked) return;
  connectivityChecked = true;

  const root = apiRoot();
  let host = 'api.github.com';
  try {
    host = new URL(root).hostname;
  } catch {
    // ignore
  }

  try {
    const looked = await dns.lookup(host);
    if (host === 'api.github.com' && isFakeIp(looked.address)) {
      logErr(
        `api.github.com → ${looked.address} (Fake-IP)。若上传异常请直连或设置 GITHUB_API_BASE`,
      );
    }
  } catch (e) {
    logErr('dns lookup failed', host, e.message);
  }

  // 探测仓库是否可达（真 404 = 无权限/不存在；劫持会在 assert 里抛）
  const probeUrl = `${repoBase()}`;
  const res = await ghRequest('GET', probeUrl, { timeout: 20000 });
  if (res.status === 404) {
    const err = new Error(
      `仓库不可访问: ${config.github.owner}/${config.github.repo} (HTTP 404)。` +
        `请确认仓库存在，且 Fine-grained Token 已勾选该仓 + Contents: Read and write。`,
    );
    err.status = 404;
    err.code = 'GitHubError';
    throw err;
  }
  if (res.status === 401 || res.status === 403) {
    const err = new Error(
      `GitHub 鉴权失败 HTTP ${res.status}: ${res.data?.message || ''}。请检查 GITHUB_TOKEN。`,
    );
    err.status = res.status;
    err.code = 'GitHubError';
    throw err;
  }
  if (res.status >= 400) {
    throw wrapGhError({ response: res }, 'probeRepo');
  }
}

async function getContentMeta(path) {
  const url = `${repoBase()}/contents/${encodeRepoPath(path)}`;
  try {
    const { data, status } = await ghRequest('GET', url, {
      params: { ref: config.github.branch },
      timeout: 60000,
    });
    if (status === 404) {
      // 仅当确认是 API JSON 404 才视为新文件（assert 已拦 HTML）
      return null;
    }
    if (status >= 400) throw wrapGhError({ response: { status, data } }, 'getContent');
    if (Array.isArray(data)) {
      const err = new Error(`Path is a directory: ${path}`);
      err.status = 400;
      throw err;
    }
    return data;
  } catch (err) {
    if (err.code === 'GitHubProxyHijack' || err.code === 'GitHubError' || err.status === 400) throw err;
    if (err.response?.status === 404 && looksLikeGithubJson(err.response?.data, err.response?.headers?.['content-type'])) {
      return null;
    }
    throw wrapGhError(err, 'getContent');
  }
}

/**
 * Upload via Git Data API (blob → tree → commit → ref).
 * More reliable for multi-MB files than Contents API.
 */
async function putViaGitData(path, buf, message) {
  const branch = config.github.branch;
  const base = repoBase();
  const blobRes = await ghRequest('POST', `${base}/git/blobs`, {
    data: {
      content: buf.toString('base64'),
      encoding: 'base64',
    },
    timeout: 180000,
  });
  if (blobRes.status >= 400) {
    throw wrapGhError({ response: blobRes }, 'createBlob');
  }
  const blobSha = blobRes.data.sha;

  // current branch tip
  // GET 用单数 /git/ref/... ；PATCH 必须用复数 /git/refs/...
  const getRefUrl = `${base}/git/ref/heads/${encodeURIComponent(branch)}`;
  const updateRefUrl = `${base}/git/refs/heads/${encodeURIComponent(branch)}`;
  const refRes = await ghRequest('GET', getRefUrl, { timeout: 30000 });

  let parentSha = null;
  let baseTreeSha = null;

  if (refRes.status === 404) {
  } else if (refRes.status >= 400) {
    throw wrapGhError({ response: refRes }, 'getRef');
  } else {
    parentSha = refRes.data.object?.sha;
    const commitRes = await ghRequest('GET', `${base}/git/commits/${parentSha}`, { timeout: 30000 });
    if (commitRes.status >= 400) {
      throw wrapGhError({ response: commitRes }, 'getCommit');
    }
    baseTreeSha = commitRes.data.tree?.sha;
  }

  const treePayload = {
    tree: [
      {
        path,
        mode: '100644',
        type: 'blob',
        sha: blobSha,
      },
    ],
  };
  if (baseTreeSha) treePayload.base_tree = baseTreeSha;
  const treeRes = await ghRequest('POST', `${base}/git/trees`, {
    data: treePayload,
    timeout: 60000,
  });
  if (treeRes.status >= 400) {
    throw wrapGhError({ response: treeRes }, 'createTree');
  }
  const treeSha = treeRes.data.sha;

  const commitPayload = {
    message,
    tree: treeSha,
    parents: parentSha ? [parentSha] : [],
  };
  const commitRes = await ghRequest('POST', `${base}/git/commits`, {
    data: commitPayload,
    timeout: 60000,
  });
  if (commitRes.status >= 400) {
    throw wrapGhError({ response: commitRes }, 'createCommit');
  }
  const commitSha = commitRes.data.sha;

  if (parentSha) {
    const upd = await ghRequest('PATCH', updateRefUrl, {
      data: { sha: commitSha, force: false },
      timeout: 30000,
    });
    if (upd.status >= 400) {
      throw wrapGhError({ response: upd }, 'updateRef');
    }
  } else {
    const created = await ghRequest('POST', `${base}/git/refs`, {
      data: {
        ref: `refs/heads/${branch}`,
        sha: commitSha,
      },
      timeout: 30000,
    });
    if (created.status >= 400) {
      throw wrapGhError({ response: created }, 'createRef');
    }
  }

  return { blobSha, commitSha };
}

async function putViaContents(path, buf, message, existingSha) {
  const url = `${repoBase()}/contents/${encodeRepoPath(path)}`;
  let sha = existingSha || null;
  if (!sha) {
    const cur = await getContentMeta(path);
    sha = cur?.sha || null;
  }

  const payload = {
    message,
    content: buf.toString('base64'),
    branch: config.github.branch,
  };
  if (sha) payload.sha = sha;
  const { data, status } = await ghRequest('PUT', url, {
    data: payload,
    headers: { 'Content-Type': 'application/json' },
    timeout: 120000,
  });

  if (status >= 400) {
    if ((status === 409 || status === 422) && sha) {
      const latest = await getContentMeta(path);
      const retryPayload = {
        message,
        content: payload.content,
        branch: config.github.branch,
      };
      if (latest?.sha) retryPayload.sha = latest.sha;
      const retry = await ghRequest('PUT', url, {
        data: retryPayload,
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000,
      });
      if (retry.status >= 400) {
        throw wrapGhError({ response: retry }, 'putContents');
      }
      return {
        sha: retry.data.content?.sha || retry.data.commit?.sha || '',
      };
    }
    throw wrapGhError({ response: { status, data } }, 'putContents');
  }

  return {
    sha: data.content?.sha || data.commit?.sha || sha || '',
  };
}


export function createGithubBlob() {

  return {
    name: 'github',

    async put({ bucket, key, body, contentType, existingMeta }) {
      await ensureGithubReachable();
      const buf = Buffer.isBuffer(body) ? body : Buffer.from(body);
      const max = config.github.maxUploadBytes;
      if (buf.length > max) {
        const err = new Error(`文件超过 GitHub 上传限制 ${max} bytes`);
        err.status = 413;
        throw err;
      }

      const path = repoPath(bucket, key);
      const message = `tgfs put ${bucket}/${normalizeKey(key)}`;

      try {
        let sha;
        if (buf.length > CONTENTS_API_MAX) {
          // 大文件：Contents API 易 socket hang up，改走 Git Data API
          const result = await putViaGitData(path, buf, message);
          sha = result.blobSha;
        } else {
          const result = await putViaContents(path, buf, message, existingMeta?.sha);
          sha = result.sha;
        }

        return {
          backend: 'github',
          fileId: path,
          messageId: null,
          sha: sha || '',
          size: buf.length,
          contentType: contentType || 'application/octet-stream',
        };
      } catch (err) {
        if (err.code === 'GitHubError') throw err;
        logErr('PUT exception', formatGhError(err, 'put'));
        throw wrapGhError(err, 'put');
      }
    },

    async get(meta) {
      const path = meta.fileId || repoPath(meta.bucket, meta.key);
      const info = await getContentMeta(path);
      if (!info) {
        const err = new Error('NoSuchKey');
        err.code = 'NoSuchKey';
        err.status = 404;
        throw err;
      }

      if (info.download_url) {
        const { data } = await axios.get(info.download_url, {
          headers: headers(),
          responseType: 'arraybuffer',
          timeout: 120000,
          maxContentLength: config.github.maxUploadBytes,
        });
        return Buffer.from(data);
      }

      if (info.encoding === 'base64' && info.content) {
        return Buffer.from(info.content.replace(/\n/g, ''), 'base64');
      }

      // large files: content may be null — fetch blob by sha
      if (info.sha) {
        const blobRes = await ghRequest('GET', `${repoBase()}/git/blobs/${info.sha}`, {
          timeout: 180000,
        });
        if (blobRes.status >= 400) {
          throw wrapGhError({ response: blobRes }, 'getBlob');
        }
        if (blobRes.data.encoding === 'base64' && blobRes.data.content) {
          return Buffer.from(String(blobRes.data.content).replace(/\n/g, ''), 'base64');
        }
      }

      throw new Error('无法从 GitHub 读取文件内容');
    },

    async remove(meta) {
      const path = meta.fileId || repoPath(meta.bucket, meta.key);
      let sha = meta.sha;
      if (!sha) {
        const cur = await getContentMeta(path);
        if (!cur) {
          return false;
        }
        sha = cur.sha;
      }

      // Prefer Contents API delete for simplicity (needs content blob sha)
      const url = `${repoBase()}/contents/${encodeRepoPath(path)}`;
      try {
        const { status, data } = await ghRequest('DELETE', url, {
          data: {
            message: `tgfs delete ${path}`,
            sha,
            branch: config.github.branch,
          },
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000,
        });
        if (status >= 400) {
          // sha 可能是 blob sha；重新取 contents sha 再删
          const cur = await getContentMeta(path);
          if (!cur?.sha) {
            logErr('DELETE failed', { status, message: data?.message });
            return false;
          }
          const retry = await ghRequest('DELETE', url, {
            data: {
              message: `tgfs delete ${path}`,
              sha: cur.sha,
              branch: config.github.branch,
            },
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000,
          });
          if (retry.status >= 400) {
            logErr('DELETE retry failed', { status: retry.status, message: retry.data?.message });
            return false;
          }
        }
        return true;
      } catch (err) {
        logErr('DELETE exception:', err.response?.data?.message || err.message);
        return false;
      }
    },
  };
}
