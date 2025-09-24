import express from 'express';
import MovieController from '../controller/movieController.js';

/**
 * 电影相关路由模块
 * 提供电影搜索、详情查看和豆瓣热门列表功能的路由配置
 */
const router = express.Router();

// 创建电影控制器实例
const movieController = new MovieController();

/**
 * 电影搜索路由
 * GET /movie/search?q=关键词
 * 根据关键词搜索电影信息
 */
router.get('/search', movieController.search.bind(movieController));

/**
 * 电影详情路由  
 * GET /movie/detail?id=电影ID&source=数据源
 * 获取指定电影的详细信息
 */
router.get('/detail', movieController.detail.bind(movieController));

/**
 * 豆瓣热门电影列表路由
 * GET /movie/douban?kind=movie&start=0&limit=25&category=最新&type=华语
 * 获取豆瓣热门电影列表数据
 */
router.get('/douban', movieController.douban.bind(movieController));

router.get('/parse', movieController.parse.bind(movieController));

router.get('/tvbox', movieController.tvbox.bind(movieController));


export default {
  router
};