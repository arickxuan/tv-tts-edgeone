// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
// const jsonData = require('../config/movie.json');
// 直接使用 import 导入 JSON 文件
import jsonData from '../config/movie.json' assert { type: 'json' };

import { cleanHtmlTags } from './utils/movie.js';

export const API_CONFIG = {
    prep: "/api.php/provide/vod/",
    search: {
        path: '?ac=videolist&wd=',
        pagePath: '?ac=videolist&wd={query}&pg={page}',
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'application/json',
        },
    },
    detail: {
        path: '?ac=videolist&ids=',
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'application/json',
        },
    },
};

// 在模块加载时根据环境决定配置来源
let fileConfig = null;
let cachedConfig = null;

async function initConfig() {
    if (cachedConfig) {
        return;
    }
    fileConfig = jsonData;

    if (process.env.DOCKER_ENV === 'true') {
    } else {
        // 默认使用编译时生成的配置
        // fileConfig = runtimeConfig;
    }
    const storageType = process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage';
    if (storageType !== 'localstorage') {

    } else {
        // 本地存储直接使用文件配置
        cachedConfig = {
            SiteConfig: {
                SiteName: process.env.SITE_NAME || 'KatelyaTV',
                Announcement:
                    process.env.ANNOUNCEMENT ||
                    '本网站仅提供影视信息搜索服务，所有内容均来自第三方网站。本站不存储任何视频资源，不对任何内容的准确性、合法性、完整性负责。',
                SearchDownstreamMaxPage:
                    Number(process.env.NEXT_PUBLIC_SEARCH_MAX_PAGE) || 5,
                SiteInterfaceCacheTime: fileConfig.cache_time || 7200,
                ImageProxy: process.env.NEXT_PUBLIC_IMAGE_PROXY || '',
                DoubanProxy: process.env.NEXT_PUBLIC_DOUBAN_PROXY || '',
            },
            UserConfig: {
                AllowRegister: process.env.NEXT_PUBLIC_ENABLE_REGISTER === 'true',
                Users: [],
            },
            SourceConfig: Object.entries(fileConfig.api_site).map(([key, site]) => ({
                key,
                name: site.name,
                api: site.api,
                detail: site.detail,
                fullurl: site.fullurl,
                adult: site.adult,
                from: 'config',
                disabled: false,
            })),
        };
    }
}

export async function getConfig() {
    await initConfig();
    return cachedConfig;
}


export async function getCacheTime() {
    const config = await getConfig();
    return config.SiteConfig.SiteInterfaceCacheTime || 7200;
}

export async function getAvailableApiSites(adult = false) {  //: Promise<ApiSite[]>
    const config = await getConfig();
    return config.SourceConfig.filter((s) => {
        return (s.adult == adult || (s.adult == undefined && adult == false) && !s.disabled)
    }).map((s) => ({
        key: s.key,
        name: s.name,
        api: s.api,
        detail: s.detail,
        fullurl: s.fullurl,
    }));
}




