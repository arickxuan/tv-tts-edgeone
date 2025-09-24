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
        res.json({ code:0,msg:"success",data });
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
        const { id, title,sync_id,sync_disk, url, type, from_qq, from_netease, from_kuwo, from_kugou, } = req.body;
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
        const {  error } = await this.db.from('song_list').update(updateData).eq('id', id);
        if (error) {
            res.status(500).json({ error: error.message });
        }
        res.json({ code:0,msg:"success" });
    }

    async syncSonglist(req, res) {
        const { sid, url, source_type,source_id, from_qq, from_netease, from_kuwo, from_kugou, } = req.body;
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

    async importSonglist(req, res) {
        const {  url, source_type,source_id, from_qq, from_netease, from_kuwo, from_kugou, } = req.body;
        if (  !source_type || !source_id) {
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
                const { data:sid,error:songErr } = await this.db.from('song_list').insert({  uid: req.userId, title: playlist.songListName,  from_qq: source_id }).select('id'); ;
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
                const { data:sid,error:songErr } = await this.db.from('song_list').insert({  uid: req.userId, title: playlist.songListName,  from_netease: source_id }).select('id'); ;
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
}

export default UserController;