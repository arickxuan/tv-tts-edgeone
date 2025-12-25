const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { encryptData, decryptData } = require('./util/aes_help');
const zeppHelper = require('./util/zepp_helper');
const pushUtil = require('./util/push_util');

/**
 * 获取默认值转int
 */
function getIntValueDefault(config, key, defaultValue) {
    if (!config.hasOwnProperty(key)) {
        config[key] = defaultValue;
    }
    return parseInt(config[key]);
}

/**
 * 获取当前时间对应的最大和最小步数
 */
function getMinMaxByTime(timeBj, config) {
    const hour = timeBj.getHours();
    const minute = timeBj.getMinutes();
    const timeRate = Math.min((hour * 60 + minute) / (22 * 60), 1);
    const minStep = getIntValueDefault(config, 'MIN_STEP', 18000);
    const maxStep = getIntValueDefault(config, 'MAX_STEP', 25000);
    return [Math.floor(timeRate * minStep), Math.floor(timeRate * maxStep)];
}

/**
 * 虚拟ip地址
 */
function fakeIp() {
    // 随便找的国内IP段：223.64.0.0 - 223.117.255.255
    return `223.${Math.floor(Math.random() * (117 - 64 + 1)) + 64}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

/**
 * 账号脱敏
 */
function desensitizeUserName(user) {
    if (user.length <= 8) {
        const ln = Math.max(Math.floor(user.length / 3), 1);
        return `${user.substring(0, ln)}***${user.substring(user.length - ln)}`;
    }
    return `${user.substring(0, 3)}****${user.substring(user.length - 4)}`;
}

/**
 * MiMotion 运行器类
 */
class MiMotionRunner {
    constructor(user, passwd) {
        this.userId = null;
        this.deviceId = crypto.randomUUID();
        const userStr = String(user);
        const password = String(passwd);
        this.invalid = false;
        this.logStr = '';

        if (userStr === '' || password === '') {
            this.error = '用户名或密码填写有误！';
            this.invalid = true;
            return;
        }

        this.password = password;
        let finalUser = userStr;

        if (userStr.startsWith('+86') || userStr.includes('@')) {
            finalUser = userStr;
        } else {
            finalUser = '+86' + userStr;
        }

        this.isPhone = finalUser.startsWith('+86');
        this.user = finalUser;
    }

    /**
     * 登录
     */
    async login(userTokens) {
        const userTokenInfo = userTokens[this.user];
        
        if (userTokenInfo) {
            const accessToken = userTokenInfo.access_token;
            const loginToken = userTokenInfo.login_token;
            let appToken = userTokenInfo.app_token;
            this.deviceId = userTokenInfo.device_id || crypto.randomUUID();
            this.userId = userTokenInfo.user_id;

            if (!userTokenInfo.device_id) {
                userTokenInfo.device_id = this.deviceId;
            }

            const [ok, msg] = await zeppHelper.checkAppToken(appToken);
            if (ok) {
                this.logStr += '使用加密保存的app_token\n';
                return appToken;
            } else {
                this.logStr += `app_token失效 重新获取 last grant time: ${userTokenInfo.app_token_time}\n`;
                
                // 检查login_token是否可用
                const [newAppToken, grantMsg] = await zeppHelper.grantAppToken(loginToken);
                if (newAppToken === null) {
                    this.logStr += `login_token 失效 重新获取 last grant time: ${userTokenInfo.login_token_time}\n`;
                    
                    const [newLoginToken, newAppToken2, userId, loginMsg] = await zeppHelper.grantLoginTokens(accessToken, this.deviceId, this.isPhone);
                    if (newLoginToken === null) {
                        this.logStr += `access_token 已失效：${loginMsg} last grant time:${userTokenInfo.access_token_time}\n`;
                        return null;
                    } else {
                        userTokenInfo.login_token = newLoginToken;
                        userTokenInfo.app_token = newAppToken2;
                        userTokenInfo.user_id = userId;
                        userTokenInfo.login_token_time = zeppHelper.getTime();
                        userTokenInfo.app_token_time = zeppHelper.getTime();
                        this.userId = userId;
                        return newAppToken2;
                    }
                } else {
                    this.logStr += '重新获取app_token成功\n';
                    userTokenInfo.app_token = newAppToken;
                    userTokenInfo.app_token_time = zeppHelper.getTime();
                    return newAppToken;
                }
            }
        }

        // access_token 失效 或者没有保存加密数据
        const [accessToken, loginMsg] = await zeppHelper.loginAccessToken(this.user, this.password);
        if (accessToken === null) {
            this.logStr += `登录获取accessToken失败：${loginMsg}`;
            return null;
        }

        const [loginToken, appToken, userId, grantMsg] = await zeppHelper.grantLoginTokens(accessToken, this.deviceId, this.isPhone);
        if (loginToken === null) {
            this.logStr += `登录提取的 access_token 无效：${grantMsg}`;
            return null;
        }

        const newUserTokenInfo = {
            access_token: accessToken,
            login_token: loginToken,
            app_token: appToken,
            user_id: userId,
            access_token_time: zeppHelper.getTime(),
            login_token_time: zeppHelper.getTime(),
            app_token_time: zeppHelper.getTime(),
            device_id: this.deviceId
        };

        userTokens[this.user] = newUserTokenInfo;
        this.userId = userId;
        return appToken;
    }

    /**
     * 登录并发布步数
     */
    async loginAndPostStep(minStep, maxStep, userTokens) {
        if (this.invalid) {
            return ['账号或密码配置有误', false];
        }

        const appToken = await this.login(userTokens);
        console.log('appToken', appToken);
        if (appToken === null) {
            return ['登陆失败！', false];
        }

        const step = String(Math.floor(Math.random() * (maxStep - minStep + 1)) + minStep);
        this.logStr += `已设置为随机步数范围(${minStep}~${maxStep}) 随机值:${step}\n`;
        
        const [ok, msg] = await zeppHelper.postFakeBrandData(step, appToken, this.userId);
        return [`修改步数（${step}）[${msg}]`, ok];
    }
}

/**
 * 运行单个账号
 */
async function runSingleAccount(total, idx, userMi, passwdMi, minStep, maxStep, userTokens) {
    let idxInfo = '';
    if (idx !== null) {
        idxInfo = `[${idx + 1}/${total}]`;
    }

    let logStr = `[${pushUtil.formatNow()}]\n${idxInfo}账号：${desensitizeUserName(userMi)}\n`;
    
    try {
        const runner = new MiMotionRunner(userMi, passwdMi);
        const [execMsg, success] = await runner.loginAndPostStep(minStep, maxStep, userTokens);
        logStr += runner.logStr;
        logStr += `${execMsg}\n`;
        
        const execResult = {
            user: userMi,
            success: success,
            msg: execMsg
        };
        
        console.log(logStr);
        return execResult;
    } catch (error) {
        logStr += `执行异常:${error.stack}\n`;
        const execResult = {
            user: userMi,
            success: false,
            msg: `执行异常:${error.message}`
        };
        
        console.log(logStr);
        return execResult;
    }
}

/**
 * 执行主函数
 */
async function execute(config, userTokens, encryptSupport) {
    const users = config.USER;
    const passwords = config.PWD;
    const userList = users.split('#');
    const passwdList = passwords.split('#');
    const execResults = [];

    if (userList.length === passwdList.length) {
        const total = userList.length;
        const [minStep, maxStep] = getMinMaxByTime(pushUtil.getBeijingTime(), config);
        const useConcurrent = config.USE_CONCURRENT === true;
        const sleepSeconds = parseFloat(config.SLEEP_GAP || 5);

        if (useConcurrent) {
            // 并发执行
            const promises = userList.map((userMi, idx) => 
                runSingleAccount(total, idx, userMi, passwdList[idx], minStep, maxStep, userTokens)
            );
            const results = await Promise.all(promises);
            execResults.push(...results);
        } else {
            // 顺序执行
            for (let idx = 0; idx < userList.length; idx++) {
                const result = await runSingleAccount(total, idx, userList[idx], passwdList[idx], minStep, maxStep, userTokens);
                execResults.push(result);
                
                if (idx < total - 1) {
                    // 每个账号之间间隔一定时间请求一次，避免接口请求过于频繁导致异常
                    await new Promise(resolve => setTimeout(resolve, sleepSeconds * 1000));
                }
            }
        }

        if (encryptSupport) {
            persistUserTokens(userTokens, config.AES_KEY);
        }

        let successCount = 0;
        const pushResults = [];
        for (const result of execResults) {
            pushResults.push(result);
            if (result.success === true) {
                successCount++;
            }
        }

        const summary = `\n执行账号总数${total}，成功：${successCount}，失败：${total - successCount}`;
        console.log(summary);
        
        pushUtil.pushResults(pushResults, summary, config.pushConfig);
    } else {
        console.log(`账号数长度[${userList.length}]和密码数长度[${passwdList.length}]不匹配，跳过执行`);
        process.exit(1);
    }
}

/**
 * 准备用户token
 */
function prepareUserTokens(aesKey) {
    const dataPath = 'encrypted_tokens.data';
    
    if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath);
        try {
            const decryptedData = decryptData(data, Buffer.from(aesKey, 'utf-8'), null);
            return JSON.parse(decryptedData.toString('utf-8'));
        } catch (error) {
            console.log('密钥不正确或者加密内容损坏 放弃token');
            return {};
        }
    } else {
        return {};
    }
}

/**
 * 持久化用户token
 */
function persistUserTokens(userTokens, aesKey) {
    const dataPath = 'encrypted_tokens.data';
    const originStr = JSON.stringify(userTokens);
    const cipherData = encryptData(Buffer.from(originStr, 'utf-8'), Buffer.from(aesKey, 'utf-8'), null);
    fs.writeFileSync(dataPath, cipherData);
}

/**
 * 主入口
 */
async function main() {
    // 北京时间
    const timeBj = pushUtil.getBeijingTime();
    let encryptSupport = false;
    let userTokens = {};

    // 检查 AES_KEY
    if (process.env.AES_KEY) {
        const aesKey = process.env.AES_KEY;
        if (aesKey && aesKey.length === 16) {
            encryptSupport = true;
            userTokens = prepareUserTokens(aesKey);
        } else {
            console.log('AES_KEY未设置或者无效 无法使用加密保存功能');
        }
    }

    // 检查 CONFIG
    // if (!process.env.CONFIG) {
    //     console.log('未配置CONFIG变量，无法执行');
    //     process.exit(1);
    // }

    try {
        const config = {};//JSON.parse(process.env.CONFIG);
        
        // 用于测试的硬编码值
        config.USER = 'XXX@qq.com';
        config.PWD = '123456';
        config.AES_KEY = process.env.AES_KEY;
        config.MIN_STEP = 562;
        config.MAX_STEP = 1271;
        config.SLEEP_GAP = 5;
        config.USE_CONCURRENT = false;
        config.PUSH_PLUS_TOKEN = '';
        config.PUSH_PLUS_HOUR = '';
        config.PUSH_PLUS_MAX = 30;
        config.PUSH_WECHAT_WEBHOOK_KEY = '';
        config.TELEGRAM_BOT_TOKEN = '';
        config.TELEGRAM_CHAT_ID = '';

        // 创建推送配置对象
        config.pushConfig = new pushUtil.PushConfig({
            pushPlusToken: config.PUSH_PLUS_TOKEN,
            pushPlusHour: config.PUSH_PLUS_HOUR,
            pushPlusMax: getIntValueDefault(config, 'PUSH_PLUS_MAX', 30),
            pushWechatWebhookKey: config.PUSH_WECHAT_WEBHOOK_KEY,
            telegramBotToken: config.TELEGRAM_BOT_TOKEN,
            telegramChatId: config.TELEGRAM_CHAT_ID
        });

        const sleepSeconds = config.SLEEP_GAP || 5;
        config.SLEEP_GAP = parseFloat(sleepSeconds);

        const users = config.USER;
        const passwords = config.PWD;

        if (!users || !passwords) {
            console.log('未正确配置账号密码，无法执行');
            process.exit(1);
        }

        const useConcurrent = config.USE_CONCURRENT === true;
        if (!useConcurrent) {
            console.log(`多账号执行间隔：${sleepSeconds}`);
        }

        await execute(config, userTokens, encryptSupport);
    } catch (error) {
        console.log('CONFIG格式不正确，请检查Secret配置，请严格按照JSON格式：使用双引号包裹字段和值，逗号不能多也不能少');
        console.error(error);
        process.exit(1);
    }
}

// 如果直接运行此文件，则执行主函数
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    MiMotionRunner,
    runSingleAccount,
    execute,
    prepareUserTokens,
    persistUserTokens,
    getIntValueDefault,
    getMinMaxByTime,
    fakeIp,
    desensitizeUserName
};


