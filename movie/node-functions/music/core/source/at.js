  // 需要确保 cheerio 和 axios 已导入
  import * as cheerio from "cheerio";
  import axios from "axios";

  const headers = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36 Edg/89.0.774.63",
    accept: "*/*",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
};

export default {
    // 插件名称
    platform: "爱听",
    // 插件作者
    author: "SoEasy同学",
    // 插件版本号
    version: "0.1.0",
    // 插件更新地址
    srcUrl: "https://gitee.com/kevinr/tvbox/raw/master/musicfree/plugins/at.js",
    // 缓存策略
    cacheControl: "no-cache",
    // 支持的搜索类型
    supportedSearchType: ["music", "album", "artist"],
    
    // 搜索
    async search(query, page, type) {
      const host = "http://www.2t58.com";
      
      if (type === "music") {
        let keyword = encodeURIComponent(query);
        let searchUrl = host + "/so/" + keyword + "/" + page + ".html";
        let searchRes = (await axios.get(searchUrl,{
          headers,
          // httpsAgent:"127.0.0.1:1080"
        })).data;
        
        const $ = cheerio.load(searchRes);
        const total = $("div.play_list").find("span").text();
        let isEnd = true;
        
        let songList = await parseSearchResult(searchRes, " - ");
        
        if (total !== "" && !isNaN(Number(total))) {
          isEnd = Number(total) <= page * 68;
        }
        
        const songs = songList.map(formatMusicItem);
        return {
          isEnd: isEnd,
          data: songs
        };
      } else if (type === "album") {
        return {
          isEnd: true,
          data: []
        };
      } else if (type === "artist") {
        return {
          isEnd: true,
          data: []
        };
      }
    },
    
    // 获取音乐的真实 url
    async getMediaSource(musicItem, quality) {
      const host = "http://www.2t58.com";
      let header = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": host + `/song/${musicItem.id}.html`
      };
      
      let mp3Result = (await axios({
        method: "post",
        url: host + `/js/play.php`,
        headers: header,
        data: `id=${musicItem.id}&type=music`
      })).data;
      
      if (mp3Result.url) {
        return {
          url: mp3Result.url,
          quality: quality
        };
      }
      
      return {
        url: ""
      };
    },
    
    // 获取歌词
    async getLyric(musicItem) {
      const host = "http://www.2t58.com";
      let res = (await axios({
        method: "get",
        url: host + "/plug/down.php?ac=music&lk=lrc&id=" + musicItem.id,
        timeout: 10000
      })).data;
      
      res = res.replace("www.44h4.com", "")
              .replace("www.2t58.com", "")
              .replace("44h4", "****")
              .replace("2t58", "****")
              .replace("欢迎来访", "")
              .replace("爱听音乐网", "");
      
      return {
        rawLrc: res
      };
    },
    
    // 获取歌单详情
    async getMusicSheetInfo(sheetItem, page) {
      const host = "http://www.2t58.com";
      let result = {};
      let urlSearch = host + "/playlist/" + sheetItem.id + "/" + page + ".html";
      let searchRes = (await axios.get(urlSearch)).data;
      
      const $ = cheerio.load(searchRes);
      result.sheetItem = {
        description: $(".info").text()
      };
      
      let songList = await parseSearchResult(searchRes, " - ");
      result.musicList = songList;
      result.isEnd = songList.length < 68;
      
      return result;
    },
    
    // 获取榜单列表
    async getTopLists() {
      const host = "http://www.2t58.com";
      const html = (await axios.get(host + "/list/top.html")).data;
      let topList = await parseTopList(html);
      
      return [
        {
          title: "官方榜单",
          data: topList.map(item => {
            return {
              id: item.id,
              title: item.title,
              description: item.description
            };
          })
        }
      ];
    },
    
    // 获取榜单详情
    async getTopListDetail(topListItem, page) {
      const host = "http://www.2t58.com";
      var result = {
        ...topListItem
      };
      
      var musicList = [];
      let urlSearch = host + "/list/" + topListItem.id + "/" + page + ".html";
      let searchRes = (await axios.get(urlSearch)).data;
      let songList = await parseSearchResult(searchRes, "_");
      
      songList = songList.map(item => {
        return {
          id: item.id,
          title: item.title,
          artist: item.artist
        };
      });
      
      result.musicList = songList;
      result.isEnd = songList.length < 68;
      
      return result;
    },
    
    // 获取推荐歌单 tag
    async getRecommendSheetTags() {
      const host = "http://www.2t58.com";
      try {
        var result = {};
        var datas = [];
        var pinned = [];
        
        const html = (await axios.get(host + "/playtype/index.html")).data;
        const $ = cheerio.load(html);
        const tagList = $("div.ilingku_fl");
        
        for (let i = 0; i < tagList.length; i++) {
          var tag = $(tagList[i]).find("li:first-child").text().replace(":", "");
          var group = {};
          group.title = tag;
          
          var secondTag = [];
          const secondTagList = $(tagList[i]).find("a");
          
          for (let j = 0; j < secondTagList.length; j++) {
            var item = {
              id: $(secondTagList[j]).attr("href").match(/\/playtype\/(.*?).html/)[1],
              title: $(secondTagList[j]).text()
            };
            secondTag.push(item);
            
            if (j == 0) {
              pinned.push(item);
            }
          }
          
          group.data = secondTag;
          datas.push(group);
        }
        
        result.data = datas;
        result.pinned = pinned;
        return result;
      } catch (e) {
        console.log(e);
        return {};
      }
    },
    
    // 获取某个 tag 下的所有歌单
    async getRecommendSheetsByTag(tag, page) {
      const host = "http://www.2t58.com";
      try {
        var result = {};
        var sheets = [];
        var id = tag.id !== "" ? tag.id : "index";
        var searchUrl = host + "/playtype/" + id + "/" + page + ".html";
        
        const html = (await axios.get(searchUrl)).data;
        const $ = cheerio.load(html);
        const sheetList = $("div.video_list").find("li");
        
        for (let i = 0; i < sheetList.length; i++) {
          sheets.push({
            id: $(sheetList[i]).find(".pic a").attr("href").match(/\/playlist\/(.*?).html/)[1],
            title: $(sheetList[i]).find(".name a").text(),
            artwork: $(sheetList[i]).find(".pic a img").attr("src")
          });
        }
        
        result.data = sheets;
        result.isEnd = sheets.length < 30;
        return result;
      } catch (e) {
        console.log(e);
        return {};
      }
    }
  };
  
  // 工具函数
  async function parseSearchResult(rawData, separator) {
    const $ = cheerio.load(rawData);
    const rawPlayList = $("div.play_list").find("li");
    var list = [];
    
    for (let i = 0; i < rawPlayList.length; i++) {
      const item = $(rawPlayList[i]).find("a");
      let id = $(item[0]).attr("href").match(/\/song\/(.*?).html/)[1];
      let separatedText = $(item[0]).text().split(separator);
      let artist = separatedText[0];
      let title = separatedText[1] != "" ? separatedText[1] : separatedText[2];
      
      list.push({
        id: id,
        title: title,
        artist: artist
      });
    }
    
    return list;
  }
  
  async function parseTopList(html) {
    const $ = cheerio.load(html);
    const rawPlayList = $("div.ilingku_fl").find("li");
    const pageData = $("div.pagedata").text();
    
    let topListArr = [];
    topListArr.push({
      id: "new",
      title: "新歌榜",
      description: "每日同步官方数据。" + pageData
    }, {
      id: "top",
      title: "飙升榜",
      description: "每日同步官方数据。" + pageData
    });
    
    for (let i = 0; i < rawPlayList.length; i++) {
      const item = $(rawPlayList[i]).find("a");
      let href = $(item[0]).attr("href").match(/\/list\/(.*?).html/)[1];
      let title = $(item[0]).text();
      
      topListArr.push({
        id: href,
        title: title,
        description: "每日同步官方数据：" + pageData
      });
    }
    
    return topListArr;
  }
  
  function formatMusicItem(item) {
    return {
      id: item.id,
      artist: item.artist,
      title: item.title,
      album: item.album,
      duration: item.duration,
      artwork: item.artwork
    };
  }
  
