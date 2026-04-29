import axios from 'axios';
//import https from 'https';
// 目标 API 基础地址
const BASE_URL = 'https://ktx.cn';


// 创建 axios 实例，统一设置必需的请求头
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'channel': 'ios',
        'User-Agent': 'VistaKTX/3.7.8 (iPhone X;iOS16.7.11)'
    },
    timeout: 10000,
    //httpsAgent: new https.Agent({ rejectUnauthorized: false })   // 绕过证书验证
});

// 辅助函数：将查询参数转发到目标 API
export const forwardRequest = async (req, res, targetPath) => {
    try {
        const response = await apiClient.get(targetPath, {
            params: req.query,          // 转发所有查询参数
            //headers: req.headers        // 可选：保留客户端的一些头（按需）
        });
        res.json(response.data);
    } catch (error) {
        console.error(`代理请求失败 [${targetPath}]:`, error.message);
        if (error.response) {
            // 目标服务器返回了错误响应
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: '代理请求失败', details: error.message });
        }
    }
};