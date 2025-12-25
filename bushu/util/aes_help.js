const crypto = require('crypto');

// 华米传输加密使用的密钥 固定iv
// 参考自 https://github.com/hanximeng/Zepp_API/blob/main/index.php
const HM_AES_KEY = Buffer.from('xeNtBVqzDc6tuNTh', 'utf-8'); // 16 bytes
const HM_AES_IV = Buffer.from('MAAAYAAAAAAAAABg', 'utf-8'); // 16 bytes

const AES_BLOCK_SIZE = 16;

/**
 * PKCS7 填充
 */
function pkcs7Pad(data) {
    const padLen = AES_BLOCK_SIZE - (data.length % AES_BLOCK_SIZE);
    const padding = Buffer.alloc(padLen, padLen);
    return Buffer.concat([data, padding]);
}

/**
 * PKCS7 去填充
 */
function pkcs7Unpad(data) {
    if (!data || data.length % AES_BLOCK_SIZE !== 0) {
        throw new Error(`invalid padded data length ${data.length}`);
    }
    const padLen = data[data.length - 1];
    if (padLen < 1 || padLen > AES_BLOCK_SIZE) {
        throw new Error(`invalid padding length: ${padLen}`);
    }
    // 验证填充
    for (let i = data.length - padLen; i < data.length; i++) {
        if (data[i] !== padLen) {
            throw new Error('invalid PKCS#7 padding');
        }
    }
    return data.slice(0, data.length - padLen);
}

/**
 * 验证密钥
 */
function validateKey(key) {
    if (!Buffer.isBuffer(key)) {
        throw new TypeError('key must be Buffer');
    }
    if (key.length !== 16) {
        throw new ValueError('key must be 16 bytes for AES-128');
    }
}

/**
 * 加密数据
 * @param {Buffer} plain - 明文字节
 * @param {Buffer} key - 16 字节 AES-128 密钥
 * @param {Buffer|null} iv - IV向量，如果为null则生成随机IV
 * @returns {Buffer} - IV（16B） + ciphertext（bytes） 或者仅ciphertext（当使用固定IV时）
 */
function encryptData(plain, key, iv = null) {
    validateKey(key);
    if (!Buffer.isBuffer(plain)) {
        throw new TypeError('plain must be Buffer');
    }

    if (iv === null) {
        // 使用随机IV
        iv = crypto.randomBytes(AES_BLOCK_SIZE);
        const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        cipher.setAutoPadding(false);
        const padded = pkcs7Pad(plain);
        const ciphertext = Buffer.concat([cipher.update(padded), cipher.final()]);
        return Buffer.concat([iv, ciphertext]);
    } else {
        // 使用固定IV
        if (iv.length !== AES_BLOCK_SIZE) {
            throw new Error(`IV must be ${AES_BLOCK_SIZE} bytes`);
        }
        const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        cipher.setAutoPadding(false);
        const padded = pkcs7Pad(plain);
        const ciphertext = Buffer.concat([cipher.update(padded), cipher.final()]);
        return ciphertext;
    }
}

/**
 * 解密数据
 * @param {Buffer} data - IV（16B） + ciphertext 或者仅ciphertext（当使用固定IV时）
 * @param {Buffer} key - 16 字节 AES-128 密钥
 * @param {Buffer|null} iv - IV向量，如果为null则从数据中提取
 * @returns {Buffer} - 明文字节
 */
function decryptData(data, key, iv = null) {
    validateKey(key);
    if (!Buffer.isBuffer(data)) {
        throw new TypeError('data must be Buffer');
    }

    let ciphertext;
    if (iv === null) {
        // 从数据中提取IV（假设前16字节是IV）
        if (data.length < AES_BLOCK_SIZE) {
            throw new Error('data too short');
        }
        iv = data.slice(0, AES_BLOCK_SIZE);
        ciphertext = data.slice(AES_BLOCK_SIZE);

        if (ciphertext.length === 0 || ciphertext.length % AES_BLOCK_SIZE !== 0) {
            throw new Error('invalid ciphertext length');
        }
    } else {
        // 使用提供的固定IV
        if (iv.length !== AES_BLOCK_SIZE) {
            throw new Error(`IV must be ${AES_BLOCK_SIZE} bytes`);
        }
        ciphertext = data;
        if (ciphertext.length === 0 || ciphertext.length % AES_BLOCK_SIZE !== 0) {
            throw new Error('invalid ciphertext length');
        }
    }

    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    decipher.setAutoPadding(false);
    const decryptedPadded = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return pkcs7Unpad(decryptedPadded);
}

/**
 * 将字节数据转换为Base64编码字符串
 */
function bytesToBase64(data) {
    return data.toString('base64');
}

/**
 * 将Base64编码字符串转换为字节数据
 */
function base64ToBytes(data) {
    return Buffer.from(data, 'base64');
}

module.exports = {
    encryptData,
    decryptData,
    bytesToBase64,
    base64ToBytes,
    HM_AES_KEY,
    HM_AES_IV
};
