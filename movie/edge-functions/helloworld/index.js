const json = JSON.stringify({
      "code": 0,
      "message": "Hello World"
    });


export function onRequest(context) {
  return new Response(json, {
    headers: {
      'content-type': 'text/html; charset=UTF-8',
      'x-edgefunctions-test': 'Welcome to use Pages Functions.',
    },
  });
}

