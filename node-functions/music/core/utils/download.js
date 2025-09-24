import https from 'https';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { execSync } from 'child_process';
import { tmpdir } from 'os';

/**
 * 使用axios下载文件并返回详细结果
 * @param {string} downloadUrl - 要下载的文件的URL
 * @param {string} [downloadDir='./downloads'] - 下载目录
 * @param {Object} [options={}] - 额外选项
 * @returns {Promise<Object>} 下载结果对象
 */
export async function downloadFile(downloadUrl, downloadDir = './downloads', options = {}) {
  const result = {
    success: false,
    message: '',
    filePath: '',
    filename: '',
    fileSize: 0,
    downloadTime: 0,
    contentType: '',
    headers: {},
    error: null
  };

  const startTime = Date.now();

  try {
    // 确保下载目录存在
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    // 获取文件名
    const parsedUrl = new URL(downloadUrl);
    let filename = path.basename(parsedUrl.pathname).replace(/[?#].*$/, '') || 'download';
    
    // 处理文件名冲突
    filename = await getUniqueFilename(downloadDir, filename);
    result.filename = filename;

    const filePath = path.join(downloadDir, filename);
    result.filePath = filePath;

    // 发送请求
    const response = await axios({
      method: 'GET',
      url: downloadUrl,
      responseType: 'stream',
      timeout: options.timeout || 30000,
      onDownloadProgress: (progressEvent) => {
        // 可以在这里添加进度回调
        if (options.onProgress) {
          options.onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percent: progressEvent.total ? (progressEvent.loaded / progressEvent.total * 100) : 0
          });
        }
      }
    });

    result.contentType = response.headers['content-type'];
    result.headers = response.headers;

    // 从Content-Disposition获取更好的文件名（如果有）
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
      if (filenameMatch && filenameMatch[1]) {
        const betterFilename = filenameMatch[1];
        const betterFilePath = path.join(downloadDir, betterFilename);
        const uniqueBetterFilename = await getUniqueFilename(downloadDir, betterFilename);
        
        if (betterFilename !== filename) {
          filename = uniqueBetterFilename;
          result.filename = filename;
          result.filePath = path.join(downloadDir, filename);
        }
      }
    }

    console.log("result.filePath",result.filePath)

    // 创建写入流
    const writer = fs.createWriteStream(result.filePath);
    response.data.pipe(writer);

    // 等待下载完成
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
      response.data.on('error', reject);
    });

    // 获取文件大小
    const stats = fs.statSync(result.filePath);
    result.fileSize = stats.size;
    result.downloadTime = Date.now() - startTime;
    result.success = true;
    result.message = '文件下载成功';

    return result;

  } catch (error) {
    // 清理可能创建的不完整文件
    if (result.filePath && fs.existsSync(result.filePath)) {
      fs.unlinkSync(result.filePath);
    }

    result.success = false;
    result.message = '文件下载失败';
    result.error = error.message;
    result.downloadTime = Date.now() - startTime;

    return result;
  }
}

/**
 * 生成唯一文件名
 */
async function getUniqueFilename(directory, filename) {
  const extension = path.extname(filename);
  const nameWithoutExt = path.basename(filename, extension);
  
  let counter = 1;
  let uniqueFilename = filename;
  let filePath = path.join(directory, uniqueFilename);
  
  while (fs.existsSync(filePath)) {
    uniqueFilename = `${nameWithoutExt}_${counter}${extension}`;
    filePath = path.join(directory, uniqueFilename);
    counter++;
    
    if (counter > 1000) { // 安全限制
      uniqueFilename = `${nameWithoutExt}_${Date.now()}${extension}`;
      break;
    }
  }
  
  return uniqueFilename;
}

/**
 * 同步下载文件
 * @param {string} downloadUrl - 要下载的文件的URL
 * @param {string} [downloadDir='./downloads'] - 下载目录
 * @param {Object} [options={}] - 额外选项
 * @returns {Object} 下载结果对象
 */
