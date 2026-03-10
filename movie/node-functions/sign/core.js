// server.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const app = express();
const PORT = process.env.PORT || 3000;

// 配置上传中间件
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB限制
    }
});

// 中间件
app.use(express.json());
app.use(express.static('public'));

// 签名端点
app.post('/api/sign', upload.fields([
    { name: 'p12', maxCount: 1 },
    { name: 'provisioning', maxCount: 1 },
    { name: 'ipa', maxCount: 1 }
]), async (req, res) => {
    try {
        const { password } = req.body;
        const files = req.files;

        // 验证文件存在
        if (!files.p12 || !files.provisioning || !files.ipa) {
            return res.status(400).json({
                success: false,
                message: '缺少必要的文件'
            });
        }

        // 创建临时目录
        const timestamp = Date.now();
        const tempDir = path.join(__dirname, 'temp', `sign_${timestamp}`);
        const outputDir = path.join(__dirname, 'output');
        
        fs.mkdirSync(tempDir, { recursive: true });
        fs.mkdirSync(outputDir, { recursive: true });

        // 文件路径
        const p12Path = files.p12[0].path;
        const provisioningPath = files.provisioning[0].path;
        const ipaPath = files.ipa[0].path;
        const outputIpaPath = path.join(outputDir, `signed_${timestamp}.ipa`);

        // 步骤1: 提取描述文件信息
        console.log('正在提取描述文件信息...');
        const provisioningInfo = await extractProvisioningInfo(provisioningPath);
        
        // 步骤2: 导入P12证书到临时钥匙串
        console.log('正在导入证书...');
        const keychainPath = path.join(tempDir, 'temp.keychain');
        await importP12Certificate(p12Path, password, keychainPath);

        // 步骤3: 解压IPA文件
        console.log('正在解压IPA文件...');
        const extractedPath = path.join(tempDir, 'extracted');
        await unzipIPA(ipaPath, extractedPath);

        // 步骤4: 替换描述文件
        console.log('正在替换描述文件...');
        await replaceProvisioningProfile(extractedPath, provisioningPath);

        // 步骤5: 重签名应用
        console.log('正在重签名...');
        await resignApp(extractedPath, provisioningInfo, keychainPath);

        // 步骤6: 重新打包为IPA
        console.log('正在重新打包...');
        await repackageIPA(extractedPath, outputIpaPath);

        // 步骤7: 清理临时文件
        console.log('正在清理临时文件...');
        await cleanup(tempDir, keychainPath);

        // 返回成功响应
        res.json({
            success: true,
            message: '签名成功',
            downloadUrl: `/download/${path.basename(outputIpaPath)}`,
            fileSize: fs.statSync(outputIpaPath).size
        });

    } catch (error) {
        console.error('签名错误:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 下载端点
app.get('/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'output', req.params.filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath, `signed_${req.params.filename}`, (err) => {
            if (err) {
                console.error('下载错误:', err);
            }
            // 可选：下载后删除文件
            // fs.unlinkSync(filePath);
        });
    } else {
        res.status(404).send('文件不存在');
    }
});

// 辅助函数
async function extractProvisioningInfo(provisioningPath) {
    try {
        // 使用security命令读取描述文件
        const { stdout } = await execPromise(
            `security cms -D -i "${provisioningPath}"`
        );
        const profile = JSON.parse(stdout);
        
        return {
            teamId: profile.TeamIdentifier?.[0],
            bundleId: profile.Entitlements?.['application-identifier']?.split('.')?.[1],
            certificates: profile.DeveloperCertificates
        };
    } catch (error) {
        throw new Error(`提取描述文件信息失败: ${error.message}`);
    }
}

async function importP12Certificate(p12Path, password, keychainPath) {
    try {
        // 创建临时钥匙串
        await execPromise(
            `security create-keychain -p "temp_password" "${keychainPath}"`
        );
        
        // 设置钥匙串超时
        await execPromise(
            `security set-keychain-settings -t 3600 -u "${keychainPath}"`
        );
        
        // 导入P12证书
        await execPromise(
            `security import "${p12Path}" -k "${keychainPath}" ` +
            `-P "${password}" -T /usr/bin/codesign -T /usr/bin/productbuild`
        );
        
        // 解锁钥匙串
        await execPromise(
            `security unlock-keychain -p "temp_password" "${keychainPath}"`
        );
    } catch (error) {
        throw new Error(`导入证书失败: ${error.message}`);
    }
}

