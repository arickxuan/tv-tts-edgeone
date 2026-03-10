#!/usr/bin/env node
// -*- coding: utf-8 -*-
// @Time    : 2025/5/9 9:48
// 原作者：https://www.52pojie.cn/thread-1231190-1-1.html
// 出处：https://github.com/vistal8/tianyiyun
// cron "30 4 * * *" script-path=xxx.js,tag=匹配cron用
// const $ = new Env('天翼云盘签到');
// 变量说明：ty_username 用户名 &隔开  ty_password 密码 &隔开
// 5.9变更：更改推送为表格单次推送 打印日志简化 现在抽奖只能抽一次 第二次和第三次已经失效。
// 推送变量需设置 WXPUSHER_APP_TOKEN 和 WXPUSHER_UID（多个UID用&分隔）
// 有图形验证码就是风控了 自己去网页端登陆 输入验证码 等几天
// 设备锁问题请访问https://github.com/vistal8/tianyiyun/blob/main/README.md 查看详细说明

import crypto from 'crypto';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

const BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz".split('');
const B64MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// 从环境变量获取账号信息
const ty_usernames = process.env.TY_USERNAME ? process.env.TY_USERNAME.split('&') : ["189"];
const ty_passwords = process.env.TY_PASSWORD ? process.env.TY_PASSWORD.split('&') : ["passwd"];

// 检查环境变量
if (!ty_usernames || !ty_passwords) {
    throw new Error("❌ 请设置环境变量 ty_username 和 TY_PASSWORD");
}

// 组合账号信息
const accounts = ty_usernames.map((username, index) => ({
    username: username,
    password: ty_passwords[index]
}));

// WxPusher配置
const WXPUSHER_APP_TOKEN = process.env.WXPUSHER_APP_TOKEN;
const WXPUSHER_UIDS = process.env.WXPUSHER_UID ? process.env.WXPUSHER_UID.split('&') : [];

/**
 * 隐藏手机号中间四位
 */
function maskPhone(phone) {
    return phone.length === 11 ? phone.substr(0, 3) + "****" + phone.substr(-4) : phone.substr(0, 3) + "****" + phone.substr(-4);
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

function rsaEncode(jRsakey, string) {
    const rsaKey = `-----BEGIN PUBLIC KEY-----\n${jRsakey}\n-----END PUBLIC KEY-----`;
    const buffer = Buffer.from(string, 'utf8');
    const encrypted = crypto.publicEncrypt(
        {
            key: rsaKey,
            padding: crypto.constants.RSA_PKCS1_PADDING
        },
        buffer
    );
    const result = b64tohex(encrypted.toString('base64'));
    return result;
}

async function login(username, password) {
    console.log("🔄 正在执行登录流程...");
    
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));
    
    try {
        const urlToken = "https://m.cloud.189.cn/udb/udb_login.jsp?pageId=1&pageKey=default&clientType=wap&redirectURL=https://m.cloud.189.cn/zhuanti/2021/shakeLottery/index.html";
        let r = await client.get(urlToken);
        
        const match1 = r.data.match(/https?:\/\/[^\s'"]+/);
        if (!match1) {
            console.log("❌ 错误：未找到动态登录页");
            return null;
        }
        
        const url = match1[0];
        r = await client.get(url);
        
        const match2 = r.data.match(/<a id="j-tab-login-link"[^>]*href="([^"]+)"/);
        if (!match2) {
            console.log("❌ 错误：登录入口获取失败");
            return null;
        }
        
        const href = match2[1];
        r = await client.get(href);
        
        const captchaToken = r.data.match(/captchaToken' value='(.+?)'/)[1];
        const lt = r.data.match(/lt = "(.+?)"/)[1];
        const returnUrl = r.data.match(/returnUrl= '(.+?)'/)[1];
        const paramId = r.data.match(/paramId = "(.+?)"/)[1];
        const jRsakey = r.data.match(/j_rsaKey" value="(\S+)"/m)[1];
        
        const usernameEnc = rsaEncode(jRsakey, username);
        const passwordEnc = rsaEncode(jRsakey, password);
        
        const data = {
            appKey: "cloud",
            accountType: '01',
            userName: `{RSA}${usernameEnc}`,
            password: `{RSA}${passwordEnc}`,
            validateCode: "",
            captchaToken: captchaToken,
            returnUrl: returnUrl,
            mailSuffix: "@189.cn",
            paramId: paramId
        };
        
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:74.0) Gecko/20100101 Firefox/76.0',
            'Referer': 'https://open.e.189.cn/',
            'lt': lt
        };
        
        r = await client.post(
            "https://open.e.189.cn/api/logbox/oauth2/loginSubmit.do",
            new URLSearchParams(data),
            {
                headers: headers,
                timeout: 10000
            }
        );
        
        if (r.data.result !== 0) {
            console.log(`❌ 登录错误：${r.data.msg}`);
            return null;
        }
        
        //console.log(r.data.toUrl);
        const ress = await client.get(r.data.toUrl);
        //console.log(ress.data, "re.text");
        //console.log("cookies", jar, "headers", ress.headers);
        //console.log("Response cookies:");
        //const cookies = await jar.getCookies(r.data.toUrl);
        // cookies.forEach(cookie => {
        //     console.log(`Name: ${cookie.key}`);
        //     console.log(`Value: ${cookie.value}`);
        //     console.log(`Domain: ${cookie.domain}`);
        //     console.log(`Path: ${cookie.path}`);
        //     console.log(`Expires: ${cookie.expires}`);
        //     console.log(`Secure: ${cookie.secure}`);
        //     console.log("---");
        // });
        
        // console.log("\nAll headers:");
        // Object.entries(r.headers).forEach(([key, value]) => {
        //     console.log(`${key}: ${value}`);
        // });
        
        console.log("✅ 登录成功");
        //console.log("sharedCookies", r.headers['set-cookie']);
        return client;
        
    } catch (e) {
        console.log(`⚠️ 登录异常：${e.message}`);
        return null;
    }
}

