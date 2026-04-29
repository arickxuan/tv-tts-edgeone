

import express from 'express';
import axios from 'axios';
import cors from 'cors';
import path from 'path';
import { forwardRequest } from './api.js';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';

dotenv.config();
const app = express();

// 中间件
// 允许所有来源的跨域请求
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));



// 获取 __dirname 的 ES 模块替代方案
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//==== 路由定义（与 API 文档一一对应） =====

// 1. 获取所有杂志（magType=1-4 通用）
app.get('/v3/api/magazine/all_mag_page_3', (req, res) => {
    forwardRequest(req, res, '/v3/api/magazine/all_mag_page_3');
});

// 2. 杂志详情
app.get('/v3/api/magazine/get_mag', (req, res) => {
    forwardRequest(req, res, '/v3/api/magazine/get_mag');
});

// 3. 杂志目录（当 magType ≠ 4 时使用此接口）
app.get('/v3/api/magazine/mag_column_detail', (req, res) => {
    forwardRequest(req, res, '/v3/api/magazine/mag_column_detail');
});

// 4. 文章列表（当 magType = 4 时使用此接口代替目录）
app.get('/v3/api/article/get_article_list_by_mag', (req, res) => {
    forwardRequest(req, res, '/v3/api/article/get_article_list_by_mag');
});

// 5. 文章内容
app.get('/v3/api/article/article_detail2', (req, res) => {
    forwardRequest(req, res, '/v3/api/article/article_detail2');
});


app.get('/', (req, res) => {
    try {
        // 注意：路径相对于项目根目录，但函数中需要使用相对路径访问 // 'included_files'
        const htmlPath = path.join( 'included_files','public', 'ktx', 'index.html');
        if (!existsSync(htmlPath)) {
            console.error(`File not found: ${htmlPath}`);
            const dan4 = readDirectorySync('./')
            return res.status(200).json({ dan4 });
        }
        const htmlContent = readFileSync(htmlPath, 'utf-8');
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(htmlContent);
    } catch (error) {
        const fileStructure = getAllFiles('./')
        console.log(fileStructure);
        return res.status(200).json(fileStructure);

    }
});

app.get('/ping', (req, res) => {
    res.send('pong');
});



// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        code: 500,
        msg: "服务器内部错误",
        error: err.message
    });
});

export default app;

