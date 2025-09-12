/**
 * EdgeOne Pages Edge Function - Microsoft Edge TTS 服务代理
 *
 * @version 2.4.0 (EdgeOne Pages 适配版)
 * @description 实现了内部自动批处理机制，优雅地处理 EdgeOne 的子请求限制。
 * API 现在可以处理任何长度的文本，不会因为"子请求过多"而失败。
 * 这是最终的生产就绪版本。
 * 
 * @features
 * - 支持流式和非流式 TTS 输出
 * - 自动文本清理和分块处理
 * - 智能批处理避免 EdgeOne 限制
 * - 兼容 OpenAI TTS API 格式
 * - 支持多种中英文语音
 */

// =================================================================================
// 配置参数
// =================================================================================

// 批处理配置 - 控制并发请求数量以避免 EdgeOne 限制
const DEFAULT_CONCURRENCY = 10; // 现在作为批处理大小使用
const DEFAULT_CHUNK_SIZE = 300; // 默认文本分块大小

// OpenAI 语音映射到 Microsoft 语音
const OPENAI_VOICE_MAP = {
  "shimmer": "zh-CN-XiaoxiaoNeural",    // 温柔女声 -> 晓晓
  "alloy": "zh-CN-YunyangNeural",       // 专业男声 -> 云扬
  "fable": "zh-CN-YunjianNeural",       // 激情男声 -> 云健
  "onyx": "zh-CN-XiaoyiNeural",         // 活泼女声 -> 晓伊
  "nova": "zh-CN-YunxiNeural",          // 阳光男声 -> 云希
  "echo": "zh-CN-liaoning-XiaobeiNeural" // 东北女声 -> 晓北
};



// =================================================================================
// 主事件处理器
// =================================================================================

/**
 * 处理 /api/v1/audio/speech 请求
 * @param {Object} context - EdgeOne Pages 上下文对象
 * @returns {Promise<Response>} HTTP 响应
 */
export default async function onRequest(context) {
  const request = context.request;

  // 处理 CORS 预检请求
  if (request.method === "OPTIONS") return handleOptions(request);

  // API 密钥验证
  const API_KEY = context.env.API_KEY;
  if (API_KEY) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.slice(7) !== API_KEY) {
      return errorResponse("无效的 API 密钥", 401, "invalid_api_key");
    }
  }

  try {
    // 处理语音合成请求
    return await handleSpeechRequest(request);
  } catch (err) {
    return errorResponse(`处理错误: ${err.message} | 堆栈: ${err.stack}`, 500, "internal_server_error");
  }
}

// =================================================================================
// 路由处理器
// =================================================================================

/**
 * 处理 CORS 预检请求
 * @param {Request} request - HTTP 请求对象
 * @returns {Response} CORS 响应
 */
function handleOptions(request) {
  const headers = makeCORSHeaders(request.headers.get("Access-Control-Request-Headers"));
  return new Response(null, { status: 204, headers });
}

/**
 * 处理语音合成请求
 * @param {Request} request - HTTP 请求对象
 * @returns {Promise<Response>} 语音数据响应
 */
