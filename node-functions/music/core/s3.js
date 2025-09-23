import { S3Client } from "@aws-sdk/client-s3";
import { ListBucketsCommand, ListObjectsV2Command, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { readFile } from "fs/promises";

import { Upload } from "@aws-sdk/lib-storage";

// import {
//     ProgressBar,
//     logger,
// } from "@aws-doc-sdk-examples/lib/utils/util-log.js";


// Create an S3 service client object.
export function NewS3Client(key, secret, endpoint, region) {
    const credentials = {
        accessKeyId: key,
        secretAccessKey: secret
    };
    const s3Client = new S3Client({
        endpoint: endpoint,//"https://s3.tebi.io",
        credentials: credentials,
        region: region //"global"
    });
    return s3Client;
}

export class s3Tools {

    constructor(config) {
        this.s3Client = new S3Client({
            endpoint: config.endpoint,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey
            },
            region: config.region
        });
        this.bucket = config.bucket;
        this.endpoint = config.endpoint;
    }

    async ListBuckets() {
        // List buckets
        const buckets_data = await this.s3Client.send(
            new ListBucketsCommand({})
        );
        return buckets_data;
    }

    async PutFile(fileName, content, bucket) {
        if (!bucket) {
            bucket = this.bucket;
        }
        const upload_data = await this.s3Client.send(
            new PutObjectCommand({
                Bucket: bucket,
                Key: fileName,
                Body: content
            })
        );
        return upload_data;
    }

    async PutFilePath(key,filePath, bucket) {
        if (!bucket) {
            bucket = this.bucket;
        }
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: await readFile(filePath),
        });
        const data = await this.s3Client.send(command)
        // console.log(data);
        return data;
    }

    // export const PutBigFile = async (client, bucketName, fileName, buffer ) => {
    //     // const str = createString();
    //     // const buffer = Buffer.from(str, "utf8");
    //     const progressBar = new ProgressBar({
    //         description: `Uploading "${key}" to "${bucketName}"`,
    //         barLength: 30,
    //     });

    //     try {
    //         const upload = new Upload({
    //             client: new client,
    //             params: {
    //                 Bucket: bucketName,
    //                 Key: fileName,
    //                 Body: buffer,
    //             },
    //         });

    //         upload.on("httpUploadProgress", ({ loaded, total }) => {
    //             progressBar.update({ current: loaded, total });
    //         });

    //         await upload.done();
    //     } catch (caught) {
    //         if (caught instanceof Error && caught.name === "AbortError") {
    //             logger.error(`Multipart upload was aborted. ${caught.message}`);
    //         } else {
    //             throw caught;
    //         }
    //     }
    // };


    // 列出文件夹中的文件和子文件夹

    async ListObjects(folderPath = '', delimiter = '', bucket) {
        if (!bucket) {
            bucket = this.bucket;
        }
        const prefix = folderPath ? (folderPath.endsWith('/') ? folderPath : folderPath + '/') : '';
        try {
            const command = new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: prefix,
                Delimiter: delimiter,
                MaxKeys: 1000
            });

            const response = await this.s3Client.send(command);

            return {
                files: response.Contents || [],
                folders: response.CommonPrefixes || [],
                isTruncated: response.IsTruncated,
                nextContinuationToken: response.NextContinuationToken
            };
        } catch (error) {
            console.error('列出对象时出错:', error);
            throw error;
        }
    }

    // 列出指定文件夹下的所有文件
    async ListFiles(folderPath = '', delimiter = '', bucket) {
        if (!bucket) {
            bucket = this.bucket;
        }
        try {
            const prefix = folderPath ? (folderPath.endsWith('/') ? folderPath : folderPath + '/') : '';
            const result = await this.s3Client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, Delimiter: delimiter, MaxKeys: 1000 }));

            return result.files.map(file => ({
                key: file.Key,
                size: file.Size,
                lastModified: file.LastModified,
                etag: file.ETag,
                name: file.Key.split('/').pop() // 获取文件名
            }));
        } catch (error) {
            console.error('列出文件时出错:', error);
            throw error;
        }
    }

    // 列出指定文件夹下的子文件夹
    async ListFolders(bucket, folderPath = '') {
        if (!bucket) {
            bucket = this, bucket
        }
        try {
            const prefix = folderPath ? (folderPath.endsWith('/') ? folderPath : folderPath + '/') : '';
            const result = await this.s3Client.send(new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix, Delimiter: '/', MaxKeys: 1000 }));

            return result.folders.map(folder => ({
                prefix: folder.Prefix,
                name: folder.Prefix.replace(prefix, '').replace('/', '') // 获取文件夹名
            }));
        } catch (error) {
            console.error('列出文件夹时出错:', error);
            throw error;
        }
    }

    // 获取文件内容
    async GetFile(fileName, bucket) {
        if (!bucket) {
            bucket = this.bucket;
        }
        try {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: fileName
            });

            const response = await s3Client.send(command);

            // 将流转换为Buffer
            const chunks = [];
            for await (const chunk of response.Body) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);

            return {
                body: buffer,
                contentType: response.ContentType,
                contentLength: response.ContentLength,
                lastModified: response.LastModified,
                etag: response.ETag
            };
        } catch (error) {
            console.error('获取文件时出错:', error);
            throw error;
        }
    }

    GetFileURL(key) {
        return `${this.endpoint}/${this.bucket}/${key}`
    }

    // 获取文件下载URL
    async GetUrl(s3Client, bucket, fileName) {
        // Generate a presigned URL
        const get_command = new GetObjectCommand({
            Bucket: bucket,
            Key: fileName,
            ResponseContentDisposition: 'attachment; filename="' + fileName + '"'
        });
        const url = await getSignedUrl(s3Client, get_command, { expiresIn: 3600 });
        console.log(url);
        return url;
    }

    // 获取文件预览URL (不强制下载)
    async GetPreviewUrl(fileName, bucket, expiresIn = 3600) {
        if (!bucket) {
            bucket = this.bucket;
        }
        try {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: fileName
            });

            const url = await getSignedUrl(this.s3Client, command, { expiresIn });
            return url;
        } catch (error) {
            console.error('生成预览URL时出错:', error);
            throw error;
        }
    }

    // 检查文件是否存在
    async FileExists(fileName, bucket) {
        if (!bucket) {
            bucket = this.bucket;
        }
        try {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: fileName
            });

            await this.s3Client.send(command);
            return true;
        } catch (error) {
            if (error.name === 'NoSuchKey') {
                return false;
            }
            throw error;
        }
    }

    // 获取文件夹结构（递归获取所有文件和文件夹）
    async GetFolderStructure(bucket, folderPath = '', maxDepth = 10, currentDepth = 0) {
        if (!bucket) {
            bucket = this.bucket;
        }
        if (currentDepth >= maxDepth) {
            return { files: [], folders: [] };
        }

        try {
            const prefix = folderPath ? (folderPath.endsWith('/') ? folderPath : folderPath + '/') : '';
            const result = await this.s3Client.send(new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix, Delimiter: '/', MaxKeys: 1000 }));

            const structure = {
                files: result.files.map(file => ({
                    key: file.Key,
                    size: file.Size,
                    lastModified: file.LastModified,
                    name: file.Key.split('/').pop(),
                    path: folderPath
                })),
                folders: []
            };

            // 递归获取子文件夹结构
            for (const folder of result.folders) {
                const subFolderPath = folder.Prefix.slice(0, -1); // 移除末尾的 '/'
                const subStructure = await GetFolderStructure(s3Client, bucket, subFolderPath, maxDepth, currentDepth + 1);

                structure.folders.push({
                    name: folder.Prefix.replace(prefix, '').replace('/', ''),
                    path: subFolderPath,
                    files: subStructure.files,
                    folders: subStructure.folders
                });
            }

            return structure;
        } catch (error) {
            console.error('获取文件夹结构时出错:', error);
            throw error;
        }
    }

    async DelFile(bucket, fileName) {
        if (!bucket) {
            bucket = this.bucket;
        }
        const upload_data = await this.s3Client.send(
            new DeleteObjectCommand({
                Bucket: bucket,
                Key: fileName,
            }),
        );
        console.log(upload_data);
    }
    async DelFiles(bucket, fileNames) {
        if (!bucket) {
            bucket = this.bucket;
        }
        const { Deleted } = await this.s3Client.send(
            new DeleteObjectsCommand({
                Bucket: bucket,
                Delete: {
                    Objects: fileNames.map((k) => ({ Key: k })),
                },
            }),
        );
        console.log(Deleted);
    }
}