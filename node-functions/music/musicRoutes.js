import express from 'express';
const router = express.Router();
import MusicController from './controller/musicController.js';

// 创建控制器实例
const musicController = new MusicController();

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

export default router;