async function handleSpeechRequest(request) {
  if (request.method !== "POST") {
    return errorResponse("不允许的方法", 405, "method_not_allowed");
  }

  let requestBody;
  try {
    requestBody = await request.json();
  } catch (err) {
    return errorResponse(`JSON 解析错误: ${err.message}`, 400, "invalid_request_error");
  }

  if (!requestBody.input) {
    return errorResponse("'input' 是必需参数", 400, "invalid_request_error");
  }

  // 解析请求参数并设置默认值
  const {
    model = "tts-1",                    // 模型名称
    input,                              // 输入文本
    voice = "shimmer",                  // 语音
    speed = 1.0,                        // 语速 (0.25-2.0)
    pitch = 1.0,                        // 音调 (0.5-1.5)
    style = "general",                  // 语音风格
    stream = false,                     // 是否流式输出
    concurrency = DEFAULT_CONCURRENCY, // 并发数
    chunk_size = DEFAULT_CHUNK_SIZE,    // 分块大小
    cleaning_options = {}               // 文本清理选项
  } = requestBody;

  // 合并默认清理选项
  const finalCleaningOptions = {
    remove_markdown: true,      // 移除 Markdown
    remove_emoji: true,         // 移除 Emoji
    remove_urls: true,          // 移除 URL
    remove_line_breaks: true,   // 移除换行符
    remove_citation_numbers: true, // 移除引用数字
    custom_keywords: "",        // 自定义关键词
    ...cleaning_options
  };

  // 清理输入文本
  const cleanedInput = cleanText(input, finalCleaningOptions);

  // 语音映射处理
  const modelVoice = !voice ? OPENAI_VOICE_MAP[model.replace('tts-1-', '')] : null;
  const finalVoice = modelVoice || voice;

  if (!finalVoice) {
    return errorResponse(`无效的语音模型 - model: ${model}, voice: ${voice}, modelVoice: ${modelVoice}`, 400, "invalid_request_error");
  }

  // 参数转换为 Microsoft TTS 格式
  const rate = ((speed - 1) * 100).toFixed(0);        // 语速转换
  const finalPitch = ((pitch - 1) * 100).toFixed(0);  // 音调转换
  const outputFormat = "audio-24khz-48kbitrate-mono-mp3"; // 输出格式

  // 智能文本分块
  const textChunks = smartChunkText(cleanedInput, chunk_size);
  const ttsArgs = [finalVoice, rate, finalPitch, style, outputFormat];

  // 根据是否流式选择处理方式
  if (stream) {
    return await streamVoice(textChunks, concurrency, ...ttsArgs);
  } else {
    return await getVoice(textChunks, concurrency, ...ttsArgs);
  }
}



// =================================================================================
// 核心 TTS 逻辑 (自动批处理机制)
// =================================================================================

/**
 * 流式语音生成
 * @param {string[]} textChunks - 文本块数组
 * @param {number} concurrency - 并发数
 * @param {...any} ttsArgs - TTS 参数
 * @returns {Promise<Response>} 流式音频响应
 */
async function streamVoice(textChunks, concurrency, ...ttsArgs) {
  const { readable, writable } = new TransformStream();
  try {
    // 等待流式管道完成以便捕获错误
    await pipeChunksToStream(writable.getWriter(), textChunks, concurrency, ...ttsArgs);
    return new Response(readable, {
      headers: { "Content-Type": "audio/mpeg", ...makeCORSHeaders() }
    });
  } catch (error) {
    return errorResponse(`流式 TTS 失败: ${error.message}`, 500, "tts_generation_error");
  }
}

/**
 * 将文本块流式传输到响应流
 * @param {WritableStreamDefaultWriter} writer - 写入器
 * @param {string[]} chunks - 文本块
 * @param {number} concurrency - 并发数
 * @param {...any} ttsArgs - TTS 参数
 */
async function pipeChunksToStream(writer, chunks, concurrency, ...ttsArgs) {
  try {
    // 分批处理文本块以避免超出 EdgeOne 子请求限制
    for (let i = 0; i < chunks.length; i += concurrency) {
      const batch = chunks.slice(i, i + concurrency);
      const audioPromises = batch.map(chunk => getAudioChunk(chunk, ...ttsArgs));

      // 仅等待当前批次完成
      const audioBlobs = await Promise.all(audioPromises);

      // 将音频数据写入流
      for (const blob of audioBlobs) {
        const arrayBuffer = await blob.arrayBuffer();
        writer.write(new Uint8Array(arrayBuffer));
      }
    }
  } catch (error) {
    writer.abort(error);
    throw new Error(`流式处理失败: ${error.message}`);
  } finally {
    writer.close();
  }
}

