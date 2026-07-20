import Redis from 'ioredis';
import { config } from '../config/index.js';

class RedisClient {
  constructor() {
    if (RedisClient.instance) {
      return RedisClient.instance;
    }

    this.client = new Redis(config.redis.uri, {
      tls: { rejectUnauthorized: false },
      lazyConnect: true,
      enableOfflineQueue: true,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    RedisClient.instance = this;
  }

  static getClient() {
    if (!RedisClient.instance) {
      new RedisClient();
    }
    return RedisClient.instance.client;
  }
}

let redisClient = null;

export async function getRedisClient() {
  if (!redisClient) {
    if (!config.redis.uri) {
      throw new Error('UPSTASH_REDIS_URI 环境变量未配置');
    }

    redisClient = new RedisClient().client;

    try {
      await redisClient.ping();
      console.log('Redis 连接成功');
    } catch (error) {
      console.error('Redis 连接失败:', error.message);
      redisClient = null;
      throw error;
    }
  }
  return redisClient;
}

export async function closeRedisClient() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
