
import express from "express";
import cors from 'cors';
import routes from "./musicRoutes.js";


const app = express();
// 允许所有来源的跨域请求
app.use(cors());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});


app.use("/", routes);

export default app;