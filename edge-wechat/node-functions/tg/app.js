import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import apiRouter from './routes/api.js';
import s3Router from './routes/s3.js';
import davRouter from './routes/dav.js';

dotenv.config();

const app = express();

app.use(cors());

// REST JSON helpers; S3/DAV capture their own raw bodies.
app.use('/api', express.json({ limit: '2mb' }));
app.use('/api', express.urlencoded({ extended: true }));

app.get('/ping', (_req, res) => {
  res.send('pong');
});

app.use(apiRouter);
app.use('/s3', s3Router);
app.use('/dav', davRouter);

app.use((err, _req, res, _next) => {
  console.error('服务器错误:', err);
  if (err instanceof multer.MulterError || err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: '文件过大', message: err.message });
  }
  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误',
    code: err.code,
  });
});

export default app;
