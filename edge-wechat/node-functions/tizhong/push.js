// const admin = require('firebase-admin');
import admin from "firebase-admin";
// const jwt = require("jsonwebtoken");
import jwt from "jsonwebtoken";
import { getMessaging } from "firebase-admin/messaging";
//const https = require('https');
import fs from "fs";
import { readFileSync } from "fs";

import https from "https";
import { fileURLToPath } from "url";
import { dirname } from "path";

import dotenv from "dotenv";

dotenv.config();
const FB_CONFIG = {
  FB_ACCOUNT_KEY: process.env.FB_ACCOUNT_KEY,
  FB_PROJECT_ID: process.env.FB_PROJECT_ID,
  FB_DEVICE_TOKEN: process.env.FB_DEVICE_TOKEN,
};

// 初始化（使用服务账号密钥文件）
//const serviceAccount = require(FB_CONFIG.FB_ACCOUNT_KEY);
const serviceAccount = JSON.parse(
  readFileSync(new URL(FB_CONFIG.FB_ACCOUNT_KEY, import.meta.url)),
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 发送通知到单个设备
async function sendToDevice(deviceToken, title, body, data = {}) {
  try {
    const message = {
      token: deviceToken,
      notification: {
        title: title,
        body: body,
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channel_id: "fcm_channel",
          click_action: "OPEN_ACTIVITY",
        },
      },
      data: data,
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log("发送成功:", response);
    return response;
  } catch (error) {
    console.error("发送失败:", error);
    throw error;
  }
}

// 发送通知到单个设备
async function sendToDeviceBack(deviceToken, title, body, data = {}) {
  try {
    const message = {
      token: deviceToken,
      data: {
        title: title,
        body: body,
        key1: "value1",
      },
      android: {
        priority: "high",
      },
      apns: {
        headers: {
          "apns-priority": "10", // iOS 高优先级 (10 为立即发送)
        },
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
      webpush: {
        headers: {
          Urgency: "high", // Web 推送高优先级
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log("发送成功:", response);
    return response;
  } catch (error) {
    console.error("发送失败:", error);
    throw error;
  }
}

// 发送到主题
async function sendToTopic(topic, title, body) {
  const message = {
    topic: topic,
    notification: {
      title: title,
      body: body,
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("发送到主题成功:", response);
    return response;
  } catch (error) {
    console.error("发送失败:", error);
  }
}

// 批量发送
async function sendMulticast(tokens, title, body) {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    tokens: tokens, // 最多 500 个 token
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(
      "批量发送完成:",
      response.successCount,
      "成功,",
      response.failureCount,
      "失败",
    );

    // 处理失败的 token
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Token ${tokens[idx]} 失败:`, resp.error);
        }
      });
    }
    return response;
  } catch (error) {
    console.error("批量发送失败:", error);
  }
}

// 使用示例
async function main() {
  const deviceToken = FB_CONFIG.FB_DEVICE_TOKEN;

  // 发送简单通知
  await sendToDevice(deviceToken, "测试通知", "这是通知内容22", {
    type: "test",
    timestamp: Date.now().toString(),
  });

  // 发送到主题
  await sendToTopic("global_notifications", "全局公告", "系统维护通知2");

  await sendToDeviceBack(deviceToken, "测试houtai通知", "这是hou通知内容22", {
    type: "test",
    timestamp: Date.now().toString(),
  });

  // 批量发送
  // await sendMulticast(
  //   ["token1", "token2", "token3"],
  //   "批量通知",
  //   "这是一条批量消息",
  // );
}

class FCMV1SimpleClient {
  constructor(projectId, serviceAccountPath) {
    this.projectId = projectId;
    this.serviceAccountPath = serviceAccountPath;
    this.url = `/v1/projects/${projectId}/messages:send`;
    this.hostname = "fcm.googleapis.com";

    // 加载服务账号
    this.serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, "utf8"),
    );
  }

  async getAccessToken() {
    // 使用 JWT 获取 access token
    const jwt = this.createJWT();

    const options = {
      hostname: "oauth2.googleapis.com",
      path: "/token",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const response = JSON.parse(data);
            resolve(response.access_token);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on("error", reject);
      req.write(
        "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=" +
          jwt,
      );
      req.end();
    });
  }

  createJWT() {
    // 简化的 JWT 创建（实际需要完整实现）
    // 建议使用 jsonwebtoken 库

    const now = Math.floor(Date.now() / 1000);

    const payload = {
      iss: this.serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };

    return jwt.sign(payload, this.serviceAccount.private_key, {
      algorithm: "RS256",
    });
  }

  async sendNotification(token, title, body) {
    const accessToken = await this.getAccessToken();

    const message = {
      message: {
        token: token,
        notification: {
          title: title,
          body: body,
        },
      },
    };

    const options = {
      hostname: this.hostname,
      path: this.url,
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          resolve(JSON.parse(data));
        });
      });

      req.on("error", reject);
      req.write(JSON.stringify(message));
      req.end();
    });
  }
}

main();
//
let client = new FCMV1SimpleClient(
  FB_CONFIG.FB_PROJECT_ID,
  FB_CONFIG.FB_ACCOUNT_KEY,
);
// client.getAccessToken().then((accessToken) => {
//   console.log(accessToken);
// });
