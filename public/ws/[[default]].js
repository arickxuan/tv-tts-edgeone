const { WebSocket, createWebSocketStream } = require('ws');
// const http = require('http');
import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "http";

const app = express();
const server = createServer(app);

// 创建 WebSocket 服务器
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
    console.log("WebSocket 连接成功");
    ws.on('message', msg => {
        if (msg.length < 18) {
            console.error("数据长度无效");
            return;
        }
        try {
            const [VERSION] = msg;
            const id = msg.slice(1, 17);
            if (!id.every((v, i) => v == parseInt(uuid.substr(i * 2, 2), 16))) {
                console.error("UUID 验证失败");
                return;
            }
            let i = msg.slice(17, 18).readUInt8() + 19;
            const port = msg.slice(i, i += 2).readUInt16BE(0);
            const ATYP = msg.slice(i, i += 1).readUInt8();
            const host = ATYP === 1 ? msg.slice(i, i += 4).join('.') :
                (ATYP === 2 ? new TextDecoder().decode(msg.slice(i + 1, i += 1 + msg.slice(i, i + 1).readUInt8())) :
                    (ATYP === 3 ? msg.slice(i, i += 16).reduce((s, b, i, a) => (i % 2 ? s.concat(a.slice(i - 1, i + 1)) : s), []).map(b => b.readUInt16BE(0).toString(16)).join(':') : ''));
            console.log('连接到:', host, port);
            ws.send(new Uint8Array([VERSION, 0]));
            const duplex = createWebSocketStream(ws);
            net.connect({ host, port }, function () {
                this.write(msg.slice(i));
                duplex.on('error', err => console.error("E1:", err.message)).pipe(this).on('error', err => console.error("E2:", err.message)).pipe(duplex);
            }).on('error', err => console.error("连接错误:", err.message));
        } catch (err) {
            console.error("处理消息时出错:", err.message);
        }
    })
    //.on('error', err => console.error("WebSocket 错误:", err.message));

    // 处理连接关闭
    ws.on("close", () => {
        console.log(`[${new Date().toISOString()}] WebSocket 连接关闭`);
    });

    // 处理错误
    ws.on("error", (error) => {
        console.error(`[${new Date().toISOString()}] WebSocket 错误:`, error);
    });

});


// 添加日志中间件
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// 添加根路由处理
app.get("/", (req, res) => {
    res.json({
        message: "Hello from Express on Node Functions!",
        websocket: "WebSocket 服务器已启动",
        endpoints: {
            http: "HTTP API 可用",
            websocket: "连接到 / 使用 WebSocket 协议"
        }
    });
});

// WebSocket 状态检查端点
app.get("/websocket-status", (req, res) => {
    res.json({
        connectedClients: wss.clients.size,
        status: "active",
        protocol: "WebSocket"
    });
});

// 导出服务器而不是 app
// export { server as default, wss };
export default app;