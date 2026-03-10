// const axios = require('axios');
// const CryptoJS = require('crypto-js');
// const qs = require('qs');
// const bigInt = require('big-integer');
// const dayjs = require('dayjs');
// const cheerio = require('cheerio');

import axios from 'axios';
import CryptoJS from 'crypto-js';
import qs from 'qs';
import bigInt from 'big-integer';
import dayjs from 'dayjs';
import * as cheerio from 'cheerio'; // 暂时注释，未使用

const platform = "网易云音乐";
const author = "公众号:科技长青";
const version = "0.1.0";
const pageSize = 30;

// 加密工具函数
function create_key() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
        const index = Math.floor(Math.random() * chars.length);
        result += chars.charAt(index);
    }
    return result;
}

function AES(text, key) {
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    const iv = CryptoJS.enc.Utf8.parse('0102030405060708');
    const textBytes = CryptoJS.enc.Utf8.parse(text);
    const encrypted = CryptoJS.AES.encrypt(textBytes, keyBytes, {
        iv: iv,
        mode: CryptoJS.mode.CBC
    });
    return encrypted.toString();
}

function Rsa(text) {
    text = text.split('').reverse().join('');
    const pubKey = '010001';
    const modulus = '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7';

    const textHex = text.split('').map(char => char.charCodeAt(0).toString(16)).join('');
    const textBigInt = bigInt(textHex, 16);
    const modulusBigInt = bigInt(modulus, 16);
    const pubKeyBigInt = bigInt(pubKey, 16);

    const encrypted = textBigInt.modPow(pubKeyBigInt, modulusBigInt).toString(16);
    return Array(256 - encrypted.length).fill('0').join('') + encrypted;
}

function getParamsAndEnc(data) {
    const secretKey = create_key();
    const firstEncrypted = AES(data, '0CoJUm6Qyw8W8jud');
    const secondEncrypted = AES(firstEncrypted, secretKey);
    const encSecKey = Rsa(secretKey);

    return {
        params: secondEncrypted,
        encSecKey: encSecKey
    };
}

// 格式化函数
function formatMusicItem(item) {
    const album = item.al || item.album;
    return {
        id: item.id,
        artwork: album ? album.picUrl : undefined,
        title: item.name,
        artist: (item.ar || item.artists)[0].name,
        album: album ? album.name : undefined,
        url: 'https://share.duanx.cn/url/wy/' + item.id + '.mp3',
        qualities: {
            low: { size: (item.l || {}).size },
            standard: { size: (item.m || {}).size },
            high: { size: (item.h || {}).size },
            super: { size: (item.sq || {}).size }
        },
        copyrightId: item.copyrightId
    };
}

function formatAlbumItem(item) {
    return {
        id: item.id,
        artist: item.artist.name,
        title: item.name,
        artwork: item.picUrl,
        description: '',
        date: dayjs.unix(item.publishTime / 1000).format('YYYY-MM-DD')
    };
}

// 搜索功能
async function searchBase(query, page, type) {
    const params = {
        s: query,
        limit: pageSize,
        type: type,
        offset: (page - 1) * pageSize,
        csrf_token: ''
    };

    const encrypted = getParamsAndEnc(JSON.stringify(params));
    const formData = qs.stringify(encrypted);

    const headers = {
        'authority': 'music.163.com',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'content-type': 'application/x-www-form-urlencoded',
        'accept': '*/*',
        'origin': 'https://music.163.com',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://music.163.com/search/',
        'accept-language': 'zh-CN,zh;q=0.9'
    };

    const response = await axios.post('https://music.163.com/weapi/search/get', formData, { headers });
    return response.data;
}

async function searchMusic(query, page) {
    const result = await searchBase(query, page, 1);
    const songs = result.result.songs.map(formatMusicItem);
    return {
        isEnd: result.result.songCount <= page * pageSize,
        data: songs
    };
}

async function searchAlbum(query, page) {
    const result = await searchBase(query, page, 10);
    const albums = result.result.albums.map(formatAlbumItem);
    return {
        isEnd: result.result.albumCount <= page * pageSize,
        data: albums
    };
}