/**
 * 非流式语音生成
 * @param {string[]} textChunks - 文本块数组
 * @param {number} concurrency - 并发数
 * @param {...any} ttsArgs - TTS 参数
 * @returns {Promise<Response>} 完整音频响应
 */
async function getVoice(textChunks, concurrency, ...ttsArgs) {
  const allAudioBlobs = [];
  try {
    // 非流式模式也使用批处理
    for (let i = 0; i < textChunks.length; i += concurrency) {
      const batch = textChunks.slice(i, i + concurrency);
      const audioPromises = batch.map(chunk => getAudioChunk(chunk, ...ttsArgs));

      // 等待当前批次并收集结果
      const audioBlobs = await Promise.all(audioPromises);
      allAudioBlobs.push(...audioBlobs);
    }

    // 合并所有音频数据
    const concatenatedAudio = new Blob(allAudioBlobs, { type: 'audio/mpeg' });
    return new Response(concatenatedAudio, {
      headers: { "Content-Type": "audio/mpeg", ...makeCORSHeaders() }
    });
  } catch (error) {
    return errorResponse(`非流式 TTS 失败: ${error.message}`, 500, "tts_generation_error");
  }
}

/**
 * 获取单个文本块的音频数据
 * @param {string} text - 文本内容
 * @param {string} voiceName - 语音名称
 * @param {string} rate - 语速
 * @param {string} pitch - 音调
 * @param {string} style - 语音风格
 * @param {string} outputFormat - 输出格式
 * @returns {Promise<Blob>} 音频 Blob
 */
async function getAudioChunk(text, voiceName, rate, pitch, style, outputFormat) {
  const endpoint = await getEndpoint();
  const url = `https://${endpoint.r}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const ssml = getSsml(text, voiceName, rate, pitch, style);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": endpoint.t,
      "Content-Type": "application/ssml+xml",
      "User-Agent": "okhttp/4.5.0",
      "X-Microsoft-OutputFormat": outputFormat
    },
    body: ssml
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Edge TTS API 错误: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.blob();
}

// =================================================================================
// 稳定的身份验证与辅助函数
// =================================================================================

// Token 缓存信息
let tokenInfo = { endpoint: null, token: null, expiredAt: null };
const TOKEN_REFRESH_BEFORE_EXPIRY = 5 * 60; // 提前 5 分钟刷新 Token

/**
 * 获取 Microsoft TTS 服务端点和 Token
 * @returns {Promise<Object>} 端点信息对象
 */
async function getEndpoint() {
  const now = Date.now() / 1000;

  // 检查 Token 是否仍然有效
  if (tokenInfo.token && tokenInfo.expiredAt &&
    now < tokenInfo.expiredAt - TOKEN_REFRESH_BEFORE_EXPIRY) {
    return tokenInfo.endpoint;
  }

  const endpointUrl = "https://dev.microsofttranslator.com/apps/endpoint?api-version=1.0";

  let clientId;
  try {
    clientId = crypto.randomUUID().replace(/-/g, "");
  } catch (e) {
    // 如果 crypto.randomUUID 不可用，使用备用方法
    clientId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  try {
    const signature = await sign(endpointUrl);

    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Accept-Language": "zh-Hans",
        "X-ClientVersion": "4.0.530a 5fe1dc6c",
        "X-UserId": "0f04d16a175c411e",
        "X-HomeGeographicRegion": "zh-Hans-CN",
        "X-ClientTraceId": clientId,
        "X-MT-Signature": signature,
        "User-Agent": "okhttp/4.5.0",
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": "0",
        "Accept-Encoding": "gzip"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`获取端点失败: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    // 解析 JWT Token 获取过期时间
    let decodedJwt;
    try {
      const jwt = data.t.split(".")[1];

      // 尝试多种 base64 解码方式
      let decoded;
      if (typeof atob !== 'undefined') {
        decoded = atob(jwt);
      } else if (typeof Buffer !== 'undefined') {
        decoded = Buffer.from(jwt, 'base64').toString('utf-8');
      } else {
        // 手动 base64 解码
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let result = '';
        for (let i = 0; i < jwt.length; i += 4) {
          const a = chars.indexOf(jwt[i]);
          const b = chars.indexOf(jwt[i + 1]);
          const c = chars.indexOf(jwt[i + 2]);
          const d = chars.indexOf(jwt[i + 3]);

          result += String.fromCharCode((a << 2) | (b >> 4));
          if (c !== 64) result += String.fromCharCode(((b & 15) << 4) | (c >> 2));
          if (d !== 64) result += String.fromCharCode(((c & 3) << 6) | d);
        }
        decoded = result;
      }

      decodedJwt = JSON.parse(decoded);
    } catch (e) {
      throw new Error(`JWT 解析失败: ${e.message}`);
    }

    // 更新 Token 缓存
    tokenInfo = {
      endpoint: data,
      token: data.t,
      expiredAt: decodedJwt.exp
    };

    return data;
  } catch (error) {
    // 如果有缓存的 Token，使用过期的 Token 作为备用
    if (tokenInfo.token) {
      return tokenInfo.endpoint;
    }

    throw new Error(`端点获取失败: ${error.message}`);
  }
}

