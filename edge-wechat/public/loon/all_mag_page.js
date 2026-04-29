// let body = $response.body;
// let obj = JSON.parse(body);

// https://ktx.cn/v3/api/magazine/all_mag_page*
// 
/**
[rewrite_local]

// ^https?:\/\/ktx\.cn\/v3\/api\/magazine\/all_mag_page.*$ url script-response-body https://raw.githubusercontent.com/89996462/Quantumult-X/main/ycdz/jihu.js


[mitm]

hostname = ktx.cn

**/


let responseBody = $response.body;

if (!responseBody) {
  $done({});
}

try {
  let body = JSON.parse(responseBody);
  
  // 检查 magList 是否存在且为数组
  if (body?.magList && Array.isArray(body.magList)) {
    Object.keys(body.magList).forEach(item => {
    //body.magList.forEach(item => {
      if (item) {
        body.magList[item].isfree = 1;
        body.magList[item].isBuyMag = 1;
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


// let obj = {};
// // 修改数据
// obj.data.nickname = "修改后的昵称";
// obj.data.vip_level = 10;
// obj.code = 200;

$done({ body: JSON.stringify(obj) });