/**
 * 消息通知路由
 * 用于主动发送消息给用户
 */

import express from 'express';
import { sendTemplateMessage, sendTextMessage ,sendSubscribeMessage } from '../api/message.js';
import { replyTextMessage } from '../api/kefu.js';
const router = express.Router();

/**
 * 通知接口
 * POST /:bundleId/notify 或 POST /notify（使用默认账号）
 * 
 * 请求参数:
 * {
 *   "openId": "用户的openId",
 *   "type": "text|template",  // 消息类型：text-文本消息，template-模板消息
 *   "content": "文本内容",     // type为text时必填
 *   "templateId": "模板ID",    // type为template时必填
 *   "data": {},               // type为template时必填，模板数据
 *   "url": "跳转链接",        // type为template时可选
 *   "kfAccount": "客服账号"   // type为text时可选，指定客服账号
 * }
 * 
 * 或批量发送（数组形式）:
 * {
 *   "openIds": ["openId1", "openId2"],
 *   "type": "text",
 *   "content": "文本内容"
 * }
 */
router.post('/:bundleId/notify', handleNotify);
router.post('/:bundleId/notify/sub', handleSubscribeNotify);
router.post('/:bundleId/notify/text', handleNotifyText);
router.post('/:bundleId/reply/text', handleReplyText);


async function handleNotify(req, res) {
    const bundleId = req.params.bundleId;

    try {
        const { openId, openIds, type, content, templateId, data, url, kfAccount } = req.body;

        // 验证必要参数
        if (!openId && !openIds) {
            return res.status(400).json({
                code: 400,
                msg: "缺少必要参数: openId 或 openIds"
            });
        }

        if (!type) {
            return res.status(400).json({
                code: 400,
                msg: "缺少必要参数: type (text 或 template)"
            });
        }

        // 处理单个用户发送
        if (openId) {
            let result;

            if (type === 'text') {
                if (!content) {
                    return res.status(400).json({
                        code: 400,
                        msg: "文本消息需要提供 content 参数"
                    });
                }
                result = await sendTextMessage(bundleId, openId, content, kfAccount);
            } else if (type === 'template') {
                if (!templateId || !content) {
                    return res.status(400).json({
                        code: 400,
                        msg: "模板消息需要提供 templateId 和 data 参数"
                    });
                }
                result = await sendTemplateMessage(bundleId, openId, templateId, content, url);
            } else {
                return res.status(400).json({
                    code: 400,
                    msg: "不支持的消息类型，仅支持 text 或 template"
                });
            }

            return res.json({
                code: 0,
                msg: "消息发送成功",
                data: result
            });
        }

        // 处理批量发送
        if (openIds && Array.isArray(openIds)) {
            const results = [];
            const errors = [];

            for (const id of openIds) {
                try {
                    let result;
                    if (type === 'text') {
                        result = await sendTextMessage(bundleId, id, content, kfAccount);
                    } else if (type === 'template') {
                        result = await sendTemplateMessage(bundleId, id, templateId, data, url);
                    }
                    results.push({ openId: id, success: true, result });
                } catch (error) {
                    errors.push({ openId: id, error: error.message });
                }
            }

            return res.json({
                code: 0,
                msg: `批量发送完成，成功: ${results.length}，失败: ${errors.length}`,
                data: {
                    success: results,
                    failed: errors
                }
            });
        }

    } catch (error) {
        console.error(`Notify 错误 [${bundleId}]:`, error);
        return res.status(500).json({
            code: 500,
            msg: error.message || "服务器内部错误",
            error: error.toString()
        });
    }
}

async function handleSubscribeNotify(req, res) {
    const bundleId = req.params.bundleId;

    try {
        const { openId, openIds, content, templateId, data, url } = req.body;

        // 验证必要参数
        if (!openId && !openIds) {
            return res.status(400).json({
                code: 400,
                msg: "缺少必要参数: openId 或 openIds"
            });
        }


        // 处理单个用户发送
        if (openId) {
            let result;

            if (!templateId || !content) {
                return res.status(400).json({
                    code: 400,
                    msg: "模板消息需要提供 templateId 和 data 参数"
                });
            }
            result = await sendSubscribeMessage(bundleId, openId, templateId, content, url);


            return res.json({
                code: 0,
                msg: "消息发送成功",
                data: result
            });
        }

        // 处理批量发送
        if (openIds && Array.isArray(openIds)) {
            const results = [];
            const errors = [];

            for (const id of openIds) {
                try {
                    let result;
                    result = await sendSubscribeMessage(bundleId, id, templateId, data, url);

                    results.push({ openId: id, success: true, result });
                } catch (error) {
                    errors.push({ openId: id, error: error.message });
                }
            }

            return res.json({
                code: 0,
                msg: `批量发送完成，成功: ${results.length}，失败: ${errors.length}`,
                data: {
                    success: results,
                    failed: errors
                }
            });
        }

    } catch (error) {
        console.error(`Notify 错误 [${bundleId}]:`, error);
        return res.status(500).json({
            code: 500,
            msg: error.message || "服务器内部错误",
            error: error.toString()
        });
    }
}

async function handleNotifyText(req, res) {
    const bundleId = req.params.bundleId;
    const { openId, content, kfAccount } = req.body;
    const replyMessage = {
        ToUserName: message.FromUserName,
        FromUserName: message.ToUserName,
        CreateTime: Math.floor(Date.now() / 1000),
        MsgType: 'text',
        Content: `您发送的消息是：${message.Content}`
    };
    const result = await sendTextMessage(bundleId, openId, content, kfAccount);
    return res.json({
        code: 0,
        msg: "消息发送成功",
        data: result
    });
}

async function handleReplyText(req, res) {
    const bundleId = req.params.bundleId;
    const { openId, content, kfAccount } = req.body;
    if (!openId || !content) {
        return res.status(400).json({
            code: 400,
            msg: "缺少必要参数: openId 或 content"
        });
    }
    const result = await replyTextMessage(bundleId, openId, content, kfAccount);
    return res.json({
        code: 0,
        msg: "消息发送成功",
        data: result
    });
}

export default router;
