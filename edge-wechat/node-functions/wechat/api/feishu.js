import axios from 'axios';

export async function sendLarkWebhookMessage(msg) {
    const webhookUrl = process.env.FEISHU_WEBHOOK_URL;

    const message = {
        msg_type: "text",
        content: {
            text: msg //+" \n"+ new Date().toLocaleString()
        }
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message)
        });

        const result = await response.json();
        console.log('发送成功:', result);
        return result;
    } catch (error) {
        console.error('发送失败:', error);
        throw error;
    }
}

export async function sendWeWorkTextMessage(msg) {
    const webhookUrl = process.env.WEWORK_WEBHOOK_URL;

    const message = {
        msgtype: "text",
        text: {
            content: msg,
            mentioned_list: ["@all"], // 提醒所有人
            // mentioned_mobile_list: ["13800001111", "@all"] // 提醒指定手机号
        }
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message)
        });

        const result = await response.json();
        console.log('发送成功:', result);
        return result;
    } catch (error) {
        console.error('发送失败:', error);
        throw error;
    }
}

export async function sendDingTalkTextMessage(msg) {
    const webhookUrl = process.env.DINGDING_WEBHOOK_URL;

    const message = {
        msgtype: "text",
        text: {
            content: msg
        },
        at: {
            //atMobiles: [],
            isAtAll: true
        }
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message)
        });

        const result = await response.json();
        console.log('发送成功:', result);
        return result;
    } catch (error) {
        console.error('发送失败:', error);
        throw error;
    }
}

export async function getLarkAccessToken(appId, appSecret) {
    const url = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            app_id: appId,
            app_secret: appSecret
        })
    });

    const data = await response.json();
    return data.tenant_access_token;
}

export async function getWeWorkAccessToken(corpId, corpSecret) {
    const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpId}&corpsecret=${corpSecret}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.errcode === 0) {
            return data.access_token;
        } else {
            throw new Error(`获取token失败: ${data.errmsg}`);
        }
    } catch (error) {
        console.error('获取Access Token失败:', error);
        throw error;
    }
}

export async function sendLarkMessageToUser(accessToken, openId,msg) {

    // 2. 发送消息
    const url = 'https://open.feishu.cn/open-apis/im/v1/messages';

    const message = {
        receive_id: openId,
        msg_type: "text",
        content: JSON.stringify({
            text: msg
        })
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(message)
    });

    return await response.json();
}

export async function sendWeWorkAppMessage(accessToken, agentId, UserID, options={}) {
    // const agentId = 'YOUR_AGENT_ID'; // 应用ID


    // 2. 发送消息
    const url = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${accessToken}`;

    const message = {
        touser: UserID,//"UserID1|UserID2|UserID3", // 指定接收用户，用 | 分隔
        // toparty: "PartyID1|PartyID2",      // 指定接收部门
        // totag: "TagID1 | TagID2",          // 指定接收标签
        msgtype: "text",
        agentid: agentId,
        text: {
            content: content,
            mentioned_list: options.mentioned_list || [],
            mentioned_mobile_list: options.mentioned_mobile_list || []
        },
        enable_id_trans: 0, // 是否开启id转译
        enable_duplicate_check: 0, // 是否开启重复消息检查
        duplicate_check_interval: 1800 // 重复消息检查时间间隔
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message)
        });

        const result = await response.json();
        console.log('应用消息发送成功:', result);
        return result;
    } catch (error) {
        console.error('发送失败:', error);
        throw error;
    }
}