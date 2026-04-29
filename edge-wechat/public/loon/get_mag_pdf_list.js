

// https://ktx.cn/v3/api/mag/pdf/get_mag_pdf_list*
// ^https?:\/\/ktx\.cn\/v3\/api\/mag\/pdf\/get_mag_pdf_list.*$
let responseBody = $response.body;

if (!responseBody) {
  $done({});
}

try {
  let body = JSON.parse(responseBody);
  
  // 检查 magList 是否存在且为数组
  if (body?.magList && Array.isArray(body.magList)) {
    body.magList.forEach(item => {
      if (item) {
        //item.isfree = 1;
        item.isBuyMag = 1;
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
