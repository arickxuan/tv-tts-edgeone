/**
 * 微信公众号服务 - 主应用文件
 * 重构版本：模块化、支持多账号
 */

import express from 'express';
import cors from 'cors';
import { addAccount, getAllAccounts } from './config/index.js';
import { registerRoutes } from './routes/index.js';

const app = express();

// 允许所有来源的跨域请求
app.use(cors());

// 支持多种内容类型
// 重要：必须先处理 XML，再处理 JSON，避免 JSON 中间件错误处理 XML
app.use(express.text({ type: 'text/xml' })); // 处理 text/xml
app.use(express.text({ type: 'application/xml' })); // 处理 application/xml
app.use(express.json()); // 处理 application/json
app.use(express.urlencoded({ extended: true })); // 处理 application/x-www-form-urlencoded

// 注册所有路由
registerRoutes(app);

// 首页路由
app.get('/', (req, res) => {
    const accounts = getAllAccounts();
    
    res.json({ 
        service: "微信公众号消息服务", 
        version: "2.0.0",
        features: [
            "✅ 模块化架构",
            "✅ 支持多账号",
            "✅ 消息加密解密",
            "✅ 完整的 API 支持"
        ],
        accounts: accounts.length > 0 ? accounts : ['default'],
        endpoints: {
            receive: "/:bundleId/recive - 接收微信消息（支持多账号）",
            notify: "/:bundleId/notify - 发送通知消息",
            kefu: {
                list: "/:bundleId/kefu/list - 获取客服列表",
                online: "/:bundleId/kefu/online - 获取在线客服",
                add: "/:bundleId/kefu/add - 添加客服账号"
            },
            token: "/:bundleId/token - 获取 access_token（调试）"
        },
        notes: [
            "bundleId 用于区分不同的微信公众号账号",
            "如果不指定 bundleId，将使用 'default' 账号",
            "示例：/default/recive 或 /recive"
        ]
    });
});

/**
 * 账号管理路由
 */
app.get('/accounts', (req, res) => {
    const accounts = getAllAccounts();
    res.json({
        code: 0,
        msg: "success",
        data: {
            accounts: accounts,
            total: accounts.length
        }
    });
});

/**
 * 添加账号配置（用于动态添加账号）
 * POST /accounts/add
 * 
 * 请求参数:
 * {
 *   "bundleId": "账号标识",
 *   "appId": "微信 AppId",
 *   "appSecret": "微信 AppSecret",
 *   "token": "微信 Token",
 *   "encodingAESKey": "消息加密密钥（可选）"
 * }
 */
app.post('/accounts/add', (req, res) => {
    try {
        const { bundleId, appId, appSecret, token, encodingAESKey } = req.body;
        
        if (!bundleId || !appId || !appSecret || !token) {
            return res.status(400).json({
                code: 400,
                msg: "缺少必要参数: bundleId, appId, appSecret, token"
            });
        }
        
        addAccount(bundleId, {
            appId,
            appSecret,
            token,
            encodingAESKey: encodingAESKey || ''
        });
        
        res.json({
            code: 0,
            msg: "账号添加成功",
            data: { bundleId }
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            msg: error.message
        });
    }
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        code: 500,
        msg: "服务器内部错误",
        error: err.message
    });
});

export default app;
