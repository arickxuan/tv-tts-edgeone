/**
 * 接收微信消息路由
 * 支持多账号（通过 bundleId 区分）
 */

import express from 'express';
import { getAccountConfig } from '../config/index.js';
import { checkSignature, checkMsgSignature, generateMsgSignature } from '../utils/signature.js';
import { decryptMessage, encryptMessage } from '../utils/crypto.js';
import { parseXML, buildXML, parseMessage } from '../utils/xml.js';
import { handleMessage } from '../handlers/index.js';

const router = express.Router();

/**
 * 接收微信消息接口
 * GET  - 用于微信服务器验证
 * POST - 用于接收消息推送
 * 
 * 路由格式：/:bundleId/recive 或 /recive（使用默认账号）
 */
router.all('/:bundleId/recive', handleReceive);
router.all('/recive', (req, res) => {
    req.params.bundleId = 'default';
    handleReceive(req, res);
});

async function handleReceive(req, res) {
    const bundleId = req.params.bundleId;
    
    try {
        // 获取账号配置
        const config = getAccountConfig(bundleId);
        
        // GET 请求：验证服务器地址
        if (req.method === 'GET') {
            const { signature, timestamp, nonce, echostr } = req.query;
            
            // 验证参数
            if (!signature || !timestamp || !nonce || !echostr) {
                return res.status(400).send('参数错误');
            }
            
            // 验证签名
            if (checkSignature(signature, timestamp, nonce, config.token)) {
                console.log(`微信服务器验证成功 [${bundleId}]`);
                return res.send(echostr);
            } else {
                console.log(`微信服务器验证失败 [${bundleId}]`);
                return res.status(403).send('签名验证失败');
            }
        }
        
        // POST 请求：接收消息
        if (req.method === 'POST') {
            const { signature, timestamp, nonce, msg_signature, encrypt_type } = req.query;
            
            // 检查是否是加密消息
            const isEncrypted = encrypt_type === 'aes';
            
            let message;
            let isJsonFormat = false;
            
            if (isEncrypted) {
                // 加密模式
                console.log(`收到加密消息 [${bundleId}]`);
                
                // 解析加密消息
                const contentType = req.headers['content-type'] || '';
                const { message: parsedMsg } = parseMessage(req.body, contentType);
                
                const encryptedMsg = parsedMsg.Encrypt;
                if (!encryptedMsg) {
                    console.log('未找到加密消息字段');
                    return res.status(400).send('消息格式错误');
                }
                
                // 验证消息签名
                if (!checkMsgSignature(msg_signature, timestamp, nonce, encryptedMsg, config.token)) {
                    console.log(`加密消息签名验证失败 [${bundleId}]`);
                    return res.status(403).send('签名验证失败');
                }
                
                try {
                    // 解密消息
                    const decryptedXml = decryptMessage(encryptedMsg, config.encodingAESKey, config.appId);
                    console.log(`解密后的消息 [${bundleId}]:`, decryptedXml);
                    
                    // 解析解密后的 XML
                    message = parseXML(decryptedXml);
                } catch (error) {
                    console.error(`消息解密失败 [${bundleId}]:`, error);
                    return res.status(400).send('消息解密失败');
                }
            } else {
                // 明文模式
                // 验证签名
                if (!checkSignature(signature, timestamp, nonce, config.token)) {
                    console.log(`消息签名验证失败 [${bundleId}]`);
                    return res.status(403).send('签名验证失败');
                }
                
                // 智能解析消息格式（支持 JSON 和 XML）
                const contentType = req.headers['content-type'] || '';
                
                console.log(`收到微信消息（明文）[${bundleId}]，Content-Type:`, contentType);
                console.log('消息原始内容:', req.body);
                
                const parsed = parseMessage(req.body, contentType);
                message = parsed.message;
                isJsonFormat = parsed.isJson;
                console.log(`解析为 ${isJsonFormat ? 'JSON' : 'XML'} 格式 [${bundleId}]:`, message);
            }
            
            // 处理消息
            const replyMessage = handleMessage(message);
            
            // 返回响应消息
            if (replyMessage) {
                if (isEncrypted) {
                    // 加密模式回复
                    try {
                        const xmlResponse = buildXML(replyMessage);
                        const encryptedMsg = encryptMessage(xmlResponse, config.encodingAESKey, config.appId);
                        
                        // 生成新的时间戳和随机数
                        const replyTimestamp = Date.now().toString();
                        const replyNonce = Math.random().toString(36).substring(2);
                        
                        // 生成签名
                        const msgSignature = generateMsgSignature(encryptedMsg, replyTimestamp, replyNonce, config.token);
                        
                        // 构建加密响应 XML
                        const encryptedResponse = buildXML({
                            Encrypt: encryptedMsg,
                            MsgSignature: msgSignature,
                            TimeStamp: replyTimestamp,
                            Nonce: replyNonce
                        });
                        
                        console.log(`回复加密消息 [${bundleId}]`);
                        res.type('text/xml').send(encryptedResponse);
                    } catch (error) {
                        console.error(`加密回复失败 [${bundleId}]:`, error);
                        res.send('success');
                    }
                } else if (isJsonFormat) {
                    // 返回 JSON 格式（明文）
                    console.log(`回复 JSON 消息 [${bundleId}]:`, replyMessage);
                    res.json(replyMessage);
                } else {
                    // 返回 XML 格式（明文）
                    const xmlResponse = buildXML(replyMessage);
                    console.log(`回复 XML 消息 [${bundleId}]:`, xmlResponse);
                    res.type('text/xml').send(xmlResponse);
                }
            } else {
                // 返回 success 表示收到消息但不回复
                res.send('success');
            }
        }
        
    } catch (error) {
        console.error(`处理微信消息错误 [${bundleId}]:`, error);
        res.send('success'); // 即使出错也返回 success，避免微信重复推送
    }
}

export default router;
