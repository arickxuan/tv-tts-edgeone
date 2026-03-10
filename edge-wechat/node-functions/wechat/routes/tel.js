import express from 'express';
import { push } from '../api/bark.js';
import { getTokenCache } from '../config/index.js';
import { sendLarkWebhookMessage } from '../api/feishu.js'

const router = express.Router();

router.post('/tel/receive', async (req, res) => {
    console.log(req.body)
    let { slot, type, netCh, msIsdn, scName, phNum, smsBd } = req.body
    // {
    //     devId: '3cdc7508',
    //     slot: 2, // 1表示卡槽1；2表示卡槽2
    //     type: 501,
    //     netCh: 0, //哪个网络通道推送。0:WIFI; 1:SIM1; 2:SIM2
    //     msgTs: 1768917129,
    //     imsi: '460115873',
    //     iccId: '898603',
    //     msIsdn: '18888',
    //     scName: '电信',
    //     phNum: '10685912000000000277',
    //     smsBd: '【阿里健康】您正在短信登录，验证码672484',
    //     charset: 'utf8',
    //     smsTs: 1768917129
    // }
    
    let msg = '';
    
    switch(type) {
        // SIM卡状态
        case 204:
            msg = `📱 SIM卡已就绪\n卡槽: ${slot}\n运营商: ${scName}\n号码: ${msIsdn}`;
            break;
        case 205:
            msg = `⚠️ SIM卡已弹出\n卡槽: ${slot}`;
            break;
        case 209:
            msg = `❌ SIM卡错误\n卡槽: ${slot}`;
            break;
            
        // 通信模组
        case 301:
            msg = `⚠️ 通信模组异常\n卡槽: ${slot}`;
            break;
            
        // 短信消息
        case 501:
            msg = `📨 新短信消息\n卡槽: ${slot}\n运营商: ${scName}\n本机号码: ${msIsdn}\n发送人: ${phNum}\n内容: ${smsBd}`;
            //push(req.body);
            break;
        case 502:
            msg = `✅ 外发短信成功\n卡槽: ${slot}\n接收人: ${phNum}`;
            break;
            
        // 来电
        case 601:
            msg = `📞 来电振铃\n卡槽: ${slot}\n来电号码: ${phNum}\n本机号码: ${msIsdn}`;
            break;
        case 602:
            msg = `✅ 来电接通\n卡槽: ${slot}\n来电号码: ${phNum}`;
            break;
        case 603:
            msg = `📴 来电挂断\n卡槽: ${slot}\n来电号码: ${phNum}`;
            break;
            
        // 去电
        case 620:
            msg = `📱 去电拨号\n卡槽: ${slot}\n拨打号码: ${phNum}`;
            break;
        case 621:
            msg = `📞 去电振铃\n卡槽: ${slot}\n拨打号码: ${phNum}`;
            break;
        case 622:
            msg = `✅ 去电接通\n卡槽: ${slot}\n拨打号码: ${phNum}`;
            break;
        case 623:
            msg = `📴 去电挂断\n卡槽: ${slot}\n拨打号码: ${phNum}`;
            break;
            
        // 通话按键
        case 641:
            msg = `🔢 通话本地按键\n卡槽: ${slot}`;
            break;
        case 642:
            msg = `🔢 通话远程按键\n卡槽: ${slot}`;
            break;
            
        // 设备PING
        // case 998:
        //     msg = `💓 设备PING消息\n卡槽: ${slot}\n网络通道: ${netCh === 0 ? 'WIFI' : netCh === 1 ? 'SIM1' : 'SIM2'}`;
        //     break;
            
        default:
            // msg = `📋 未知消息类型: ${type}\n卡槽: ${slot}`;

            console.log('未处理的消息类型:', type, req.body);
    }
    
    if (msg) {
        await sendLarkWebhookMessage(msg);
    }
    
    res.json({
        code: 0,
        msg: "success",
        data: {}
    });
    return 
})

router.post('/tel/record', async (req, res) => { 
    console.log(req.body)
    
    res.json({
        errcode: 0,
        errmsg: "success",
        "type": "file",
        created_at:
        Math.ceil(Date.now()/1000),
        media_id: new Date().getTime() + '',
        data: {}
    });
    return
})

router.get('/tel/token', async (req, res) => { 
    console.log(req.body)
    res.json({
        code: 0,
        msg: "success",
        data: {}
    });
    return
})

router.all('/tel/feishu/send/:msg', async (req, res) => {
    console.log(req.body)
    if (req.body.msg){

        let re = await sendLarkWebhookMessage(req.body.msg)
        res.json(re);
        return
    }
    const { msg } = req.params;
    let re = await sendLarkWebhookMessage(msg)
    
    res.json({
        code: 0,
        msg: "success",
        data: {re}
    });
    return
})


export default router;