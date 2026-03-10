// const axios = require('axios');
// const he = require('he');

import axios from 'axios';
import he from 'he';

const platform = "酷我音乐";
const author = "公众号:科技长青";
const version = "0.1.0";
const pageSize = 30;

// 工具函数
function artworkShort2Long(url) {
    if (!url) return undefined;
    const index = url.indexOf('/');
    return index !== -1 ? 'http://' + url.substring(index) : undefined;
}

function formatMusicItem(item) {
    return {
        id: item.MUSICRID.replace(/\D/g, ''),
        artwork: artworkShort2Long(item.web_albumpic_short),
        title: he.decode(item.NAME || ''),
        artist: he.decode(item.ARTIST || ''),
        album: he.decode(item.ALBUM || ''),
        albumId: item.ALBUMID,
        artistId: item.ARTISTID,
        formats: item.FORMATS
    };
}

function formatAlbumItem(item) {
    return {
        id: item.albumid,
        artist: he.decode(item.artist || ''),
        title: he.decode(item.album || ''),
        artwork: item.img || artworkShort2Long(item.pic),
        description: he.decode(item.info || ''),
        date: item.pub,
        artistId: item.artistid
    };
}

function formatArtistItem(item) {
    return {
        id: item.artistid,
        avatar: item.pic,
        name: he.decode(item.name || ''),
        artistId: item.artistid,
        description: he.decode(item.desc || ''),
        worksNum: item.musicNum
    };
}

// 搜索功能
async function searchMusic(query, page = 1) {
    const response = await axios.get('http://search.kuwo.cn/r.s', {
        params: {
            client: 'kt',
            all: query,
            pn: page - 1,
            rn: pageSize,
            uid: 2573470584,
            ver: 'MUSIC_9.1.1.2_BCS2',
            vipver: 1,
            ft: 'music',
            cluster: 0,
            strategy: 2012,
            encoding: 'utf8',
            rformat: 'json',
            vermerge: 1,
            mobi: 1
        }
    });
    
    return {
        isEnd: (parseInt(response.data.PN) + 1) * pageSize >= parseInt(response.data.TOTAL),
        data: response.data.abslist.map(formatMusicItem)
    };
}

async function searchAlbum(query, page = 1) {
    const response = await axios.get('http://search.kuwo.cn/r.s', {
        params: {
            all: query,
            ft: 'album',
            itemset: 'web_2013',
            client: 'kt',
            pn: page - 1,
            rn: pageSize,
            rformat: 'json',
            encoding: 'utf8',
            pcjson: 1
        }
    });
    
    return {
        isEnd: (parseInt(response.data.PN) + 1) * pageSize >= parseInt(response.data.TOTAL),
        data: response.data.abslist.map(formatAlbumItem)
    };
}

async function searchArtist(query, page = 1) {
    const response = await axios.get('http://search.kuwo.cn/r.s', {
        params: {
            all: query,
            ft: 'artist',
            itemset: 'web_2013',
            client: 'kt',
            pn: page - 1,
            rn: pageSize,
            rformat: 'json',
            encoding: 'utf8',
            pcjson: 1
        }
    });
    
    return {
        isEnd: (parseInt(response.data.PN) + 1) * pageSize >= parseInt(response.data.TOTAL),
        data: response.data.abslist.map(formatArtistItem)
    };
}

// 获取播放源
async function getMediaSource(musicItem, quality = 'standard') {
    const qualityLevels = {
        low: '128kmp3',
        standard: '320kmp3', 
        high: 'flac',
        super: 'high'
    };

    let url = `http://musicapi.haitangw.net/music/kw.php?id=${musicItem.id}&quality=${qualityLevels[quality]}`
    let url2 = `http://musicapi.haitangw.net/music/qq_song_kw.php?id=${musicItem.id}&type=json&level=exhigh`
    
    const response = await axios.get(url);

    // console.log("url",url,"response",response.data)
    
    return {
        url: response.data.data.url
    };
}

