import PocketBase from 'pocketbase';
import { config } from '../config/index.js';

const USERS = 'users';

let pbInstance = null;
let authAt = 0;

async function getPb() {
  if (!config.pocketbase.url) {
    throw new Error('POCKETBASE_URL 未配置');
  }
  if (!pbInstance) {
    pbInstance = new PocketBase(config.pocketbase.url);
    pbInstance.autoCancellation(false);
  }

  if (Date.now() - authAt > 10 * 60 * 1000 || !pbInstance.authStore.isValid) {
    const { adminEmail, adminPassword, authToken } = config.pocketbase;
    if (authToken) {
      pbInstance.authStore.save(authToken, null);
    } else if (adminEmail && adminPassword) {
      await pbInstance.collection('_superusers').authWithPassword(adminEmail, adminPassword);
    } else {
      throw new Error('PocketBase 需配置 POCKETBASE_AUTH_TOKEN 或 ADMIN 账号');
    }
    authAt = Date.now();
  }
  return pbInstance;
}

/**
 * 注册 PocketBase users 集合用户
 * @param {string} email
 * @param {string} password
 */
export async function registerUser(email, password) {
  const pb = await getPb();
  try {
    return await pb.collection(USERS).create({
      email,
      password,
      passwordConfirm: password,
    });
  } catch (err) {
    const e = new Error(err.message || '注册失败');
    e.status = err.status || 500;
    e.data = err.response || err.data;
    e.code = err.code;
    throw e;
  }
}