// 获取播放链接
async function getMediaSource(musicItem, quality = 'standard') {
    const qualityLevels = {
        low: 'standard',
        standard: 'higher',
        high: 'exhigh',
        super: 'lossless'
    };
    const QUALITY_MAP = {
        low: '128k',
        standard: "192k",
        high: '320k',
        super: 'flac',
    }
    const QUALITY_MAP2 = {
        low: 'standard',
        standard: "exhigh",
        high: 'lossless',
        super: 'jymaster',
    }

    let url = `https://share.duanx.cn/url/wy/${musicItem.id}.mp3?quality=${qualityLevels[quality]}`
    let url2 = `https://wyy-api-three.vercel.app/song/url?id=${musicItem.id}&quality=${QUALITY_MAP[quality]}`
    let url3 = `https://api.toubiec.cn/wyapi/getMusicUrl.php?id=${musicItem.id}&level=${QUALITY_MAP2[quality]}`

    const response = await axios.get(url3);
    console.log("response", response.data)
    return {
        url: response.data.data[0].url
    };
}

// 获取歌词
async function getLyric(musicItem) {
    const headers = {
        'Referer': 'https://music.163.com/',
        'Origin': 'https://music.163.com',
        'authority': 'music.163.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    const params = {
        id: musicItem.id,
        lv: -1,
        tv: -1,
        csrf_token: ''
    };

    const encrypted = getParamsAndEnc(JSON.stringify(params));
    const formData = qs.stringify(encrypted);

    const response = await axios.post('https://music.163.com/weapi/song/lyric?csrf_token=', formData, { headers });
    return {
        rawLrc: response.data.lrc.lyric
    };
}

async function getValidMusicItems(songIds) {
    // HTTP请求头配置
    const headers = {
        Referer: "https://music.163.com/",
        Origin: "https://y.music.163.com/",
        authority: "music.163.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded"
    };

    try {
        // 构造网易云音乐歌曲详情API请求
        const apiUrl = "https://music.163.com/api/song/detail/?ids=[" +
            songIds.join(",") +
            "]";

        // 发送GET请求获取歌曲详情
        const response = await axios.get(apiUrl, { headers });

        // 提取歌曲数据并使用formatMusicItem格式化
        const formattedSongs = response.data.songs.map(song => formatMusicItem(song));

        return formattedSongs;

    } catch (error) {
        // 发生错误时记录日志并返回空数组
        console.error('获取歌曲详情失败:', error.message);
        return [];
    }
}

async function getSheetMusicById(playlistId) {
    // HTTP请求头配置
    const headers = {
        Referer: "https://y.music.163.com/",
        Origin: "https://y.music.163.com/",
        authority: "music.163.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36"
    };

    // 获取歌单详情
    const playlistResponse = await axios.get(
        `https://music.163.com/api/v3/playlist/detail?id=${playlistId}&n=5000`,
        { headers: headers }
    );

    // 提取所有歌曲ID
    const trackIds = playlistResponse.data.playlist.trackIds.map(track => track.id);

    // 分批处理歌曲（每批200首）
    const BATCH_SIZE = 200; // 原来的 0xc8
    let allMusicItems = [];
    let batchIndex = 0;

    // 循环处理每一批
    while (batchIndex * BATCH_SIZE < trackIds.length) {
        // 计算当前批次的歌曲ID范围
        const startIndex = batchIndex * BATCH_SIZE;
        const endIndex = (batchIndex + 1) * BATCH_SIZE;

        // 获取当前批次的歌曲ID切片
        const batchIds = trackIds.slice(startIndex, endIndex);

        // 获取当前批次歌曲的详细信息
        const batchMusicItems = await getValidMusicItems(batchIds);

        // 合并到总结果中
        allMusicItems = allMusicItems.concat(batchMusicItems);

        // 递增批次索引
        batchIndex++;
    }

    return allMusicItems;
}

