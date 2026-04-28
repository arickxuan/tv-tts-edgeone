// https://ktx.cn/v3/api/article/article_detail2*

// ^https?:\/\/ktx\.cn\/v3\/api\/article\/article_detail2
let responseBody = $response.body;

if (!responseBody) {
  $done({});
  return;
}

try {
  let body = JSON.parse(responseBody);
  
  body["article"]["isFree"] = 1;
  body["article"]["isFreeMag"] = 1;
  
  body["article"]["isBuyArticle"] = 1;
  body["article"]["isFree"] = 1;
  body["article"]["mag"]["isfree"] = 1;
  body["article"]["mag"]["isBuyArticle"] = 1;
  
  $done({body: JSON.stringify(body)});
  
} catch(e) {
  console.log("JSON解析失败: " + e.message);
  // 返回原始响应
  $done({body: responseBody});
}
