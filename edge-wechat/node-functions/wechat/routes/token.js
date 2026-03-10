/**
 * Token 调试路由
 */

import express from 'express';
import { getAccessToken } from '../api/token.js';
import { getTokenCache } from '../config/index.js';

const router = express.Router();

/**
 * 获取 access_token（调试接口）
 * GET /:bundleId/token 或 GET /token（使用默认账号）
 */
router.get('/:bundleId/token', async (req, res) => {
    const bundleId = req.params.bundleId;
    
    try {
        const token = await getAccessToken(bundleId);
        const cache = getTokenCache(bundleId);
        
        res.json({ 
            code: 0, 
            msg: "success", 
            data: { 
                access_token: token,
                expire_time: new Date(cache.expireTime).toISOString()
            } 
        });
    } catch (error) {
        res.status(500).json({ 
            code: 500, 
            msg: error.message 
        });
    }
});

router.get('/token', async (req, res) => {
    try {
        const token = await getAccessToken('default');
        const cache = getTokenCache('default');
        
        res.json({ 
            code: 0, 
            msg: "success", 
            data: { 
                access_token: token,
                expire_time: new Date(cache.expireTime).toISOString()
            } 
        });
    } catch (error) {
        res.status(500).json({ 
            code: 500, 
            msg: error.message 
        });
    }
});

export default router;
