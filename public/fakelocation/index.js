/* 
    FakeLocation-Server
    File: index.js
    Description: Main code to create the express web server and dispatch the requests.
    Author: BobH
    Time: 2022-5-11
    A free and open source api server for app "Fake Location @ 1.3.0.2"
*/

import express from 'express';
import logger from './node-functions/logger.js';
import core from './node-functions/core.js';
import fake from './node-functions/fake.js';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 使用路由
app.use("/", fake.router);

const server = app.listen(8000, () => {
    let host = server.address().address;
    let port = server.address().port;
    core.Init();
    logger.LogInfo("Server running at http://" + host + ":" + port + "!");
});