"use strict";
// Object.defineProperty(exports, "__esModule", { value: true });
import axios from "axios";
const headers = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "accept": "application/json, text/plain, */*",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "referer": "https://suno.com/",
    "origin": "https://suno.com"
};

// 重试函数
async function retryRequest(fn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            const isLastAttempt = i === maxRetries - 1;
            
            // 如果是最后一次尝试或者不是可重试的错误，直接抛出
            if (isLastAttempt || (error.response?.status && ![503, 502, 504, 429].includes(error.response.status))) {
                throw error;
            }
            
            console.log(`请求失败，第 ${i + 1}/${maxRetries} 次重试中... (${delay}ms后重试)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // 指数退避
        }
    }
}
async function getTopLists() {
    return [
        {
            title: "趋势榜",
            data: [
                {
                    id: "1190bf92-10dc-4ce5-968a-7a377f37f984",
                    title: "趋势榜 - 最近一天",
                },
                {
                    id: "08a079b2-a63b-4f9c-9f29-de3c1864ddef",
                    title: "趋势榜 - 最近一周",
                },
                {
                    id: "845539aa-2a39-4cf5-b4ae-16d3fe159a77",
                    title: "趋势榜 - 最近一月",
                },
                {
                    id: "6943c7ee-cbc5-4f72-bc4e-f3371a8be9d5",
                    title: "趋势榜 - 全部时间",
                },
            ],
        },
        {
            title: "最新榜",
            data: [
                {
                    id: "cc14084a-2622-4c4b-8258-1f6b4b4f54b3",
                    title: "最新榜",
                },
            ],
        },
        {
            title: "其他类别",
            data: [
                {
                    id: "1ac7823f-8faf-474f-b14c-e4f7c7bb373f",
                    title: "动物开会",
                },
                {
                    id: '6713d315-3541-460d-8788-162cce241336',
                    title: 'Lo-Fi'
                }
            ],
        },
    ];
}
async function getTopListDetail(topListItem) {
    try {
        console.log(`正在请求 Suno API: ${topListItem.id}`);
        
        const response = await retryRequest(async () => {
            return await axios.get(`https://studio-api.suno.ai/api/playlist/${topListItem.id}/?page=0`, {
                headers,
                timeout: 15000, // 15秒超时
                validateStatus: function (status) {
                    // 接受 200-299 的状态码
                    return status >= 200 && status < 300;
                }
            });
        });
        
        const result = response.data;
        
        // 检查响应数据结构
        if (!result || !result.playlist_clips) {
            console.warn('API 响应数据结构异常:', result);
            return {
                isEnd: true,
                musicList: []
            };
        }
        
        return {
            isEnd: true,
            musicList: result.playlist_clips.map(it => {
                var _a, _b;
                const clip = it.clip;
                return {
                    id: clip.id,
                    url: clip.audio_url,
                    artwork: clip.image_large_url || clip.image_url,
                    duration: (_a = clip.metadata) === null || _a === void 0 ? void 0 : _a.duration,
                    title: clip.title,
                    artist: clip.display_name,
                    userId: clip.user_id,
                    rawLrc: (_b = clip.metadata) === null || _b === void 0 ? void 0 : _b.prompt
                };
            })
        };
        
    } catch (error) {
        console.error('Suno API 请求失败:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            url: `https://studio-api.suno.ai/api/playlist/${topListItem.id}/?page=0`
        });
        
        // 根据不同的错误状态码提供不同的处理
        if (error.response?.status === 503) {
            console.warn('Suno API 服务暂时不可用 (503)，返回空结果');
        } else if (error.response?.status === 429) {
            console.warn('请求过于频繁 (429)，请稍后重试');
        } else if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn('认证失败 (401/403)，可能需要 API 密钥');
        }
        
        // 返回空结果而不是抛出错误
        return {
            isEnd: true,
            musicList: []
        };
    }
}
async function getLyric(musicItem) {
    return {
        rawLrc: musicItem.rawLrc
    };
}
export default {
    platform: "suno",
    version: "0.0.0",
    srcUrl: "https://gitee.com/maotoumao/MusicFreePlugins/raw/v0.1/dist/suno/index.js",
    cacheControl: "no-cache",
    getTopLists,
    getTopListDetail,
    getLyric
};
// 测试代码 - 在生产环境中已注释
// getTopListDetail({
//     id: "1ac7823f-8faf-474f-b14c-e4f7c7bb373f",
//     title: "最新榜",
// }).then(e => console.log(e.musicList[0]));