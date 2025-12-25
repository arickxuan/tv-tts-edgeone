# 小米运动刷步数 JavaScript 版本

这是小米运动刷步数程序的 JavaScript 版本，从 Python 版本转换而来。

## 文件结构

```
js/
├── main.js                 # 主程序文件
├── util/
│   ├── aes_help.js        # AES 加密解密工具
│   ├── zepp_helper.js     # Zepp API 辅助函数
│   └── push_util.js       # 推送通知工具
└── README.md              # 本文件
```

## 依赖项

所需的 npm 包：
- `axios` - HTTP 客户端（已在项目 package.json 中）
- Node.js 内置模块：`crypto`、`fs`、`querystring`

## 环境变量配置

### 必需环境变量

- `CONFIG`: JSON 格式的配置字符串，包含以下字段：
  ```json
  {
    "USER": "账号1#账号2#账号3",
    "PWD": "密码1#密码2#密码3",
    "MIN_STEP": 18000,
    "MAX_STEP": 25000,
    "SLEEP_GAP": 5,
    "USE_CONCURRENT": "False",
    "PUSH_PLUS_TOKEN": "pushplus token",
    "PUSH_PLUS_HOUR": "8",
    "PUSH_PLUS_MAX": 30,
    "PUSH_WECHAT_WEBHOOK_KEY": "企业微信 webhook key",
    "TELEGRAM_BOT_TOKEN": "telegram bot token",
    "TELEGRAM_CHAT_ID": "telegram chat id"
  }
  ```

### 可选环境变量

- `AES_KEY`: 16字节的AES密钥，用于加密保存token（可选）

## 使用方法

### 1. 安装依赖

```bash
cd /Users/arick/taruiProject/edgeone
npm install
```

### 2. 设置环境变量

```bash
# Linux/Mac
export CONFIG='{"USER":"your_account","PWD":"your_password",...}'
export AES_KEY="your_16_byte_key"  # 可选

# Windows
set CONFIG={"USER":"your_account","PWD":"your_password",...}
set AES_KEY=your_16_byte_key  # 可选
```

### 3. 运行程序

```bash
node js/main.js
```

## 功能说明

### 主要功能

1. **登录认证**
   - 支持手机号和邮箱登录
   - 自动处理 token 刷新
   - 支持加密保存 token

2. **刷步数**
   - 根据时间自动调整步数范围
   - 支持随机步数
   - 支持多账号批量处理

3. **推送通知**
   - 支持 PushPlus 推送
   - 支持企业微信 Webhook
   - 支持 Telegram Bot

### 核心类和函数

#### MiMotionRunner 类

```javascript
const runner = new MiMotionRunner(user, password);
const [message, success] = await runner.loginAndPostStep(minStep, maxStep, userTokens);
```

#### 工具函数

- `getMinMaxByTime(timeBj, config)` - 根据时间获取步数范围
- `desensitizeUserName(user)` - 账号脱敏
- `prepareUserTokens(aesKey)` - 准备用户 token
- `persistUserTokens(userTokens, aesKey)` - 持久化 token

## 配置说明

### 账号配置

- `USER`: 账号列表，使用 `#` 分隔多个账号
- `PWD`: 密码列表，使用 `#` 分隔多个密码
- 账号和密码需要一一对应

### 步数配置

- `MIN_STEP`: 最小步数（默认 18000）
- `MAX_STEP`: 最大步数（默认 25000）
- 程序会根据当前时间自动调整步数范围

### 执行配置

- `SLEEP_GAP`: 多账号执行间隔（秒），默认 5
- `USE_CONCURRENT`: 是否并发执行，`"True"` 或 `"False"`

### 推送配置

- `PUSH_PLUS_TOKEN`: PushPlus 推送 token
- `PUSH_PLUS_HOUR`: 推送时间点（小时）
- `PUSH_PLUS_MAX`: 推送最大账号数
- `PUSH_WECHAT_WEBHOOK_KEY`: 企业微信 Webhook Key
- `TELEGRAM_BOT_TOKEN`: Telegram Bot Token
- `TELEGRAM_CHAT_ID`: Telegram Chat ID

## 加密说明

### Token 加密存储

如果设置了 `AES_KEY`（16字节），程序会自动加密保存用户 token 到 `encrypted_tokens.data` 文件中。

好处：
- 避免频繁登录
- Token 加密存储更安全
- 自动刷新过期 token

### 加密算法

- 算法：AES-128-CBC
- 填充：PKCS7
- IV：随机生成（动态 token）或固定（华米 API）

## 注意事项

1. **账号安全**
   - 建议使用环境变量而非硬编码配置
   - 不要将配置文件提交到版本控制系统
   - 建议启用 AES_KEY 加密

2. **执行频率**
   - 避免过于频繁请求
   - 建议使用 `SLEEP_GAP` 设置合理间隔
   - 可以配合 cron 定时任务使用

3. **多账号处理**
   - 并发模式（`USE_CONCURRENT: "True"`）速度快但可能触发限流
   - 顺序模式更稳定但耗时较长

## 错误处理

程序会自动处理以下情况：
- Token 过期自动刷新
- 网络请求失败重试
- 登录失败提示
- 账号密码错误提示

## 与 Python 版本的差异

1. **语法差异**
   - 异步处理：Python 使用同步请求，JS 使用 async/await
   - 类型：Python 使用类型提示，JS 使用 JSDoc 注释
   - 模块：Python 使用 import，JS 使用 require

2. **功能一致**
   - 所有核心功能与 Python 版本一致
   - API 调用逻辑完全相同
   - 加密算法完全兼容

3. **性能**
   - JS 版本支持真正的并发执行（Promise.all）
   - Python 版本使用线程池并发

## 开发说明

### 添加新功能

1. 修改 `main.js` 添加主逻辑
2. 在 `util/` 目录下添加工具函数
3. 更新 `README.md` 文档

### 调试

```javascript
// 在代码中添加调试日志
console.log('Debug info:', variable);

// 或使用 Node.js 调试器
node --inspect-brk js/main.js
```

## 许可证

与原 Python 版本保持一致

## 贡献

欢迎提交 Issue 和 Pull Request

## 更新日志

### v1.0.0 (2024-12-24)
- 从 Python 版本完整转换
- 支持所有原有功能
- 添加详细文档


