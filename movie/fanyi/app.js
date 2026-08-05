/**
 * DeepL 翻译服务 - Express 应用
 *
 * 既可以独立运行（node fanyi/app.js），也可以作为子应用挂载到主 app.js：
 *   import fanyiApp from './fanyi/app.js';
 *   app.use('/fanyi', fanyiApp);
 *
 * 接口：
 *   GET  /            健康检查
 *   GET  /languages   支持的语言列表
 *   GET  /            测试页面（HTML）
 *   POST /translate   翻译接口
 */

import express from 'express';
import cors from 'cors';
import { translate, Language } from './translator.js';

const app = express();

// 跨域 & body 解析
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
    console.log(`[fanyi ${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'deepl-translate' });
});

// 支持的语言列表
app.get('/languages', (req, res) => {
    res.json(Language);
});

/**
 * POST /translate
 *
 * Body:
 * {
 *   "text": "Hello world",
 *   "source_lang": "EN",        // 源语言，auto 为自动检测
 *   "target_lang": "ZH",        // 目标语言
 *   "type": "free",             // free | api | deeplx
 *   "authKey": "xxx:fx",        // type=api 时必填
 *   "customUrl": "http://..."   // type=deeplx 时必填
 * }
 *
 * Response:
 * { "code": 200, "data": "你好世界" }
 * 或错误时 { "code": 500, "error": "..." }
 */
app.post('/translate', async (req, res) => {
    const { text, source_lang = 'auto', target_lang, type = 'free', authKey, customUrl } = req.body || {};

    if (!text || !target_lang) {
        return res.status(400).json({ code: 400, error: '参数 text 和 target_lang 为必填项' });
    }

    try {
        const result = await translate(text, source_lang, target_lang, {
            config: { type, authKey, customUrl },
        });
        res.json({ code: 200, data: result });
    } catch (err) {
        console.error('[fanyi] 翻译失败:', err);
        res.status(500).json({ code: 500, error: String(err) });
    }
});

// 内嵌测试页面
app.get('/', (req, res) => {
    res.type('html').send(TEST_PAGE);
});

// 独立运行时监听端口
const PORT = process.env.FANYI_PORT || 8089;
if (import.meta.url === `file://${process.argv[1]}`) {
    app.listen(PORT, () => {
        console.log(`翻译服务已启动: http://localhost:${PORT}`);
    });
}

export default app;

