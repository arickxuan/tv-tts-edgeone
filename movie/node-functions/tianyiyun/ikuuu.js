/**
 * new Env('ikuuu签到');
 * cron: 0 9 * * *
 */

import axios from 'axios';
import qs from 'querystring';

// ================= 配置区域 =================
// 在这里直接填写您的邮箱和密码(支持多账户）
const ACCOUNTS = [
    {
        email: process.env.IKUUUMAIL,// "example@gmail.com",
        pwd: process.env.IKUUUPWD,
    },
]

// 域名配置
const BASE_URL = "https://ikuuu.org";
// ===========================================

const LOGIN_URL = `${BASE_URL}/auth/login`;
const CHECKIN_URL = `${BASE_URL}/user/checkin`;
const USER_URL = `${BASE_URL}/user`;

function getHeaders() {
    return {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'Referer': BASE_URL,
        'Origin': BASE_URL,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    };
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function runCheckin() {
    let logContent = "";
    console.log(`检测到 ${ACCOUNTS.length} 个账号，开始执行任务...\n`);

    for (let i = 0; i < ACCOUNTS.length; i++) {
        const account = ACCOUNTS[i];
        const email = account.email;
        const password = account.pwd;

        console.log(`=== 开始处理第 ${i + 1} 个账号: ${email} ===`);

        // 创建axios实例，保持cookie
        const instance = axios.create({
            timeout: 10000,
            headers: getHeaders(),
            withCredentials: true
        });

        try {
            // 1. 登录
            const loginData = qs.stringify({
                email: email,
                passwd: password,
                code: ''
            });

            const loginResp = await instance.post(LOGIN_URL, loginData);

            if (loginResp.data.ret !== 1) {
                console.log(`登录失败: ${loginResp.data.msg || '未知错误'}`);
                continue;
            }

            console.log("登录成功，准备签到...");

            // 2. 执行签到
            const checkinResp = await instance.post(CHECKIN_URL);
            const checkinMsg = checkinResp.data.msg || "无返回消息";
            console.log(`签到结果: ${checkinMsg}`);

            // 3. 获取流量信息
            const userPageResp = await instance.get(USER_URL);
            const rawHtml = userPageResp.data;

            // === 解码处理开始 ===
            let finalHtml = rawHtml;
            const originBodyMatch = rawHtml.match(/var originBody = "(.*?)";/);

            if (originBodyMatch && originBodyMatch[1]) {
                try {
                    // 提取Base64字符串
                    const b64Str = originBodyMatch[1];
                    // 解码Base64
                    const decodedStr = Buffer.from(b64Str, 'base64').toString('utf-8');
                    // 注意：原Python代码中还有decodeURIComponent的处理
                    // 但在Node.js中，Buffer.toString('utf-8')已经完成解码
                    finalHtml = decodedStr;
                } catch (e) {
                    console.log(`页面解密失败: ${e.message}`);
                    // 解密失败则使用原HTML
                }
            }
            // === 解码处理结束 ===

            // 4. 正则匹配流量
            let trafficInfo = "";
            const trafficMatch = finalHtml.match(/剩余流量[\s\S]*?<span class="counter">(.*?)<\/span>/);

            if (trafficMatch && trafficMatch[1]) {
                trafficInfo = trafficMatch[1] + " GB";
            } else {
                // 备用匹配：尝试直接匹配所有counter
                const backupMatches = finalHtml.match(/<span class="counter">(.*?)<\/span>/g);
                if (backupMatches && backupMatches.length > 0) {
                    // 提取第一个counter的内容
                    const firstMatch = backupMatches[0].match(/<span class="counter">(.*?)<\/span>/);
                    if (firstMatch && firstMatch[1]) {
                        trafficInfo = firstMatch[1] + " GB (可能不准)";
                    }
                } else {
                    trafficInfo = "提取失败 (HTML结构变化)";
                }
            }

            console.log(`当前流量: ${trafficInfo}`);
            logContent += `账号: ${email}\n状态: ${checkinMsg}\n剩余流量: ${trafficInfo}\n${"-".repeat(20)}\n`;

        } catch (error) {
            console.log(`账号 ${email} 发生异常:`, error.message);
            if (error.response) {
                console.log(`响应状态: ${error.response.status}`);
            }
        }

        // 等待2秒再处理下一个账号
        await sleep(2000);
        console.log("\n");
    }

    return logContent;
}

// 主函数
async function main() {
    try {
        const result = await runCheckin();
        console.log("任务执行完成");
    } catch (error) {
        console.error("全局错误:", error);
    }
}