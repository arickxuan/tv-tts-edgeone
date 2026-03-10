/**
 * 微信公众号配置管理
 * 支持多账号配置，通过 bundleId 区分
 */

import { getRedisClient } from '../redis/index.js';

// 账号配置存储
const accountConfigs = new Map();

/**
 * 默认配置（从环境变量读取）
 */
const DEFAULT_CONFIG = {
    appId: process.env.WECHAT_APPID || '',
    appSecret: process.env.WECHAT_APPSECRET || '',
    token: process.env.WECHAT_TOKEN || '',
    encodingAESKey: process.env.WECHAT_ENCODING_AES_KEY || '',
    tokenExpireTime: 7200000, // 2小时，单位毫秒
    redirectUri: process.env.WECHAT_REDIRECT_URI || '',
    scope: process.env.WECHAT_SCOPE || 'snsapi_login',
    state: process.env.WECHAT_STATE || 'wechat_auth_state'
};

/**
 * access_token 缓存（按账号存储）
 */
const accessTokenCache = new Map();

/**
 * 添加账号配置
 * @param {string} bundleId - 账号标识
 * @param {object} config - 账号配置
 */
export function addAccount(bundleId, config) {
    accountConfigs.set(bundleId, {
        ...config,
        tokenExpireTime: config.tokenExpireTime || 7200000
    });

    // 初始化 token 缓存
    if (!accessTokenCache.has(bundleId)) {
        accessTokenCache.set(bundleId, {
            token: '',
            expireTime: 0
        });
    }

    console.log(`添加账号配置: ${bundleId}`);
}

export async function saveWechatConfig(config) {
    const { bundleId, ...configData } = config;

    try {
        const redisClient = await getRedisClient();

        // 使用 hset 保存配置（ioredis 支持对象形式）
        await redisClient.hset(`wechat:config:${bundleId}`, {
            appId: configData.appId || '',
            appSecret: configData.appSecret || '',
            token: configData.token || '',
            encodingAESKey: configData.encodingAESKey || ''
        });

        // 设置过期时间（可选）
        // await redisClient.expire(`wechat:config:${bundleId}`, 3600);
        console.log(`✅ 保存账号配置到 Redis: ${bundleId}`);
    } catch (error) {
        console.error(`❌ 保存账号配置到 Redis 失败: ${bundleId}`, error.message);
        console.log('将仅在内存中保存配置');
    }

    // 无论 Redis 是否成功，都在内存中添加账号
    return addAccount(bundleId, configData);
}

/**
 * 获取账号配置
 * @param {string} bundleId - 账号标识
 * @returns {object} 账号配置
 */
export function getAccountConfig(bundleId) {
    if (!bundleId) {
        // 如果没有指定 bundleId，使用默认配置
        return DEFAULT_CONFIG;
    }

    const config = accountConfigs.get(bundleId);
    if (!config) {
        throw new Error(`账号配置不存在: ${bundleId}`);
    }

    return config;
}

/**
 * 获取所有账号
 * @returns {Array} 账号列表
 */
export function getAllAccounts() {
    return Array.from(accountConfigs.keys());
}

/**
 * 删除账号配置
 * @param {string} bundleId - 账号标识
 */
export function removeAccount(bundleId) {
    accountConfigs.delete(bundleId);
    accessTokenCache.delete(bundleId);
    console.log(`删除账号配置: ${bundleId}`);
}

/**
 * 获取 access_token 缓存
 * @param {string} bundleId - 账号标识
 * @returns {object} token 缓存对象
 */
export function getTokenCache(bundleId) {
    if (!bundleId) {
        // 默认账号使用全局缓存
        if (!accessTokenCache.has('default')) {
            accessTokenCache.set('default', {
                token: '',
                expireTime: 0
            });
        }
        return accessTokenCache.get('default');
    }

    let cache = accessTokenCache.get(bundleId);
    if (!cache) {
        cache = { token: '', expireTime: 0 };
        accessTokenCache.set(bundleId, cache);
    }
    return cache;
}

/**
 * 设置 access_token 缓存
 * @param {string} bundleId - 账号标识
 * @param {string} token - access_token
 * @param {number} expireTime - 过期时间
 */
export function setTokenCache(bundleId, token, expireTime) {
    const key = bundleId || 'default';
    accessTokenCache.set(key, { token, expireTime });
}

/**
 * 初始化默认账号（从环境变量）
 */
export async function initDefaultAccount() {
    // 先加载环境变量配置的默认账号
    if (DEFAULT_CONFIG.appId && DEFAULT_CONFIG.appSecret && DEFAULT_CONFIG.token) {
        addAccount('default', DEFAULT_CONFIG);
        console.log('已加载默认账号配置（从环境变量）');
    }

    // 尝试从 Redis 加载其他账号配置
    try {
        const redisClient = await getRedisClient();
        
        // 获取所有 wechat:config:* 的 keys
        const keys = await redisClient.keys('wechat:config:*');
        
        console.log(`从 Redis 加载 ${keys.length} 个账号配置`);

        for (const key of keys) {
            const config = await redisClient.hgetall(key);
            const bundleId = key.replace('wechat:config:', '');
            
            // 跳过默认账号（已经从环境变量加载）
            if (bundleId === 'default') {
                continue;
            }
            
            addAccount(bundleId, config);
            console.log(`从 Redis 加载账号: ${bundleId}`);
        }
    } catch (error) {
        console.error('从 Redis 加载账号配置失败:', error.message);
        console.log('将仅使用环境变量配置的账号');
    }
}

// 自动初始化默认账号（异步）
// 注意：这是一个异步操作，但为了不阻塞模块加载，我们不等待它
// 实际的初始化会在后台完成
initDefaultAccount().catch(err => {
    console.error('初始化默认账号失败:', err);
    // 如果 Redis 失败，至少确保环境变量配置的默认账号可用
    if (DEFAULT_CONFIG.appId && DEFAULT_CONFIG.appSecret && DEFAULT_CONFIG.token) {
        addAccount('default', DEFAULT_CONFIG);
        console.log('已加载默认账号配置（从环境变量，Redis 连接失败）');
    }
});

export default {
    addAccount,
    getAccountConfig,
    saveWechatConfig,
    getAllAccounts,
    removeAccount,
    getTokenCache,
    setTokenCache,
    initDefaultAccount
};
