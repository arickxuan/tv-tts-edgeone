/**
 * 微信签名验证工具
 */

import crypto from 'crypto';

/**
 * 验证微信服务器签名（明文模式）
 * @param {string} signature - 微信加密签名
 * @param {string} timestamp - 时间戳
 * @param {string} nonce - 随机数
 * @param {string} token - 微信配置的 token
 * @returns {boolean} 验证结果
 */
export function checkSignature(signature, timestamp, nonce, token) {
    const tmpArr = [token, timestamp, nonce].sort();
    const tmpStr = tmpArr.join('');
    const hash = crypto.createHash('sha1').update(tmpStr).digest('hex');
    return hash === signature;
}

/**
 * 验证加密消息签名
 * @param {string} msgSignature - 消息签名
 * @param {string} timestamp - 时间戳
 * @param {string} nonce - 随机数
 * @param {string} encryptMsg - 加密的消息体
 * @param {string} token - 微信配置的 token
 * @returns {boolean} 验证结果
 */
export function checkMsgSignature(msgSignature, timestamp, nonce, encryptMsg, token) {
    const tmpArr = [token, timestamp, nonce, encryptMsg].sort();
    const tmpStr = tmpArr.join('');
    const hash = crypto.createHash('sha1').update(tmpStr).digest('hex');
    return hash === msgSignature;
}

/**
 * 生成加密消息的签名
 * @param {string} encryptMsg - 加密的消息
 * @param {string} timestamp - 时间戳
 * @param {string} nonce - 随机数
 * @param {string} token - 微信配置的 token
 * @returns {string} 签名
 */
export function generateMsgSignature(encryptMsg, timestamp, nonce, token) {
    const tmpArr = [token, timestamp, nonce, encryptMsg].sort();
    const tmpStr = tmpArr.join('');
    return crypto.createHash('sha1').update(tmpStr).digest('hex');
}

export default {
    checkSignature,
    checkMsgSignature,
    generateMsgSignature
};
