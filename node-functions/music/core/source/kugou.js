// const axios = require('axios');
// const CryptoJS = require('crypto-js');
// const he = require('he');
// const cheerio = require('cheerio');

import axios from 'axios';
import CryptoJS from 'crypto-js';
import he from 'he';
// import cheerio from 'cheerio'; // 暂时注释，未使用

const platform = "酷狗音乐";
const author = "公众号:科技长青";
const version = "0.1.0";

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': '*/*',
  'Accept-Encoding': 'gzip, deflate',
  'Accept-Language': 'zh-CN,zh;q=0.9'
};

// 搜索函数
async function search(query, page, type) {
  switch (type) {
    case 'music':
      return await searchMusic(query, page);
    case 'album':
      return await searchAlbum(query, page);
    case 'playlist':
      return await searchMusicSheet(query, page);
    default:
      throw new Error('不支持的搜索类型');
  }
}

const qualityLevels = {
  low: '128',
  standard: '320',
  high: 'flac',
  super: 'high'
};

// 获取播放源
async function getMediaSource2(musicInfo, quality) {
  let url = 'https://music-api2.cenguigui.cn/?kg&id=' + musicInfo.id + "&type=song&level=" + qualityLevels[quality]
  const response = await axios.get(url);
  const data = response.data;
  console.log("kugou", data)
  return {
    'url': data.data.play_url
  };
}

async function getMediaSource(musicInfo, qua) {
  let quality = {
    low: "128k",
    high: "flac",
    standard: "320k",
    super: "flac24bit"
  }
  let url = `https://88.lxmusic.xn--fiqs8s/lxmusicv3/url/kg/${musicInfo.id}/${quality[qua]}`
  const response = await axios.get(url);
  const data = response.data;
  // console.log("kugou", data)
  return {
    'url': data.data
  };

}

// 获取歌词
async function getLyric(musicItem) {
  const infoResponse = await axios.get(
    `http://krcs.kugou.com/search?ver=1&man=yes&client=mobi&keyword=&duration=&hash=${musicItem.id}`,
    { headers }
  );

  const lyricInfo = infoResponse.data.candidates[0];
  const lyricResponse = await axios.get(
    `http://lyrics.kugou.com/download?ver=1&client=iphone&id=${lyricInfo.id}&accesskey=${lyricInfo.accesskey}&fmt=lrc&charset=utf8`,
    { headers }
  );

  const decodedLyric = he.decode(
    CryptoJS.enc.Base64.parse(lyricResponse.data.content).toString(CryptoJS.enc.Utf8)
  );

  return {
    rawLrc: decodedLyric
  };
}

// 搜索音乐
async function searchMusic(query, page = 1) {
  const response = await axios.get(
    `http://mobilecdn.kugou.com/api/v3/search/song?format=json&keyword=${encodeURIComponent(query)}&page=${page}&pagesize=20`,
    { headers }
  );

  return {
    data: response.data.data.info.map(item => ({
      id: item.hash,
      title: item.songname,
      artist: item.singername,
      album: item.album_name,
      duration: item.duration * 1000,
      artwork: item.imgUrl?.replace('{size}', '400')
    }))
  };
}

// 搜索专辑
async function searchAlbum(query, page = 1) {
  const response = await axios.get(
    `http://mobilecdn.kugou.com/api/v3/search/album?format=json&keyword=${encodeURIComponent(query)}&page=${page}&pagesize=20`,
    { headers }
  );

  return {
    data: response.data.data.info.map(item => ({
      id: item.albumid,
      title: item.albumname,
      artist: item.singername,
      artwork: item.imgUrl?.replace('{size}', '400'),
      date: item.publishtime
    }))
  };
}

// 搜索歌单
async function searchMusicSheet(query, page = 1) {
  const response = await axios.get(
    `http://mobilecdn.kugou.com/api/v3/search/special?format=json&keyword=${encodeURIComponent(query)}&page=${page}&pagesize=20`,
    { headers }
  );

  return {
    data: response.data.data.info.map(item => ({
      id: item.specialid,
      title: item.specialname,
      artist: item.nickname,
      artwork: item.imgurl?.replace('{size}', '400'),
      playCount: item.playcount
    }))
  };
}

// 获取排行榜列表
async function getTopLists() {
  const response = await axios.get(
    'http://mobilecdn.kugou.com/api/v3/rank/list?format=json',
    { headers }
  );

  return response.data.data.map(item => ({
    id: item.rankid,
    title: item.rankname,
    description: item.intro
  }));
}

// 获取排行榜详情
async function getTopListDetail(listId) {
  const response = await axios.get(
    `http://mobilecdn.kugou.com/api/v3/rank/info?format=json&rankid=${listId}`,
    { headers }
  );

  return {
    data: response.data.data.info.map(item => ({
      id: item.hash,
      title: item.filename,
      artist: item.singername,
      album: item.album_name,
      duration: item.duration * 1000,
      artwork: item.imgUrl?.replace('{size}', '400')
    }))
  };
}

// 获取专辑信息
async function getAlbumInfo(albumId) {
  const response = await axios.get(
    `http://mobilecdn.kugou.com/api/v3/album/info?format=json&albumid=${albumId}`,
    { headers }
  );

  return {
    data: response.data.data.info.map(item => ({
      id: item.hash,
      title: item.filename,
      artist: item.singername,
      album: response.data.data.albumname,
      duration: item.duration * 1000,
      artwork: response.data.data.imgurl?.replace('{size}', '400')
    }))
  };
}

// 导入歌单
async function importMusicSheet(urlOrId) {
  let specialId = urlOrId;

  // 如果是URL，提取歌单ID
  if (urlOrId.includes('kugou.com')) {
    const match = urlOrId.match(/special\/single\/(\d+)/);
    if (match) {
      specialId = match[1];
    }
  }

  const response = await axios.get(
    `http://mobilecdn.kugou.com/api/v3/special/info?format=json&specialid=${specialId}`,
    { headers }
  );

  console.log("importMusicSheet", response.data)

  return {
    title: response.data.data.specialname,
    data: response.data.data.info.map(item => ({
      id: item.hash,
      title: item.filename,
      artist: item.singername,
      album: item.album_name,
      duration: item.duration * 1000,
      artwork: item.imgurl?.replace('{size}', '400')
    }))
  };
}

// 提取歌单ID
async function importMusicSheet2(url) {

  const match = url.match(/^(?:.*?)(\d+)(?:.*?)$/);
  const sheetId = match?.[1];

  if (!sheetId) return [];

  let importedSongs = [];

  // 获取歌单信息
  const commandResponse = await axios.get('http://t.kugou.com/command/', {
    params: {
      appid: 1001,
      clientver: 9028,
      mid: '78779687',
      clienttime: Math.floor(Date.now() / 1000),
      key: 'eb7c7338c6899c77af2d5e56c6e2f8d5',
      data: sheetId
    }
  });

  if (commandResponse.status === 200 && commandResponse.data.status === 1) {
    const sheetInfo = commandResponse.data.data;

    // 获取歌单详情
    const detailResponse = await axios.get('http://t.kugou.com/command/', {
      params: {
        appid: 1001,
        clientver: 10112,
        mid: '70a02aad1ce4648e7dca77f2afa7b182',
        clienttime: Math.floor(Date.now() / 1000),
        key: '381d7062030e8a5a94cfbe50bfe65433',
        data: {
          id: sheetInfo.info.id,
          type: 3,
          userid: sheetInfo.info.userid,
          collect_type: sheetInfo.info.collect_type,
          page: 1,
          pagesize: sheetInfo.info.songcount
        }
      }
    });

    if (detailResponse.status === 200 && detailResponse.data.status === 1) {
      // 批量获取歌曲信息
      const songHashes = detailResponse.data.data.list.map(song => song.hash);
      const batchResponse = await axios.post(
        'http://media.store.kugou.com/v1/get_res_privilege',
        {
          appid: 1001,
          area_code: '1',
          behavior: 'play',
          clientver: '10112',
          dfid: '3xV0R3',
          mid: '70a02aad1ce4648e7dca77f2afa7b182',
          need_hash_offset: 1,
          relate: 1,
          resource: songHashes.map(hash => ({
            album_audio_id: 0,
            album_id: '0',
            hash: hash,
            id: 0,
            name: '',
            page_id: 0,
            type: 'audio'
          })),
          token: '',
          userid: '0',
          vip: 0
        },
        {
          headers: {
            'x-router': 'media.store.kugou.com'
          }
        }
      );

      if (batchResponse.status === 200) {
        importedSongs = batchResponse.data.data.map(formatImportMusicItem);
      }
    }
  }

  return importedSongs;
}

// 导出模块
export default {
  platform,
  version,
  author,
  srcUrl: 'http://music.haitangw.net/cqapi/kg.js',
  cacheControl: 'no-cache',
  primaryKey: ['id', 'album_id', 'album_audio_id'],
  hints: {
    importMusicSheet: [
      '1. 支持酷狗歌单链接导入',
      '2. 也支持直接输入歌单ID'
    ]
  },
  supportedSearchType: ['music', 'album', 'playlist'],
  search,
  getMediaSource,
  getLyric,
  getTopLists: getTopLists,
  getTopListDetail: getTopListDetail,
  getAlbumInfo: getAlbumInfo,
  importMusicSheet: importMusicSheet
};