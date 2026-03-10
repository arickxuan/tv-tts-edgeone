# TV and TTS

自用版本 代码ai 生成

## 部署


[![使用 EdgeOne Pages 部署](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://console.cloud.tencent.com/edgeone/pages/new?repository-url=https://github.com/arickxuan/tv-tts-edgeone)

## 微信测试号推送
ENV：
```
WECHAT_APPID=wx6XXX
WECHAT_APPSECRET=6a30beXXX
WECHAT_TOKEN=token
WECHAT_ENCODING_AES_KEY=bizOR4aPXiXXXX

```
1. 定义模板 得到模板id
```
内容：{{content.DATA}}
```
2. 后台记录openid

3. 发送模板消息
```
curl -X "POST" "https://xxx.com/wechat/default/notify" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "openId": "xxx",
  "content": "哼哼",
  "templateId": "q_6MgfKYTuXBcaKOD5wVXyILiReH53_121AVJtfs7KI",
  "type": "template"
}'
```



客服平台 登录
https://mpkf.weixin.qq.com/

## 天翼云签到
ENV：
TY_USERNAME=XXXX
TY_PASSWORD=XXXX

签到地址
xxx.com/wangyiyun/click


最新：关于天翼云设备锁问题导致登陆失败或者提示登录错误：设备ID不存在，需要二次设备校验的解决办法！ 登陆这个网址：https://e.dlife.cn/user/index.do

会弹出新网页，默认显示【个人信息】，点左侧【帐号安全】

5、关闭【设备锁】，即可

Ps：网页关闭不了设备锁的，用 天翼云盘 app关闭自行寻找 期间需要两次验证码验证！ 如果对上述网址不放心的可以用下面的方法 1、登录天翼云盘网页版，地址：https://cloud.189.cn/web/login.html 2、登录后，鼠标移动到右上方帐号位置，并点击【帐号设置】