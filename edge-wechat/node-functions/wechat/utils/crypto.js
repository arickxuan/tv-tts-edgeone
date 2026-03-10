/**
 * 微信消息加密解密工具
 */

import crypto from 'crypto';

/**
 * 解密微信消息
 * @param {string} encryptedMsg - base64 编码的加密消息
 * @param {string} encodingAESKey - 加密密钥（43位字符）
 * @param {string} appId - 公众号 AppId
 * @returns {string} 解密后的 XML 消息
 */
export function decryptMessage(encryptedMsg, encodingAESKey, appId) {
    try {
        // EncodingAESKey 是 43 位字符，补充 '=' 后做 base64 解码得到 32 字节的 AES key
        const aesKey = Buffer.from(encodingAESKey + '=', 'base64');
        
        // 解码加密消息
        const encryptedBuffer = Buffer.from(encryptedMsg, 'base64');
        
        // 使用 AES-256-CBC 解密
        const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, aesKey.slice(0, 16));
        decipher.setAutoPadding(false);
        
        let decrypted = Buffer.concat([
            decipher.update(encryptedBuffer),
            decipher.final()
        ]);
        
        // 移除 padding
        const pad = decrypted[decrypted.length - 1];
        decrypted = decrypted.slice(0, decrypted.length - pad);
        
        // 消息格式：16字节随机字符串 + 4字节消息长度 + 消息内容 + AppId
        const content = decrypted.slice(16);
        const msgLen = content.readUInt32BE(0);
        const message = content.slice(4, msgLen + 4).toString('utf8');
        const receivedAppId = content.slice(msgLen + 4).toString('utf8');
        
        // 验证 AppId
        if (receivedAppId !== appId) {
            throw new Error(`AppId 验证失败: 期望 ${appId}, 收到 ${receivedAppId}`);
        }
        
        return message;
    } catch (error) {
        console.error('消息解密失败:', error);
        throw error;
    }
}

/**
 * 加密微信消息
 * @param {string} message - 要加密的消息（XML 字符串）
 * @param {string} encodingAESKey - 加密密钥（43位字符）
 * @param {string} appId - 公众号 AppId
 * @returns {string} base64 编码的加密消息
 */
export function encryptMessage(message, encodingAESKey, appId) {
    try {
        // EncodingAESKey 是 43 位字符，补充 '=' 后做 base64 解码得到 32 字节的 AES key
        const aesKey = Buffer.from(encodingAESKey + '=', 'base64');
        
        // 生成 16 字节随机字符串
        const random16 = crypto.randomBytes(16);
        
        // 消息长度（4字节，网络字节序）
        const msgBuffer = Buffer.from(message, 'utf8');
        const msgLenBuffer = Buffer.alloc(4);
        msgLenBuffer.writeUInt32BE(msgBuffer.length, 0);
        
        // AppId
        const appIdBuffer = Buffer.from(appId, 'utf8');
        
        // 拼接：随机字符串 + 消息长度 + 消息内容 + AppId
        const contentBuffer = Buffer.concat([
            random16,
            msgLenBuffer,
            msgBuffer,
            appIdBuffer
        ]);
        
        // PKCS#7 padding
        const blockSize = 32;
        const padLength = blockSize - (contentBuffer.length % blockSize);
        const padded = Buffer.concat([
            contentBuffer,
            Buffer.alloc(padLength, padLength)
        ]);
        
        // 使用 AES-256-CBC 加密
        const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, aesKey.slice(0, 16));
        cipher.setAutoPadding(false);
        
        const encrypted = Buffer.concat([
            cipher.update(padded),
            cipher.final()
        ]);
        
        // 返回 base64 编码
        return encrypted.toString('base64');
    } catch (error) {
        console.error('消息加密失败:', error);
        throw error;
    }
}

export default {
    decryptMessage,
    encryptMessage
};
