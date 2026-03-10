import express from 'express';
import { getPluginOpenPid, getOpenPid } from '../api/xiaochengxu.js';
const router = express.Router();

router.get('/:bundleId/xiaochengxu/getpluginopenpid', handleGetPluginOpenPid);

router.get('/xiaochengxu/getpluginopenpid', async (req, res) => {
    req.params.bundleId = 'default';
    handleGetPluginOpenPid(req, res);
});

async function handleGetPluginOpenPid(req, res) {
    const bundleId = req.params.bundleId;
    const code = req.query.code;
    if(!bundleId || !code) {
        return res.status(400).json({
            code: 400,
            msg: "缺少必要参数: bundleId 或 code"
        });
    }
    const data = await getPluginOpenPid(bundleId,code);
    console.log("data",data);
    res.json({
        code: 0,
        msg: "success",
        data: data
    });
}

router.get('/:bundleId/xiaochengxu/getopenpid', handleGetOpenPid);
router.get('/xiaochengxu/getopenpid', async (req, res) => {
    req.params.bundleId = 'default';
    handleGetOpenPid(req, res);
});

async function handleGetOpenPid(req, res) {
    const bundleId = req.params.bundleId;
    const code = req.query.code;
    if(!bundleId || !code) {
        return res.status(400).json({
            code: 400,
            msg: "缺少必要参数: bundleId 或 code"
        });
    }
    const data = await getOpenPid(bundleId,code);
    console.log("data",data);
    res.json({
        code: 0,
        msg: "success",
        data: data
    });
}
export default router;