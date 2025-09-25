import { getDB } from '../config/supabase';
import config from '../config/app.js';
import MusicService from '../service/musicService.js';
import { syncSongListByQQ, syncSongListByNetease } from '../core/utils/string.js';
import { getListByNetease } from '../core/utils/import_qq.js';

class UserController {
    constructor() {
        this.db = getDB();
        this.MusicService = new MusicService(config.qq);
    }

    async getUser(req, res) {
        const { id } = req.params;
        const { data, error } = await this.db.from('users').select('*').eq('id', id);
        if (error) {
            res.status(400).json({ error: error.message });
        }
        res.json({ data });
    }

    async createSonglist(req, res) {
        const { title, url, type } = req.body;
        if (!req.userId) {
            res.status(400).json({ error: 'uid is required' });
        }
        if (!title) {
            res.status(400).json({ error: 'title are required' });
        }
        const data = {
            title,
            uid: req.userId,
        }
        const { error } = await this.db.from('song_list').insert(data);
        if (error) {
            res.status(500).json({ error: error.message });
        }
        res.json({ code: 0, msg: "success", data });
    }

    async getSonglist(req, res) {
        if (!req.userId) {
            res.status(400).json({ error: 'uid is required' });
        }
        const { data, error } = await this.db.from('song_list').select('*').eq('uid', req.userId);
        if (error) {
            res.status(500).json({ error: error.message });
        }
        res.json({ data });
    }

    async getSonglistItem(req, res) {
        const { sid } = req.query;
        if (!req.userId) {
            res.status(400).json({ error: 'uid is required' });
            return;
        }
        let query = this.db.from('song_list_item').select('*').eq('uid', req.userId);

        if (sid) {
            query = query.eq('sid', sid);
        }
        const { data, error } = await query;
        if (error) {
            res.status(500).json({ error: error.message });
            return;
        }
        res.json({ data });
    }
    async updateSonglist(req, res) {
        if (!req.userId) {
            res.status(400).json({ error: 'uid is required' });
        }
        const { id, title, sync_id, sync_disk, url, type, from_qq, from_netease, from_kuwo, from_kugou, } = req.body;
        if (!id) {
            res.status(400).json({ error: 'id is required' });
        }
        const updateData = {
            title,
            sync_id,
            sync_disk,
            from_netease,
            from_kuwo,
            from_qq,
            from_kugou
        };

        // 删除值为 undefined 或 null 的字段
        Object.keys(updateData).forEach((key) => {
            if (updateData[key] === undefined || updateData[key] === null) {
                delete updateData[key];
            }
        });
        const { data: songlist, error: songlistError } = await this.db.from('song_list').select('*').eq('id', id).eq('uid', req.userId);
        if (songlistError) {
            res.status(500).json({ error: songlistError.message });
        }
        if (!songlist) {
            res.status(400).json({ error: 'songlist not found' });
        }
        const { error } = await this.db.from('song_list').update(updateData).eq('id', id);
        if (error) {
            res.status(500).json({ error: error.message });
        }
        res.json({ code: 0, msg: "success" });
    }

