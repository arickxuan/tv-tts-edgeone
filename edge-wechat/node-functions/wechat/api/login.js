import { getAccountConfig, getTokenCache, setTokenCache } from '../config/index.js';
import { stringify } from 'qs';

export function getAuthorizationUrl(bundleId, scope, state = '') {
    const wechatConfig = getAccountConfig(bundleId);
    let redirect_uri = wechatConfig.redirectUri || 'https://m1.arick.top/test/wxlogin/callback'; //'https://m1.arick.top/bundleId/wxlogin/callback'
    let scopes = '';
    if (scope == 1) {
        scopes = 'snsapi_userinfo'
    } else if (scope == 2) {
        scopes = 'snsapi_base'
    } else {
        scopes = 'snsapi_login'
    }
    const params = {
        appid: wechatConfig.appId,
        redirect_uri: encodeURIComponent(redirect_uri),
        response_type: 'code',
        scope: scopes || 'snsapi_userinfo',
        state: state || wechatConfig.state
    };

    if (scope == 3) {
        return `https://open.weixin.qq.com/connect/qrconnect?${stringify(params)}#wechat_redirect`;

    }
    else {
        return `https://open.weixin.qq.com/connect/oauth2/authorize?${stringify(params)}#wechat_redirect`;
    }

}

export async function getAccessToken(bundleId,code) {
    let wechatConfig = getAccountConfig(bundleId)
    const params = {
        appid: wechatConfig.appId,
        secret: wechatConfig.appSecret,
        code: code,
        grant_type: 'authorization_code'
    };

    try {
        const response = await axios.get(
            'https://api.weixin.qq.com/sns/oauth2/access_token',
            { params }
        );

        return response.data;
    } catch (error) {
        console.error('获取微信access_token失败:', error);
        throw error;
    }
}

/**
 * 获取用户信息
 */
export async function getUserInfo(accessToken, openId) {
    const params = {
        access_token: accessToken,
        openid: openId,
        lang: 'zh_CN'
    };

    try {
        const response = await axios.get(
            'https://api.weixin.qq.com/sns/userinfo',
            { params }
        );

        return response.data;
    } catch (error) {
        console.error('获取微信用户信息失败:', error);
        throw error;
    }
}

/**
 * 刷新access_token
 */
export async function refreshToken(refreshToken) {
    const params = {
        appid: wechatConfig.appId,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
    };

    try {
        const response = await axios.get(
            'https://api.weixin.qq.com/sns/oauth2/refresh_token',
            { params }
        );

        return response.data;
    } catch (error) {
        console.error('刷新微信token失败:', error);
        throw error;
    }
}