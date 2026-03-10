# 快速开始指南

## 第一步：配置环境变量

创建环境变量文件或在系统中设置：

```bash
export WECHAT_APPID="你的AppID"
export WECHAT_APPSECRET="你的AppSecret"  
export WECHAT_TOKEN="你的Token"  # 自定义，例如：myToken123
export WECHAT_ENCODING_AES_KEY="你的EncodingAESKey"  # 43位字符，用于消息加密（可选）
```

### 获取方式

1. 登录 [微信公众平台](https://mp.weixin.qq.com)
2. 进入"开发" -> "基本配置"
3. 获取 **开发者ID(AppID)** 和 **开发者密码(AppSecret)**
4. **Token** 是你自己设置的，用于验证消息来源（3-32位字母和数字）
5. **EncodingAESKey** 在配置服务器时生成（43位字符），用于消息加密（可选）

## 第二步：启动服务

```bash
cd node-functions/wechat
npm install  # 如果需要
node [[default]].js
```

服务会在默认端口启动（通常是 3000）。

## 第三步：配置微信服务器

### 数据格式支持

本服务支持以下两种数据格式，服务器会自动识别：
- ✅ **XML 格式**：微信官方标准格式
- ✅ **JSON 格式**：更易读和调试的格式

无论使用哪种格式发送请求，服务器都会用相同格式回复。

### 开发环境（使用内网穿透）

如果在本地开发，使用 ngrok 或 cloudflared：

```bash
# 使用 ngrok
ngrok http 3000

# 或使用 cloudflared
cloudflared tunnel --url http://localhost:3000
```

获得公网地址后（例如：`https://abc123.ngrok.io`）

### 配置步骤

1. 登录微信公众平台
2. 进入"开发" -> "基本配置" -> "服务器配置"
3. 点击"修改配置"
4. 填写：
   - **服务器地址(URL)**：`https://your-domain.com/recive`
   - **令牌(Token)**：与环境变量 `WECHAT_TOKEN` 一致
   - **消息加密密钥(EncodingAESKey)**：点击"随机生成"（或自己设置43位字符）
   - **消息加密方式**：
     * **明文模式**：不加密（仅开发测试）
     * **兼容模式**：支持加密和明文（推荐）
     * **安全模式**：仅加密（生产环境推荐）
   - **消息数据格式**：XML
5. 点击"提交"

如果验证成功，会显示"配置成功"。

**重要提示**：
- 使用**安全模式**或**兼容模式**时，必须配置 `WECHAT_ENCODING_AES_KEY` 环境变量
- 生产环境强烈建议使用**安全模式**以保护消息安全

## 第四步：测试消息接收

### 方式一：通过微信客户端测试

1. 用手机关注你的测试公众号
2. 发送文本消息：`你好`
3. 公众号会自动回复：`您发送的消息是：你好`

查看服务器控制台，应该能看到详细的消息日志（微信默认使用 XML 格式）。

### 方式二：使用测试脚本

```bash
# 修改 test-formats.js 中的 Token
# 然后运行测试脚本
node test-formats.js
```

这个脚本会测试 XML 和 JSON 两种格式的消息接收。

### 方式三：手动测试 JSON 格式

```bash
# 使用 curl 测试 JSON 格式
curl -X POST "http://localhost:3000/recive?signature=xxx&timestamp=xxx&nonce=xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "ToUserName": "gh_test",
    "FromUserName": "test_user",
    "CreateTime": 1234567890,
    "MsgType": "text",
    "Content": "测试消息"
  }'
```

## 第五步：发送通知消息

### 发送文本消息

```bash
curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "openId": "用户的openId",
    "type": "text",
    "content": "这是一条测试消息"
  }'
```

### 发送模板消息

```bash
curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{
    "openId": "用户的openId",
    "type": "template",
    "templateId": "你的模板ID",
    "data": {
      "first": {"value": "标题"},
      "keyword1": {"value": "内容1"},
      "keyword2": {"value": "内容2"},
      "remark": {"value": "备注"}
    }
  }'
```

## 如何获取用户的 openId？

### 方法一：通过关注事件

当用户关注公众号时，在服务器日志中可以看到：

```
关注事件: subscribe oLxxx-xxxxxxxxxx
```

其中 `oLxxx-xxxxxxxxxx` 就是用户的 openId。

### 方法二：修改代码保存 openId

在 `handleSubscribeEvent` 函数中添加保存逻辑：

```javascript
function handleSubscribeEvent(message) {
    console.log('关注事件:', message.Event, message.FromUserName);
    
    if (message.Event === 'subscribe') {
        const openId = message.FromUserName;
        // 保存到你的数据库
        console.log('新用户 openId:', openId);
        // saveToDatabase(openId);
        
        const replyMessage = {
            ToUserName: message.FromUserName,
            FromUserName: message.ToUserName,
            CreateTime: Math.floor(Date.now() / 1000),
            MsgType: 'text',
            Content: '欢迎关注！你的 openId 是：' + openId
        };
        return replyMessage;
    }
    
    return null;
}
```

## 自定义消息回复

### 修改文本消息处理

编辑 `handleTextMessage` 函数：

```javascript
function handleTextMessage(message) {
    const userMessage = message.Content;
    let replyContent = '';
    
    // 根据关键词回复
    if (userMessage.includes('帮助')) {
        replyContent = '使用指南：\n1. 发送"菜单"查看功能\n2. 发送"联系"获取客服信息';
    } else if (userMessage.includes('菜单')) {
        replyContent = '功能菜单：\n📱 查询订单\n💰 账户余额\n❓ 常见问题';
    } else {
        replyContent = `收到您的消息：${userMessage}`;
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

### 接入 AI 对话

```javascript
import axios from 'axios';

async function handleTextMessage(message) {
    try {
        // 调用 AI API
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message.Content }]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });
        
        const aiReply = response.data.choices[0].message.content;
        
        return {
            ToUserName: message.FromUserName,
            FromUserName: message.ToUserName,
            CreateTime: Math.floor(Date.now() / 1000),
            MsgType: 'text',
            Content: aiReply
        };
    } catch (error) {
        console.error('AI 调用失败:', error);
        return {
            ToUserName: message.FromUserName,
            FromUserName: message.ToUserName,
            CreateTime: Math.floor(Date.now() / 1000),
            MsgType: 'text',
            Content: '抱歉，服务暂时不可用'
        };
    }
}
```

## 常见问题排查

### ❌ 服务器验证失败

**检查项：**
- Token 是否配置正确
- 服务器地址是否可访问
- 端口是否开放
- 查看服务器日志

**解决方案：**
```bash
# 查看服务日志
tail -f server.log

