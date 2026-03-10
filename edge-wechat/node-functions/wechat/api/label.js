
import axios from 'axios';
import { getAccessToken } from './token.js';

export async function addTag(bundleId, name) {
    try {
        const accessToken = await getAccessToken(bundleId);
        console.log("accessToken", accessToken);
        let url = `https://api.weixin.qq.com/cgi-bin/tags/create?access_token=${accessToken}`;
        const payload = {
            tag: {
                "name": name
            }
        };

        const response = await axios.post(url, payload);

        if (response.data.tag) {
            return response.data;
        } else {
            console.error('添加标签失败:', response.data);
            throw new Error(`添加标签失败: ${response.data.errmsg || '未知错误'}`);
        }
    } catch (error) {
        console.error(`添加标签失败 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}

export async function getTagList(bundleId) {
    try {
        const accessToken = await getAccessToken(bundleId);
        const url = `https://api.weixin.qq.com/cgi-bin/tags/get?access_token=${accessToken}`;
        const response = await axios.get(url);
        return response.data;
    }
    catch (error) {
        console.error(`获取标签列表错误 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}

export async function Tagging(bundleId, tagid, openid_list) {
    try {
        const accessToken = await getAccessToken(bundleId);
        let url = `https://api.weixin.qq.com/cgi-bin/tags/members/batchtagging?access_token=${accessToken}`;
        const payload = {
            tagid: tagid,
            openid_list: openid_list
        };
        // "openid_list" : [
        //     "ocYxcuAEy30bX0NXmGn4ypqx3tI0",
        //     "ocYxcuBt0mRugKZ7tGAHPnUaOW7Y"
        // ],  

        const response = await axios.post(url, payload);

        if (response.data.errcode == 0) {
            return response.data;
        } else {
            console.error('绑定标签失败:', response.data);
            throw new Error(`绑定标签失败: ${response.data.errmsg || '未知错误'}`);
        }
    } catch (error) {
        console.error(`绑定标签失败 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}

export async function getUserTagList(bundleId, openid) {
    try {
        const accessToken = await getAccessToken(bundleId);
        const url = `https://api.weixin.qq.com/cgi-bin/tags/getidlist?access_token=${accessToken}`;
        const payload = {
            openid:openid
        };

        const response = await axios.post(url, payload);
        if (response.data.errcode == 0) {
            return response.data;
        } else {
            console.error('获取用户标签失败:', response.data);
            throw new Error(`获取用户标签失败: ${response.data.errmsg || '未知错误'}`);
        }
    }
    catch (error) {
        console.error(`获取用户标签失败 [${bundleId || 'default'}]:`, error);
        throw error;
    }
}