// const headers = {
//     authority: _0x3a037c(0x19f, "dSe7"),
//     "user-agent": _0x3a037c(0x261, "dSe7"),
//     "content-type": _0x3a037c(0x2f5, "Yj*x"),
//     accept: _0x3a037c(0x1cb, "zDEC"),
//     origin: "https://music.163.com",
//     "sec-fetch-site": "same-origin",
//     "sec-fetch-mode": _0x3a037c(0x1a5, "Yj*x"),
//     "sec-fetch-dest": "empty",
//     referer: _0x3a037c(0x296, "xsAm"),
//     "accept-language": _0x3a037c(0x184, "zDEC"),
// };
async function getRecommendSheetTags() {
    try {
        // 准备请求参数
        const params = { csrf_token: "" };
        const encryptedParams = getParamsAndEnc(JSON.stringify(params));
        const postData = qs.stringify(encryptedParams);
        
        // 请求网易云音乐的歌单标签API
        const response = await axios({
            method: "POST",
            url: "https://music.163.com/weapi/playlist/catalogue",  // 根据混淆代码推断的API端点
            headers: headers,
            data: postData
        });
        
        const categoryMap = response.data.sub;  // 获取标签分类数据
        const categoryObject = {};
        
        // 构建分类结构：将分类标签按类别组织
        const categories = Object.entries(categoryMap).map(([key, value]) => {
            const category = { title: value, data: [] };
            categoryObject[key] = category;
            return category;
        });
        
        const pinnedTags = [];  // 热门标签数组
        
        // 处理所有标签，将热门标签添加到置顶列表
        response.data.all.forEach((tag) => {
            const tagItem = {
                id: tag.name,
                title: tag.name
            };
            
            // 如果是热门标签，添加到置顶列表
            if (tag.hot) {
                pinnedTags.push(tagItem);
            }
            
            // 将标签添加到对应的分类中
            if (categoryObject[tag.category]) {
                categoryObject[tag.category].data.push(tagItem);
            }
        });
        
        return {
            pinned: pinnedTags,    // 置顶的热门标签
            data: categories       // 按分类组织的所有标签
        };
    } catch (error) {
        console.error('获取推荐歌单标签失败:', error);
        throw error;
    }
}
async function getRecommendSheetsByTag(tag, page) {
    try {
        const pageSize = 20;  // 每页显示20个歌单
        
        // 构建请求参数
        const params = {
            cat: tag.id || "全部",        // 分类标签，默认为"全部"
            order: "hot",                 // 按热度排序
            limit: pageSize,              // 每页数量
            offset: (page - 1) * pageSize, // 偏移量计算
            total: true,                  // 返回总数
            csrf_token: ""
        };
        
        // 加密请求参数
        const encryptedParams = getParamsAndEnc(JSON.stringify(params));
        const postData = qs.stringify(encryptedParams);
        
        // 请求网易云音乐的歌单列表API
        const response = await axios({
            method: "POST",
            url: "https://music.163.com/weapi/playlist/list",  // 根据混淆代码推断的API端点
            headers: headers,
            data: postData
        });
        
        // 处理歌单数据
        const playlists = response.data.playlists.map((playlist) => ({
            id: playlist.id,
            artist: playlist.creator.nickname,      // 创建者昵称
            title: playlist.name,                   // 歌单名称
            artwork: playlist.coverImgUrl,          // 封面图片URL
            playCount: playlist.playCount,          // 播放次数
            createUserId: playlist.creator.userId,  // 创建者用户ID
            createTime: playlist.createTime,        // 创建时间
            description: playlist.description       // 歌单描述
        }));
        
        return {
            isEnd: !response.data.more,  // 是否还有更多数据
            data: playlists
        };
    } catch (error) {
        console.error('获取推荐歌单失败:', error);
        throw error;
    }
}
async function getMusicSheetInfo(musicSheet, page) {
    try {
        // 获取歌单的歌曲ID列表
        let trackIds = musicSheet.trackIds;
        
        // 如果歌单没有提供歌曲ID列表，先获取歌单详情
        if (!trackIds) {
            const playlistId = musicSheet.id;
            const headers = {
                Referer: "https://music.163.com/",
                Origin: "https://y.music.163.com/",
                authority: "music.163.com",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36"
            };
            
            // 获取歌单详情API
            const playlistDetail = await axios_1.default.get(
                `https://music.163.com/api/v6/playlist/detail?id=${playlistId}&n=100000&s=8`,
                { headers: headers }
            );
            
            // 提取所有歌曲的ID
            trackIds = playlistDetail.data.playlist.tracks.map((track) => track.id);
        }
        
        const pageSize = 40;  // 每页40首歌曲
        
        // 计算当前页的歌曲ID范围
        const startIndex = (page - 1) * pageSize;
        const endIndex = page * pageSize;
        const currentPageTrackIds = trackIds.slice(startIndex, endIndex);
        
        // 获取当前页歌曲的详细信息
        const musicList = await getValidMusicItems(currentPageTrackIds);
        
        // 构建返回结果
        let additionalData = {};
        
        // 如果是第一页，返回完整的trackIds供后续使用
        if (page <= 1) {
            additionalData = { _trackIds: trackIds };
        }
        
        return Object.assign(
            {
                isEnd: trackIds.length <= (page * pageSize),  // 判断是否为最后一页
                musicList: musicList
            },
            additionalData
        );
    } catch (error) {
        console.error('获取歌单信息失败:', error);
        throw error;
    }
}

