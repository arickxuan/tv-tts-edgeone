import axios from 'axios'

// 豆瓣API基础配置
const DOUBAN_BASE_URL = 'https://m.douban.com/rexxar/api/v2'
const CORS_PROXY = 'https://cors.zme.ink/'

// 创建axios实例
const doubanApi = axios.create({
    timeout: 10000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Referer': 'https://movie.douban.com/',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://movie.douban.com'
    }
})

/**
 * 获取豆瓣热门电影
 * @param {Object} params - 请求参数
 * @param {number} params.start - 开始位置，默认0
 * @param {number} params.limit - 限制数量，默认25
 * @param {string} params.category - 分类，如"最新"
 * @param {string} params.type - 类型，如"华语"
 * @param {boolean} params.useProxy - 是否使用代理，默认true
 * @returns {Promise} 返回电影数据
 */
export async function getRecentHotMovies(params = {}) {
    const {
        kind = 'movie',
        start = 0,
        limit = 25,
        category = '最新',
        type = '华语',
        useProxy = true
    } = params

    try {
        // 构建请求URL
        const baseUrl =  DOUBAN_BASE_URL  //useProxy ? CORS_PROXY + DOUBAN_BASE_URL :
        const url = `${baseUrl}/subject/recent_hot/${kind}`

        // 请求参数
        const requestParams = {
            start,
            limit,
            category: category,
            type: type
        }

        console.log('豆瓣API请求:', {
            url,
            params: requestParams,
            useProxy
        })

        const response = await doubanApi.get(url, {
            params: requestParams
        })

        // console.log('豆瓣API响应:', response.data)
        return response.data

    } catch (error) {
        console.error('豆瓣API请求失败:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        })

        // 如果使用代理失败，尝试直接请求
        if (useProxy && error.response?.status >= 400) {
            console.log('代理请求失败，尝试直接请求...')
            return getRecentHotMovies({ ...params, useProxy: false })
        }

        throw error
    }
}

/**
 * 通用豆瓣API请求函数
 * @param {string} endpoint - API端点
 * @param {Object} params - 请求参数
 * @param {boolean} useProxy - 是否使用代理
 * @returns {Promise} 返回API响应数据
 */
export async function doubanRequest(endpoint, params = {}, useProxy = true) {
    try {
        const baseUrl = useProxy ? CORS_PROXY + DOUBAN_BASE_URL : DOUBAN_BASE_URL
        const url = `${baseUrl}${endpoint}`

        console.log('豆瓣通用API请求:', {
            endpoint,
            url,
            params,
            useProxy
        })

        const response = await doubanApi.get(url, { params })
        return response.data

    } catch (error) {
        console.error('豆瓣通用API请求失败:', error.message)

        // 如果使用代理失败，尝试直接请求
        if (useProxy && error.response?.status >= 400) {
            console.log('代理请求失败，尝试直接请求...')
            return doubanRequest(endpoint, params, false)
        }

        throw error
    }
}

// 导出常用的API函数
export const doubanAPI = {
    /**
     * 获取热门电影
     */
    getHotMovies: (params) => getRecentHotMovies(params),

    /**
     * 获取电影详情
     */
    getMovieDetail: (movieId) => doubanRequest(`/subject/${movieId}`),

    /**
     * 搜索电影
     */
    searchMovies: (query, start = 0, limit = 20) => doubanRequest('/search', {
        q: query,
        start,
        limit,
        type: 'movie'
    }),

    /**
     * 获取电影评论
     */
    getMovieComments: (movieId, start = 0, limit = 20) => doubanRequest(`/subject/${movieId}/comments`, {
        start,
        limit
    })
}

export default doubanAPI
