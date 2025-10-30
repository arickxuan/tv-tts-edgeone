// import { consturctServer } from '@neteaseapireborn/api/server';



// let app = (async () => {
//     try {
//         const server = await consturctServer();
//         console.log('服务器启动成功');
//         // 在这里处理服务器相关逻辑
//         server.use((req, res, next) => {
//             console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
//             next();
//         });
//         return server
//     } catch (error) {
//         console.error('服务器启动失败:', error);
//     }
// })();

// // // 导出处理函数
// export default app;

import express from "express";
import cors from 'cors';
import { main } from "./core.js";
const app = express();

// 允许所有来源的跨域请求
app.use(cors());

// Express 路由（与方法一相同的 HTML）
app.get('/', async (req, res) => {
    // ... 相同的 HTML 代码
    res.json({ h: req.headers, data:"123" });
});


app.get('/click', async (req, res) => {
    const result = await main();
    res.json({ data:result });
})

export default app;