async function sendWxpusher(msg) {
    if (!WXPUSHER_APP_TOKEN || WXPUSHER_UIDS.length === 0) {
        console.log("⚠️ 未配置WxPusher，跳过消息推送");
        return;
    }
    
    const url = "https://wxpusher.zjiecode.com/api/send/message";
    const headers = { "Content-Type": "application/json" };
    
    for (const uid of WXPUSHER_UIDS) {
        const data = {
            appToken: WXPUSHER_APP_TOKEN,
            content: msg,
            contentType: 3,
            topicIds: [],
            uids: [uid],
        };
        
        try {
            const resp = await axios.post(url, data, { headers, timeout: 10000 });
            if (resp.data.code === 1000) {
                console.log(`✅ 消息推送成功 -> UID: ${uid}`);
            } else {
                console.log(`❌ 消息推送失败：${JSON.stringify(resp.data)}`);
            }
        } catch (e) {
            console.log(`❌ 推送异常：${e.message}`);
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log("\n=============== 天翼云盘签到开始 ===============");
    const allResults = [];
    
    for (const acc of accounts) {
        const username = acc.username;
        const password = acc.password;
        const maskedPhone = maskPhone(username);
        const accountResult = { username: maskedPhone, sign: "", lottery: "" };
        
        console.log(`\n🔔 处理账号：${maskedPhone}`);
        
        // 登录流程
        const session = await login(username, password);
        if (!session) {
            accountResult.sign = "❌ 登录失败";
            allResults.push(accountResult);
            continue;
        }
        
        // 签到流程
        try {
            // 每日签到
            const rand = Math.round(Date.now());
            const signUrl = `https://api.cloud.189.cn/mkt/userSign.action?rand=${rand}&clientType=TELEANDROID&version=8.6.3&model=SM-G930K`;
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 5.1.1; SM-G930K Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.136 Mobile Safari/537.36 Ecloud/8.6.3 Android/22 clientId/355325117317828 clientModel/SM-G930K imsi/460071114317824 clientChannelId/qq proVersion/1.0.6',
                "Referer": "https://m.cloud.189.cn/zhuanti/2016/sign/index.jsp?albumBackupOpened=1",
                "Host": "m.cloud.189.cn",
            };
            
            const resp = await session.get(signUrl, { headers });
            console.log(resp.data, "resp");
            
            if (resp.data.isSign === "false") {
                accountResult.sign = `✅ +${resp.data.netdiskBonus}M`;
            } else {
                accountResult.sign = `⏳ 已签到+${resp.data.netdiskBonus}M`;
            }
            
            // 单次抽奖（原第一次抽奖）
            await sleep(Math.floor(Math.random() * 3000) + 2000);
            const lotteryUrl = 'https://m.cloud.189.cn/v2/drawPrizeMarketDetails.action?taskId=TASK_SIGNIN&activityId=ACT_SIGNIN';
            const lotteryResp = await session.get(lotteryUrl, { headers });
            
            if (lotteryResp.data.errorCode) {
                accountResult.lottery = `❌ ${lotteryResp.data.errorCode}`;
            } else {
                const prize = lotteryResp.data.prizeName || lotteryResp.data.description;
                accountResult.lottery = `🎁 ${prize}`;
            }
            
        } catch (e) {
            accountResult.sign = "❌ 操作异常";
            accountResult.lottery = `⚠️ ${e.message}`;
        }
        
        allResults.push(accountResult);
        console.log(`  ${accountResult.sign} | ${accountResult.lottery}`);
    }
    
    // 生成汇总表格
    let table = "### ⛅ 天翼云盘签到汇总\n\n";
    table += "| 账号 | 签到结果 | 每日抽奖 |\n";
    table += "|:-:|:-:|:-:|\n";
    for (const res of allResults) {
        table += `| ${res.username} | ${res.sign} | ${res.lottery} |\n`;
    }
    
    // 发送汇总推送
    await sendWxpusher(table);
    console.log("\n✅ 所有账号处理完成！");
    return allResults;
}

// 直接执行
//main().catch(console.error);

export { main };

