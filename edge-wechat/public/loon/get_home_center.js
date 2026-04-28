
//ktx.cn/v3/api/my/home/get_home_center*
// ^https?:\/\/ktx\.cn\/v3\/api\/my\/home\/get_home_center.*$
let obj = $response.body;
if (obj) {
  try {
    // 解析原始 JSON
    let body = JSON.parse(obj);
    
    // 修改用户相关字段
  body["isVip"] = 1;
  body["level"] = 6;
  body["point"] = 66666;
  body["exp"] = 0;
  
  // 添加订阅 VIP 信息
  body["subscriptionVip"] = {
    "id": 265226,
    "createTime": 1777010776000,
    "beginTime": 1777010776000,
    "endTime": 1887132799000,
    "userId": (body.user && body.user.id) ? body.user.id : 805169,
    "isActive": 1,
    "createTimeFormat": "2026-04-24 14:06:16"
  }
    
    // 转回 JSON 字符串
    let newBody = JSON.stringify(body);
    $done({body: newBody});
  } catch(e) {
    console.log("解析错误: " + e);
    $done({body});
  }
} else {
  $done({code:0});
}