
// 常用的视频解析接口列表
export const PARSE_APIS = [
    {
        name: '无名小站',
        url: 'https://jx.aidouer.net/?url=',
        support: ['qq', 'iqiyi', 'youku', 'mgtv', 'bilibili']
    },
    {
        name: '虾米解析',
        url: 'https://jx.xmflv.com/?url=',
        support: ['qq', 'iqiyi', 'youku', 'mgtv', 'bilibili', 'sohu']
    },
    {
        name: '爱豆解析',
        url: 'https://jx.aidouer.net/?url=',
        support: ['qq', 'iqiyi', 'youku', 'mgtv', 'bilibili']
    },
    {
        name: '8090解析',
        url: 'https://www.8090g.cn/?url=',
        support: ['qq', 'iqiyi', 'youku', 'mgtv', 'bilibili']
    },
    {
        name: 'OK解析',
        url: 'https://okjx.cc/?url=',
        support: ['qq', 'iqiyi', 'youku', 'mgtv', 'bilibili']
    }
];

export function detectPlatform(url) {
    if (url.includes('qq.com') || url.includes('v.qq.com')) return 'qq';
    if (url.includes('iqiyi.com') || url.includes('qiyi.com')) return 'iqiyi';
    if (url.includes('youku.com')) return 'youku';
    if (url.includes('mgtv.com')) return 'mgtv';
    if (url.includes('bilibili.com')) return 'bilibili';
    if (url.includes('sohu.com')) return 'sohu';
    if (url.includes('letv.com') || url.includes('le.com')) return 'letv';
    if (url.includes('tudou.com')) return 'tudou';
    if (url.includes('pptv.com')) return 'pptv';
    if (url.includes('1905.com')) return '1905';
    return 'unknown';
}


export function getCompatibleParsers(platform) {
    return PARSE_APIS.filter(api =>
        api.support.includes(platform) || platform === 'unknown'
    );
}