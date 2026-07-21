import * as tg from '../telegram.js';

export function createTelegramBlob() {
  return {
    name: 'telegram',

    async put({ bucket, key, body, contentType, caption }) {
      const buf = Buffer.isBuffer(body) ? body : Buffer.from(body);
      const filename = String(key).split('/').pop() || 'file.bin';
      const uploaded = await tg.uploadBuffer(
        buf,
        filename,
        contentType || 'application/octet-stream',
        caption || `${bucket}/${key}`,
      );
      return {
        backend: 'telegram',
        fileId: uploaded.fileId,
        messageId: uploaded.messageId,
        sha: '',
        size: uploaded.fileSize,
        contentType: contentType || 'application/octet-stream',
      };
    },

    async get(meta) {
      if (!meta.fileId) {
        const err = new Error('NoSuchKey');
        err.code = 'NoSuchKey';
        err.status = 404;
        throw err;
      }
      return tg.downloadByFileId(meta.fileId);
    },

    async remove(meta) {
      if (meta.messageId) {
        return tg.deleteMessage(meta.messageId);
      }
      return false;
    },
  };
}