// 获取歌词
async function getLyric(musicItem) {
    const response = await axios.get('http://m.kuwo.cn/newh5/singles/songinfoandlrc', {
        params: {
            musicId: musicItem.id,
            httpStatus: 1
        }
    });
    
    const lrcList = response.data.data.lrclist;
    return {
        rawLrc: lrcList.map(item => '[' + item.time + ']' + item.lineLyric).join('\n')
    };
}

// 获取歌单响应数据
async function getMusicSheetResponseById(playlistId, pageNumber, pageSize = 50) {
    return (await axios.get(
        "http://wapi.kuwo.cn/api/www/playlist/playListInfo", 
        {
            params: {
                op: "getlistinfo",
                pid: playlistId,
                pn: pageNumber - 1,  // API页码从0开始
                rn: pageSize,
                encode: "utf8",
                keyset: "pl2012",
                vipver: "MUSIC_9.1.1.2_BCS2",
                newver: 1,
            }
        }
    )).data;
}

// 导入酷我音乐歌单
async function importMusicSheet(inputUrl) {
    let playlistId = null;
    
    // 解析歌单ID
    // 1. 桌面版URL: https://www.kuwo.cn/playlist_detail/123456
    let urlMatch = inputUrl.match(/https?:\/\/www\.kuwo\.cn\/playlist_detail\/(\d+)/);
    if (urlMatch?.[1]) {
        playlistId = urlMatch[1];
    }
    
    // 2. 手机版URL: https://m.kuwo.cn/h5app/playlist/123456  
    if (!playlistId) {
        urlMatch = inputUrl.match(/https?:\/\/m\.kuwo\.cn\/h5app\/playlist\/(\d+)/);
        if (urlMatch?.[1]) {
            playlistId = urlMatch[1];
        }
    }
    
    // 3. 纯数字ID
    if (!playlistId) {
        urlMatch = inputUrl.match(/^\s*(\d+)\s*$/);
        if (urlMatch?.[1]) {
            playlistId = urlMatch[1];
        }
    }
    
    if (!playlistId) {
        return [];
    }
    
    // 分页获取歌曲数据
    let currentPage = 1;
    let totalPages = 30;  // 最多30页
    let allSongs = [];
    
    while (currentPage <= totalPages) {
        try {
            const pageData = await getMusicSheetResponseById(
                playlistId, 
                currentPage, 
                80  // 每页80首
            );

            console.log("pageData",pageData.data.musicList[0])
            console.log("pageData",pageData.data.musicList.length)
            
            // 计算实际总页数
            if (currentPage === 1 && pageData.data.total) {
                totalPages = Math.ceil(pageData.data.total / 80);
                if (isNaN(totalPages)) totalPages = 1;
            }

            
            
            // 格式化歌曲数据
            if (pageData.data.musicList?.length) {
                const songs = pageData.data.musicList.map(song => ({
                    id: song.rid,
                    title: he.decode(song.name || ''),
                    artist: he.decode(song.artist || ''),
                    album: he.decode(song.album || ''),
                    albumId: song.albumid,
                    artistId: song.artistid,
                    formats: song.formats,
                    pic: song.pic,
                    pic120: song.pic120,
                    albumpic:song.albumpic,
                    
                }));
                
                allSongs = allSongs.concat(songs);
            }
            
            
        } catch (error) {
            console.error(`获取第 ${currentPage} 页失败:`, error.message);
        }
        
        
        // 延迟避免请求过频
        await new Promise(resolve => {
            setTimeout(() => resolve(), 200 + Math.random() * 100);
        });
        
        currentPage++;
    }
    console.log("totalPages",totalPages)
    console.log("allSongs",allSongs.length)
    
    return allSongs;
}

/**
 * 获取排行榜列表
 * @returns {Promise<Array>} 排行榜数据
 */
