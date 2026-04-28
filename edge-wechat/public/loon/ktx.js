
// KTX 看天下 - 全功能解锁脚本
// 作者: Your Name
// 更新时间: 2026-04-29

// ktx_all.js - 统一处理所有KTX接口
let url = $request.url;

console.log("拦截URL: " + url);

// 获取响应体
let responseBody = $response.body;

if (!responseBody) {
    console.log("响应体为空");
    $done({});
    return;
}

try {
    let body = JSON.parse(responseBody);

    // 1. 首页中心接口 - 修改用户VIP信息
    if (url.includes("/my/home/get_home_center")) {
        console.log("处理首页中心接口");
        let newBody = vip(body)
        $done({ body: newBody });
        return;
    }
    // 2. 杂志列表接口 - 修改杂志列表
    else if (url.includes("/magazine/all_mag_page")) {
        console.log("处理杂志列表接口");
        let newBody = allMagPage(body)
        $done({ body: newBody });
        return;
    }
    // 3. 文章详情接口
    else if (url.includes("/article/article_detail2")) {
        console.log("处理文章详情接口");
        let newBody = articleDetail2(body)
        $done({ body: newBody });
        return;
    }
    // 4. 杂志详情接口
    else if (url.includes("/magazine/mag_column_detail")) {
        console.log("处理杂志详情接口");
        let newBody = magColumnDetail(body)
        $done({ body: newBody });
        return;
    }
    // 5. 获取杂志接口
    else if (url.includes("/magazine/get_mag")) {
        console.log("处理获取杂志接口");
        let newBody = getMag(body)
        $done({ body: newBody });
        return;
    }
    // 6. 获取杂志PDF列表接口
    else if (url.includes("/magazine/pdf/get_mag_pdf_list")) {
        console.log("处理获取杂志PDF列表接口");
        let newBody = getMagPdfList(body)
        $done({ body: newBody });
        return;
    }

    // 返回修改后的响应
    $done({ body: JSON.stringify(body) });

} catch (e) {
    console.log("KTX脚本错误: " + e.message);
    $done({});
    return;
}

function vip(body) {
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
    return newBody;
}

function allMagPage(body) {
    // 检查 magList 是否存在且为数组
    if (body?.magList && Array.isArray(body.magList)) {
        body.magList.forEach(item => {
            if (item) {
                item.isfree = 1;
                item.isBuyMag = 1;
            }
        });
    } else {
        console.log("magList 不存在或不是数组");
    }
    // 转回 JSON 字符串
    let newBody = JSON.stringify(body);
    return newBody;
}

function articleDetail2(body) {
    body["article"]["isFree"] = 1;
    body["article"]["isFreeMag"] = 1;

    body["article"]["isBuyArticle"] = 1;
    body["article"]["isFree"] = 1;
    body["article"]["mag"]["isfree"] = 1;
    body["article"]["mag"]["isBuyArticle"] = 1;

    let newBody = JSON.stringify(body);
    return newBody;
}

function magColumnDetail(body) {

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
    // 转回 JSON 字符串
    let newBody = JSON.stringify(body);
    return newBody;
}

function getMag(body) {

    // 检查 magList 是否存在且为数组
    if (body?.columnList && Array.isArray(body.columnList)) {
        body.columnList.forEach(item => {
            if (item) {
                item.isfree = 1;
                item.isBuyArticle = 1;
            }
        });
    } else {
        console.log("magList 不存在或不是数组");
    }

    body["mag"]["isFree"] = 1;
    body["mag"]["isBuyArticle"] = 1;
    body["article"]["isFree"] = 1;
    body["article"]["mag"]["isfree"] = 1;
    body["article"]["mag"]["isBuyArticle"] = 1;
    body["isFree"] = 1;
    body["isBuyMag"] = 1;

    // 转回 JSON 字符串
    let newBody = JSON.stringify(body);
    return newBody;

}

function getMagPdfList(body) {
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

    // 转回 JSON 字符串
    let newBody = JSON.stringify(body);
    return newBody;
}




// ^https?:\/\/ktx\.cn\/v3\/api\/my\/home\/get_home_center.*$ response-body-json-replace data.isVip 1 data.level 6 data.subscriptionVip {"id":265226,"createTime":1777010776000,"beginTime":1777010776000,"endTime":1887132799000,"userId":805169,"isActive":1,"createTimeFormat":"2026-04-24 14:06:16"}
// ^https?:\/\/ktx\.cn\/v3\/api\/magazine\/all_mag_page.*$ response-body-json-replace $.magList[].isfree 1 $.magList[].isBuyMag 1
// ^https?:\/\/ktx\.cn\/v3\/api\/article\/article_detail2.*$ response-body-json-replace $.article.isFree 1 $.article.isFreeMag 1 $.article.isBuyArticle 1 $.article.mag.isfree 1 $.article.mag.isBuyArticle 1
// ^https?:\/\/ktx\.cn\/v3\/api\/magazine\/mag_column_detail.*$ response-body-json-replace $.columnList[].isfree 1 $.columnList[].isBuyArticle 1 $.columnList[].articles[].isBuyArticle 1
// ^https?:\/\/ktx\.cn\/v3\/api\/magazine\/get_mag.*$ response-body-json-replace $.columnList[].isfree 1 $.columnList[].isBuyArticle 1 $.article.isFree 1 $.article.mag.isfree 1 $.article.mag.isBuyArticle 1 $.isFree 1 $.isBuyMag 1
// ^https?:\/\/ktx\.cn\/v3\/api\/magazine\/pdf\/get_mag_pdf_list.*$ response-body-json-replace $.magList[].isfree 1 $.magList[].isBuyMag 1