/**
 * 生成 Microsoft Translator 签名
 * @param {string} urlStr - 要签名的 URL
 * @returns {Promise<string>} 签名字符串
 */
async function sign(urlStr) {
  const url = urlStr.split("://")[1];
  const encodedUrl = encodeURIComponent(url);

  let uuidStr;
  try {
    uuidStr = crypto.randomUUID().replace(/-/g, "");
  } catch (e) {
    // 如果 crypto.randomUUID 不可用，使用备用方法
    uuidStr = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  const formattedDate = (new Date()).toUTCString().replace(/GMT/, "").trim() + " GMT";

  // 构建待签名字符串
  const bytesToSign = `MSTranslatorAndroidApp${encodedUrl}${formattedDate}${uuidStr}`.toLowerCase();

  // 解码密钥并生成 HMAC 签名
  const decode = await base64ToBytes("oik6PdDdMnOXemTbwvMn9de/h9lFnfBaCWbGMMZqqoSaQaqUOqjVGm5NqsmjcBI1x+sS9ugjB55HEJWRiFXYFw==");
  const signData = await hmacSha256(decode, bytesToSign);
  const signBase64 = await bytesToBase64(signData);

  return `MSTranslatorAndroidApp::${signBase64}::${formattedDate}::${uuidStr}`;
}

/**
 * HMAC-SHA256 签名
 * @param {Uint8Array} key - 密钥
 * @param {string} data - 待签名数据
 * @returns {Promise<Uint8Array>} 签名结果
 */
async function hmacSha256(key, data) {
  // 检查 EdgeOne Pages 环境中的 crypto API
  if (!crypto || !crypto.subtle) {
    throw new Error("crypto.subtle API 不可用，EdgeOne Pages 环境可能不支持此功能");
  }

  try {
    // 确保 key 是 Uint8Array 格式
    const keyBuffer = key instanceof Uint8Array ? key : new Uint8Array(key);

    // 导入密钥，使用更兼容的参数
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      {
        name: "HMAC",
        hash: "SHA-256"  // 简化 hash 参数
      },
      false,
      ["sign"]
    );

    // 确保数据是正确的格式
    const dataBuffer = typeof data === 'string' ? new TextEncoder().encode(data) : data;

    // 执行签名
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, dataBuffer);
    return new Uint8Array(signature);
  } catch (e) {
    throw new Error(`HMAC 签名失败: ${e.message} | 详细信息: ${e.stack}`);
  }
}

/**
 * Base64 字符串转字节数组
 * @param {string} base64 - Base64 字符串
 * @returns {Promise<Uint8Array>} 字节数组
 */