async function getTopLists() {
    try {
        // 请求酷我音乐的排行榜API
        const response = await axios.get("http://wapi.kuwo.cn/api/pc/bang/list");
        const bangList = response.data.child;
        
        // 处理排行榜数据结构
        return bangList.map((category) => ({
            title: category.disname,
            data: category.child.map((bangItem) => {
                var coverImg;
                
                // 优先使用 pic5，如果不存在则使用 pic2，最后使用 pic
                if (bangItem.pic5 && bangItem.pic5 !== null && bangItem.pic5 !== undefined) {
                    coverImg = bangItem.pic5;
                } else if (bangItem.pic2 && bangItem.pic2 !== null && bangItem.pic2 !== undefined) {
                    coverImg = bangItem.pic2;
                } else {
                    coverImg = bangItem.pic;
                }
                
                return {
                    id: bangItem.sourceid,
                    coverImg: coverImg,
                    title: bangItem.name,
                    description: bangItem.intro
                };
            })
        }));
    } catch (error) {
        console.error('获取排行榜列表失败:', error);
        throw error;
    }
}

/**
 * 获取排行榜详情
 * @param {Object} topList - 排行榜对象，包含id属性
 * @returns {Promise<Object>} 排行榜详情数据
 */
async function getTopListDetail(topList) {
    try {
        // 请求酷我音乐排行榜详情API
        const response = await axios.get("http://wapi.kuwo.cn/api/pc/bang/info", {
            params: {
                from: "pc",
                fmt: "json",
                pn: 0,           // 页码从0开始
                rn: 80,          // 每页返回80条数据
                type: "top",     // 类型为排行榜
                data: "content", // 返回内容数据
                id: topList.id,  // 排行榜ID
                show_copyright_off: 0,
                pcmp4: 1,
                isbang: 1,
                userid: 0,
                httpStatus: 1
            }
        });
        
        // 合并基础信息和音乐列表
        return Object.assign(Object.assign({}, topList), {
            musicList: response.data.musiclist.map((song) => {
                return {
                    id: song.id,
                    title: he.decode(song.name || ""),
                    artist: he.decode(song.artist || ""),
                    album: he.decode(song.album || ""),
                    albumId: song.albumid,
                    artistId: song.artistid,
                    formats: song.formats
                };
            })
        });
    } catch (error) {
        console.error('获取排行榜详情失败:', error);
        throw error;
    }
}

// 导出模块
export default {
    platform,
    version,
    author,
    srcUrl: 'http://music.haitangw.net/cqapi/kw.js',
    cacheControl: 'no-cache',
    hints: {
        importMusicSheet: [
            '支持酷我歌单链接导入',
            'H5：复制URL并粘贴，或者直接输入纯数字歌单ID即可',
            '导入时间和歌单大小有关，请耐心等待'
        ]
    },
    supportedSearchType: ['music', 'album', 'artist', 'playlist'],
    search: async function(query, page, type) {
        switch (type) {
            case 'music':
                return await searchMusic(query, page);
            case 'album':
                return await searchAlbum(query, page);
            case 'artist':
                return await searchArtist(query, page);
            case 'playlist':
                // 歌单搜索实现
                return { isEnd: true, data: [] };
            default:
                return { isEnd: true, data: [] };
        }
    },
    getMediaSource,
    getLyric,
    getAlbumInfo: async function(albumItem) {
        // 获取专辑详情实现
        return { musicList: [] };
    },
    getArtistWorks: async function(artistItem, page, type) {
        // 获取歌手作品实现
        return { isEnd: true, data: [] };
    },
    importMusicSheet: importMusicSheet,
    getRecommendSheetTags: async function() {
        // 获取推荐歌单标签
        return { data: [], pinned: [] };
    },
    getRecommendSheetsByTag: async function(tag, page) {
        // 根据标签获取推荐歌单
        return { isEnd: true, data: [] };
    },
    getMusicSheetInfo: async function(sheetItem, page) {
        // 获取歌单详情
        return { isEnd: true, musicList: [] };
    },
    getTopLists: getTopLists,
    getTopListDetail: getTopListDetail,
};