# 测试签名验证
curl "http://localhost:3000/recive?signature=xxx&timestamp=xxx&nonce=xxx&echostr=test"
```

### ❌ 收不到用户消息

**检查项：**
- 服务器配置是否已启用
- 服务是否正常运行
- 响应时间是否超过 5 秒

**解决方案：**
确保服务在 5 秒内响应：
```javascript
// 设置超时处理
app.use((req, res, next) => {
    req.setTimeout(4000); // 4秒超时
    next();
});
```

### ❌ 发送消息失败

**检查项：**
- 用户是否关注了公众号
- openId 是否正确
- access_token 是否有效

**解决方案：**
```bash
# 测试 access_token
curl http://localhost:3000/token

# 查看错误信息
curl -X POST http://localhost:3000/notify \
  -H "Content-Type: application/json" \
  -d '{"openId": "xxx", "type": "text", "content": "test"}'
```

## 生产部署建议

1. **使用 HTTPS**：必须使用 SSL 证书
2. **使用 PM2 管理进程**：
   ```bash
   npm install -g pm2
   pm2 start [[default]].js --name wechat-service
   pm2 logs wechat-service
   ```
3. **配置日志系统**：使用 winston 或其他日志库
4. **添加监控告警**：使用 Sentry 或其他监控服务
5. **数据库存储**：保存用户 openId 和消息历史
6. **消息队列**：处理高并发场景

## 消息加密（可选）

### 为什么需要加密？

- 🔒 **安全性**：防止消息被窃听和篡改
- ✅ **合规性**：满足微信公众平台安全要求
- 🏢 **生产环境**：正式上线必须使用安全模式

### 配置加密模式

**方法一：使用随机生成（推荐）**

1. 在微信公众平台服务器配置页面
2. 点击 EncodingAESKey 右侧的"随机生成"按钮
3. 复制生成的 43 位密钥
4. 配置环境变量：
```bash
export WECHAT_ENCODING_AES_KEY="生成的43位密钥"
```
5. 选择"安全模式"或"兼容模式"
6. 提交配置

**方法二：自定义密钥**

EncodingAESKey 必须是 43 位字符（A-Z, a-z, 0-9）

```bash
# 生成随机密钥（Linux/Mac）
cat /dev/urandom | base64 | head -c 43

# 配置环境变量
export WECHAT_ENCODING_AES_KEY="你的43位密钥"
```

### 测试加密功能

```bash
# 启动服务
node [[default]].js

# 在另一个终端运行加密测试
node test-encrypt.js
```

查看详细说明：[消息加密文档](./ENCRYPTION.md)

## 下一步

- 阅读完整文档：`README.md`
- 查看加密说明：`ENCRYPTION.md`
- 查看测试指南：`test-message.md`
- 自定义消息处理逻辑
- 接入数据库存储用户信息
- 实现更多业务功能

## 技术支持

如有问题，请查看：
1. 控制台日志输出
2. 微信公众平台的"接口调试工具"
3. 微信公众平台开发文档

祝你使用愉快！🎉

