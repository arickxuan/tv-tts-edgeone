
import express from 'express';
import { getAllAccounts, saveWechatConfig } from '../config/index.js';


const router = express.Router();


/**
 * 账号管理路由
 */

/**
 * 添加账号配置（用于动态添加账号）
 * POST /accounts/add
 * 
 * 请求参数:
 * {
 *   "bundleId": "账号标识",
 *   "appId": "微信 AppId",
 *   "appSecret": "微信 AppSecret",
 *   "token": "微信 Token",
 *   "encodingAESKey": "消息加密密钥（可选）"
 * }
 */
router.post('/55/add', (req, res) => {
    try {
        const { bundleId, appId, appSecret, token, encodingAESKey } = req.body;
        
        if (!bundleId || !appId || !appSecret || !token) {
            return res.status(400).json({
                code: 400,
                msg: "缺少必要参数: bundleId, appId, appSecret, token"
            });
        }
        
        addAccount(bundleId, {
            appId,
            appSecret,
            token,
            encodingAESKey: encodingAESKey || ''
        });
        
        res.json({
            code: 0,
            msg: "账号添加成功",
            data: { bundleId }
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            msg: error.message
        });
    }
});


router.get('/accounts', async (req, res) => {
    const accounts = await getAllAccounts();
    res.json({
        code: 0,
        msg: "success",
        data: accounts
    });
});

router.post('/accounts/add', async (req, res) => {
    const config = req.body;
    if (config.pass != process.env.ADMIN_PASSWORD) {
        return res.status(400).json({
            code: 400,
            msg: "密码错误"
        });
    }
    if (!config.bundleId || !config.appId || !config.appSecret || !config.token) {
        return res.status(400).json({
            code: 400,
            msg: "缺少必要参数: bundleId, appId, appSecret, token"
        });
    }
    await saveWechatConfig(config);
    res.json({
        code: 0,
        msg: "success",
        data: "账号配置保存成功"
    });
});

export default router;