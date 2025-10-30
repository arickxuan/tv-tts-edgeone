// 天翼云盘签到脚本 (JavaScript Fetch版本)
// 环境变量说明：
// TY_USERNAME: 用户名，多个用&隔开
// TY_PASSWORD: 密码，多个用&隔开
// WXPUSHER_APP_TOKEN: WxPusher应用令牌
// WXPUSHER_UID: WxPusher用户ID，多个用&隔开

// const NodeRSA = require('node-rsa');
// const crypto = require('crypto');

import NodeRSA from "node-rsa";
import crypto from 'crypto';

const BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz".split('');
const B64MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// 从环境变量获取账号信息
function getAccounts() {
    const usernames = (process.env.TY_USERNAME || '').split('&').filter(u => u.trim());
    const passwords = (process.env.TY_PASSWORD || '').split('&').filter(p => p.trim());

    if (!usernames.length || !passwords.length) {
        throw new Error("❌ 请设置环境变量 TY_USERNAME 和 TY_PASSWORD");
    }

    return usernames.map((username, index) => ({
        username: username.trim(),
        password: passwords[index] ? passwords[index].trim() : ''
    }));
}

function maskPhone(phone) {
    return phone.length === 11 ? phone.slice(0, 3) + "****" + phone.slice(-4) : phone;
}

function int2char(a) {
    return BI_RM[a];
}

function b64tohex(a) {
    let d = "";
    let e = 0;
    let c = 0;

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== "=") {
            const v = B64MAP.indexOf(a[i]);
            if (e === 0) {
                e = 1;
                d += int2char(v >> 2);
                c = 3 & v;
            } else if (e === 1) {
                e = 2;
                d += int2char(c << 2 | v >> 4);
                c = 15 & v;
            } else if (e === 2) {
                e = 3;
                d += int2char(c);
                d += int2char(v >> 2);
                c = 3 & v;
            } else {
                e = 0;
                d += int2char(c << 2 | v >> 4);
                d += int2char(15 & v);
            }
        }
    }

    if (e === 1) {
        d += int2char(c << 2);
    }

    return d;
}



function base64ToHex(base64String) {
    const raw = Buffer.from(base64String, "base64");
    return raw.toString("hex");
}

/**
   * JS版 rsa_encode，对应你给的 Python rsa_encode
   */
export function rsaEncode(j_rsakey, string) {
    const rsaKey = `-----BEGIN PUBLIC KEY-----\n${j_rsakey}\n-----END PUBLIC KEY-----`;

    const key = new NodeRSA();
    key.importKey(rsaKey, "pkcs8-public-pem");
    key.setOptions({ encryptionScheme: "pkcs1" }); // 确保与 python-rsa 一致

    const encryptedBase64 = key.encrypt(string, "base64");
    return base64ToHex(encryptedBase64);
}

class TianyiYunClient {
    constructor() {
        this.session = null;
    }

    async login(username, password) {
        console.log("🔄 正在执行登录流程...");

        try {
            // 初始化会话
            this.session = {
                cookies: new Map(),
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:74.0) Gecko/20100101 Firefox/76.0'
                }
            };



            // 获取登录页面
            const urlToken = "https://m.cloud.189.cn/udb/udb_login.jsp?pageId=1&pageKey=default&clientType=wap&redirectURL=https://m.cloud.189.cn/zhuanti/2021/shakeLottery/index.html";
            const response1 = await fetch(urlToken, {
                headers: this.session.headers
            });
            const text1 = await response1.text();

