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
import { createClient } from '@supabase/supabase-js'
import http from "http";
const app = express();

// Express 路由（与方法一相同的 HTML）
app.get('/',async (req, res) => {
    // ... 相同的 HTML 代码
    const supabaseUrl = process.env.SUPURL //'https://bhziqtdetzehtjngvjpy.supabase.co'
    const supabaseKey = process.env.SUPSECRET
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase.from('user').select()
    res.json({h:req.headers,data});
});



export default app;