    async syncSonglist(req, res) {
        const { sid, url, source_type, source_id, from_qq, from_netease, from_kuwo, from_kugou, } = req.body;
        if (!sid || !source_type || !source_id) {
            res.status(400).json({ error: 'sid source_type source_id is required' });
            return;
        }
        try {


            if (source_type == "qq") {
                const playlist = await this.MusicService.getQQPlaylist(from_qq, false);
                // console.log("playlist", playlist);
                if (playlist.songList.length == 0) {
                    res.status(400).json({ error: 'playlist not found' });
                    return;
                }
                const { error } = await this.db.from('song_sync_log').insert({ sid: sid, uid: req.userId, field: "from_qq", value: from_qq });
                if (error) {
                    res.status(500).json({ error: error.message });
                    return;
                }
                const { data: songlist, error: songlistItemError } = await this.db.from('song_list_item').select('*').eq('sid', sid).eq('uid', req.userId);
                if (songlistItemError) {
                    res.status(500).json({ error: songlistItemError.message });
                    return;
                }
                let newSonglist = syncSongListByQQ(playlist, songlist, sid, req.userId);
                const { error: newSonglistError } = await this.db.from('song_list_item').insert(newSonglist);
                if (newSonglistError) {
                    res.status(500).json({ error: newSonglistError.message });
                    return;
                }

                res.json({ code: 0, msg: "success" });
                return;
            }

            if (source_type == "netease") {
                const playlist = await getListByNetease(source_id, false);
                // res.json({ code: 0, msg: "success" });
                console.log("playlist", playlist);
                if (playlist.length == 0) {
                    res.status(400).json({ error: 'playlist not found' });
                    return;
                }
                const { error } = await this.db.from('song_sync_log').insert({ sid: sid, uid: req.userId, field: "from_netease", value: source_id });
                if (error) {
                    res.status(500).json({ error: error.message });
                    return;
                }
                const { data: songlist, error: songlistItemError } = await this.db.from('song_list_item').select('*').eq('sid', sid).eq('uid', req.userId);
                if (songlistItemError) {
                    res.status(500).json({ error: songlistItemError.message });
                    return;
                }
                let newSonglist = syncSongListByNetease(playlist, songlist, sid, req.userId);
                const { error: newSonglistError } = await this.db.from('song_list_item').insert(newSonglist);
                if (newSonglistError) {
                    res.status(500).json({ error: newSonglistError.message });
                    return;
                }
                res.json({ code: 0, msg: "success" });
                return;
            }

            res.json({ code: 0, msg: "success" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async addToSonglist(req, res) {
        const { sid, mid, title, singers, album, url, source_type } = req.body;
        if (!sid || !title) {
            res.status(400).json({ error: 'sid songs is required' });
            return;
        }
        let data = { sid, uid: req.userId, title, singers, album, name: this.cleanTitle(title) }
        if (source_type == "qq") {
            data.qq_id = mid;
        } else if (source_type == "netease") {
            data.netease_id = mid;
        } else if (source_type == "kugou") {
            data.kugou_id = mid;
        } else if (source_type == "kuwo") {
            data.kuwo_id = mid;
        }
        const { error } = await this.db.from('song_list_item').insert(data);
        if (error) {
            res.status(500).json({ error: error.message });
            return;
        }
        res.json({ code: 0, msg: "success" });
    }

    async importSonglist(req, res) {
        const { url, source_type, source_id, from_qq, from_netease, from_kuwo, from_kugou, } = req.body;
        if (!source_type || !source_id) {
            res.status(400).json({ error: 'sid source_type source_id is required' });
            return;
        }
        try {


            if (source_type == "qq") {
                const playlist = await this.MusicService.getQQPlaylist(source_id, false);
                // console.log("playlist", playlist);
                if (playlist.songList.length == 0) {
                    res.status(400).json({ error: 'playlist not found' });
                    return;
                }
                const { data: sid, error: songErr } = await this.db.from('song_list').insert({ uid: req.userId, title: playlist.songListName, from_qq: source_id }).select('id');;
                if (songErr) {
                    res.status(500).json({ error: songErr.message });
                    return;
                }
                const { error } = await this.db.from('song_sync_log').insert({ sid: sid.id, uid: req.userId, field: "from_qq", value: source_id });
                if (error) {
                    res.status(500).json({ error: error.message });
                    return;
                }

                let newSonglist = syncSongListByQQ(playlist, [], sid.id, req.userId);
                const { error: newSonglistError } = await this.db.from('song_list_item').insert(newSonglist);
                if (newSonglistError) {
                    res.status(500).json({ error: newSonglistError.message });
                    return;
                }

                res.json({ code: 0, msg: "success" });
                return;
            }

            if (source_type == "netease") {
                const playlist = await getListByNetease(source_id, false);
                // res.json({ code: 0, msg: "success" });
                console.log("playlist", playlist);
                if (playlist.length == 0) {
                    res.status(400).json({ error: 'playlist not found' });
                    return;
                }
                const { data: sid, error: songErr } = await this.db.from('song_list').insert({ uid: req.userId, title: playlist.songListName, from_netease: source_id }).select('id');;
                if (songErr) {
                    res.status(500).json({ error: songErr.message });
                    return;
                }
                const { error } = await this.db.from('song_sync_log').insert({ sid: sid, uid: req.userId, field: "from_netease", value: source_id });
                if (error) {
                    res.status(500).json({ error: error.message });
                    return;
                }
                const { data: songlist, error: songlistItemError } = await this.db.from('song_list_item').select('*').eq('sid', sid).eq('uid', req.userId);
                if (songlistItemError) {
                    res.status(500).json({ error: songlistItemError.message });
                    return;
                }
                let newSonglist = syncSongListByNetease(playlist, songlist, sid, req.userId);
                const { error: newSonglistError } = await this.db.from('song_list_item').insert(newSonglist);
                if (newSonglistError) {
                    res.status(500).json({ error: newSonglistError.message });
                    return;
                }
                res.json({ code: 0, msg: "success" });
                return;
            }

            res.json({ code: 0, msg: "success" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async fillSongInfo(req, res) {
        const { sid, source_type } = req.body;

        // 验证必需参数
        if (!sid || !source_type) {
            return res.status(400).json({
                error: 'sid 和 source_type 是必需的参数'
            });
        }

        if (!req.userId) {
            return res.status(400).json({
                error: 'uid 是必需的'
            });
        }

        try {
            // 获取歌单中的所有歌曲
            const { data: songs, error: songsError } = await this.db
                .from('song_list_item')
                .select('*')
                .eq('sid', sid)
                .eq('uid', req.userId);

            if (songsError) {
                return res.status(500).json({
                    error: songsError.message
                });
            }

            if (!songs || songs.length === 0) {
                return res.json({
                    code: 0,
                    msg: "歌单中没有找到歌曲",
                    data: { updated: 0, total: 0 }
                });
            }

            const targetIdField = `${source_type}_id`;
            let updatedCount = 0;
            const API_BASE = config.gd.baseUrl;

            // 遍历所有歌曲，填充缺失的ID
            for (const song of songs) {
                // 检查是否需要填充该歌曲的ID
                if (!song[targetIdField]) {
                    console.log(`正在处理歌曲: ${song.title} - ${song.artist || song.singers?.join('、')}`);

                    try {
                        // 构造搜索关键词
                        const keyword = song.title;
                        const searchUrl = `${API_BASE}?types=search&source=${source_type}&name=${encodeURIComponent(keyword)}&count=30`;

                        // 调用搜索接口
                        const searchResponse = await fetch(searchUrl);
                        const searchResult = await searchResponse.json();

                        if (searchResult && searchResult.data && Array.isArray(searchResult.data)) {
                            // 在搜索结果中查找匹配的歌曲
                            const matchedSong = this.findMatchingSong(song, searchResult.data);

                            if (matchedSong) {
                                // 更新数据库中的歌曲信息
                                const updateData = {};
                                updateData[targetIdField] = matchedSong.id;

                                const { error: updateError } = await this.db
                                    .from('song_list_item')
                                    .update(updateData)
                                    .eq('id', song.id);

                                if (updateError) {
                                    console.error(`更新歌曲 ${song.title} 失败:`, updateError.message);
                                } else {
                                    updatedCount++;
                                    console.log(`成功填充歌曲: ${song.title} - ID: ${matchedSong.id}`);
                                }
                            } else {
                                console.log(`未找到匹配的歌曲: ${song.title}`);
                            }
                        }
                    } catch (searchError) {
                        console.error(`搜索歌曲 ${song.title} 失败:`, searchError.message);
                    }

                    // 添加延时避免请求过于频繁
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            res.json({
                code: 0,
                msg: `成功填充了 ${updatedCount} 首歌曲的信息`,
                data: {
                    updated: updatedCount,
                    total: songs.length,
                    targetField: targetIdField
                }
            });

        } catch (error) {
            console.error('fillSongInfo 执行出错:', error);
            res.status(500).json({
                error: error.message
            });
        }
    }

    // 辅助方法：查找匹配的歌曲
    findMatchingSong(originalSong, searchResults) {
        for (const candidate of searchResults) {
            // 比较标题
            const originalTitle = this.cleanTitle(originalSong.title);
            const candidateTitle = this.cleanTitle(candidate.title || candidate.name);

            if (originalTitle !== candidateTitle) {
                continue;
            }

            // 比较歌手
            const originalArtists = this.getArtistsList(originalSong);
            const candidateArtists = this.getArtistsList(candidate);

            // 检查歌手是否完全匹配
            if (this.areArtistsMatch(originalArtists, candidateArtists)) {
                return candidate;
            }
        }

        return null;
    }

    // 辅助方法：清理歌曲标题
    cleanTitle(title) {
        if (!title) return '';

        // 移除括号内容并转换为小写，去除多余空格
        return title
            .replace(/\([^)]*\)/g, '')  // 移除圆括号内容
            .replace(/\[[^\]]*\]/g, '') // 移除方括号内容
            .replace(/\s+/g, ' ')       // 合并多个空格
            .trim()
            .toLowerCase();
    }

    // 辅助方法：获取歌手列表
    getArtistsList(song) {
        if (song.singers && Array.isArray(song.singers)) {
            return song.singers;
        }

        if (song.artist) {
            // 支持多种分隔符
            return song.artist.split(/[、,&/]/).map(a => a.trim()).filter(a => a.length > 0);
        }

        return [];
    }

    // 辅助方法：检查歌手是否匹配
    areArtistsMatch(artists1, artists2) {
        if (!artists1.length || !artists2.length) {
            return false;
        }

        // 将所有歌手转换为小写便于比较
        const normalizedArtists1 = artists1.map(a => a.toLowerCase().trim());
        const normalizedArtists2 = artists2.map(a => a.toLowerCase().trim());

        // 检查是否有完全匹配的歌手（所有歌手都要匹配）
        return normalizedArtists1.length === normalizedArtists2.length &&
            normalizedArtists1.every(artist => normalizedArtists2.includes(artist));
    }
}

export default UserController;