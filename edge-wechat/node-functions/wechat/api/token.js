/**
 * 微信 access_token 管理
 */

import axios from 'axios';
import { getAccountConfig, getTokenCache, setTokenCache } from '../config/index.js';

/**
 * 获取微信 access_token
 * @param {string} bundleId - 账号标识
 * @returns {Promise<string>} access_token
 */
export async function getAccessToken(bundleId) {
    const config = getAccountConfig(bundleId);
    const cache = getTokenCache(bundleId);
    
    // 如果缓存中有未过期的 token，直接返回
    if (cache.token && Date.now() < cache.expireTime) {
        return cache.token;
    }

    try {
        const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appId}&secret=${config.appSecret}`;
        const response = await axios.get(url);
        
        if (response.data.access_token) {
            const token = response.data.access_token;
            const expireTime = Date.now() + config.tokenExpireTime - 300000; // 提前5分钟过期
            
            setTokenCache(bundleId, token, expireTime);
            
            return token;
        } else {
            throw new Error(`获取 access_token 失败: ${response.data.errmsg || '未知错误'}`);
        }
    } catch (error) {
        console.error(`获取 access_token 错误 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}

export default {
    getAccessToken
};