async function getTopListDetail(topList) {
    try {
        // 通过排行榜ID获取其音乐列表
        const musicList = await getSheetMusicById(topList.id);
        
        // 合并排行榜基础信息和音乐列表
        return Object.assign(
            Object.assign({}, topList),
            { musicList: musicList }
        );
    } catch (error) {
        console.error('获取排行榜详情失败:', error);
        throw error;
    }
}

async function getTopLists() {
    try {
        // 请求网易云音乐排行榜页面
        const response = await axios.get("https://music.163.com/discover/toplist", {
            headers: {
                referer: "https://music.163.com/",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.54"
            }
        });
        
        // 使用cheerio解析HTML页面
        const $ = cheerio.load(response.data);
        const elements = $(".n-lkbx.clrfix").children();  // 获取排行榜容器的子元素
        const categories = [];
        let currentCategory = {};

        console.log("elements", elements)
        
        // 遍历页面元素，提取排行榜分类和数据
        for (let element of elements) {
            // 如果找到h2标签，表示这是一个新的排行榜分类
            if (element.tagName === "h2") {
                // 如果当前分类有数据，先保存到结果数组中
                if (currentCategory.title) {
                    categories.push(currentCategory);
                }
                
                // 创建新的分类对象
                currentCategory = {};
                currentCategory.title = $(element).text();  // 提取分类标题
                currentCategory.data = [];
            }
            // 如果找到ul标签，表示这是排行榜列表
            else if (element.tagName === "ul") {
                let listItems = $(element).children();  // 获取列表项
                
                // 遍历每个排行榜项目并提取信息
                currentCategory.data = listItems.map((index, item) => {
                    const $item = $(item);
                    
                    // 提取排行榜ID（从data-res-id属性）
                    const id = $item.attr("data-res-id");
                    
                    // 提取封面图片URL，并处理图片参数
                    const coverImg = $item.find("img")
                        .attr("src")
                        .replace(/(\.jpg\?).*/, ".jpg?param=800y800");
                    
                    // 提取排行榜标题
                    const title = $item.find(".s-fc0").text();
                    
                    // 提取排行榜描述
                    const description = $item.find("p.s-fc4").text();
                    
                    return {
                        id: id,
                        coverImg: coverImg,
                        title: title,
                        description: description
                    };
                }).get();  // 转换为普通数组
            }
        }
        
        // 如果最后一个分类有数据，添加到结果数组
        if (currentCategory.title) {
            categories.push(currentCategory);
        }
        
        return categories;
    } catch (error) {
        console.error('获取排行榜列表失败:', error);
        throw error;
    }
}

// 导出模块
export default {
    platform,
    version,
    author,
    srcUrl: '',
    cacheControl: 'no-cache',
    hints: {
        importMusicSheet: [
            '网易云：APP点击分享，然后复制链接',
            '默认歌单无法导入，先新建一个空白歌单复制过去再导入新歌单即可'
        ]
    },
    supportedSearchType: ['music', 'album', 'sheet', 'artist', 'lyric'],
    search: async function (query, page, type) {
        switch (type) {
            case 'music':
                return await searchMusic(query, page);
            case 'album':
                return await searchAlbum(query, page);
            case 'artist':
                // 搜索歌手实现
                return { isEnd: true, data: [] };
            case 'sheet':
                // 搜索歌单实现
                return { isEnd: true, data: [] };
            case 'lyric':
                // 搜索歌词实现
                return { isEnd: true, data: [] };
            default:
                return { isEnd: true, data: [] };
        }
    },
    getMediaSource,
    getLyric,
    importMusicSheet: async function (url) {
        const match = url.match(/(?:https:\/\/y\.music\.163.com\/m\/playlist\?id=([0-9]+))|(?:https?:\/\/music\.163\.com\/playlist\/([0-9]+)\/.*)|(?:https?:\/\/music.163.com(?:\/#)?\/playlist\?id=(\d+))|(?:^\s*(\d+)\s*$)/);
        const playlistId = match[1] || match[2] || match[3] || match[4];

        // 获取歌单音乐实现
        return await getSheetMusicById(playlistId);
    },
    getTopLists: getTopLists,
    getTopListDetail: getTopListDetail,
    getRecommendSheetTags: getRecommendSheetTags,
    getRecommendSheetsByTag: getRecommendSheetsByTag,
    getMusicSheetInfo: getMusicSheetInfo,
};