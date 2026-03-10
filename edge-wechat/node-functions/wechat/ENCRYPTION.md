# 微信消息加密解密说明

本服务完整支持微信公众号的三种消息加密模式。

## 三种加密模式

### 1. 明文模式（Plain Text）

**特点：**
- 消息不加密，直接传输 XML 或 JSON
- 仅适用于开发测试环境
- **不建议生产环境使用**

**配置：**
- 微信公众平台选择"明文模式"
- 无需配置 `WECHAT_ENCODING_AES_KEY`

### 2. 兼容模式（Compatible）

**特点：**
- 同时支持加密和明文消息
- 服务器自动识别并处理
- 适合从明文模式迁移到安全模式的过渡期

**配置：**
- 微信公众平台选择"兼容模式"
- **必须**配置 `WECHAT_ENCODING_AES_KEY`

### 3. 安全模式（Safe Mode）⭐️ 推荐

**特点：**
- 所有消息均加密传输
- 最高安全级别
- **生产环境强烈推荐**

**配置：**
- 微信公众平台选择"安全模式"
- **必须**配置 `WECHAT_ENCODING_AES_KEY`

## 快速配置

### 第一步：获取 EncodingAESKey

1. 登录 [微信公众平台](https://mp.weixin.qq.com)
2. 进入"开发" -> "基本配置" -> "服务器配置"
3. 点击"修改配置"
4. 在 **EncodingAESKey** 字段，点击"随机生成"按钮
5. 复制生成的 43 位字符串

### 第二步：配置环境变量

```bash
# 必需配置
export WECHAT_APPID="你的AppID"
export WECHAT_APPSECRET="你的AppSecret"
export WECHAT_TOKEN="你的Token"

# 使用安全模式或兼容模式时必需
export WECHAT_ENCODING_AES_KEY="你的43位EncodingAESKey"
```

### 第三步：选择加密模式

在微信公众平台的服务器配置中：
- 选择 **安全模式**（推荐）或 **兼容模式**
- 填写服务器 URL、Token 和 EncodingAESKey
- 提交配置

## 工作原理

### 接收加密消息

1. 微信服务器发送加密消息（XML 格式）：
```xml
<xml>
    <ToUserName><![CDATA[公众号]]></ToUserName>
    <Encrypt><![CDATA[加密的消息内容...]]></Encrypt>
</xml>
```

2. 服务器验证 `msg_signature` 签名
3. 使用 AES-256-CBC 解密 `Encrypt` 字段
4. 得到原始消息并处理

### 发送加密回复

1. 构建回复消息（XML）
2. 使用 AES-256-CBC 加密消息
3. 生成消息签名 `msg_signature`
4. 返回加密响应：
```xml
<xml>
    <Encrypt><![CDATA[加密的回复内容...]]></Encrypt>
    <MsgSignature><![CDATA[消息签名]]></MsgSignature>
    <TimeStamp>时间戳</TimeStamp>
    <Nonce><![CDATA[随机数]]></Nonce>
</xml>
```

## 加密算法详解

### AES-256-CBC 加密

**密钥生成：**
```javascript
// EncodingAESKey 是 43 位字符
// 补充 '=' 后做 base64 解码得到 32 字节的 AES key
const aesKey = Buffer.from(encodingAESKey + '=', 'base64');
```

**消息格式：**
```
[16字节随机字符串][4字节消息长度][消息内容][AppId]
```

**Padding：**
- 使用 PKCS#7 padding
- 块大小为 32 字节

**IV（初始向量）：**
- 使用 AES key 的前 16 字节作为 IV

### 签名算法

```javascript
// 排序并拼接
const tmpArr = [token, timestamp, nonce, encryptMsg].sort();
const tmpStr = tmpArr.join('');

// SHA1 计算签名
const signature = sha1(tmpStr);
```

## 测试加密功能

### 方法一：使用测试脚本

```bash
# 确保已配置环境变量
export WECHAT_APPID="your_app_id"
export WECHAT_TOKEN="your_token"
export WECHAT_ENCODING_AES_KEY="your_43_char_key"

# 启动服务
node [[default]].js

# 在另一个终端运行测试
node test-encrypt.js
```

### 方法二：使用微信客户端

1. 在微信公众平台选择"安全模式"
2. 提交配置并启用
3. 用手机发送消息给公众号
4. 查看服务器日志，应该看到：
```
收到加密消息
解密后的消息: <xml>...</xml>
回复加密消息
```

### 方法三：手动构造加密请求

查看 `test-encrypt.js` 文件了解如何：
- 加密原始消息
- 生成消息签名
- 构造请求参数

## 常见问题

### ❌ 签名验证失败

**原因：**
- Token 配置不一致
- EncodingAESKey 配置错误
- 时间戳或随机数参数缺失

**解决：**
```bash
# 检查配置
echo $WECHAT_TOKEN
echo $WECHAT_ENCODING_AES_KEY

# 查看服务器日志
# 确认 Token 和 EncodingAESKey 正确
```

### ❌ 消息解密失败

**原因：**
- EncodingAESKey 与微信平台配置不一致
- AppId 不匹配

**解决：**
1. 确认 `WECHAT_ENCODING_AES_KEY` 与微信平台完全一致
2. 确认 `WECHAT_APPID` 正确
3. 重新生成 EncodingAESKey 并同步更新

### ❌ AppId 验证失败

**原因：**
- 解密后的消息中 AppId 与配置的不匹配

**解决：**
```bash
# 检查 AppId
echo $WECHAT_APPID

# 确保与微信公众平台的 AppId 完全一致（区分大小写）
```

### ⚠️ 性能问题

加密解密会增加一定的计算开销：
- 单次解密约 1-3ms
- 单次加密约 1-3ms

**优化建议：**
- 使用 Node.js 原生 crypto 模块（已实现）
- 避免在解密过程中进行复杂运算
- 考虑使用集群模式处理高并发

## 安全建议

### ✅ 生产环境最佳实践

1. **使用安全模式**
   - 所有消息加密传输
   - 防止中间人攻击

2. **定期更换密钥**
   - 每 3-6 个月更换 EncodingAESKey
   - 使用兼容模式平滑过渡

3. **保护密钥安全**
   - 不要将密钥提交到代码仓库
   - 使用环境变量或密钥管理服务
   - 限制密钥访问权限

4. **监控异常**
   - 记录签名验证失败次数
   - 监控解密失败率
   - 设置告警机制

### ❌ 不要这样做

```bash
# 不要在代码中硬编码密钥
const encodingAESKey = 'abcdefg...'; // ❌

# 不要将密钥提交到 Git
git add .env  # ❌

# 不要在明文模式运行生产环境
encrypt_type: 'plain'  # ❌
```

## 技术细节

### 加密流程

```
原始消息
   ↓
构造消息体 [random(16) + msgLen(4) + msg + appId]
   ↓
PKCS#7 Padding (blockSize=32)
   ↓
AES-256-CBC 加密 (key=aesKey, iv=aesKey[0:16])
   ↓
Base64 编码
   ↓
加密消息
```

### 解密流程

```
加密消息
   ↓
Base64 解码
   ↓
AES-256-CBC 解密
   ↓
去除 Padding
   ↓
解析消息体 [random(16) + msgLen(4) + msg + appId]
   ↓
验证 AppId
   ↓
原始消息
```

### 代码实现位置

在 `[[default]].js` 文件中：

- **解密函数**：`decryptMessage(encryptedMsg)`
- **加密函数**：`encryptMessage(message)`
- **签名验证**：`checkMsgSignature(msgSignature, timestamp, nonce, encryptMsg)`
- **签名生成**：`generateMsgSignature(encryptMsg, timestamp, nonce)`

## 参考资料

- [微信公众平台技术文档 - 消息加解密](https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Message_encryption_and_decryption_instructions.html)
- [微信公众平台接口调试工具](https://mp.weixin.qq.com/debug/)
- [Node.js Crypto 模块文档](https://nodejs.org/api/crypto.html)

## 更新日志

- **v1.1.0** (2026-01-08)
  - ✅ 添加完整的消息加密解密支持
  - ✅ 支持明文、兼容、安全三种模式
  - ✅ 自动识别消息格式并正确响应
  - ✅ 添加测试脚本和详细文档

---

如有问题，请查看服务器日志或使用测试脚本进行调试。
