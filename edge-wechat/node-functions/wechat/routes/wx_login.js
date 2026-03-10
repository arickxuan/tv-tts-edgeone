import express from 'express';
import { getAuthorizationUrl, getAccessToken, getUserInfo } from '../api/login.js';
const router = express.Router();

router.get('/:bundleId/wxlogin/url', async (req, res) => {
    try {
        const bundleId = req.params.bundleId;

        let url = getAuthorizationUrl(bundleId, 1, 'status888')
        
        res.json({
            code: 0,
            msg: "success",
            data: url
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            msg: error.message
        });
    }
});

router.get('/:bundleId/wxlogin/callback', async (req, res) => {
    try {
        const bundleId = req.params.bundleId;
        console.log(req.query)
        
        let token = await getAccessToken(bundleId, req.query.code)
        console.log(token)

        let info = await getUserInfo(token.access_token, token.openid)
        res.json({ 
            code: 0, 
            msg: "success", 
            data: info 
        });
    } catch (error) {
        res.status(500).json({ 
            code: 500, 
            msg: error.message 
        });
    }
});

export default router;