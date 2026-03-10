# 微信公众号服务 v2.0.0

一个功能完整、模块化的微信公众号服务，支持消息接收、发送、加密解密和多账号管理。

## ✨ 主要特性

- ✅ **模块化架构** - 代码结构清晰，易于维护和扩展
- ✅ **多账号支持** - 一个服务管理多个微信公众号
- ✅ **消息加密** - 支持明文、兼容、安全三种模式
- ✅ **完整 API** - 消息发送、客服管理、模板消息等
- ✅ **智能解析** - 自动识别 JSON 和 XML 格式
- ✅ **易于扩展** - 插件化设计，方便添加自定义功能

## 🚀 快速开始

### 安装依赖

```bash
npm install express cors axios
```

### 配置环境变量

```bash
export WECHAT_APPID="你的AppID"
export WECHAT_APPSECRET="你的AppSecret"
export WECHAT_TOKEN="你的Token"
export WECHAT_ENCODING_AES_KEY="你的EncodingAESKey"  # 可选，使用加密模式时需要
```

### 启动服务

```bash
node [[default]].js
```

服务将在默认端口启动（通常是 3000）。

## 📁 项目结构

```
wechat/
├── [[default]].js      # 入口文件
├── app.js              # Express 应用主文件
├── config/             # 配置管理
│   └── index.js       # 多账号配置
├── api/                # 微信 API
│   ├── token.js       # Token 管理
│   ├── message.js     # 消息发送
│   └── kefu.js        # 客服管理
├── handlers/           # 消息处理器
│   ├── message.js     # 消息处理
│   ├── event.js       # 事件处理
│   └── index.js       # 处理器入口
├── routes/             # 路由模块
│   ├── receive.js     # 接收消息
│   ├── notify.js      # 消息通知
│   ├── kefu.js        # 客服管理
│   ├── token.js       # Token 调试
│   └── index.js       # 路由入口
└── utils/              # 工具函数
    ├── crypto.js      # 加密解密
    ├── signature.js   # 签名验证
    └── xml.js         # XML 处理
```

## 📖 API 文档

### 基础路由

| 路由 | 方法 | 说明 |
|------|------|------|
| `/` | GET | 服务信息 |
| `/accounts` | GET | 获取账号列表 |
| `/accounts/add` | POST | 添加账号 |

### 消息接收

| 路由 | 方法 | 说明 |
|------|------|------|
| `/recive` | GET/POST | 接收微信消息（默认账号） |
| `/:bundleId/recive` | GET/POST | 接收消息（指定账号） |

### 消息发送

| 路由 | 方法 | 说明 |
|------|------|------|
| `/notify` | POST | 发送消息（默认账号） |
| `/:bundleId/notify` | POST | 发送消息（指定账号） |

### 客服管理

| 路由 | 方法 | 说明 |
|------|------|------|
| `/kefu/list` | GET | 获取客服列表 |
| `/kefu/online` | GET | 获取在线客服 |
| `/kefu/add` | POST | 添加客服账号 |
| `/:bundleId/kefu/*` | * | 指定账号的客服操作 |

### Token 调试

| 路由 | 方法 | 说明 |
|------|------|------|
| `/token` | GET | 获取 access_token |
| `/:bundleId/token` | GET | 获取指定账号的 token |

## 🔐 多账号支持

### 添加账号

```bash
curl -X POST http://localhost:3000/accounts/add \
  -H "Content-Type: application/json" \
  -d '{
    "bundleId": "account1",
    "appId": "wx1234567890",
    "appSecret": "abc123...",
    "token": "myToken",
    "encodingAESKey": "abc..."
  }'
```

### 使用指定账号

```bash
# 接收消息
https://your-domain.com/account1/recive

# 发送消息
curl -X POST https://your-domain.com/account1/notify \
  -H "Content-Type: application/json" \
  -d '{"openId": "xxx", "type": "text", "content": "Hello"}'
```

## 💬 使用示例

### 发送文本消息

```bash
curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "openId": "用户openId",
    "type": "text",
    "content": "这是一条测试消息"
  }'
```

### 发送模板消息

```bash
curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "openId": "用户openId",
    "type": "template",
    "templateId": "模板ID",
    "data": {
      "first": {"value": "标题"},
      "keyword1": {"value": "内容1"},
      "remark": {"value": "备注"}
    }
  }'
```

### 批量发送

```bash
curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "openIds": ["openId1", "openId2", "openId3"],
    "type": "text",
    "content": "群发消息"
  }'
```

## 🛠️ 自定义扩展

### 修改消息处理逻辑

编辑 `handlers/message.js`:

```javascript
export function handleTextMessage(message) {
    // 自定义逻辑
    const userMessage = message.Content;
    
    let replyContent;
    if (userMessage.includes('帮助')) {
        replyContent = '这里是帮助信息...';
    } else {
        replyContent = `收到: ${userMessage}`;
    }
    
    return {
        ToUserName: message.FromUserName,
        FromUserName: message.ToUserName,
        CreateTime: Math.floor(Date.now() / 1000),
        MsgType: 'text',
        Content: replyContent
    };
}
```

### 添加新的 API 接口

1. 在 `api/` 创建新文件
2. 在 `routes/` 创建对应路由
3. 在 `routes/index.js` 注册路由

## 📚 文档

- [快速开始指南](./QUICKSTART.md) - 详细的配置和使用说明
- [重构说明](./REFACTOR.md) - 项目重构详情
- [使用示例](./EXAMPLES.md) - 更多使用案例
- [加密说明](./ENCRYPTION.md) - 消息加密详解
- [更新日志](./CHANGELOG.md) - 版本更新记录

## 🧪 测试

### 测试消息格式

```bash
node test-formats.js
```

### 测试加密功能

```bash
node test-encrypt.js
```

## 🔒 安全建议

1. **生产环境使用安全模式** - 配置 EncodingAESKey 并选择安全模式
2. **保护密钥安全** - 不要将密钥提交到代码仓库
3. **使用 HTTPS** - 生产环境必须使用 SSL 证书
4. **定期更换密钥** - 每 3-6 个月更换一次
5. **限制访问权限** - 使用防火墙和访问控制

## 📊 性能

- **启动时间**: < 100ms
- **响应时间**: < 50ms（不含微信 API 调用）
- **并发支持**: 取决于服务器配置
- **内存占用**: ~50MB（空闲状态）

## 🐛 问题排查

### 签名验证失败

检查：
- Token 配置是否正确
- 微信平台配置是否一致
- 服务器时间是否准确

### 消息解密失败

检查：
- EncodingAESKey 配置是否正确
- AppId 是否匹配
- 加密模式是否选对

### 发送消息失败

检查：
- access_token 是否有效
- 用户是否关注公众号
- openId 是否正确

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

感谢微信公众平台提供的 API 和文档支持。

---

**版本**: v2.0.0  
**更新日期**: 2026-01-08  
**作者**: Your Name
