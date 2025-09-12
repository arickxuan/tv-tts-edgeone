import express from "express";
const app = express();

// 添加日志中间件
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// 添加根路由处理
app.get("/", (req, res) => {
    res.json({ message: "Hello from Express on Node Functions!" });
});

// 导出处理函数
export default app;