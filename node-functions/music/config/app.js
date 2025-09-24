// import path from 'path';


// 应用配置文件
export default {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',

  // WebSocket配置
  websocket: {
    uuid: process.env.UUID || 'fc3ac1f6-56aa-42e5-8ae4-9daffb4295e3',
    domain: process.env.DOMAIN || '',
    name: process.env.NAME || 'arickxuan',
    path: '/ws'
  },

  // SS消息WebSocket配置
  messageWebSocket: {
    path: '/msg-ws',
    password: process.env.SS_PASSWORD || 'default-password',
    method: process.env.SS_METHOD || 'aes-256-gcm',
    port: process.env.SS_PORT || 8080
  },

  // S3配置
  s3: [
    {
    name: 'tebi',
    accessKeyId: 'Tb4GL625OaD9DKRR',
    secretAccessKey: 'jw4UY17mJNt18MrVfLfiFFimQnrFiE8oSTSAc3Kp',
    endpoint: 'https://s3.tebi.io',
    region: process.env.S3_REGION || 'global',
    bucket: 'soft'
  },
  ],
  // QQ音乐API配置
  qq: {
    proxy: "https://cors.zme.ink/",
    baseUrl: "https://c.y.qq.com/v8/fcg-bin/fcg_v8_playlist_cp.fcg"
  },
  gd:{
    proxy: "https://cors.zme.ink/",
    baseUrl: "https://music-api.gdstudio.xyz/api.php"
  },
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    aria2Url: process.env.ARIA2_RPC_URL || 'http://localhost:6800/jsonrpc',
    aria2Token: process.env.ARIA2_TOKEN || '',
    // downloadDir: process.env.DOWNLOAD_DIR || path.resolve('downloads'),
  }
};
