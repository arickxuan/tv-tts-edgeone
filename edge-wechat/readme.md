# TGFS 上传接口使用说明

文件存储服务（`node-functions/tg`）。本地默认 `http://localhost:3000`，EdgeOne 部署后一般为 `https://你的域名/tg`。

管理界面：`/` 或 `/ui`

---

## 鉴权

除下载与用户注册外，写操作需携带 API Token（环境变量 `TGFS_API_TOKEN`）：

```http
X-API-Key: <TGFS_API_TOKEN>
```

或：

```http
Authorization: Bearer <TGFS_API_TOKEN>
```

---

## 上传文件

`POST /api/upload`  
`Content-Type: multipart/form-data`

| 字段 | 必填 | 说明 |
|------|------|------|
| `file` | 是 | 文件本体 |
| `key` / `path` | 否 | 对象路径，默认用原文件名 |
| `bucket` | 否 | 桶名，默认 `TGFS_DEFAULT_BUCKET`（通常为 `default`） |
| `backend` / `blob` | 否 | `github` 或 `telegram`；不传则用该 bucket 配置，再回落到 `TGFS_BLOB_BACKEND` |

### curl 示例

```bash
# 默认后端上传
curl -X POST 'http://localhost:3000/api/upload' \
  -H 'X-API-Key: your-token' \
  -F 'file=@./photo.jpg' \
  -F 'key=photos/photo.jpg' \
  -F 'bucket=github'

# 指定存到 Telegram
curl -X POST 'http://localhost:3000/api/upload' \
  -H 'X-API-Key: your-token' \
  -F 'file=@./a.bin' \
  -F 'key=a.bin' \
  -F 'bucket=default' \
  -F 'backend=telegram'
```

### 成功响应

```json
{
  "ok": true,
  "bucket": "github",
  "key": "photos/photo.jpg",
  "etag": "...",
  "size": 12345,
  "contentType": "image/jpeg",
  "backend": "github",
  "url": "/api/files/photos/photo.jpg"
}
```

---

## 下载文件

`GET /api/files/{key}?bucket={bucket}`

**必须带 `bucket`**，否则会用默认桶，容易 `NoSuchKey`。

```bash
# 正确
curl -O 'http://localhost:3000/api/files/photos/photo.jpg?bucket=github'

# 错误（缺 bucket，会去 default 里找）
curl 'http://localhost:3000/api/files/photos/photo.jpg'
```

完整地址示例：

```
http://localhost:3000/api/files/IMG202607141511381.jpg?bucket=github
```

---

## 相关接口（简要）

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/users/reg` | 注册 PocketBase 用户（无需 Token） |
| `GET` | `/api/list?bucket=&prefix=&delimiter=/` | 列目录 |
| `DELETE` | `/api/files/{key}?bucket=&recursive=1` | 删除 |
| `PUT` | `/api/mkdir/{key}?bucket=` | 建目录 |
| `GET` | `/api/buckets` | 列出 bucket |
| `PUT` | `/api/buckets/{name}` | 设置 bucket 默认后端 `{"backend":"github"}` |
| `GET` | `/ping` | 健康检查 |

### 注册用户

`POST /api/users/reg`（无需 Token，写入 `POCKETBASE_URL` 的 users 集合）

```bash
curl -X POST 'http://localhost:3000/api/users/reg' \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"新用户密码"}'
```

S3 兼容：`/s3`（SigV4）
WebDAV：`/dav/{bucket}/`（Basic Auth）  
二者上传后端读 **bucket 在数据库中的配置**，不接受 query/header 覆盖。

---

## 限制

- Telegram：上传约 50MB，下载约 20MB  
- GitHub：建议注意网络；大文件走 Git Data API  
- EdgeOne 函数 `maxDuration` 约 120s  
