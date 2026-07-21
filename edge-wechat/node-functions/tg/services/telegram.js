import axios from 'axios';
import FormData from 'form-data';
import { config } from '../config/index.js';

function apiBase() {
  if (!config.tg.botToken) {
    throw new Error('TG_BOT_TOKEN 未配置');
  }
  return `${config.tg.apiBase}/bot${config.tg.botToken}`;
}

function fileBase() {
  if (!config.tg.botToken) {
    throw new Error('TG_BOT_TOKEN 未配置');
  }
  return `${config.tg.apiBase}/file/bot${config.tg.botToken}`;
}

/**
 * Upload a buffer as a document to the configured chat.
 * @returns {{ fileId, messageId, fileUniqueId, fileSize }}
 */
export async function uploadBuffer(buf, filename, contentType, caption = '') {
  if (!config.tg.chatId) {
    throw new Error('TG_CHAT_ID 未配置');
  }
  if (buf.length > config.tg.maxUploadBytes) {
    const err = new Error(`文件超过上传限制 ${config.tg.maxUploadBytes} bytes`);
    err.status = 413;
    throw err;
  }

  const form = new FormData();
  form.append('chat_id', String(config.tg.chatId));
  form.append('document', buf, {
    filename: filename || 'file.bin',
    contentType: contentType || 'application/octet-stream',
  });
  if (caption) {
    form.append('caption', caption.slice(0, 1024));
  }

  const { data } = await axios.post(`${apiBase()}/sendDocument`, form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 110000,
  });

  if (!data.ok) {
    throw new Error(`Telegram sendDocument 失败: ${data.description || JSON.stringify(data)}`);
  }

  const doc = data.result.document;
  return {
    fileId: doc.file_id,
    fileUniqueId: doc.file_unique_id,
    fileSize: doc.file_size || buf.length,
    messageId: data.result.message_id,
  };
}

/**
 * Download file bytes by Telegram file_id.
 * @returns {Buffer}
 */
export async function downloadByFileId(fileId) {
  const { data: meta } = await axios.get(`${apiBase()}/getFile`, {
    params: { file_id: fileId },
    timeout: 30000,
  });

  if (!meta.ok) {
    throw new Error(`Telegram getFile 失败: ${meta.description || JSON.stringify(meta)}`);
  }

  const filePath = meta.result.file_path;
  const fileSize = meta.result.file_size || 0;
  if (fileSize > config.tg.maxDownloadBytes) {
    const err = new Error(`文件超过下载限制 ${config.tg.maxDownloadBytes} bytes`);
    err.status = 413;
    throw err;
  }

  const url = `${fileBase()}/${filePath}`;
  const { data } = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 110000,
    maxContentLength: config.tg.maxDownloadBytes,
  });

  return Buffer.from(data);
}

/**
 * Best-effort delete of a chat message.
 */
export async function deleteMessage(messageId) {
  if (!messageId || !config.tg.chatId) return false;
  try {
    const { data } = await axios.post(`${apiBase()}/deleteMessage`, {
      chat_id: config.tg.chatId,
      message_id: messageId,
    }, { timeout: 15000 });
    return !!data.ok;
  } catch (err) {
    console.warn('Telegram deleteMessage 失败:', err.message);
    return false;
  }
}
