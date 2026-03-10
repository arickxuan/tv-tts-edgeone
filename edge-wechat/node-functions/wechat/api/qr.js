import axios from 'axios';

import { getAccessToken } from './token.js';

// POST https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=ACCESS_TOKEN
export async function createQrcode(bundleId,scene,expireSeconds = 604800) {
    try {
        const accessToken = await getAccessToken(bundleId);
        const url = `https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${accessToken}`;
        const response = await axios.post(url, {
            scene: scene,
            expire_seconds: expireSeconds
        });
        return response.data;
    }
    catch (error) {
        console.error(`创建二维码错误 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}