import { getCacheTime, getAvailableApiSites, searchFromApi, getDetailFromApi, getConfig } from '../core/movie.js';
import { getRecentHotMovies } from '../core/douban.js';
import { detectPlatform,getCompatibleParsers,PARSE_APIS } from '../core/utils/parse.js';

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

    async tvbox(req, res) {
        let { id, format } = req.query;
        if (format == "") {
            format = "json";
        }
        console.log(req.headers);
        const host = req.headers["x-forwarded-host"] || 'localhost:3000';
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const baseUrl = `${protocol}://${host}`;
        // 读取当前配置
        const config = await getConfig();

        // 从配置中获取源站列表
        const sourceConfigs = config.SourceConfig || [];

        if (sourceConfigs.length === 0) {
            return NextResponse.json({ error: '没有配置任何视频源' }, { status: 500 });
        }

        let siteArr = sourceConfigs.map((source) => {
            // 更智能的type判断逻辑：
            // 1. 如果api地址包含 "/provide/vod" 且不包含 "at/xml"，则认为是JSON类型 (type=1)
            // 2. 如果api地址包含 "at/xml"，则认为是XML类型 (type=0)
            // 3. 如果api地址以 ".json" 结尾，则认为是JSON类型 (type=1)
            // 4. 其他情况默认为JSON类型 (type=1)，因为现在大部分都是JSON
            let type = 1; // 默认为JSON类型

            const apiLower = source.api.toLowerCase();
            if (apiLower.includes('at/xml') || apiLower.endsWith('.xml')) {
                type = 0; // XML类型
            }

            return {
                key: source.key || source.name,
                name: source.name,
                type: type, // 使用智能判断的type
                api: source.api,
                searchable: 1, // 可搜索
                quickSearch: 1, // 支持快速搜索
                filterable: 1, // 支持分类筛选
                ext: source.detail || '', // 详情页地址作为扩展参数
                timeout: 30, // 30秒超时
                categories: [
                    "电影", "电视剧", "综艺", "动漫", "纪录片", "短剧"
                ]
            };
        })

        siteArr[0] = {
			"key": "豆瓣",
			"name": "豆瓣",
			"type": 3,
			"api": "csp_Douban",
			"searchable": 0,
			"changeable": 1,
			"indexs":1,
			"ext": "/libs/tokenm.json$$$/libs/douban.json"
		}


        // 转换为TVBox格式
        const tvboxConfig = {
            // 基础配置
            spider: `${baseUrl}/libs/pg.jar`, // 可以根据需要添加爬虫jar包
            wallpaper: `${baseUrl}/libs/screenshot1.png`, // 使用项目截图作为壁纸

            // 影视源配置
            sites: siteArr,

            // 解析源配置（添加一些常用的解析源）
            parses: [
                {
                    name: "Json并发",
                    type: 2,
                    url: "Parallel"
                },
                {
                    name: "Json轮询",
                    type: 2,
                    url: "Sequence"
                },
                {
                    name: "KatelyaTV内置解析",
                    type: 1,
                    url: `${baseUrl}/movie/parse?url=`,
                    ext: {
                        flag: ["qiyi", "qq", "letv", "sohu", "youku", "mgtv", "bilibili", "wasu", "xigua", "1905"]
                    }
                }
            ],

            // 播放标识
            flags: [
                "youku", "qq", "iqiyi", "qiyi", "letv", "sohu", "tudou", "pptv",
                "mgtv", "wasu", "bilibili", "le", "duoduozy", "renrenmi", "xigua",
                "优酷", "腾讯", "爱奇艺", "奇艺", "乐视", "搜狐", "土豆", "PPTV",
                "芒果", "华数", "哔哩", "1905"
            ],

            // 直播源（可选）
            lives: [
                {
                    name: "KatelyaTV直播",
                    type: 0,
                    url: `https://livetv.izbds.com/tv/iptv4.m3u`,
                    epg: "",
                    logo: ""
                }
            ],

            // 广告过滤规则
            ads: [
                "mimg.0c1q0l.cn",
                "www.googletagmanager.com",
                "www.google-analytics.com",
                "mc.usihnbcq.cn",
                "mg.g1mm3d.cn",
                "mscs.svaeuzh.cn",
                "cnzz.hhurm.com",
                "tp.vinuxhome.com",
                "cnzz.mmstat.com",
                "www.baihuillq.com",
                "s23.cnzz.com",
                "z3.cnzz.com",
                "c.cnzz.com",
                "stj.v1vo.top",
                "z12.cnzz.com",
                "img.mosflower.cn",
                "tips.gamevvip.com",
                "ehwe.yhdtns.com",
                "xdn.cqqc3.com",
                "www.jixunkyy.cn",
                "sp.chemacid.cn",
                "hm.baidu.com",
                "s9.cnzz.com",
                "z6.cnzz.com",
                "um.cavuc.com",
                "mav.mavuz.com",
                "wofwk.aoidf3.com",
                "z5.cnzz.com",
                "xc.hubeijieshikj.cn",
                "tj.tianwenhu.com",
                "xg.gars57.cn",
                "k.jinxiuzhilv.com",
                "cdn.bootcss.com",
                "ppl.xunzhuo123.com",
                "xomk.jiangjunmh.top",
                "img.xunzhuo123.com",
                "z1.cnzz.com",
                "s13.cnzz.com",
                "xg.huataisangao.cn",
                "z7.cnzz.com",
                "xg.huataisangao.cn",
                "z2.cnzz.com",
                "s96.cnzz.com",
                "q11.cnzz.com",
                "thy.dacedsfa.cn",
                "xg.whsbpw.cn",
                "s19.cnzz.com",
                "z8.cnzz.com",
                "s4.cnzz.com",
                "f5w.as12df.top",
                "ae01.alicdn.com",
                "www.92424.cn",
                "k.wudejia.com",
                "vivovip.mmszxc.top",
                "qiu.xixiqiu.com",
                "cdnjs.hnfenxun.com",
                "cms.qdwght.com"
            ]
        };

        // 根据format参数返回不同格式
        if (format === 'txt') {
            // 返回base64编码的配置（TVBox常用格式）
            const configStr = JSON.stringify(tvboxConfig, null, 2);
            const base64Config = Buffer.from(configStr).toString('base64');

            res.send(base64Config);
            return
        } else {
            // 返回JSON格式
            res.json(tvboxConfig);
            return
        }

    }

    async parse(req, res) {
        let { url,parser,format } = req.query;
        if (format == "") {
            format = "json";
        }

        if (!url) {
            res.json(
                { error: '缺少url参数' },
                { status: 400 }
            );
            return
        }

        // 检测平台类型
        const platform = detectPlatform(url);
        const compatibleParsers = getCompatibleParsers(platform);

        if (compatibleParsers.length === 0) {
            return NextResponse.json(
                {
                    error: '暂不支持该平台的视频解析',
                    platform,
                    url
                },
                { status: 400 }
            );
        }

        // 如果指定了解析器，优先使用
        let selectedParser = compatibleParsers[0];
        if (parser) {
            const customParser = PARSE_APIS.find(api =>
                api.name.toLowerCase().includes(parser.toLowerCase())
            );
            if (customParser && compatibleParsers.includes(customParser)) {
                selectedParser = customParser;
            }
        }

        const parseUrl = selectedParser.url + encodeURIComponent(url);

        // 根据format返回不同格式
        if (format === 'redirect') {
            // 直接重定向到解析页面
            // return NextResponse.redirect(parseUrl);
            res.redirect(parseUrl);
            return
        } else if (format === 'iframe') {
            // 返回可嵌入的HTML页面
            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>视频播放</title>
    <style>
        body { margin: 0; padding: 0; background: #000; }
        iframe { width: 100%; height: 100vh; border: none; }
    </style>
</head>
<body>
    <iframe src="${parseUrl}" allowfullscreen></iframe>
</body>
</html>`;
            res.send(html);
            return
        } else {
            // 返回JSON格式的解析信息
            let result = {
                success: true,
                data: {
                    original_url: url,
                    platform,
                    parse_url: parseUrl,
                    parser_name: selectedParser.name,
                    available_parsers: compatibleParsers.map(p => p.name)
                }
            };
            res.json(result);
            return
        }

    }
}

export default MovieController;

