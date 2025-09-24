import express from 'express';
const router = express.Router();
import MusicController from './controller/musicController.js';
import UserController from './controller/userController.js';
import { authMiddleware } from './config/supabase.js';

// 创建控制器实例
const musicController = new MusicController();
const userController = new UserController();
// 音乐相关路由
router.get('/qq/playlist/:id', musicController.getPlaylist.bind(musicController));
router.get('/merge-song-list', musicController.mergeSongList.bind(musicController));
router.get('/qq/miss-song/:id', musicController.missSong.bind(musicController));
router.get('/qq/miss-song-sd/:id', musicController.missSongSearchDownload.bind(musicController));
router.get('/search', musicController.search.bind(musicController));
router.get('/play-url', musicController.playMusic.bind(musicController));
router.get('/top-lists', musicController.getTopLists.bind(musicController));
router.get('/top-list-detail', musicController.getTopListDetail.bind(musicController));
router.get('/import-song-list', musicController.songList.bind(musicController));
router.get('/fix-id', musicController.fixId.bind(musicController));
router.get('/to-gd', musicController.toGD.bind(musicController));
router.get('/to-text', musicController.toText.bind(musicController));

router.get('/user/:id', userController.getUser.bind(userController));
router.post('/songlist', authMiddleware,userController.createSonglist.bind(userController));
router.get('/songlist', authMiddleware,userController.getSonglist.bind(userController));
router.get('/songlist/item', authMiddleware,userController.getSonglistItem.bind(userController));
router.put('/songlist', authMiddleware,userController.updateSonglist.bind(userController));
router.post('/songlist/sync', authMiddleware,userController.syncSonglist.bind(userController));
router.post('/songlist/import', authMiddleware,userController.importSonglist.bind(userController));


export default router;
