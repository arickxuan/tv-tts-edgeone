import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`TGFS server listening on port ${PORT}`);
  console.log(`  REST:  http://localhost:${PORT}/api/upload`);
  console.log(`  S3:    http://localhost:${PORT}/s3`);
  console.log(`  WebDAV: http://localhost:${PORT}/dav`);
});
