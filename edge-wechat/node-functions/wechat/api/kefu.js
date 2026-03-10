/**
 * 微信客服管理 API
 */

import axios from 'axios';
import { getAccessToken } from './token.js';

/**
 * 获取客服列表
 * @param {string} bundleId - 账号标识
 * @returns {Promise<object>} 客服列表
 */
export async function getKefuList(bundleId) {
    try {
        const accessToken = await getAccessToken(bundleId);
        const url = `https://api.weixin.qq.com/cgi-bin/customservice/getkflist?access_token=${accessToken}`;
        const response = await axios.get(url);
        
        if (response.data.kf_list) {
            return response.data;
        } else {
            throw new Error(`获取客服列表失败: ${response.data.errmsg || '未知错误'}`);
        }
    } catch (error) {
        console.error(`获取客服列表错误 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}

/**
 * 获取在线客服列表
 * @param {string} bundleId - 账号标识
 * @returns {Promise<object>} 在线客服列表
 */
export async function getKefuOnline(bundleId) {
    try {
        const accessToken = await getAccessToken(bundleId);
        const url = `https://api.weixin.qq.com/cgi-bin/customservice/getonlinekflist?access_token=${accessToken}`;
        const response = await axios.get(url);
        
        if (response.data.kf_online_list) {
            return response.data;
        } else {
            throw new Error(`获取客服在线列表失败: ${response.data.errmsg || '未知错误'}`);
        }
    } catch (error) {
        console.error(`获取客服在线列表错误 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}

/**
 * 添加客服账号
 * @param {string} bundleId - 账号标识
 * @param {string} kfAccount - 客服账号
 * @param {string} kfNick - 客服昵称
 * @returns {Promise<object>} 添加结果
 */
export async function addKefuAccount(bundleId, kfAccount, kfNick) {
    try {
        const accessToken = await getAccessToken(bundleId);
        const url = `https://api.weixin.qq.com/customservice/kfaccount/add?access_token=${accessToken}`;
        
        const payload = {
            kf_account: kfAccount,
            kf_nick: kfNick
        };
        
        console.log(`添加客服账号请求 [${bundleId || 'default'}]:`, payload);
        
        const response = await axios.post(url, payload);
        
        if (response.data.errcode === 0) {
            return response.data;
        } else {
            console.error('添加客服账号失败:', response.data);
            throw new Error(`添加客服账号失败: ${response.data.errmsg || '未知错误'}`);
        }
    } catch (error) {
        console.error(`添加客服账号错误 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}

//https://api.weixin.qq.com/customservice/kfaccount/inviteworker?access_token=ACCESS_TOKEN
export async function inviteWx(bundleId,kfAccount,wx) {
    try {
        const accessToken = await getAccessToken(bundleId);
        const url = `https://api.weixin.qq.com/customservice/kfaccount/inviteworker?access_token=${accessToken}`;

        const payload = {
            kf_account: kfAccount,
            invite_wx: wx
        };

        const response = await axios.post(url, payload);

        if (response.data.errcode === 0) {
            return response.data;
        } else {
            console.error('邀请客服账号失败:', response.data);
            throw new Error(`邀请客服账号失败: ${response.data.errmsg || '未知错误'}`);
        }
    } catch (error) {
        console.error(`邀请客服账号错误 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}


//GET https://api.weixin.qq.com/customservice/kfsession/getsessionlist?access_token=ACCESS_TOKEN&kf_account=test1@test
export async function getKfSessionList(bundleId,kfAccount) {
    try {
        const accessToken = await getAccessToken(bundleId);
        const url = `https://api.weixin.qq.com/customservice/kfsession/getsessionlist?access_token=${accessToken}&kf_account=${kfAccount}`;
        const response = await axios.get(url);
        return response.data;
    }
    catch (error) {
        console.error(`获取客服会话列表错误 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}

//GET https://api.weixin.qq.com/customservice/kfsession/getwaitcase?access_token=ACCESS_TOKEN
export async function getWaitCase(bundleId) {
    try {
        const accessToken = await getAccessToken(bundleId);
        const url = `https://api.weixin.qq.com/customservice/kfsession/getwaitcase?access_token=${accessToken}`;
        const response = await axios.get(url);
        return response.data;
    }
    catch (error) {
        console.error(`获取等待客服会话错误 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}


//https://api.weixin.qq.com/customservice/kfsession/create?access_token=ACCESS_TOKEN
export async function createKfSession(bundleId,openId,kfAccount) {
    try {
        const accessToken = await getAccessToken(bundleId);
        const url = `https://api.weixin.qq.com/customservice/kfsession/create?access_token=${accessToken}`;
        const payload = {
            openid: openId,
            kf_account: kfAccount
        };
        const response = await axios.post(url, payload);
        if (response.data.errcode !== 0) {
            throw new Error(`创建客服会话失败: ${response.data.errmsg || '未知错误'}`);
        }

        console.log(`创建客服会话响应 [${bundleId || 'default'}]:`, response.data);
        return response.data;
    }
    catch (error) {
        console.error(`创建客服会话错误 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}


export async function replyTextMessage(bundleId,openId,content, kfAccount = null) {
    try {
        const accessToken = await getAccessToken(bundleId);
        const url = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${accessToken}`;
        
        const payload = {
            touser: openId,
            msgtype: "text",
            text: {
                content: content
            },
        };
        if(kfAccount) {
            payload.customservice = {
                kf_account: kfAccount
            };
        }
        
        const response = await axios.post(url, payload);
        
        if (response.data.errcode === 0) {
            return response.data;
        } else {
            console.error('发送文本消息失败:', response.data);
            throw new Error(`发送文本消息失败: ${response.data.errmsg || '未知错误'}`);
        }
    } catch (error) {
        console.error(`发送文本消息错误 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}

export default {
    getKefuList,
    getKefuOnline,
    addKefuAccount
};
