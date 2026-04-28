

// https://ktx.cn/v3/api/magazine/mag_column_detail*
// ^https?:\/\/ktx\.cn\/v3\/api\/magazine\/mag_column_detail
let responseBody = $response.body;

if (!responseBody) {
  $done({});
  return;
}

try {
  let body = JSON.parse(responseBody);
  
  // 检查 columnList 是否存在且为数组
  if (body?.columnList && Array.isArray(body.columnList)) {
    body.columnList.forEach(item => {
      if (item) {
        item.isfree = 1;
        item.isBuyArticle = 1;
        item.articles.forEach(i => {
          i.isBuyArticle = 1;
        });

      }
    });
  } else {
    console.log("magList 不存在或不是数组");
  }
  
  $done({body: JSON.stringify(body)});
  
} catch(e) {
  console.log("JSON解析失败: " + e.message);
  // 返回原始响应
  $done({body: responseBody});
}