async function base64ToBytes(base64) {
  try {
    // 检查全局 atob 函数
    if (typeof atob !== 'undefined') {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }

    // 如果 atob 不可用，尝试使用 Buffer (Node.js 环境)
    if (typeof Buffer !== 'undefined') {
      return new Uint8Array(Buffer.from(base64, 'base64'));
    }

    // 手动实现 base64 解码作为最后的备用方案
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    for (let i = 0; i < base64.length; i += 4) {
      const a = chars.indexOf(base64[i]);
      const b = chars.indexOf(base64[i + 1]);
      const c = chars.indexOf(base64[i + 2]);
      const d = chars.indexOf(base64[i + 3]);

      result += String.fromCharCode((a << 2) | (b >> 4));
      if (c !== 64) result += String.fromCharCode(((b & 15) << 4) | (c >> 2));
      if (d !== 64) result += String.fromCharCode(((c & 3) << 6) | d);
    }

    const bytes = new Uint8Array(result.length);
    for (let i = 0; i < result.length; i++) {
      bytes[i] = result.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    throw new Error(`Base64 解码失败: ${e.message}`);
  }
}

/**
 * 字节数组转 Base64 字符串
 * @param {Uint8Array} bytes - 字节数组
 * @returns {Promise<string>} Base64 字符串
 */
async function bytesToBase64(bytes) {
  try {
    // 检查全局 btoa 函数
    if (typeof btoa !== 'undefined') {
      return btoa(String.fromCharCode.apply(null, bytes));
    }

    // 如果 btoa 不可用，尝试使用 Buffer (Node.js 环境)
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(bytes).toString('base64');
    }

    // 手动实现 base64 编码作为最后的备用方案
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;

    while (i < bytes.length) {
      const a = bytes[i++];
      const b = i < bytes.length ? bytes[i++] : 0;
      const c = i < bytes.length ? bytes[i++] : 0;

      result += chars[a >> 2];
      result += chars[((a & 3) << 4) | (b >> 4)];
      result += i - 2 < bytes.length ? chars[((b & 15) << 2) | (c >> 6)] : '=';
      result += i - 1 < bytes.length ? chars[c & 63] : '=';
    }

    return result;
  } catch (e) {
    throw new Error(`Base64 编码失败: ${e.message}`);
  }
}

// =================================================================================
// 通用工具函数
// =================================================================================

/**
 * 生成 SSML (Speech Synthesis Markup Language) 文档
 * @param {string} text - 文本内容
 * @param {string} voiceName - 语音名称
 * @param {string} rate - 语速百分比
 * @param {string} pitch - 音调百分比
 * @param {string} style - 语音风格
 * @returns {string} SSML 文档
 */
function getSsml(text, voiceName, rate, pitch, style) {
  // 先保护 break 标签
  const breakTagRegex = /<break\s+time="[^"]*"\s*\/?>|<break\s*\/?>|<break\s+time='[^']*'\s*\/?>/gi;
  const breakTags = [];
  let processedText = text.replace(breakTagRegex, (match) => {
    const placeholder = `__BREAK_TAG_${breakTags.length}__`;
    breakTags.push(match);
    return placeholder;
  });

  // 转义其他 XML 特殊字符
  const sanitizedText = processedText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 恢复 break 标签
  let finalText = sanitizedText;
  breakTags.forEach((tag, index) => {
    finalText = finalText.replace(`__BREAK_TAG_${index}__`, tag);
  });

  return `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" version="1.0" xml:lang="en-US">
    <voice name="${voiceName}">
      <mstts:express-as style="${style}">
        <prosody rate="${rate}%" pitch="${pitch}%">${finalText}</prosody>
      </mstts:express-as>
    </voice>
  </speak>`;
}

/**
 * 智能文本分块 - 按句子边界分割文本
 * @param {string} text - 输入文本
 * @param {number} maxChunkLength - 最大分块长度
 * @returns {string[]} 文本块数组
 */
