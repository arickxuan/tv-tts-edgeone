import MusicService from '../service/musicService.js';
import S3Service from '../service/s3Service.js';
import config from '../config/app.js';
import { mergeSongList, getCleanTitle } from '../core/utils/string.js';
import { downloadFile, downloadFileSync } from '../core/utils/download.js';

import axios from 'axios';

class MusicController {
  constructor() {
    this.MusicService = new MusicService(config.qq);
    this.s3Service = new S3Service(config.s3[0]);
  }

  // 获取QQ音乐歌单
  async getPlaylist(req, res) {
    try {
      const { id } = req.params;
      const { proxy } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "歌单ID不能为空"
        });
      }

      const isProxy = proxy === 'true';
      const playlist = await this.MusicService.getQQPlaylist(id, isProxy);

      const prefix = `music/`;

      const s3SongListObj = await this.s3Service.s3SongList(prefix)

      const mergeSongListObj = mergeSongList(playlist, s3SongListObj);

      const fileName = prefix + `qq_${id}.json`;
      const content = JSON.stringify(mergeSongListObj);
      // let re = await this.s3Service.putFile(fileName, content);
      // console.log("re", re)

      res.json({
        success: true,
        data: mergeSongListObj,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }


  //缺失的歌曲
  async missSong(req, res) {
    const { id } = req.params;
    const { isdownload, uptos3 } = req.query;

    const playlist = await this.MusicService.getQQPlaylist(id);

    const prefix = `music/`;

    const s3SongListObj = await this.s3Service.s3SongList(prefix)

    const mergeSongListObj = mergeSongList(playlist, s3SongListObj);

    const missSongs = mergeSongListObj.songList.filter(item => !item.url);
    if (!isdownload) {
      res.json({
        code: 0,
        success: true,
        data: missSongs
      });
      return
    }
    console.log("missSongs", missSongs.length)
    let pathUrls = []

    // 使用 for...of 循环来正确处理异步操作
    for (const item of missSongs) {
      try {
        let re = await this.MusicService.playMusic(item.mid, 'standard', item.type);
        if (re.url) {
          let file = await downloadFileSync(re.url, `./music`)
          pathUrls.push(file)
          // console.log("file",file)

          if (uptos3) {
            let exname = file.filePath.split(".")[1]
            let key = prefix + item.title + "-" + item.singers.join("、") + "." + exname
            console.log("key", key)
            let isUpload = await this.s3Service.putFilePath(key, file.filePath)
            console.log("isUpload", isUpload)
            if (isUpload) {
              item.url = this.s3Service.GetFileURL(file.filePath)
            }
          }
        }
      } catch (error) {
        console.error(`处理歌曲失败 ${item.title}:`, error.message)
      }
    }

    console.log("pathUrls", pathUrls.length, "missSongs", missSongs.length - pathUrls.length)

    res.json({
      code: 0,
      success: true,
      data: missSongs
    });
  }

  //缺失的歌曲 搜索下载
  async missSongSearchDownload(req, res) {
    const { id } = req.params;
    const { isdownload, uptos3 } = req.query;

    const playlist = await this.MusicService.getQQPlaylist(id);

    const prefix = `music/`;

    const s3SongListObj = await this.s3Service.s3SongList(prefix)

    const mergeSongListObj = mergeSongList(playlist, s3SongListObj);

    const missSongs = mergeSongListObj.songList.filter(item => !item.url);
    if (!isdownload) {
      res.json({
        code: 0,
        success: true,
        data: missSongs
      });
      return
    }
    console.log("missSongs", missSongs.length)
    let pathUrls = []

    for (const item of missSongs) {
      let re = await this.searchDownload(getCleanTitle(item.title), item.singers);
      // console.log("re", re)
      if (re && re.url) {
        let file = await downloadFileSync(re.url, `./music`)
        pathUrls.push(file)
        if (uptos3) {
          let exname = file.filePath.split(".")[1]
          let key = prefix + item.title + "-" + item.singers.join("、") + "." + exname
          console.log("key", key)
          let isUpload = await this.s3Service.putFilePath(key, file.filePath)
          // console.log("isUpload", isUpload)
          if (isUpload) {
            item.url = this.s3Service.GetFileURL(file.filePath)
          }
        }
      }
    }

    res.json({
      code: 0,
      success: true,
      data: missSongs
    });
  }

  //搜索下载
  async searchDownload(key, singers) {
    let froms = ['kuwo', 'kugou', 'wangyi', 'qq']
    for (const from of froms) {
      const result = await this.MusicService.search(key, 1, 'music', from);
      // console.log("result", result.data.length,key,singers)
      if (result.data.length > 0) {
        for (const item of result.data) {
          //           id: title: artist: 
          // console.log("item", item,singers,key)
          if (singers.every(word => item.artist.includes(word))) {
            // console.log("item", item)
            if (getCleanTitle(item.title) == key) {
              item.from = from;
              const url = await this.MusicService.playMusic(item.id, 'standard', from);
              // console.log("url", url)
              item.url = url.url;
              return item;
            }

          }
        }
      }
    }

    // 歌手不严格匹配
    for (const from of froms) {
      const result = await this.MusicService.search(key, 1, 'music', from);
      if (result) {
        for (const item of result) {
          //           id: title: artist: 
          if (singers.some(word => item.artist.includes(word))) {
            if (getCleanTitle(item.title) == key) {
              item.from = from;
              const url = await this.MusicService.playMusic(item.id, 'standard', from);
              item.url = url;
              return item;
            }

          }

        }
      }
    }
    return null;
  }

  //搜索
  async search(req, res) {
    try {
      let { key, page, type, from } = req.query;
      if (key === null) {
        return res.status(400).json({
          success: false,
          message: "搜索关键词不能为空"
        });
      }
      page = parseInt(page) || 1;
      type = type || "music";
      from = from || "qq";
      const result = await this.MusicService.search(key, page, type, from);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.log(error)
      res.status(500).json({})
    }
  }

  //播放音乐
  async playMusic(req, res) {
    try {
      let { id, quality, from } = req.query;
      console.log("playMusic", id, quality, from)
      quality = quality || "standard";
      from = from || "qq";
      const result = await this.MusicService.playMusic(id, quality, from);
      res.json({
        code: 0,
        success: true,
        data: result
      });
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: error.message })
    }
  }

  async getTopLists(req, res) {
    try {
      let { from } = req.query;
      from = from || "kuwo";
      const result = await this.MusicService.getTopLists(from);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: error.message })
    }
  }

  async getTopListDetail(req, res) {
    try {
    let { from, id } = req.query;
    from = from || "kuwo";
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id不能为空"
      });
    }
    const result = await this.MusicService.getTopListDetail(from, id);
    res.json({
      success: true,
        data: result
      });
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: error.message })
    }
  }

  //获取歌曲列表 从url、id导入
  async songList(req, res) {
    try {
      let { url, from } = req.query;
      const result = await this.MusicService.songList(url, from);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: error.message })
    }
  }

  async mergeSongList(req, res) {
    try {
      let { to_url, from, from_id, togd } = req.query;
      to_url = to_url || 'https://s3.tebi.io/soft/music/qq_1839459328.json';
      let sourceMap = {
        qq: "tencent",
        kugou: "kougou",
        kuwo: "kuwo",
        wangyi: "netease",
        migu: "migu",
        spotify: "spotify",
        tidal: "tidal",
        ytmusic: "ytmusic",
        qobuz: "qobuz",
        joox: "joox",
        deezer: "deezer",
        ximalaya: "ximalaya",
        apple: "apple",
      }
      const fromList = await this.MusicService.songList(from_id, from);
      const toList = await axios.get(to_url, {
        timeout: 100000, // 10秒超时
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      let arr = await Promise.all(
        toList.data.songList.map(async (song) => {
          for (const item of fromList) {
            if (getCleanTitle(item.title) == getCleanTitle(song.title)) {
              if (song.singers.every(word => item.artist.includes(word))) {
                // let id = togd ? song.mid : item.id;
                let other_id = from == "wangyi" ? "kuwo_id" : "wangyi_id";
                let newSong = {
                  id: item.id,
                  [`${from}_id`]: item.id,
                  [`${other_id}`]: song[other_id],
                  qq_id: song.mid,
                  title: item.title,
                  name: item.title,
                  artist: item.artist,
                  singers: song.singers,
                  album: item.album,
                  type: from,
                  source: sourceMap[from],
                  url: song.url,

                }
                console.log("newSong", newSong)
                return newSong;
              }
            }
          }
          return {
            id: song.mid,
            kuwo_id: song.kuwo_id || "",
            wangyi_id: song.wangyi_id || "",
            qq_id: song.mid,
            title: song.title,
            name: song.name,
            artist: song.singers.join('、'),
            singers: song.singers,
            album: song.album,
            source: "tencent",
            type: "qq",
            url: song.url,
          }
        })
      );

      let jsonString = JSON.stringify(arr);
      if (togd) {
        res.json({
          gdmusic_fav: jsonString
        });
      } else {
        toList.data.songList = arr;
        let content = JSON.stringify(toList.data);
        // let re = await this.s3Service.putFile("music/qq_1839459328.json", content);
        res.json(toList.data);
      }

    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: error.message })
    }
  }

  //修补歌单 id
  async fixId(req, res) {
    try {
      let { id, togd, url, from } = req.query;
      url = url || 'https://s3.tebi.io/soft/music/qq_1839459328.json';
      let sourceMap = {
        qq: "tencent",
        kugou: "kougou",
        kuwo: "kuwo",
        wangyi: "netease",
        migu: "migu",
        spotify: "spotify",
        tidal: "tidal",
        ytmusic: "ytmusic",
        qobuz: "qobuz",
        joox: "joox",
        deezer: "deezer",
        ximalaya: "ximalaya",
        apple: "apple",
      }
      const response = await axios.get(url, {
        timeout: 100000, // 10秒超时
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      let arr = []

      for (const song of response.data.songList) {

        if (song.wangyi_id) {
          arr.push(song);
          continue;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        let newSong = await this.doSearch(song, from);
        if (newSong) {
          arr.push(newSong);
        } else {
          arr.push(song);
        }

      }

      let jsonString = JSON.stringify(arr);
      if (togd) {
        res.json({
          gdmusic_fav: jsonString
        });
      } else {
        response.data.songList = arr;
        res.json(response.data);
      }

    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: error.message })
    }
  }

  async doSearch(song, from) {
    let re = await this.MusicService.search(getCleanTitle(song.name), 1, 'music', from);
    // console.log("re",re)
    for (const item of re.data) {
      //           id: title: artist: 
      if (song.singers.every(word => item.artist.includes(word))) {
        if (getCleanTitle(item.title) == getCleanTitle(song.name)) {

          let other_id = from == "wangyi" ? "kuwo_id" : "wangyi_id";
          let newSong = {
            id: item.id,
            [`${from}_id`]: item.id,
            [`${other_id}`]: song[other_id],
            title: item.title,
            name: item.title,
            artist: item.artist,
            singers: item.artist.split('、'),
            album: item.album,
            type: from,
            source: sourceMap[from],
            url: song.url,
          }
          return newSong;
        }
      }

    }
    return null;
  }

  //导出gd格式 id
  async toGD(req, res) {
    try {
      let { id, type, url, from } = req.query;
      url = url || 'https://s3.tebi.io/soft/music/kuwo_1839459328.json';
      if (!from) {
        return res.status(400).json({
          success: false,
          message: "from不能为空"
        });
      }

      const response = await axios.get(url, {
        timeout: 10000, // 10秒超时
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      let sourceMap = {
        qq: "tencent",
        kugou: "kougou",
        kuwo: "kuwo",
        wangyi: "netease",
        migu: "migu",
        spotify: "spotify",
        tidal: "tidal",
        ytmusic: "ytmusic",
        qobuz: "qobuz",
        joox: "joox",
        deezer: "deezer",
        ximalaya: "ximalaya",
        apple: "apple",
      }
      let fromId = from + "_id";
      response.data.songList.forEach(async (item) => {
        item.id = item[fromId] || item.id;
        item.artist = item.singers[0];
        item.source = sourceMap[from];
      });
      const uniqueArray = response.data.songList.reduce((acc, current) => {
        const exists = acc.find(item => getCleanTitle(item.title) === getCleanTitle(current.title));
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      let jsonString = JSON.stringify(uniqueArray);
      res.json({
        gdmusic_fav: jsonString
      });
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: error.message })
    }
  }

  //导出文本
  async toText(req, res) {
    try {
      let { id, type, url } = req.query;
      url = url || 'https://s3.tebi.io/soft/music/qq_1839459328.json';
      const response = await axios.get(url, {
        timeout: 10000, // 10秒超时
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      let text = response.data.songList.map(item => {
        return `《${item.title}》 - ${item.singers.join('、')}`;
      }).join('\n');
      res.header('Content-Type', 'text/plain; charset=utf-8');
      res.send(text);
    } catch (error) {
      console.log(error)
      res.send(error.message);
    }
  }
}

export default MusicController;
