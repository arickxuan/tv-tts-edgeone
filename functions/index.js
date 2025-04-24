export function onRequest(context) {
    return new Response("ok1", {
      headers: {
        'content-type': 'text/html; charset=UTF-8',
      },
    });
  }