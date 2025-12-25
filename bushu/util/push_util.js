const axios = require('axios');

/**
 * 获取北京时间
 */
function getBeijingTime() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const beijingTime = new Date(utc + (3600000 * 8));
    return beijingTime;
}

/**
 * 格式化当前时间
 */
function formatNow() {
    const time = getBeijingTime();
    const year = time.getFullYear();
    const month = String(time.getMonth() + 1).padStart(2, '0');
    const day = String(time.getDate()).padStart(2, '0');
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const seconds = String(time.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 推送配置类
 */
class PushConfig {
    constructor({
        pushPlusToken = null,
        pushPlusHour = null,
        pushPlusMax = 30,
        pushWechatWebhookKey = null,
        telegramBotToken = null,
        telegramChatId = null
    } = {}) {
        this.pushPlusToken = pushPlusToken;
        this.pushPlusHour = pushPlusHour;
        this.pushPlusMax = pushPlusMax ? parseInt(pushPlusMax) : 30;
        this.pushWechatWebhookKey = pushWechatWebhookKey;
        this.telegramBotToken = telegramBotToken;
        this.telegramChatId = telegramChatId;
    }
}

/**
 * 推送消息到 PushPlus (推送类型为html)
 */
async function pushPlus(token, title, content) {
    const requestUrl = 'http://www.pushplus.plus/send';
    const data = {
        token: token,
        title: title,
        content: content,
        template: 'html',
        channel: 'wechat'
    };

    try {
        const response = await axios.post(requestUrl, data);
        if (response.status === 200) {
            const jsonRes = response.data;
            console.log(`pushplus推送完毕：${jsonRes.code}-${jsonRes.msg}`);
        } else {
            console.log('pushplus推送失败');
        }
    } catch (error) {
        if (error.response) {
            console.log(`pushplus推送网络异常: ${error.message}`);
        } else {
            console.log(`pushplus推送未知异常: ${error.message}`);
        }
    }
}

/**
 * 推送企业微信通知
 */
async function pushWechatWebhook(key, title, content) {
    const requestUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${key}`;

    const payload = {
        msgtype: 'markdown_v2',
        markdown_v2: {
            content: buildWeChatContent(title, content)
        }
    };

    try {
        const response = await axios.post(requestUrl, payload);
        if (response.status === 200) {
            const jsonRes = response.data;
            if (jsonRes.errcode === 0) {
                console.log(`企业微信推送完毕：${jsonRes.errmsg}`);
            } else {
                console.log(`企业微信推送失败：${jsonRes.errmsg || '未知错误'}`);
            }
        } else {
            console.log('企业微信推送失败');
        }
    } catch (error) {
        console.log(`企业微信推送异常: ${error.message}`);
    }
}

/**
 * 构建企业微信内容
 */
function buildWeChatContent(title, content) {
    return `# ${title}\n${content}`;
}

/**
 * 推送 Telegram Bot 消息
 */
async function pushTelegramBot(botToken, chatId, content) {
    const requestUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const payload = {
        chat_id: parseInt(chatId),
        text: content,
        parse_mode: 'HTML'
    };

    console.log(`post to url: ${requestUrl}`);
    console.log(`payload: ${JSON.stringify(payload)}`);

    try {
        const response = await axios.post(requestUrl, payload);
        if (response.status === 200) {
            const jsonRes = response.data;
            if (jsonRes.ok === true) {
                console.log(`telegram bot推送完毕：${jsonRes.result.message_id}`);
            } else {
                console.log(`telegram bot推送失败: ${JSON.stringify(jsonRes)}`);
            }
        } else {
            console.log(`telegram bot推送失败: ${response.status}`);
        }
    } catch (error) {
        console.log(`telegram bot推送异常: ${error.message}`);
    }
}

/**
 * 检查是否在推送时间范围内
 */
function notInPushTimeRange(config) {
    if (!config.pushPlusHour) {
        return false; // 如果没有设置推送时间，则总是推送
    }

    const timeBj = getBeijingTime();

    // 首先根据时间判断，如果匹配 直接返回
    if (/^\d+$/.test(config.pushPlusHour)) {
        if (timeBj.getHours() === parseInt(config.pushPlusHour)) {
            console.log(`当前设置推送整点为：${config.pushPlusHour}, 当前整点为：${timeBj.getHours()}，执行推送`);
            return false;
        }
    }

    // 如果时间不匹配，检查cron_change_time文件中的记录
    try {
        const fs = require('fs');
        if (fs.existsSync('cron_change_time')) {
            const content = fs.readFileSync('cron_change_time', 'utf-8');
            const lines = content.split('\n');
            if (lines.length > 0) {
                const lastLine = lines[lines.length - 1].trim();
                // 提取北京时间的小时数
                const match = lastLine.match(/北京时间\(0?(\d+):\d+\)/);
                if (match) {
                    const cronHour = parseInt(match[1]);
                    if (parseInt(config.pushPlusHour) === cronHour) {
                        console.log(`当前设置推送整点为：${config.pushPlusHour}, 根据执行记录，本次执行整点为：${cronHour}，执行推送`);
                        return false;
                    }
                }
            }
        }
    } catch (error) {
        console.log(`读取cron_change_time文件出错: ${error.message}`);
    }

    console.log(`当前整点时间为：${timeBj}，不在配置的推送时间，不执行推送`);
    return true;
}

/**
 * 推送到PushPlus
 */
function pushToPushPlus(execResults, summary, config) {
    // 判断是否需要pushplus推送
    if (config.pushPlusToken && config.pushPlusToken !== '' && config.pushPlusToken !== 'NO') {
        let html = `<div>${summary}</div>`;
        if (execResults.length >= config.pushPlusMax) {
            html += '<div>账号数量过多，详细情况请前往github actions中查看</div>';
        } else {
            html += '<ul>';
            for (const execResult of execResults) {
                const success = execResult.success;
                if (success !== null && success === true) {
                    html += `<li><span>账号：${execResult.user}</span>刷步数成功，接口返回：${execResult.msg}</li>`;
                } else {
                    html += `<li><span>账号：${execResult.user}</span>刷步数失败，失败原因：${execResult.msg}</li>`;
                }
            }
            html += '</ul>';
        }
        pushPlus(config.pushPlusToken, `${formatNow()} 刷步数通知`, html);
    } else {
        console.log('未配置 PUSH_PLUS_TOKEN 跳过PUSHPLUS推送');
    }
}

/**
 * 推送到企业微信
 */
function pushToWechatWebhook(execResults, summary, config) {
    // 判断是否需要微信推送
    if (config.pushWechatWebhookKey && config.pushWechatWebhookKey !== '' && config.pushWechatWebhookKey !== 'NO') {
        let content = `## ${summary}`;
        if (execResults.length >= config.pushPlusMax) {
            content += '\n- 账号数量过多，详细情况请前往github actions中查看';
        } else {
            for (const execResult of execResults) {
                const success = execResult.success;
                if (success !== null && success === true) {
                    content += `\n- 账号：${execResult.user}刷步数成功，接口返回：${execResult.msg}`;
                } else {
                    content += `\n- 账号：${execResult.user}刷步数失败，失败原因：${execResult.msg}`;
                }
            }
        }
        pushWechatWebhook(config.pushWechatWebhookKey, `${formatNow()} 刷步数通知`, content);
    } else {
        console.log('未配置 WECHAT_WEBHOOK_KEY 跳过微信推送');
    }
}

/**
 * 推送到Telegram
 */
function pushToTelegramBot(execResults, summary, config) {
    // 判断是否需要telegram推送
    if (config.telegramBotToken && config.telegramBotToken !== '' && config.telegramBotToken !== 'NO' &&
        config.telegramChatId && config.telegramChatId !== '') {
        let html = `<b>${summary}</b>`;
        if (execResults.length >= config.pushPlusMax) {
            html += '<blockquote>账号数量过多，详细情况请前往github actions中查看</blockquote>';
        } else {
            for (const execResult of execResults) {
                const success = execResult.success;
                if (success !== null && success === true) {
                    html += `<pre><blockquote>账号：${execResult.user}</blockquote>刷步数成功，接口返回：<b>${execResult.msg}</b></pre>`;
                } else {
                    html += `<pre><blockquote>账号：${execResult.user}</blockquote>刷步数失败，失败原因：<b>${execResult.msg}</b></pre>`;
                }
            }
        }
        pushTelegramBot(config.telegramBotToken, config.telegramChatId, html);
    } else {
        console.log('未配置 TELEGRAM_BOT_TOKEN 或 TELEGRAM_CHAT_ID 跳过telegram推送');
    }
}

/**
 * 推送所有结果
 */
function pushResults(execResults, summary, config) {
    if (notInPushTimeRange(config)) {
        return;
    }
    pushToPushPlus(execResults, summary, config);
    pushToWechatWebhook(execResults, summary, config);
    pushToTelegramBot(execResults, summary, config);
}

module.exports = {
    PushConfig,
    pushPlus,
    pushWechatWebhook,
    pushTelegramBot,
    formatNow,
    getBeijingTime,
    notInPushTimeRange,
    pushToPushPlus,
    pushToWechatWebhook,
    pushToTelegramBot,
    pushResults
};

