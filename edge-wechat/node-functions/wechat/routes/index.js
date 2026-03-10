/**
 * 路由入口
 * 汇总所有路由模块
 */

import receiveRouter from './receive.js';
import notifyRouter from './notify.js';
import kefuRouter from './kefu.js';
import tokenRouter from './token.js';
import adminRouter from './admin.js';
import fensiRouter from './fensi.js';
import xiaochengxuRouter from './xiaochengxu.js';
import { getAllAccounts } from '../config/index.js';
import wxloginRouter from './wx_login.js'
import telRouter from './tel.js'

/**
 * 注册所有路由到 app
 * @param {object} app - Express app 实例
 */
export function registerRoutes(app) {
    // tel
    app.use('/', telRouter);
    // 接收消息路由
    app.use('/', receiveRouter);
    
    //  消息通知路由
    app.use('/', notifyRouter);
    
    //  客服管理路由
    app.use('/', kefuRouter);
    
    //  Token 调试路由
    app.use('/', tokenRouter);

    app.use('/admin', adminRouter);

    app.use('/', fensiRouter);

    app.use('/', xiaochengxuRouter);

    app.use('/', wxloginRouter);

    


    
    console.log('所有路由已注册');
}

export default {
    registerRoutes,
    receiveRouter,
    notifyRouter,
    kefuRouter,
    tokenRouter
};