async function unzipIPA(ipaPath, outputPath) {
    try {
        fs.mkdirSync(outputPath, { recursive: true });
        await execPromise(`unzip -q "${ipaPath}" -d "${outputPath}"`);
    } catch (error) {
        throw new Error(`解压IPA失败: ${error.message}`);
    }
}

async function replaceProvisioningProfile(extractedPath, provisioningPath) {
    try {
        // 查找Payload目录
        const payloadPath = path.join(extractedPath, 'Payload');
        const apps = fs.readdirSync(payloadPath).filter(f => f.endsWith('.app'));
        
        if (apps.length === 0) {
            throw new Error('未找到.app目录');
        }
        
        const appPath = path.join(payloadPath, apps[0]);
        const targetProvisioningPath = path.join(appPath, 'embedded.mobileprovision');
        
        // 复制描述文件
        fs.copyFileSync(provisioningPath, targetProvisioningPath);
    } catch (error) {
        throw new Error(`替换描述文件失败: ${error.message}`);
    }
}

async function resignApp(extractedPath, provisioningInfo, keychainPath) {
    try {
        const payloadPath = path.join(extractedPath, 'Payload');
        const apps = fs.readdirSync(payloadPath).filter(f => f.endsWith('.app'));
        const appPath = path.join(payloadPath, apps[0]);
        
        // 查找可执行文件
        const infoPlistPath = path.join(appPath, 'Info.plist');
        const { stdout } = await execPromise(
            `/usr/libexec/PlistBuddy -c "Print :CFBundleExecutable" "${infoPlistPath}"`
        );
        const executable = stdout.trim();
        
        // 使用codesign重签名
        const entitlements = await generateEntitlements(appPath, provisioningInfo);
        
        // 重签名框架（如果有）
        const frameworksPath = path.join(appPath, 'Frameworks');
        if (fs.existsSync(frameworksPath)) {
            const frameworks = fs.readdirSync(frameworksPath).filter(f => f.endsWith('.framework'));
            for (const framework of frameworks) {
                const frameworkPath = path.join(frameworksPath, framework);
                await execPromise(
                    `codesign -f -s "${provisioningInfo.teamId}" "${frameworkPath}" ` +
                    `--keychain "${keychainPath}" --timestamp=none`
                );
            }
        }
        
        // 重签名插件（如果有）
        const pluginsPath = path.join(appPath, 'PlugIns');
        if (fs.existsSync(pluginsPath)) {
            const plugins = fs.readdirSync(pluginsPath).filter(f => f.endsWith('.appex'));
            for (const plugin of plugins) {
                const pluginPath = path.join(pluginsPath, plugin);
                await execPromise(
                    `codesign -f -s "${provisioningInfo.teamId}" "${pluginPath}" ` +
                    `--keychain "${keychainPath}" --entitlements "${entitlements}" --timestamp=none`
                );
            }
        }
        
        // 重签名主应用
        await execPromise(
            `codesign -f -s "${provisioningInfo.teamId}" "${appPath}" ` +
            `--keychain "${keychainPath}" --entitlements "${entitlements}" --timestamp=none`
        );
        
    } catch (error) {
        throw new Error(`重签名失败: ${error.message}`);
    }
}

async function generateEntitlements(appPath, provisioningInfo) {
    try {
        const provisioningPath = path.join(appPath, 'embedded.mobileprovision');
        const tempEntitlements = path.join(appPath, 'entitlements.plist');
        
        // 从描述文件中提取entitlements
        await execPromise(
            `security cms -D -i "${provisioningPath}" ` +
            `| plutil -extract Entitlements xml1 -o "${tempEntitlements}" -`
        );
        
        return tempEntitlements;
    } catch (error) {
        throw new Error(`生成entitlements失败: ${error.message}`);
    }
}

async function repackageIPA(extractedPath, outputPath) {
    try {
        const cwd = path.dirname(extractedPath);
        const folderName = path.basename(extractedPath);
        
        await execPromise(
            `cd "${cwd}" && zip -qr "${outputPath}" "${folderName}"`
        );
    } catch (error) {
        throw new Error(`重新打包失败: ${error.message}`);
    }
}

async function cleanup(tempDir, keychainPath) {
    try {
        // 删除临时钥匙串
        if (fs.existsSync(keychainPath)) {
            await execPromise(`security delete-keychain "${keychainPath}"`);
        }
        
        // 删除临时目录
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    } catch (error) {
        console.warn('清理临时文件时出错:', error);
    }
}