export async function searchFromApi(
    apiSite,
    query
) { //: Promise<SearchResult[]> 
    try {
        const apiBaseUrl = apiSite.api;
        let apiUrl =
            apiBaseUrl + API_CONFIG.prep + API_CONFIG.search.path + encodeURIComponent(query);
        const apiName = apiSite.name;

        if (apiSite.fullurl) {
            apiUrl = apiBaseUrl  + API_CONFIG.search.path + encodeURIComponent(query);
        }

        // 添加超时处理
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(apiUrl, {
            headers: API_CONFIG.search.headers,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        //console.log("response", response)

        if (!response.ok) {
            console.log(apiUrl, "response", response)
            return [];
        }

        const data = await response.json();
        if (
            !data ||
            !data.list ||
            !Array.isArray(data.list) ||
            data.list.length === 0
        ) {
            console.log(apiUrl, "data", data)
            return [];
        }

        // 处理第一页结果
        const results = data.list.map((item) => {
            let episodes = [];
            // 使用正则表达式从 vod_play_url 提取 m3u8 链接
            if (item.vod_play_url) {
                const m3u8Regex = /\$(https?:\/\/[^"'\s]+?\.m3u8)/g;
                // 先用 $$$ 分割
                const vod_play_url_array = item.vod_play_url.split('$$$');
                // 对每个分片做匹配，取匹配到最多的作为结果
                vod_play_url_array.forEach((url) => {
                    const matches = url.match(m3u8Regex) || [];
                    if (matches.length > episodes.length) {
                        episodes = matches;
                    }
                });
            }
            episodes = Array.from(new Set(episodes)).map((link) => {
                link = link.substring(1); // 去掉开头的 $
                const parenIndex = link.indexOf('(');
                return parenIndex > 0 ? link.substring(0, parenIndex) : link;
            });
            let info = {
                id: item.vod_id.toString(),
                title: item.vod_name.trim().replace(/\s+/g, ' '),
                poster: item.vod_pic,
                episodes,
                source: apiSite.key,
                source_name: apiName,
                class: item.vod_class,
                year: item.vod_year
                    ? item.vod_year.match(/\d{4}/)?.[0] || ''
                    : 'unknown',
                desc: cleanHtmlTags(item.vod_content || ''),
                type_name: item.type_name,
                douban_id: item.vod_douban_id,
            };
            return info;
        });

        const config = await getConfig();
        const MAX_SEARCH_PAGES = config.SiteConfig.SearchDownstreamMaxPage;

        // 获取总页数
        const pageCount = data.pagecount || 1;
        // 确定需要获取的额外页数
        const pagesToFetch = Math.min(pageCount - 1, MAX_SEARCH_PAGES - 1);

        // 如果有额外页数，获取更多页的结果
        if (pagesToFetch > 0) {
            const additionalPagePromises = [];

            for (let page = 2; page <= pagesToFetch + 1; page++) {
                const pageUrl =
                    apiBaseUrl +
                    API_CONFIG.search.pagePath
                        .replace('{query}', encodeURIComponent(query))
                        .replace('{page}', page.toString());

                const pagePromise = (async () => {
                    try {
                        const pageController = new AbortController();
                        const pageTimeoutId = setTimeout(
                            () => pageController.abort(),
                            8000
                        );

                        const pageResponse = await fetch(pageUrl, {
                            headers: API_CONFIG.search.headers,
                            signal: pageController.signal,
                        });

                        clearTimeout(pageTimeoutId);

                        if (!pageResponse.ok) return [];

                        const pageData = await pageResponse.json();

                        if (!pageData || !pageData.list || !Array.isArray(pageData.list))
                            return [];

                        return pageData.list.map((item) => {
                            let episodes = [];

                            // 使用正则表达式从 vod_play_url 提取 m3u8 链接
                            if (item.vod_play_url) {
                                const m3u8Regex = /\$(https?:\/\/[^"'\s]+?\.m3u8)/g;
                                episodes = item.vod_play_url.match(m3u8Regex) || [];
                            }

                            episodes = Array.from(new Set(episodes)).map((link) => {
                                link = link.substring(1); // 去掉开头的 $
                                const parenIndex = link.indexOf('(');
                                return parenIndex > 0 ? link.substring(0, parenIndex) : link;
                            });

                            return {
                                id: item.vod_id.toString(),
                                title: item.vod_name.trim().replace(/\s+/g, ' '),
                                poster: item.vod_pic,
                                episodes,
                                source: apiSite.key,
                                source_name: apiName,
                                class: item.vod_class,
                                year: item.vod_year
                                    ? item.vod_year.match(/\d{4}/)?.[0] || ''
                                    : 'unknown',
                                desc: cleanHtmlTags(item.vod_content || ''),
                                type_name: item.type_name,
                                douban_id: item.vod_douban_id,
                            };
                        });
                    } catch (error) {
                        return [];
                    }
                })();

                additionalPagePromises.push(pagePromise);
            }

            // 等待所有额外页的结果
            const additionalResults = await Promise.all(additionalPagePromises);

            // 合并所有页的结果
            additionalResults.forEach((pageResults) => {
                if (pageResults.length > 0) {
                    results.push(...pageResults);
                }
            });
        }

        return results;
    } catch (error) {
        return [];
    }
}

// 匹配 m3u8 链接的正则
const M3U8_PATTERN = /(https?:\/\/[^"'\s]+?\.m3u8)/g;

export async function getDetailFromApi(
    apiSite,
    id
) {
    if (apiSite.detail) {
        return handleSpecialSourceDetail(id, apiSite);
    }

    // const detailUrl = `${apiSite.api}${API_CONFIG.detail.path}${id}`;
    let detailUrl = `${apiSite.api}${API_CONFIG.prep}${API_CONFIG.detail.path}${id}`;
    if (apiSite.fullurl) {
        detailUrl = `${apiSite.api}${API_CONFIG.detail.path}${id}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(detailUrl, {
        headers: API_CONFIG.detail.headers,
        signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
        throw new Error(`详情请求失败: ${response.status}`);
    }

    const data = await response.json();

    if (
        !data ||
        !data.list ||
        !Array.isArray(data.list) ||
        data.list.length === 0
    ) {
        throw new Error('获取到的详情内容无效');
    }

    const videoDetail = data.list[0];
    let episodes = [];

    // 处理播放源拆分
    if (videoDetail.vod_play_url) {
        const playSources = videoDetail.vod_play_url.split('$$$');
        if (playSources.length > 0) {
            const mainSource = playSources[0];
            const episodeList = mainSource.split('#');
            episodes = episodeList
                .map((ep) => {
                    const parts = ep.split('$');
                    return parts.length > 1 ? parts[1] : '';
                })
                .filter(
                    (url) =>
                        url && (url.startsWith('http://') || url.startsWith('https://'))
                );
        }
    }

    // 如果播放源为空，则尝试从内容中解析 m3u8
    if (episodes.length === 0 && videoDetail.vod_content) {
        const matches = videoDetail.vod_content.match(M3U8_PATTERN) || [];
        episodes = matches.map((link) => link.replace(/^\$/, ''));
    }

    return {
        id: id.toString(),
        title: videoDetail.vod_name,
        poster: videoDetail.vod_pic,
        episodes,
        source: apiSite.key,
        source_name: apiSite.name,
        class: videoDetail.vod_class,
        year: videoDetail.vod_year
            ? videoDetail.vod_year.match(/\d{4}/)?.[0] || ''
            : 'unknown',
        desc: cleanHtmlTags(videoDetail.vod_content),
        type_name: videoDetail.type_name,
        douban_id: videoDetail.vod_douban_id,
    };
}

async function handleSpecialSourceDetail(
    id,
    apiSite
) {
    const detailUrl = `${apiSite.detail}/index.php/vod/detail/id/${id}.html`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(detailUrl, {
        headers: API_CONFIG.detail.headers,
        signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
        throw new Error(`详情页请求失败: ${response.status}`);
    }

    const html = await response.text();
    let matches = [];

    if (apiSite.key === 'ffzy') {
        const ffzyPattern =
            /\$(https?:\/\/[^"'\s]+?\/\d{8}\/\d+_[a-f0-9]+\/index\.m3u8)/g;
        matches = html.match(ffzyPattern) || [];
    }

    if (matches.length === 0) {
        const generalPattern = /\$(https?:\/\/[^"'\s]+?\.m3u8)/g;
        matches = html.match(generalPattern) || [];
    }

    // 去重并清理链接前缀
    matches = Array.from(new Set(matches)).map((link) => {
        link = link.substring(1); // 去掉开头的 $
        const parenIndex = link.indexOf('(');
        return parenIndex > 0 ? link.substring(0, parenIndex) : link;
    });

    // 提取标题
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const titleText = titleMatch ? titleMatch[1].trim() : '';

    // 提取描述
    const descMatch = html.match(
        /<div[^>]*class=["']sketch["'][^>]*>([\s\S]*?)<\/div>/
    );
    const descText = descMatch ? cleanHtmlTags(descMatch[1]) : '';

    // 提取封面
    const coverMatch = html.match(/(https?:\/\/[^"'\s]+?\.jpg)/g);
    const coverUrl = coverMatch ? coverMatch[0].trim() : '';

    // 提取年份
    const yearMatch = html.match(/>(\d{4})</);
    const yearText = yearMatch ? yearMatch[1] : 'unknown';

    return {
        id,
        title: titleText,
        poster: coverUrl,
        episodes: matches,
        source: apiSite.key,
        source_name: apiSite.name,
        class: '',
        year: yearText,
        desc: descText,
        type_name: '',
        douban_id: 0,
    };
}