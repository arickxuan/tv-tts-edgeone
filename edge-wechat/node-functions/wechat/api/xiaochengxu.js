import axios from 'axios';
import { getAccessToken } from './token.js';
import { getAccountConfig } from '../config/index.js';

export async function getPluginOpenPid(bundleId,code) {
    try {
        const accessToken = await getAccessToken(bundleId);
        const url = `https://api.weixin.qq.com/wxa/getpluginopenpid?access_token=${accessToken}`;
        const response = await axios.post(url, {
            code: code
        });
        return response.data;
    } catch (error) {
        console.error(`获取插件openpid错误 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}

export async function getOpenPid(bundleId,code) {
    try {
        const accessToken = await getAccessToken(bundleId);
        const config = getAccountConfig(bundleId);
        const url = 'https://api.weixin.qq.com/sns/jscode2session?appid='+config.appId+'&secret='+config.appSecret+'&js_code='+code+'&grant_type=authorization_code'
        const response = await axios.get(url );
        return response.data;
    } catch (error) {
        console.error(`获取插件openpid错误 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}