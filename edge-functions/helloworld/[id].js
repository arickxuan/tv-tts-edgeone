
export async function onRequest(context) {
// console.log(context.request);
let id = decodeURIComponent(context.params.id);
console.log(id);
  console.log(decodeURIComponent(id));
  const response = await fetch(id);
  if (response.ok) {
    return new Response( JSON.stringify(response.body));
  }else{
    return new Response(`fetch error , url = ${context.params.id}`, {
      headers: {
        'content-type': 'text/html; charset=UTF-8',
      },
    });
  }


  }

  function fetchGet(url) {
    return new Promise((resolve, reject) => {
      fetch(url).then(res => {
        if (res.ok) {

          console.log(res);
          resolve(res.json());
        } else {
          reject(res);
        }
      });
    });
  }