import qq from "../core/source/qq.js";
import kugou from "../core/source/kugou.js";
import migu from "../core/source/migu.js";
import wangyi from "../core/source/wangyi.js";
import kuwo from "../core/source/kuwo.js";
import bilibili from "../core/source/bilibili.js";
import at from "../core/source/at.js";
import udio from "../core/source/udio.js";
import youtube from "../core/source/youtube.js";


export class MusicService {
  constructor(config) {
    this.proxy = config.proxy;
    this.baseUrl = config.baseUrl;
  }

  async getQQPlaylist(id, isProxy = false) {
    try {
      let url = `${this.baseUrl}?newsong=1&id=${id}&format=json&inCharset=GB2312&outCharset=utf-8`;

      if (isProxy) {
        url = this.proxy + url;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!data.data || !data.data.cdlist || data.data.cdlist.length === 0) {
        throw new Error('获取歌单数据失败');
      }

      const songlist = Array.from(data.data.cdlist)
        .flatMap(u => u.songlist)
        .map(m => ({
          id: m.id,
          mid: m.mid,
          type: "qq",
          title: m.title,
          name: m.name,
          album: m.album.title,
          singers: Array.from(m.singer).map(c => c.name)
        }));

      return {
        songListName: data.data.cdlist[0].dissname,
        songListId: "qq_" + id,
        nickname: data.data.cdlist[0].nickname,
        logo: data.data.cdlist[0].logo,
        headurl: data.data.cdlist[0].headurl,
        songList: songlist
      };
    } catch (error) {
      throw new Error(`获取QQ音乐歌单失败: ${error.message}`);
    }
  }

  async search(key, page, type, from) {
    if (from == "qq") {
      const qqResult = await qq.search(key,page, type);
      return qqResult
    } else if (from == "kugou") {
      const kugouResult = await kugou.search(key,page, type);
      return kugouResult
    } else if (from == "wangyi") {
      const wangyiResult = await wangyi.search(key,page, type);
      return wangyiResult
    } else if (from == "migu") {
      const miguResult = await migu.search(key,page, type);
      return miguResult
    } else if (from == "kuwo") {
      const kuwoResult = await kuwo.search(key,page, type);
      return kuwoResult
    } else if (from == "bilibili") {
      const bilibiliResult = await bilibili.search(key,page, type);
      return bilibiliResult
    } else if (from == "at") {
      const atResult = await at.search(key,page, type);
      return atResult
    } else if (from == "udio") {
      const udioResult = await udio.search(key,page, type);
      return udioResult
    } else if (from == "youtube") {
      const youtubeResult = await youtube.search(key,page, type);
      return youtubeResult
    } else {
      throw new Error("不支持的来源"+from);
    }
  }

  async playMusic(id,quality,from) {
    console.log("playMusic",id,quality,from)
    if (from == "qq") {
      const qqResult = await qq.getMediaSource({id},quality);
      return qqResult
    } else if (from == "kugou") {
      const kugouResult = await kugou.getMediaSource({id},quality);
      return kugouResult
    } else if (from == "migu") {
      const miguResult = await migu.getMediaSource({id},quality);
      return miguResult
    } else if (from == "wangyi") {
      const wangyiResult = await wangyi.getMediaSource({id},quality);
      return wangyiResult
    } else if (from == "kuwo") {
      const kuwoResult = await kuwo.getMediaSource({id},quality);
      return kuwoResult
    } else if (from == "bilibili") {
      const bilibiliResult = await bilibili.getMediaSource({id},quality);
      return bilibiliResult
    } else if (from == "at") {
      const atResult = await at.getMediaSource({id},quality);
      return atResult
    } else if (from == "udio") {
      const udioResult = await udio.getMediaSource({id},quality);
      return udioResult
    } else if (from == "youtube") {
      const youtubeResult = await youtube.getMediaSource({id},quality);
      return youtubeResult
    } else {
      throw new Error("不支持的来源");
    }
  }

  async songList(url,from){
    if (from == "qq") {
      const qqResult = await qq.importMusicSheet(url);
      return qqResult
    } else if (from == "kugou") {
      const kugouResult = await kugou.importMusicSheet(url);
      return kugouResult
    } else if (from == "migu") {
      const miguResult = await migu.importMusicSheet(url);
      return miguResult
    } else if (from == "youtube") {
      const youtubeResult = await youtube.importMusicSheet(url);
      return youtubeResult
    } else if (from == "kuwo") {
      const kuwoResult = await kuwo.importMusicSheet(url);
      return kuwoResult
    } else if (from == "bilibili") {
      const bilibiliResult = await bilibili.importMusicSheet(url);
      return bilibiliResult
    } else if (from == "wangyi") {
      const wangyiResult = await wangyi.importMusicSheet(url);
      return wangyiResult
    } else if (from == "at") {
      const atResult = await at.importMusicSheet(url);
      return atResult
    } 
  }

  async getTopLists(from){
    if (from == "kuwo") {
      const kuwoResult = await kuwo.getTopLists();
      return kuwoResult
    }else if (from == "wangyi") {
      const wangyiResult = await wangyi.getTopLists();
      return wangyiResult
    }
  }
  
  async getTopListDetail(from,id){
    if (from == "kuwo") {
      const kuwoResult = await kuwo.getTopListDetail({id});
      return kuwoResult
    }else if (from == "wangyi") {
      const wangyiResult = await wangyi.getTopListDetail({id});
      return wangyiResult
    }
  }
}

export default MusicService;
