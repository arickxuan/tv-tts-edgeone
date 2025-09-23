import { S3Client } from "@aws-sdk/client-s3";
import { ListBucketsCommand, PutObjectCommand, GetObjectCommand, ListObjectsV2Command,DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";

import { s3Tools } from "../core/s3.js";
import { removeBracketContent } from "../core/utils/string.js";

class S3Service {
  constructor(config) {
    this.s3Client = new S3Client({
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      },
      region: config.region
    });
    this.s3Tools = new s3Tools(config);
  }

  async listBuckets() {
    try {
      const buckets_data = await this.s3Tools.ListBuckets();
      return buckets_data;
    } catch (error) {
      throw new Error(`列出存储桶失败: ${error.message}`);
    }
  }

  async listFiles(bucket) {
    try {
      const list_data = await this.s3Client.send(new ListObjectsV2Command({ Bucket: bucket }));
      return list_data;
    } catch (error) {
      throw new Error(`列出文件失败: ${error.message}`);
    }
  }

  async s3SongList(prefix) {
    const list_data = await this.s3Tools.ListObjects(prefix);
    return list_data.files
        .map(file => {
            const dics = file.Key.split("/");
            if (dics.length <= 1) return null;
            const filename = dics[dics.length - 1];
            const exnames = filename.split(".");
            if (exnames.length < 2) return null;

            const exname = exnames[0];
            const str = removeBracketContent(exname);
            const musicSinger = str.split("-");

            if (musicSinger.length < 2) return null;

            return {
                title: musicSinger[0].trim(),
                name: musicSinger[0].trim(),
                singer: musicSinger[1].trim(),
                type: "s3",
                url: this.s3Tools.GetFileURL(file.Key)
            };
        })
        .filter(item => item !== null);
}

  async putFile( fileName, content) {
    try {
      let re =await this.s3Tools.PutFile(fileName,content);
      return re;
    } catch (error) {
      throw new Error(`上传文件失败: ${error.message}`);
    }
  }

  async putFilePath(key,filePath){
    try {
      let re = await this.s3Tools.PutFilePath(key,filePath);
      return re;
    } catch (error) {
      throw new Error(`上传文件失败: ${error.message}`);
    }
  }

  async GetFileURL( key) {
    try {
      let re = this.s3Tools.GetFileURL(key);
      return re;
    } catch (error) {
      throw new Error(`下载文件失败: ${error.message}`);
    }
  }

  async putBigFile(bucketName, fileName, buffer) {
    try {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: bucketName,
          Key: fileName,
          Body: buffer,
        },
      });

      // 可以添加进度监听
      upload.on("httpUploadProgress", ({ loaded, total }) => {
        console.log(`上传进度: ${Math.round((loaded / total) * 100)}%`);
      });

      const result = await upload.done();
      return result;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error(`大文件上传被中止: ${error.message}`);
      } else {
        throw new Error(`大文件上传失败: ${error.message}`);
      }
    }
  }

  async getSignedUrl(bucket, fileName) {
    try {
      const get_command = new GetObjectCommand({
        Bucket: bucket,
        Key: fileName,
        ResponseContentDisposition: 'attachment; filename="' + fileName + '"'
      });
      const url = await getSignedUrl(this.s3Client, get_command, { expiresIn: 3600 });
      return url;
    } catch (error) {
      throw new Error(`获取签名URL失败: ${error.message}`);
    }
  }

  async deleteFile(bucket, fileName) {
    try {
      const upload_data = await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: fileName,
        })
      );
      return upload_data;
    } catch (error) {
      throw new Error(`删除文件失败: ${error.message}`);
    }
  }

  async deleteFiles(bucket, fileNames) {
    try {
      const { Deleted } = await this.s3Client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: fileNames.map((k) => ({ Key: k })),
          },
        })
      );
      return Deleted;
    } catch (error) {
      throw new Error(`批量删除文件失败: ${error.message}`);
    }
  }
}

export default S3Service;
