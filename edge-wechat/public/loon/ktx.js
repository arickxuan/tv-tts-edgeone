
// KTX 看天下 - 全功能解锁脚本
// 作者: Your Name
// 更新时间: 2026-04-29

async function onResponse(context, url, request, response) {
    try {
        var body = JSON.parse(response.body);
        
        // 根据 URL 路径执行不同的修改
        if (url.includes('/v3/api/magazine/all_mag_page')) {
            modifyAllMagPage(body);
        } else if (url.includes('/v3/api/magazine/mag_column_detail')) {
            modifyMagColumnDetail(body);
        } else if (url.includes('/v3/api/magazine/get_mag')) {
            modifyGetMag(body);
        } else if (url.includes('/v3/api/article/article_detail2')) {
            modifyArticleDetail(body);
        } else if (url.includes('/v3/api/mag/pdf/get_mag_pdf_list')) {
            modifyMagPdfList(body);
        } else if (url.includes('/v3/api/my/home/get_home_center')) {
            modifyHomeCenter(body);
        }

        // 返回修改后的响应
        response.body = JSON.stringify(body);
        $done({ response });
    } catch (e) {
        console.log("KTX脚本错误: " + e.message);
        console.log("错误URL: " + url);
        $done({ response });
    }
}

// 杂志列表页 - 全部免费
function modifyAllMagPage(body) {
    if (body.magList) {
        body.magList.forEach(item => {
            item.isfree = 1;
            item.isBuyMag = 1;
        });
    }
}

// 杂志栏目详情 - 全部免费
function modifyMagColumnDetail(body) {
    if (body.columnList) {
        body.columnList.forEach(item => {
            item.isfree = 1;
            item.isBuyArticle = 1;
            if (item.articles) {
                item.articles.forEach(i => {
                    i.isBuyArticle = 1;
                });
            }
        });
    }
    body["isFree"] = 1;
    body["isBuyMag"] = 1;
}

// 获取杂志信息 - 全部免费
function modifyGetMag(body) {
    if (body.columnList) {
        body.columnList.forEach(item => {
            item.isfree = 1;
            item.isBuyArticle = 1;
        });
    }
    if (body.mag) {
        body.mag["isFree"] = 1;
        body.mag["isBuyArticle"] = 1;
    }
    if (body.article) {
        body.article["isFree"] = 1;
        if (body.article.mag) {
            body.article.mag["isfree"] = 1;
            body.article.mag["isBuyArticle"] = 1;
        }
    }
    body["isFree"] = 1;
    body["isBuyMag"] = 1;
}

// 文章详情 - 免费
function modifyArticleDetail(body) {
    if (body.article) {
        body.article["isFree"] = 1;
        body.article["isFreeMag"] = 1;
        body.article["isBuyArticle"] = 1;
        if (body.article.mag) {
            body.article.mag["isfree"] = 1;
            body.article.mag["isBuyArticle"] = 1;
        }
    }
}

// PDF列表 - 标记已购买
function modifyMagPdfList(body) {
    if (body.magList) {
        body.magList.forEach(item => {
            item.isBuyMag = 1;
        });
    }
}

// 个人中心 - VIP状态
function modifyHomeCenter(body) {
    body["isVip"] = 1;
    body["level"] = 6;
    body["point"] = 66666;
    body["exp"] = 0;
    
    body["subscriptionVip"] = {
        "id": 265226,
        "createTime": 1777010776000,
        "beginTime": 1777010776000,
        "endTime": 1887132799000,
        "userId": body.user ? body.user.id : 805169,
        "isActive": 1,
        "createTimeFormat": "2026-04-24 14:06:16"
    };
}