function smartChunkText(text, maxChunkLength) {
  if (!text) return [];

  const chunks = [];
  let currentChunk = "";

  // 按句子分隔符分割（支持中英文标点）
  const sentences = text.split(/([.?!,;:\n。？！，；：\r]+)/g);

  for (const part of sentences) {
    // 如果当前块加上新部分不超过限制，则添加
    if (currentChunk.length + part.length <= maxChunkLength) {
      currentChunk += part;
    } else {
      // 保存当前块并开始新块
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = part;
    }
  }

  // 添加最后一个块
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  // 如果没有分块成功且文本不为空，强制按长度分割
  if (chunks.length === 0 && text.length > 0) {
    for (let i = 0; i < text.length; i += maxChunkLength) {
      chunks.push(text.substring(i, i + maxChunkLength));
    }
  }

  return chunks.filter(chunk => chunk.length > 0);
}

/**
 * 多阶段文本清理函数
 * @param {string} text - 输入文本
 * @param {Object} options - 清理选项
 * @returns {string} 清理后的文本
 */
function cleanText(text, options) {
  let cleanedText = text;

  // 阶段 1: 结构化内容移除
  if (options.remove_urls) {
    cleanedText = cleanedText.replace(/(https?:\/\/[^\s]+)/g, '');
  }

  if (options.remove_markdown) {
    // 移除图片链接
    cleanedText = cleanedText.replace(/!\[.*?\]\(.*?\)/g, '');
    // 移除普通链接，保留链接文本
    cleanedText = cleanedText.replace(/\[(.*?)\]\(.*?\)/g, '$1');
    // 移除粗体和斜体
    cleanedText = cleanedText.replace(/(\*\*|__)(.*?)\1/g, '$2');
    cleanedText = cleanedText.replace(/(\*|_)(.*?)\1/g, '$2');
    // 移除代码块
    cleanedText = cleanedText.replace(/`{1,3}(.*?)`{1,3}/g, '$1');
    // 移除标题标记
    cleanedText = cleanedText.replace(/#{1,6}\s/g, '');
  }

  // 阶段 2: 自定义内容移除
  if (options.custom_keywords) {
    const keywords = options.custom_keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k);

    if (keywords.length > 0) {
      // 转义正则表达式特殊字符
      const escapedKeywords = keywords.map(k =>
        k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
      );
      const regex = new RegExp(escapedKeywords.join('|'), 'g');
      cleanedText = cleanedText.replace(regex, '');
    }
  }

  // 阶段 3: 字符移除
  if (options.remove_emoji) {
    // 移除 Emoji 表情符号
    cleanedText = cleanedText.replace(/\p{Emoji_Presentation}/gu, '');
  }

  // 阶段 4: 上下文感知格式清理
  if (options.remove_citation_numbers) {
    // 移除引用数字（如文末的 [1], [2] 等）
    cleanedText = cleanedText.replace(/\s\d{1,2}(?=[.。，,;；:：]|$)/g, '');
  }

  // 阶段 5: 通用格式清理
  if (options.remove_line_breaks) {
    // 移除所有多余的空白字符
    cleanedText = cleanedText.replace(/\s+/g, ' ');
  }

  // 阶段 6: 最终清理
  return cleanedText.trim();
}

/**
 * 生成错误响应
 * @param {string} message - 错误消息
 * @param {number} status - HTTP 状态码
 * @param {string} code - 错误代码
 * @param {string} type - 错误类型
 * @returns {Response} 错误响应对象
 */
function errorResponse(message, status, code, type = "api_error") {
  return new Response(
    JSON.stringify({
      error: { message, type, param: null, code }
    }),
    {
      status,
      headers: { "Content-Type": "application/json", ...makeCORSHeaders() }
    }
  );
}

/**
 * 生成 CORS 响应头
 * @param {string} extraHeaders - 额外的允许头部
 * @returns {Object} CORS 头部对象
 */
function makeCORSHeaders(extraHeaders = "Content-Type, Authorization") {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": extraHeaders,
    "Access-Control-Max-Age": "86400"
  };
}
