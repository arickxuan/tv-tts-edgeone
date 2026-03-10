import Redis from 'ioredis';


class RedisClient {
    constructor() {
        if (RedisClient.instance) {
            return RedisClient.instance;
        }

        this.client = new Redis(process.env.UPSTASH_REDIS_URI, {
            tls: { rejectUnauthorized: false },
            lazyConnect: true, // 延迟连接直到需要时
            enableOfflineQueue: true, // 允许离线时缓存命令
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

// 创建全局实例
let redisClient = null;

export async function getRedisClient() {
    if (!redisClient) {
        // 检查是否配置了 Redis URI
        if (!process.env.UPSTASH_REDIS_URI) {
            throw new Error('UPSTASH_REDIS_URI 环境变量未配置');
        }
        
        redisClient = new RedisClient().client;
        
        try {
            // ioredis 默认会自动连接，不需要显式调用 connect()
            // 我们只需要测试连接是否正常
            await redisClient.ping();
            console.log('✅ Redis 连接成功');
        } catch (error) {
            console.error('❌ Redis 连接失败:', error.message);
            redisClient = null; // 重置以便下次重试
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