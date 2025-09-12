/**
 * EdgeOne Pages Edge Function for /api/v1/models
 * 处理模型列表请求
 */

// OpenAI 音色映射
const OPENAI_VOICE_MAP = {
  'alloy': 'zh-CN-XiaoxiaoNeural',
  'echo': 'zh-CN-YunxiNeural',
  'fable': 'zh-CN-XiaoyiNeural',
  'onyx': 'zh-CN-YunjianNeural',
  'nova': 'zh-CN-XiaochenNeural',
  'shimmer': 'zh-CN-XiaohanNeural'
};

/**
 * 生成 CORS 头
 * @returns {Object} CORS 头对象
 */
function makeCORSHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
  };
}

/**
 * 处理 CORS 预检请求
 * @returns {Response} CORS 响应
 */
function handleOptions() {
  return new Response(null, {
    status: 200,
    headers: makeCORSHeaders()
  });
}

/**
 * 生成错误响应
 * @param {string} message - 错误消息
 * @param {number} status - HTTP 状态码
 * @param {string} type - 错误类型
 * @returns {Response} 错误响应
 */
function errorResponse(message, status = 400, type = "invalid_request_error") {
  return new Response(JSON.stringify({
    error: { message, type, code: null }
  }), {
    status,
    headers: { "Content-Type": "application/json", ...makeCORSHeaders() }
  });
}

/**
 * 处理 /api/v1/models 请求
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
    // 返回模型列表
    const models = [
      { id: 'tts-1', object: 'model', created: Date.now(), owned_by: 'openai' },
      { id: 'tts-1-hd', object: 'model', created: Date.now(), owned_by: 'openai' },
      ...Object.keys(OPENAI_VOICE_MAP).map(v => ({
        id: `tts-1-${v}`,
        object: 'model',
        created: Date.now(),
        owned_by: 'openai'
      }))
    ];

    return new Response(JSON.stringify({ object: "list", data: models }), {
      headers: { "Content-Type": "application/json", ...makeCORSHeaders() }
    });
  } catch (err) {
    return errorResponse(`模型列表请求错误: ${err.message}`, 500, "internal_server_error");
  }
}
