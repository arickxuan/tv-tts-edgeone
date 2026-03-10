
import axios from 'axios';
import { getAccessToken } from './token.js';

export async function getFensiList(bundleId,openId = null) {
    try {
        const accessToken = await getAccessToken(bundleId);
        console.log("accessToken",accessToken);
        let url = `https://api.weixin.qq.com/cgi-bin/user/get?access_token=${accessToken}&next_openid=`;
        if(openId) {
            url += openId;
        }
        
        const response = await axios.get(url);
        
        if (response.data.total > 0) {
            return response.data;
        } else {
            console.error('获取粉丝列表失败:', response.data);
            throw new Error(`获取粉丝列表失败: ${response.data.errmsg || '未知错误'}`);
        }
    } catch (error) {
        console.error(`获取粉丝列表错误 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}

//GET https://api.weixin.qq.com/cgi-bin/user/info?access_token=ACCESS_TOKEN&openid=o6_bmjrPTlm6_2sgVt7hMZOPfL2M&lang=zh_CN
export async function getFensiInfo(bundleId,openId) {
    try {
        const accessToken = await getAccessToken(bundleId);
        const url = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${accessToken}&openid=${openId}&lang=zh_CN`;
        const response = await axios.get(url);
        // console.log(response)
        return response.data;
    }
    catch (error) {
        console.error(`获取粉丝信息错误 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}

//批量获取粉丝信息
export async function getFensiInfoList(bundleId,openIdList) {
    try {
        const accessToken = await getAccessToken(bundleId);
        const url = `https://api.weixin.qq.com/cgi-bin/user/info/batchget?access_token=${accessToken}`;
        const response = await axios.post(url, {
            user_list: openIdList
        });
        return response.data;
    }
    catch (error) {
        console.error(`批量获取粉丝信息错误 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}