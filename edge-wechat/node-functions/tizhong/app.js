

import express from 'express';
import axios from 'axios';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { readFileSync,readdirSync,statSync } from 'fs';

dotenv.config();
const app = express();

// 中间件
// 允许所有来源的跨域请求
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));



// 获取 __dirname 的 ES 模块替代方案
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// 飞书 API 配置
const FEISHU_CONFIG = {
    appId: process.env.FEISHU_APP_ID,
    appSecret: process.env.FEISHU_APP_SECRET,
    spreadsheetToken: process.env.FEISHU_SPREADSHEET_TOKEN,
    sheetId: process.env.FEISHU_SHEET_ID
};

// 存储 access_token
let tenantAccessToken = null;
let tokenExpireTime = 0;

// 获取飞书 tenant_access_token
async function getTenantAccessToken() {
    try {
        // 如果 token 未过期，直接返回
        if (tenantAccessToken && Date.now() < tokenExpireTime) {
            return tenantAccessToken;
        }

        const response = await axios.post(
            'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
            {
                app_id: FEISHU_CONFIG.appId,
                app_secret: FEISHU_CONFIG.appSecret
            }
        );

        if (response.data.code === 0) {
            tenantAccessToken = response.data.tenant_access_token;
            // 设置过期时间（提前5分钟过期，确保安全）
            //tokenExpireTime = Date.now() + (response.data.expire - 300) * 1000;
            return tenantAccessToken;
        } else {
            throw new Error(`获取token失败: ${response.data.msg}`);
        }
    } catch (error) {
        console.error('获取飞书token错误:', error.message);
        throw error;
    }
}

// 添加记录到飞书表格
async function addRecordToFeishu(weight, date, note) {
    try {
        const token = await getTenantAccessToken();
        console.log('使用的 token:', token.substring(0, 20) + '...');
        console.log('表格 token:', FEISHU_CONFIG.spreadsheetToken);
        console.log('表格 sheet_id:', FEISHU_CONFIG.sheetId);

        const response = await axios.post(
            `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${FEISHU_CONFIG.spreadsheetToken}/values_append`,
            {
                valueRange: {
                    range: `${FEISHU_CONFIG.sheetId}!A:C`,
                    values: [[String(weight), date, note || '']]
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('飞书 API 响应:', JSON.stringify(response.data, null, 2));

        if (response.data.code === 0) {
            return { success: true, data: response.data };
        } else {
            // 详细的错误信息
            const errorMsg = getFeishuErrorMessage(response.data.code);
            console.error('飞书错误:', errorMsg);
            throw new Error(`${errorMsg} (错误码: ${response.data.code})`);
        }
    } catch (error) {
        if (error.response) {
            console.error('飞书 API 错误响应:', error.response.data);
        }
        console.error('添加飞书记录错误:', error.message);
        throw error;
    }
}

// 获取飞书错误消息
function getFeishuErrorMessage(code) {
    const errorMessages = {
        91403: '权限不足：请确认已添加表格写入权限并将应用发布上线',
        99991663: '表格不存在或无权限访问',
        99991664: '表格中没有该工作表',
        99991665: '写入数据超出表格范围',
        99991668: '请求频率超限',
    };
    return errorMessages[code] || `未知错误`;
}

// 查询飞书表格记录
async function getRecordsFromFeishu(pageSize = 100) {
    try {
        const token = await getTenantAccessToken();

        const response = await axios.get(
            `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${FEISHU_CONFIG.spreadsheetToken}/values/${FEISHU_CONFIG.sheetId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (response.data.code === 0) {
            return { success: true, data: response.data.data };
        } else {
            throw new Error(`查询记录失败: ${response.data.msg}`);
        }
    } catch (error) {
        console.error('查询飞书记录错误:', error.message);
        throw error;
    }
}

// 初始化：给应用授权访问表格
async function initSheetPermission() {
    try {
        const token = await getTenantAccessToken();
        console.log('正在为应用添加表格权限...');

        const response = await axios.post(
            `https://open.feishu.cn/open-apis/drive/v1/permissions/${FEISHU_CONFIG.spreadsheetToken}/members`,
            {
                type: 'app',
                // 修正点：perm 的有效值应为 'edit' 或 'full_access'
                // 'full_access' 权限最高，更推荐用于数据写入
                perm: 'full_access'
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ 表格权限设置成功:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ 设置表格权限请求失败:');
        // 更详细的错误日志
        if (error.response) {
            console.error('错误状态码:', error.response.status);
            console.error('错误详情:', JSON.stringify(error.response.data, null, 2));
            // 如果存在 field_violations，打印更清晰的信息
            if (error.response.data.error?.field_violations) {
                console.error('字段校验失败详情:');
                error.response.data.error.field_violations.forEach((v, i) => {
                    console.error(`  问题 ${i + 1}: 字段 "${v.field}", 原因 "${v.description}"`);
                });
            }
        } else {
            console.error(error.message);
        }
    }
}




// API：添加体重记录
app.post('/api/weight', async (req, res) => {
    try {
        const { weight, date, note } = req.body;

        // 验证数据
        if (!weight || !date) {
            return res.status(400).json({
                success: false,
                message: '体重和日期不能为空'
            });
        }

        // 验证体重格式
        const weightNum = parseFloat(weight);
        if (isNaN(weightNum) || weightNum <= 0 || weightNum > 500) {
            return res.status(400).json({
                success: false,
                message: '请输入有效的体重值（0-500 kg）'
            });
        }

        // 同步到飞书表格
        const result = await addRecordToFeishu(weight, date, note);

        res.json({
            success: true,
            message: '体重记录添加成功',
            data: result.data
        });
    } catch (error) {
        console.error('添加体重记录错误:', error);
        res.status(500).json({
            success: false,
            message: '添加记录失败，请稍后重试'
        });
    }
});

// API：获取体重记录
app.get('/api/weights', async (req, res) => {
    try {
        const result = await getRecordsFromFeishu();
        res.json({
            success: true,
            data: result.data
        });
    } catch (error) {
        console.error('获取体重记录错误:', error);
        res.status(500).json({
            success: false,
            message: '获取记录失败，请稍后重试'
        });
    }
});


/**
 * 递归获取目录下所有文件路径
 * @param {string} dir 目录路径
 * @returns {object} 包含目录结构和文件列表的对象
 */
function getAllFiles(dir) {
    const result = {
        path: dir,
        files: [],
        children: []
    };

    try {
        const items = readdirSync(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = statSync(fullPath);

            if (stat.isDirectory()) {
                // 如果是目录，递归处理
                result.children.push(getAllFiles(fullPath));
            } else {
                // 如果是文件，添加到文件列表
                result.files.push({
                    name: item,
                    path: fullPath,
                    size: stat.size,
                    modifiedTime: stat.mtime
                });
            }
        }
    } catch (err) {
        console.error(`读取目录 ${dir} 失败:`, err.message);
    }

    return result;
}


// 路由：主页 - 现在 __dirname 可以正常使用了
app.get('/', (req, res) => {
    try {
        const indexHtml = readFileSync(path.join('../../../public/tizhong', 'index.html'), 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(indexHtml);
    } catch (error) {
        const targetDir = path.resolve(__dirname, '../../../');
        const fileStructure = getAllFiles(targetDir)
        return res.status(200).json(fileStructure);
    
    }
});

app.get('/ping', (req, res) => {
    res.send('pong');
});



// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        code: 500,
        msg: "服务器内部错误",
        error: err.message
    });
});

export default app;

