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
import { getDB } from "./supabase/db";
const app = express();

// 允许所有来源的跨域请求
app.use(cors());

// Express 路由（与方法一相同的 HTML）
app.get('/', async (req, res) => {
    // ... 相同的 HTML 代码
    const { data, error } = await getDB().from('user').select()
    res.json({ h: req.headers, data });
});

app.post('/login', async (req, res) => {
    let { email, password } = req.body
    const { data, error } = await getDB().auth.signInWithPassword({
        email: email,
        password: password,
    })
    if (error) {
        res.status(400).json({ error: error.message });
    }
    res.json({ data });
});

app.post('/sign_up', async (req, res) => {
    let { email, password } = req.body
    const { data, error } = await getDB().auth.signUp({
        email: email,
        password: password,
    })
    if (error) {
        res.status(400).json({ error: error.message });
    }
    res.json({ data });
});

app.post('/logout', async (req, res) => {
    const { data, error } = await getDB().auth.signOut()
    if (error) {
        res.status(400).json({ error: error.message });
    }
    res.json({ data });
});
app.get('/refresh_access_token', async (req, res) => {
    // async function refreshAccessToken() {
    const refresh_token = req.headers["refresh_token"];
    if (!refresh_token) {
        return res.status(401).json({ error: "No refresh_token provided" });
    }
    const { data: session, error } = await getDB().auth.refreshSession({ refresh_token });

    if (error) {
        console.error('Error refreshing session:', error);
        return res.status(500).json({ error: error.message });
    }

    return res.json({ access_token: session.session.access_token,refresh_token: session.session.refresh_token });
})

app.post('/insert', async (req, res) => {
    let { table, data } = req.body
    if (!table) {
        res.status(400).json({ error: 'table is required' });
    }
    let obj = JSON.parse(data)
    const { error } = await getDB().from(table).insert({ data: data })
    if (error) {
        res.status(400).json({ error: error.message });
    }
    res.json({ data });
})

app.post('/select', async (req, res) => {
    let { id, table } = req.body
    if (!table) {
        res.status(400).json({ error: 'table is required' });
    }
    const { data, error } = await getDB().from(table).select()

    if (error) {
        res.status(400).json({ error: error.message });
    }
    res.json({ data });
})


app.post('/update', async (req, res) => {
    let { id, table, data } = req.body
    if (!id) {
        res.status(400).json({ error: 'id is required' });
    }
    if (!table) {
        res.status(400).json({ error: 'table is required' });
    }
    let obj = JSON.parse(data)
    const { error } = await getDB().from(table).update({ data: data }).eq('id', id)
    if (error) {
        res.status(400).json({ error: error.message });
    }
    res.json({ data });
})

export default app;