            // 提取动态登录URL
            const urlMatch = text1.match(/https?:\/\/[^\s'"]+/);
            if (!urlMatch) {
                console.log("❌ 错误：未找到动态登录页");
                return null;
            }

            const dynamicUrl = urlMatch[0];
            const response2 = await fetch(dynamicUrl, {
                headers: this.session.headers
            });
            const text2 = await response2.text();
            // 提取登录入口
            const hrefMatch = text2.match(/<a id="j-tab-login-link"[^>]*href="([^"]+)"/);
            if (!hrefMatch) {
                console.log("❌ 错误：登录入口获取失败");
                return null;
            }

            const href = hrefMatch[1];
            const response3 = await fetch(href, {
                headers: this.session.headers
            });
            const text3 = await response3.text();

            // 提取登录参数
            const captchaTokenMatch = text3.match(/captchaToken' value='(.+?)'/);
            const ltMatch = text3.match(/lt = "(.+?)"/);
            const returnUrlMatch = text3.match(/returnUrl= '(.+?)'/);
            const paramIdMatch = text3.match(/paramId = "(.+?)"/);
            const j_rsakeyMatch = text3.match(/j_rsaKey" value="(\S+)"/);

            if (!captchaTokenMatch || !ltMatch || !returnUrlMatch || !paramIdMatch || !j_rsakeyMatch) {
                console.log("❌ 错误：登录参数提取失败");
                return null;
            }

            const captchaToken = captchaTokenMatch[1];
            const lt = ltMatch[1];
            const returnUrl = returnUrlMatch[1];
            const paramId = paramIdMatch[1];
            const j_rsakey = j_rsakeyMatch[1];

            // 更新会话头信息
            this.session.headers = {
                ...this.session.headers,
                'lt': lt,
                'Referer': 'https://open.e.189.cn/',
                'Content-Type': 'application/x-www-form-urlencoded'
            };

            // RSA加密用户名和密码（简化处理）
            const username_enc = rsaEncode(j_rsakey, username);
            const password_enc = rsaEncode(j_rsakey, password);

            const formData = new URLSearchParams({
                "appKey": "cloud",
                "accountType": '01',
                "userName": `{RSA}${username_enc}`,
                "password": `{RSA}${password_enc}`,
                "validateCode": "",
                "captchaToken": captchaToken,
                "returnUrl": returnUrl,
                "mailSuffix": "@189.cn",
                "paramId": paramId
            });

            const loginResponse = await fetch("https://open.e.189.cn/api/logbox/oauth2/loginSubmit.do", {
                method: 'POST',
                headers: this.session.headers,
                body: formData,
                redirect: 'manual'
            });

            const loginResult = await loginResponse.json();

            if (loginResult.result !== 0) {
                console.log(`❌ 登录错误：${loginResult.msg}`);
                return null;
            }

            // 跳转到返回URL
            await fetch(loginResult.toUrl, {
                headers: this.session.headers
            });

            console.log("✅ 登录成功");
            return this.session;

        } catch (error) {
            console.log(`⚠️ 登录异常：${error.message}`);
            return null;
        }
    }

    async signIn() {
        if (!this.session) {
            return { success: false, message: "未登录" };
        }

        try {
            const rand = Math.round(Date.now());
            const signUrl = `https://api.cloud.189.cn/mkt/userSign.action?rand=${rand}&clientType=TELEANDROID&version=8.6.3&model=SM-G930K`;

            const headers = {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 5.1.1; SM-G930K Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.136 Mobile Safari/537.36 Ecloud/8.6.3 Android/22 clientId/355325117317828 clientModel/SM-G930K imsi/460071114317824 clientChannelId/qq proVersion/1.0.6',
                "Referer": "https://m.cloud.189.cn/zhuanti/2016/sign/index.jsp?albumBackupOpened=1",
                "Host": "m.cloud.189.cn",
                ...this.session.headers
            };

            const response = await fetch(signUrl, { headers });
            const result = await response.json();

            if (result.isSign === "false") {
                return { success: true, message: `✅ +${result.netdiskBonus}M` };
            } else {
                return { success: true, message: `⏳ 已签到+${result.netdiskBonus}M` };
            }

        } catch (error) {
            return { success: false, message: `❌ 签到异常: ${error.message}` };
        }
    }

    async lottery() {
        if (!this.session) {
            return { success: false, message: "未登录" };
        }

        try {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 2000));

            const lotteryUrl = 'https://m.cloud.189.cn/v2/drawPrizeMarketDetails.action?taskId=TASK_SIGNIN&activityId=ACT_SIGNIN';

            const headers = {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 5.1.1; SM-G930K Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.136 Mobile Safari/537.36 Ecloud/8.6.3 Android/22 clientId/355325117317828 clientModel/SM-G930K imsi/460071114317824 clientChannelId/qq proVersion/1.0.6',
                "Referer": "https://m.cloud.189.cn/zhuanti/2016/sign/index.jsp?albumBackupOpened=1",
                "Host": "m.cloud.189.cn",
                ...this.session.headers
            };

            const response = await fetch(lotteryUrl, { headers });
            const result = await response.json();

            if (result.errorCode) {
                return { success: false, message: `❌ ${result.errorCode}` };
            } else {
                const prize = result.prizeName || result.description;
                return { success: true, message: `🎁 ${prize}` };
            }

        } catch (error) {
            return { success: false, message: `❌ 抽奖异常: ${error.message}` };
        }
    }
}

async function sendWxPusher(msg) {
    const appToken = process.env.WXPUSHER_APP_TOKEN;
    const uids = (process.env.WXPUSHER_UID || '').split('&').filter(uid => uid.trim());

    if (!appToken || !uids.length) {
        console.log("⚠️ 未配置WxPusher，跳过消息推送");
        return;
    }

    const url = "https://wxpusher.zjiecode.com/api/send/message";
    const headers = { "Content-Type": "application/json" };

    for (const uid of uids) {
        const data = {
            "appToken": appToken,
            "content": msg,
            "contentType": 3,
            "topicIds": [],
            "uids": [uid.trim()],
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.code === 1000) {
                console.log(`✅ 消息推送成功 -> UID: ${uid}`);
            } else {
                console.log(`❌ 消息推送失败：${JSON.stringify(result)}`);
            }
        } catch (error) {
            console.log(`❌ 推送异常：${error.message}`);
        }
    }
}

export async function main() {
    console.log("\n=============== 天翼云盘签到开始 ===============");

    const accounts = getAccounts();
    const allResults = [];

    for (const acc of accounts) {
        const maskedPhone = maskPhone(acc.username);
        const accountResult = {
            username: maskedPhone,
            sign: "",
            lottery: ""
        };

        console.log(`\n🔔 处理账号：${maskedPhone}`);

        const client = new TianyiYunClient();
        const session = await client.login(acc.username, acc.password);

        if (!session) {
            accountResult.sign = "❌ 登录失败";
            accountResult.lottery = "❌ 登录失败";
            allResults.push(accountResult);
            continue;
        }

        // 执行签到
        const signResult = await client.signIn();
        accountResult.sign = signResult.message;

        // 执行抽奖
        const lotteryResult = await client.lottery();
        accountResult.lottery = lotteryResult.message;

        allResults.push(accountResult);
        console.log(`  ${accountResult.sign} | ${accountResult.lottery}`);
        return accountResult;
    }

    // 生成汇总表格
    let table = "### ⛅ 天翼云盘签到汇总\n\n";
    table += "| 账号 | 签到结果 | 每日抽奖 |\n";
    table += "|:-:|:-:|:-:|\n";

    for (const res of allResults) {
        table += `| ${res.username} | ${res.sign} | ${res.lottery} |\n`;
    }

    // 发送汇总推送
    await sendWxPusher(table);
    console.log("\n✅ 所有账号处理完成！");
}


// module.exports = { main };