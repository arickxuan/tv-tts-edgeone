import { getCacheTime, getAvailableApiSites, searchFromApi, getDetailFromApi } from '../core/movie.js';
import { getRecentHotMovies } from '../core/douban.js';

/**
 * 电影控制器类
 * 处理电影搜索和详情相关的HTTP请求
 */
class MovieController {
    /**
     * 生成缓存响应头
     * @param {number} cacheTime - 缓存时间（秒）
     * @returns {Object} 缓存响应头对象
     */
    _getCacheHeaders(cacheTime) {
        return {
            'Cache-Control': `public, max-age=${cacheTime}, s-maxage=${cacheTime}`,
            'CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
            'Vercel-CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
        };
    }

    /**
     * 获取豆瓣热门电影列表
     * @param {Object} req - Express 请求对象
     * @param {Object} res - Express 响应对象
     */
    async douban(req, res) {
        try {
            const {
                kind = 'movie',
                start = 0,
                limit = 25,
                category = '最新',
                type = '华语',
                useProxy = true
            } = req.query;

            // 参数验证
            const startNum = parseInt(start, 10);
            const limitNum = parseInt(limit, 10);

            if (isNaN(startNum) || startNum < 0) {
                return res.status(400).json({ error: '无效的start参数' });
            }

            if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
                return res.status(400).json({ error: '无效的limit参数(1-100)' });
            }

            // 调用豆瓣API获取数据
            const result = await getRecentHotMovies({
                kind,
                start: startNum,
                limit: limitNum,
                category,
                type,
                useProxy: useProxy !== 'false'
            });

            // 获取缓存时间并设置响应头
            const cacheTime = await getCacheTime();

            return res.json(result, {
                headers: this._getCacheHeaders(cacheTime)
            });

        } catch (error) {
            console.error('获取豆瓣电影列表失败:', error);
            
            // 根据错误类型返回不同的状态码
            if (error.response?.status === 429) {
                return res.status(429).json({ error: '请求过于频繁，请稍后重试' });
            } else if (error.response?.status === 403) {
                return res.status(403).json({ error: '豆瓣API访问受限' });
            } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                return res.status(504).json({ error: '豆瓣API请求超时' });
            } else {
                return res.status(500).json({ 
                    error: '获取电影列表失败',
                    message: error.message 
                });
            }
        }
    }

    /**
     * 搜索电影
     * @param {Object} req - Express 请求对象
     * @param {Object} res - Express 响应对象
     */
    async search(req, res) {
        const { q: query } = req.query;

        // 如果没有查询参数，返回空结果
        if (!query) {
            const cacheTime = await getCacheTime();
            return res.json(
                { results: [] },
                {
                    headers: this._getCacheHeaders(cacheTime),
                }
            );
        }

        try {
            // 获取可用的API站点并并行搜索
            const apiSites = await getAvailableApiSites();
            const searchPromises = apiSites.map(site => searchFromApi(site, query));
            
            const results = await Promise.all(searchPromises);
            const flattenedResults = results.flat();
            const cacheTime = await getCacheTime();

            return res.json(
                { results: flattenedResults },
                {
                    headers: this._getCacheHeaders(cacheTime),
                }
            );
        } catch (error) {
            console.error('电影搜索失败:', error);
            return res.status(500).json({ error: '搜索失败' });
        }
    }

    /**
     * 获取电影详情
     * @param {Object} req - Express 请求对象  
     * @param {Object} res - Express 响应对象
     */
    async detail(req, res) {
        const { id, source } = req.query;

        // 参数验证
        if (!id || !source) {
            return res.status(400).json({ error: '缺少必要参数' });
        }

        if (!/^[\w-]+$/.test(id)) {
            return res.status(400).json({ error: '无效的视频ID格式' });
        }

        try {
            // 查找对应的API站点
            const apiSites = await getAvailableApiSites();
            const apiSite = apiSites.find(site => site.key === source);

            if (!apiSite) {
                return res.status(400).json({ error: '无效的API来源' });
            }

            // 获取详情数据
            const result = await getDetailFromApi(apiSite, id);
            const cacheTime = await getCacheTime();

            return res.json(result, {
                headers: this._getCacheHeaders(cacheTime),
            });
        } catch (error) {
            console.error('获取电影详情失败:', error);
            return res.status(500).json({ error: error.message || '获取详情失败' });
        }
    }
}

export default MovieController;

