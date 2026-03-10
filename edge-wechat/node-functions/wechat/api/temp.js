import axios from 'axios';
import { getAccessToken } from './token.js';


//POST https://api.weixin.qq.com/cgi-bin/message/template/subscribe?access_token=ACCESS_TOKEN
export async function sendTemplateSubscribe(bundleId,openId,templateId,data) {
    try {
        const accessToken = await getAccessToken(bundleId);
        const url = `https://api.weixin.qq.com/cgi-bin/message/template/subscribe?access_token=${accessToken}`;
        const response = await axios.post(url, {
            openid: openId,
            template_id: templateId,
            data: data
        });

        return response.data;
    }
    catch (error) {
        console.error(`发送模板订阅消息错误 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}