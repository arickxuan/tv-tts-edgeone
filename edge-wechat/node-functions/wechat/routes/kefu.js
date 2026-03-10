/**
 * 客服管理路由
 */

import express from 'express';
import { getKefuList, getKefuOnline, addKefuAccount } from '../api/kefu.js';
import { createKfSession, getKfSessionList, inviteWx, replyTextMessage } from '../api/kefu.js'

const router = express.Router();

/**
 * 获取客服列表
 * GET /:bundleId/kefu/list 或 GET /kefu/list（使用默认账号）
 */
router.get('/:bundleId/kefu/list', async (req, res) => {
    const bundleId = req.params.bundleId;
    
    try {
        const data = await getKefuList(bundleId);
        res.json({ 
            code: 0, 
            msg: "success", 
            data: data 
        });
    } catch (error) {
        res.status(500).json({ 
            code: 500, 
            msg: error.message 
        });
    }
});

router.get('/kefu/list', async (req, res) => {
    try {
        const data = await getKefuList('default');
        res.json({ 
            code: 0, 
            msg: "success", 
            data: data 
        });
    } catch (error) {
        res.status(500).json({ 
            code: 500, 
            msg: error.message 
        });
    }
});

/**
 * 获取在线客服列表
 * GET /:bundleId/kefu/online 或 GET /kefu/online（使用默认账号）
 */
router.get('/:bundleId/kefu/online', async (req, res) => {
    const bundleId = req.params.bundleId;
    
    try {
        const data = await getKefuOnline(bundleId);
        res.json({ 
            code: 0, 
            msg: "success", 
            data: data 
        });
    } catch (error) {
        res.status(500).json({ 
            code: 500, 
            msg: error.message 
        });
    }
});

router.get('/kefu/online', async (req, res) => {
    try {
        const data = await getKefuOnline('default');
        res.json({ 
            code: 0, 
            msg: "success", 
            data: data 
        });
    } catch (error) {
        res.status(500).json({ 
            code: 500, 
            msg: error.message 
        });
    }
});

/**
 * 添加客服账号
 * POST /:bundleId/kefu/add 或 POST /kefu/add（使用默认账号）
 * 
 * 请求参数:
 * {
 *   "kf_account": "客服账号",
 *   "kf_nick": "客服昵称"
 * }
 */
router.post('/:bundleId/kefu/add', async (req, res) => {
    const bundleId = req.params.bundleId;
    
    try {
        const { kf_account, kf_nick } = req.body;
        
        if (!kf_account || !kf_nick) {
            return res.status(400).json({ 
                code: 400, 
                msg: "缺少必要参数: kf_account, kf_nick" 
            });
        }

        const data = await addKefuAccount(bundleId, kf_account, kf_nick);
        res.json({ 
            code: 0, 
            msg: "success", 
            data: data 
        });
    } catch (error) {
        res.status(500).json({ 
            code: 500, 
            msg: error.message 
        });
    }
});

router.post('/kefu/add', async (req, res) => {
    try {
        const { kf_account, kf_nick } = req.body;
        
        if (!kf_account || !kf_nick) {
            return res.status(400).json({ 
                code: 400, 
                msg: "缺少必要参数: kf_account, kf_nick" 
            });
        }

        const data = await addKefuAccount('default', kf_account, kf_nick);
        res.json({ 
            code: 0, 
            msg: "success", 
            data: data 
        });
    } catch (error) {
        res.status(500).json({ 
            code: 500, 
            msg: error.message 
        });
    }
});



router.get('/:bundleId/inviteWx', async (req, res) => {
    const bundleId = req.params.bundleId;
    const wx = req.query.wx;
    const kfAccount = req.query.kfAccount;

    if (!bundleId || !wx) {
        return res.status(400).json({
            code: 400,
            msg: "缺少必要参数: bundleId 或 wx"
        });
    }
    let re = await inviteWx(bundleId, kfAccount, wx)
    res.json({
        code: 0,
        msg: "success",
        data: re
    });

});

router.get('/:bundleId/huihua/add', async (req, res) => {
    const bundleId = req.params.bundleId;
    const kfAccount = req.query.kfAccount;
    const openId = req.query.openId;
    console.log("openId", openId);
    if (!bundleId || !openId) {
        return res.status(400).json({
            code: 400,
            msg: "缺少必要参数: bundleId 或 openId"
        });
    }
    let re = await createKfSession(bundleId, openId, kfAccount)
    res.json({
        code: 0,
        msg: "success",
        data: re
    });

});



router.get('/:bundleId/huihua/list', async (req, res) => {
    const bundleId = req.params.bundleId;
    const kfAccount = req.query.kfAccount;

    if (!bundleId || !kfAccount) {
        return res.status(400).json({
            code: 400,
            msg: "缺少必要参数: bundleId 或 openId"
        });
    }
    let re = await getKfSessionList(bundleId, kfAccount)
    res.json({
        code: 0,
        msg: "success",
        data: re
    });

});

router.get('/:bundleId/huihua/send', async (req, res) => {
    const bundleId = req.params.bundleId;
    const kfAccount = req.query.kfAccount;
    const openId = req.query.openId;
    const content = req.query.content;
    console.log("openId", openId);
    if (!bundleId || !openId) {
        return res.status(400).json({
            code: 400,
            msg: "缺少必要参数: bundleId 或 openId"
        });
    }
    let re = await replyTextMessage(bundleId, openId, content, kfAccount)
    res.json({
        code: 0,
        msg: "success",
        data: re
    });

});

export default router;