export function downloadFileSync(downloadUrl, downloadDir = './downloads', options = {}) {
  const result = {
    success: false,
    message: '',
    filePath: '',
    filename: '',
    fileSize: 0,
    downloadTime: 0,
    contentType: '',
    headers: {},
    error: null
  };

  const startTime = Date.now();

  try {
    // 确保下载目录存在
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    // 获取文件名
    const parsedUrl = new URL(downloadUrl);
    let filename = path.basename(parsedUrl.pathname).replace(/[?#].*$/, '') || 'download';
    
    // 处理文件名冲突 (同步版本)
    filename = getUniqueFilenameSync(downloadDir, filename);
    result.filename = filename;

    const filePath = path.join(downloadDir, filename);
    result.filePath = filePath;

    // 使用同步方式下载文件
    const downloadData = downloadUrlSync(downloadUrl, result.filePath, options.timeout || 30000);
    
    result.contentType = downloadData.contentType;
    result.headers = downloadData.headers;

    // 从Content-Disposition获取更好的文件名（如果有）
    const contentDisposition = downloadData.headers['content-disposition'];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
      if (filenameMatch && filenameMatch[1]) {
        const betterFilename = filenameMatch[1];
        const uniqueBetterFilename = getUniqueFilenameSync(downloadDir, betterFilename);
        
        if (betterFilename !== filename) {
          // 如果文件名发生变化，需要移动文件
          const newFilePath = path.join(downloadDir, uniqueBetterFilename);
          if (fs.existsSync(result.filePath)) {
            fs.renameSync(result.filePath, newFilePath);
          }
          filename = uniqueBetterFilename;
          result.filename = filename;
          result.filePath = newFilePath;
        }
      }
    }

    // console.log("result.filePath", result.filePath);

    // 获取文件大小
    const stats = fs.statSync(result.filePath);
    result.fileSize = stats.size;
    result.downloadTime = Date.now() - startTime;
    result.success = true;
    result.message = '文件下载成功';

    return result;

  } catch (error) {
    // 清理可能创建的不完整文件
    if (result.filePath && fs.existsSync(result.filePath)) {
      fs.unlinkSync(result.filePath);
    }

    result.success = false;
    result.message = '文件下载失败';
    result.error = error.message;
    result.downloadTime = Date.now() - startTime;

    return result;
  }
}

/**
 * 同步下载URL内容到指定文件
 * @param {string} url - 要下载的URL
 * @param {string} outputPath - 输出文件路径
 * @param {number} timeout - 超时时间（秒）
 * @returns {Object} 包含headers和contentType的对象
 */
function downloadUrlSync(url, outputPath, timeout = 30) {
  try {
    // 创建临时文件存放headers信息
    const tempHeadersFile = path.join(tmpdir(), `headers_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.txt`);
    
    // 构建curl命令
    // -L: 跟随重定向
    // -s: 静默模式
    // -S: 显示错误信息
    // -o: 输出文件路径
    // -D: 将headers写入文件
    // --max-time: 超时时间
    const curlCommand = `curl -L -s -S -o "${outputPath}" -D "${tempHeadersFile}" --max-time ${timeout} "${url}"`;
    
    // 执行curl命令
    execSync(curlCommand, { 
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 1024 * 1024 * 100 // 100MB buffer
    });

    // 读取headers文件
    let headers = {};
    let contentType = 'application/octet-stream';
    
    if (fs.existsSync(tempHeadersFile)) {
      const headersContent = fs.readFileSync(tempHeadersFile, 'utf8');
      const headerLines = headersContent.split('\n');
      
      headerLines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim().toLowerCase();
          const value = line.substring(colonIndex + 1).trim();
          headers[key] = value;
          
          if (key === 'content-type') {
            contentType = value;
          }
        }
      });
      
      // 清理临时文件
      fs.unlinkSync(tempHeadersFile);
    }

    return {
      headers,
      contentType
    };

  } catch (error) {
    throw new Error(`下载失败: ${error.message}`);
  }
}


/**
 * 生成唯一文件名 (同步版本)
 */
function getUniqueFilenameSync(directory, filename) {
  const extension = path.extname(filename);
  const nameWithoutExt = path.basename(filename, extension);
  
  let counter = 1;
  let uniqueFilename = filename;
  let filePath = path.join(directory, uniqueFilename);
  
  while (fs.existsSync(filePath)) {
    uniqueFilename = `${nameWithoutExt}_${counter}${extension}`;
    filePath = path.join(directory, uniqueFilename);
    counter++;
    
    if (counter > 1000) { // 安全限制
      uniqueFilename = `${nameWithoutExt}_${Date.now()}${extension}`;
      break;
    }
  }
  
  return uniqueFilename;
}

export function getFilenameFromUrl(downloadUrl) {
    // 1. 解析 URL
    const parsedUrl = new URL(downloadUrl);
    
    // 2. 获取路径部分
    const urlPath = parsedUrl.pathname;
    
    // 3. 使用 path.basename() 提取文件名
    let filename = path.basename(urlPath);
    
    // 4. 处理可能存在的查询参数（如果文件名中包含 ? 等字符）
    // 如果有查询参数，basename 会包含它们，我们需要去除
    const queryIndex = filename.indexOf('?');
    if (queryIndex !== -1) {
      filename = filename.substring(0, queryIndex);
    }
    
    // 5. 处理可能存在的哈希片段
    const hashIndex = filename.indexOf('#');
    if (hashIndex !== -1) {
      filename = filename.substring(0, hashIndex);
    }
    
    // 6. 如果最终没有文件名，使用默认文件名
    if (!filename || filename === '/' || filename === '.') {
      filename = 'download'; // 默认文件名
      // 可以尝试从 Content-Disposition 头获取更好的文件名（见方法三）
    }
    
    return filename;
  }