// ============================================================
// 测试页面
// ============================================================
const TEST_PAGE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DeepL 翻译服务</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; background: #0f1117; color: #e6e6e6; min-height: 100vh; display: flex; justify-content: center; padding: 40px 16px; }
  .container { width: 100%; max-width: 820px; }
  h1 { font-size: 26px; margin-bottom: 6px; }
  .subtitle { color: #888; font-size: 14px; margin-bottom: 28px; }
  .panel { background: #1a1d27; border: 1px solid #2a2e3a; border-radius: 12px; padding: 22px; margin-bottom: 20px; }
  .row { display: flex; gap: 14px; margin-bottom: 16px; flex-wrap: wrap; }
  .field { flex: 1; min-width: 140px; }
  label { display: block; font-size: 13px; color: #9aa0ac; margin-bottom: 6px; }
  select, input { width: 100%; background: #0f1117; border: 1px solid #2a2e3a; border-radius: 8px; padding: 9px 12px; color: #e6e6e6; font-size: 14px; outline: none; }
  select:focus, input:focus { border-color: #4a8eff; }
  textarea { width: 100%; background: #0f1117; border: 1px solid #2a2e3a; border-radius: 8px; padding: 12px; color: #e6e6e6; font-size: 15px; line-height: 1.6; resize: vertical; outline: none; min-height: 110px; font-family: inherit; }
  textarea:focus { border-color: #4a8eff; }
  .arrow { text-align: center; font-size: 22px; color: #555; margin: 6px 0; }
  .btn { background: #4a8eff; color: #fff; border: none; border-radius: 8px; padding: 11px 28px; font-size: 15px; cursor: pointer; font-weight: 600; transition: background .2s; }
  .btn:hover { background: #3a7ae8; }
  .btn:disabled { background: #2a2e3a; color: #555; cursor: not-allowed; }
  .result-box { background: #0f1117; border: 1px solid #2a2e3a; border-radius: 8px; padding: 14px; min-height: 60px; font-size: 15px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
  .error { color: #ff6b6b; }
  .loading { color: #4a8eff; }
  .extra { display: none; }
  .extra.show { display: flex; }
</style>
</head>
<body>
<div class="container">
  <h1>DeepL 翻译服务</h1>
  <p class="subtitle">支持 free / api / deeplx 三种模式</p>

  <div class="panel">
    <div class="row">
      <div class="field">
        <label>翻译模式</label>
        <select id="type" onchange="toggleExtra()">
          <option value="free">free（免费接口）</option>
          <option value="api">api（官方 Key）</option>
          <option value="deeplx">deeplx（自建服务）</option>
        </select>
      </div>
      <div class="field">
        <label>源语言</label>
        <select id="from">
          <option value="auto">自动检测</option>
        </select>
      </div>
      <div class="field">
        <label>目标语言</label>
        <select id="to">
          <option value="ZH">中文</option>
        </select>
      </div>
    </div>
    <div class="row extra" id="api-row">
      <div class="field">
        <label>DeepL AuthKey</label>
        <input id="authKey" type="text" placeholder="如 xxx:fx / xxx:dp">
      </div>
    </div>
    <div class="row extra" id="deeplx-row">
      <div class="field">
        <label>DeepLX 地址</label>
        <input id="customUrl" type="text" placeholder="http://localhost:1188/translate">
      </div>
    </div>
  </div>

  <div class="panel">
    <label style="margin-bottom:8px">原文</label>
    <textarea id="text" placeholder="输入要翻译的文本...">Hello, world!</textarea>
    <div class="arrow">↓</div>
    <label style="margin-bottom:8px">译文</label>
    <div class="result-box" id="result">—</div>
  </div>

  <button class="btn" id="btn" onclick="doTranslate()">翻译</button>
</div>

<script>
const langs = {
  "auto":"自动检测","ZH":"中文","JA":"日语","EN":"英语","KO":"韩语",
  "FR":"法语","ES":"西班牙语","RU":"俄语","DE":"德语","IT":"意大利语",
  "TR":"土耳其语","PT-PT":"葡萄牙语(葡)","PT-BR":"葡萄牙语(巴)","ID":"印尼语",
  "SV":"瑞典语","PL":"波兰语","NL":"荷兰语","UK":"乌克兰语"
};
const fromSel = document.getElementById('from');
const toSel = document.getElementById('to');
Object.entries(langs).forEach(([code,name]) => {
  fromSel.add(new Option(name, code));
  if (code !== 'auto') toSel.add(new Option(name, code));
});
fromSel.value = 'auto';
toSel.value = 'ZH';

function toggleExtra() {
  const t = document.getElementById('type').value;
  document.getElementById('api-row').classList.toggle('show', t === 'api');
  document.getElementById('deeplx-row').classList.toggle('show', t === 'deeplx');
}

async function doTranslate() {
  const btn = document.getElementById('btn');
  const result = document.getElementById('result');
  const body = {
    text: document.getElementById('text').value,
    source_lang: document.getElementById('from').value,
    target_lang: document.getElementById('to').value,
    type: document.getElementById('type').value,
  };
  if (body.type === 'api') body.authKey = document.getElementById('authKey').value;
  if (body.type === 'deeplx') body.customUrl = document.getElementById('customUrl').value;

  btn.disabled = true;
  result.className = 'result-box loading';
  result.textContent = '翻译中...';
  try {
    const res = await fetch('/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.code === 200) {
      result.className = 'result-box';
      result.textContent = json.data;
    } else {
      result.className = 'result-box error';
      result.textContent = json.error || '翻译失败';
    }
  } catch (e) {
    result.className = 'result-box error';
    result.textContent = String(e);
  } finally {
    btn.disabled = false;
  }
}
</script>
</body>
</html>`;
