/**
 * DeepL 翻译引擎
 * 支持 free（免费网页接口）、api（官方 API Key）、deeplx（自建 DeepLX）三种模式
 *
 * 适配自 Cloudflare Workers 参考代码，改为 Node.js 原生 fetch：
 *   - Body.text(str)  -> str
 *   - Body.json(obj)  -> JSON.stringify(obj)
 *   - res.data        -> await res.json()
 */

// 语言代码枚举（与 DeepL 官方一致）
export const Language = {
    auto: 'auto',
    zh_cn: 'ZH',
    zh_tw: 'ZH',
    ja: 'JA',
    en: 'EN',
    ko: 'KO',
    fr: 'FR',
    es: 'ES',
    ru: 'RU',
    de: 'DE',
    it: 'IT',
    tr: 'TR',
    pt_pt: 'PT-PT',
    pt_br: 'PT-BR',
    id: 'ID',
    sv: 'SV',
    pl: 'PL',
    nl: 'NL',
    uk: 'UK',
};

/**
 * 统一翻译入口
 * @param {string} text      待翻译文本
 * @param {string} from      源语言（auto 表示自动检测）
 * @param {string} to        目标语言
 * @param {object} [options] 配置项
 * @param {object} [options.config]
 * @param {string} [options.config.type]      free | api | deeplx
 * @param {string} [options.config.authKey]   api 模式的 DeepL AuthKey
 * @param {string} [options.config.customUrl] deeplx 模式的服务地址
 * @returns {Promise<string>} 翻译结果
 */
export async function translate(text, from, to, options = {}) {
    const { config } = options;

    const serviceType = config?.type;
    if (serviceType === 'free') {
        return translate_by_free(text, from, to);
    } else if (serviceType === 'api') {
        return translate_by_key(text, from, to, config.authKey);
    } else if (serviceType === 'deeplx') {
        return translate_by_deeplx(text, from, to, config.customUrl);
    } else {
        // 默认走免费接口
        return translate_by_free(text, from, to);
    }
}

// ============================================================
// 模式一：免费网页接口（www2.deepl.com/jsonrpc）
// ============================================================
async function translate_by_free(text, from, to) {
    const url = 'https://www2.deepl.com/jsonrpc';
    const rand = getRandomNumber();
    const body = {
        jsonrpc: '2.0',
        method: 'LMT_handle_texts',
        params: {
            splitting: 'newlines',
            lang: {
                source_lang_user_selected: from !== 'auto' ? from.slice(0, 2) : 'auto',
                target_lang: to.slice(0, 2),
            },
            texts: [{ text, requestAlternatives: 3 }],
            timestamp: getTimeStamp(getICount(text)),
        },
        id: rand,
    };

    let body_str = JSON.stringify(body);

    // DeepL 网页接口的反爬细节：特定 id 时在 method 键名后加空格
    if ((rand + 5) % 29 === 0 || (rand + 3) % 13 === 0) {
        body_str = body_str.replace('"method":"', '"method" : "');
    } else {
        body_str = body_str.replace('"method":"', '"method": "');
    }

    const res = await fetch(url, {
        method: 'POST',
        body: body_str,
        headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (res.ok) {
        if (data && data.result && data.result.texts) {
            return data.result.texts[0].text.trim();
        } else {
            throw JSON.stringify(data);
        }
    } else {
        if (data?.error) {
            throw `Status Code: ${res.status}\n${data.error.message}`;
        } else {
            throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(data)}`;
        }
    }
}

// ============================================================
// 模式二：自建 DeepLX 服务
// ============================================================
async function translate_by_deeplx(text, from, to, url) {
    const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            source_lang: from,
            target_lang: to,
            text: text,
        }),
        headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (res.ok) {
        if (data['data']) {
            return data['data'];
        } else {
            throw JSON.stringify(data);
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(data)}`;
    }
}

// ============================================================
// 模式三：DeepL 官方 API
// ============================================================
async function translate_by_key(text, from, to, key) {
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `DeepL-Auth-Key ${key}`,
    };
    const body = {
        text: [text],
        target_lang: to,
    };
    if (from !== 'auto') {
        body['source_lang'] = from;
    }

    let url;
    if (key.endsWith(':fx')) {
        url = 'https://api-free.deepl.com/v2/translate';
    } else if (key.endsWith(':dp')) {
        url = 'https://api.deepl-pro.com/v2/translate';
    } else {
        url = 'https://api.deepl.com/v2/translate';
    }

    const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: headers,
    });

    const data = await res.json();

    if (res.ok) {
        if (data.translations && data.translations[0]) {
            return data.translations[0].text.trim();
        } else {
            throw JSON.stringify(data);
        }
    } else {
        if (data?.error) {
            throw `Status Code: ${res.status}\n${data.error.message}`;
        } else {
            throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(data)}`;
        }
    }
}

// ============================================================
// 辅助函数
// ============================================================
function getTimeStamp(iCount) {
    const ts = Date.now();
    if (iCount !== 0) {
        iCount = iCount + 1;
        return ts - (ts % iCount) + iCount;
    } else {
        return ts;
    }
}

function getICount(translate_text) {
    return translate_text.split('i').length - 1;
}

function getRandomNumber() {
    const rand = Math.floor(Math.random() * 99999) + 100000;
    return rand * 1000;
}
