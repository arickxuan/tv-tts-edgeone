import express from 'express';
import { getFensiList, getFensiInfo } from '../api/fensi.js';
import { createKfSession, getKfSessionList, inviteWx, replyTextMessage } from '../api/kefu.js'
const router = express.Router();

router.get('/:bundleId/fensi/list', async (req, res) => {
    try {
        const bundleId = req.params.bundleId;
        const openId = req.query.openId;
        console.log("openId",openId);
        if(!bundleId) {
            return res.status(400).json({ 
                code: 400, 
                msg: "缺少必要参数: bundleId 或 openId" 
            });
        }
        const data = await getFensiList(bundleId, openId);
        let arr = []
       
        for (let index = 0; index < data.data.openid.length; index++) {
            const userId = data.data.openid[index];
            
            let info = await getFensiInfo(bundleId, userId)
            
            arr.push(info)
            
        }
        res.json({ 
            code: 0, 
            msg: "success", 
            data: arr 
        });
    } catch (error) {
        res.status(500).json({ 
            code: 500, 
            msg: error.message 
        });
    }
});

export default router;