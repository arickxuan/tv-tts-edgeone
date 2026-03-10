import express from "express";
import cors from 'cors';
import routes from "./router/index.js";
const app = express();

// 允许所有来源的跨域请求
app.use(cors());

// 添加日志中间件
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// 使用路由
app.use("/", routes.router);
// 添加根路由处理
// app.get("/", (req, res) => {
//     res.json({ message: "Hello from Express on Node Functions!" });
// });

// 导出处理函数
export default app;