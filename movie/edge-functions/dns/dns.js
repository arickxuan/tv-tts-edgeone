// cloudflare
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/') {
      return new Response('DeepSeek inference engine is running.', {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=UTF-8' }
      });
    }

    if (url.pathname === '/v1/models') {
      const data = {
        object: "list",
        data: [
          { id: "DeepSeek-V3.2-Exp", object: "model", created: 1710000000, owned_by: "deepseek" },
          { id: "DeepSeek-V3.1-Terminus", object: "model", created: 1710000500, owned_by: "deepseek" },
          { id: "DeepSeek-Ocr", object: "model", created: 1710001000, owned_by: "deepseek" }
        ]
      };
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/v1/chat/completions') {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/dns-message')) {
        const targetURL = 'https://dns.google/dns-query';
        const forwardHeaders = new Headers();
        forwardHeaders.set('content-type', 'application/dns-message');
        const accept = request.headers.get('accept');
        if (accept) forwardHeaders.set('accept', accept);
        return fetch(targetURL, {
          method: request.method,
          headers: forwardHeaders,
          body: request.body
        });
      }
      return new Response(JSON.stringify({
        error: {
          message: 'Unauthorized. Missing or invalid API key.',
          type: 'invalid_request_error',
          code: 401
        }
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('404 Not Found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=UTF-8' }
    });
  }
};