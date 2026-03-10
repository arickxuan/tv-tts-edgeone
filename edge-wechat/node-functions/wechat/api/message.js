/**
 * 微信消息发送 API
 */

import axios from 'axios';
import { getAccessToken } from './token.js';

/**
 * 发送模板消息
 * @param {string} bundleId - 账号标识
 * @param {string} openId - 用户的 openId
 * @param {string} templateId - 模板消息 ID
 * @param {object} data - 模板数据
 * @param {string} url - 点击模板消息后跳转的链接（可选）
 * @returns {Promise<object>} 发送结果
 */
export async function sendTemplateMessage(bundleId, openId, templateId, data, url = '') {
    try {
        const accessToken = await getAccessToken(bundleId);
        const apiUrl = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${accessToken}`;
        
        const payload = {
            touser: openId,
            template_id: templateId,
            url: url,
            "data": {
                user:{value: data, color: '#173177'},
                thing1:{value: data, color: '#173177'},
                thing2: { value: data, color: '#173177' },

                "first": { "value": "data", "color": "#173177" },
                "content": {
                    "value": data, // 这里传递你的内容变量
                    "color": "#173177"
                },
                "last": {
                    "value": data+"感谢您的使用",
                    "color": "#173177"
                }
            }
        };

        console.log(payload)

        const response = await axios.post(apiUrl, payload);
        
        if (response.data.errcode === 0) {
            return { success: true, msgid: response.data.msgid };
        } else {
            console.error(`发送模板消息失败: ${JSON.stringify(response.data)}`);
            throw new Error(`发送模板消息失败: ${response.data.errmsg}`);
        }
    } catch (error) {
        console.error(`发送模板消息错误 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}

export async function sendSubscribeMessage(bundleId, openId, templateId, data, url = '') {
    try {
        const accessToken = await getAccessToken(bundleId);
        const apiUrl = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`;

        const payload = {
            touser: openId,
            template_id: templateId,
            url: url,
            "data": {
                user: { value: data, color: '#173177' },
                thing1: { value: data, color: '#173177' },
                thing2: { value: data, color: '#173177' },

                "first": { "value": "data", "color": "#173177" },
                "content": {
                    "value": data, // 这里传递你的内容变量
                    "color": "#173177"
                },
                "last": {
                    "value": data + "感谢您的使用",
                    "color": "#173177"
                }
            }
        };

        console.log(payload)

        const response = await axios.post(apiUrl, payload);

        if (response.data.errcode === 0) {
            return { success: true, msgid: response.data.msgid };
        } else {
            console.error(`发送订阅消息失败: ${JSON.stringify(response.data)}`);
            throw new Error(`发送订阅消息失败: ${response.data.errmsg}`);
        }
    } catch (error) {
        console.error(`发送订阅消息失败 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}

/**
 * 发送客服文本消息
 * @param {string} bundleId - 账号标识
 * @param {string} openId - 用户的 openId
 * @param {string} content - 文本内容
 * @param {string} kfAccount - 客服账号（可选）
 * @returns {Promise<object>} 发送结果
 */
export async function sendTextMessage(bundleId, openId, content, kfAccount = null) {
    try {
        const accessToken = await getAccessToken(bundleId);
        const apiUrl = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${accessToken}`;
        
        const payload = {
            touser: openId,
            msgtype: "text",
            text: {
                content: content
            }
        };
        
        // 如果指定了客服账号
        if (kfAccount) {
            payload.customservice = {
                kf_account: kfAccount
            };
        }

        const response = await axios.post(apiUrl, payload);
        
        if (response.data.errcode === 0) {
            return { success: true };
        } else {
            throw new Error(`发送文本消息失败: ${response.data.errmsg}`);
        }
    } catch (error) {
        console.error(`发送文本消息错误 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}

export default {
    sendTemplateMessage,
    sendTextMessage
};
