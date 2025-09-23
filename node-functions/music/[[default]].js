
import express from "express";
import routes from "./musicRoutes.js";


const app = express();

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
app.use("/", routes);

export default app;