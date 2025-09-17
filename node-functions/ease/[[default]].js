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
import http from "http";
const app = express();

// Express 路由（与方法一相同的 HTML）
app.get('/', (req, res) => {
    // ... 相同的 HTML 代码
    res.json(req.headers);
});


export default app;