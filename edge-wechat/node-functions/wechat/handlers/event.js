/**
 * 事件处理器
 * 处理各种微信事件
 */

/**
 * 处理关注/取消关注事件
 * @param {object} message - 接收到的消息对象
 * @returns {object|null} 回复消息对象
 */
export function handleSubscribeEvent(message) {
    console.log('关注事件:', message.Event, message.FromUserName);
    
    if (message.Event === 'subscribe') {
        const replyMessage = {
            ToUserName: message.FromUserName,
            FromUserName: message.ToUserName,
            CreateTime: Math.floor(Date.now() / 1000),
            MsgType: 'text',
            Content: '欢迎关注我们的公众号！感谢您的支持！'
        };
        return replyMessage;
    } else if (message.Event === 'unsubscribe') {
        console.log('用户取消关注:', message.FromUserName);
        return null;
    }
    
    return null;
}

/**
 * 处理点击菜单事件
 * @param {object} message - 接收到的消息对象
 * @returns {object} 回复消息对象
 */
export function handleClickEvent(message) {
    console.log('菜单点击事件:', message.EventKey);
    
    const replyMessage = {
        ToUserName: message.FromUserName,
        FromUserName: message.ToUserName,
        CreateTime: Math.floor(Date.now() / 1000),
        MsgType: 'text',
        Content: `您点击了菜单: ${message.EventKey}`
    };
    
    return replyMessage;
}

/**
 * 处理扫码事件
 * @param {object} message - 接收到的消息对象
 * @returns {object} 回复消息对象
 */
export function handleScanEvent(message) {
    console.log('扫码事件:', message.EventKey);
    
    const replyMessage = {
        ToUserName: message.FromUserName,
        FromUserName: message.ToUserName,
        CreateTime: Math.floor(Date.now() / 1000),
        MsgType: 'text',
        Content: '扫码成功'
    };
    
    return replyMessage;
}

/**
 * 处理菜单跳转事件
 * @param {object} message - 接收到的消息对象
 * @returns {null}
 */
export function handleViewEvent(message) {
    console.log('菜单跳转事件:', message.EventKey);
    return null; // VIEW 事件不需要回复
}

export default {
    handleSubscribeEvent,
    handleClickEvent,
    handleScanEvent,
    handleViewEvent
};
