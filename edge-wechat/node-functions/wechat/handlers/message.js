/**
 * 消息处理器
 * 处理各种类型的微信消息
 */

/**
 * 处理文本消息
 * @param {object} message - 接收到的消息对象
 * @returns {object} 回复消息对象
 */
export function handleTextMessage(message) {
    console.log('收到文本消息:', message.Content);
    
    // 构建回复消息
    const replyMessage = {
        ToUserName: message.FromUserName,
        FromUserName: message.ToUserName,
        CreateTime: Math.floor(Date.now() / 1000),
        MsgType: 'text',
        Content: `您发送的消息是：${message.Content}`
    };
    
    return replyMessage;
}

/**
 * 处理图片消息
 * @param {object} message - 接收到的消息对象
 * @returns {object} 回复消息对象
 */
export function handleImageMessage(message) {
    console.log('收到图片消息:', message.PicUrl);
    
    const replyMessage = {
        ToUserName: message.FromUserName,
        FromUserName: message.ToUserName,
        CreateTime: Math.floor(Date.now() / 1000),
        MsgType: 'text',
        Content: '已收到您的图片'
    };
    
    return replyMessage;
}

/**
 * 处理语音消息
 * @param {object} message - 接收到的消息对象
 * @returns {object} 回复消息对象
 */
export function handleVoiceMessage(message) {
    console.log('收到语音消息:', message.MediaId);
    
    const replyMessage = {
        ToUserName: message.FromUserName,
        FromUserName: message.ToUserName,
        CreateTime: Math.floor(Date.now() / 1000),
        MsgType: 'text',
        Content: message.Recognition ? `语音识别结果：${message.Recognition}` : '已收到您的语音消息'
    };
    
    return replyMessage;
}

/**
 * 处理视频消息
 * @param {object} message - 接收到的消息对象
 * @returns {object} 回复消息对象
 */
export function handleVideoMessage(message) {
    console.log('收到视频消息:', message.MediaId);
    
    const replyMessage = {
        ToUserName: message.FromUserName,
        FromUserName: message.ToUserName,
        CreateTime: Math.floor(Date.now() / 1000),
        MsgType: 'text',
        Content: '已收到您的视频'
    };
    
    return replyMessage;
}

/**
 * 处理位置消息
 * @param {object} message - 接收到的消息对象
 * @returns {object} 回复消息对象
 */
export function handleLocationMessage(message) {
    console.log('收到位置消息:', message.Label);
    
    const replyMessage = {
        ToUserName: message.FromUserName,
        FromUserName: message.ToUserName,
        CreateTime: Math.floor(Date.now() / 1000),
        MsgType: 'text',
        Content: `已收到您的位置：${message.Label}`
    };
    
    return replyMessage;
}

/**
 * 处理链接消息
 * @param {object} message - 接收到的消息对象
 * @returns {object} 回复消息对象
 */
export function handleLinkMessage(message) {
    console.log('收到链接消息:', message.Url);
    
    const replyMessage = {
        ToUserName: message.FromUserName,
        FromUserName: message.ToUserName,
        CreateTime: Math.floor(Date.now() / 1000),
        MsgType: 'text',
        Content: '已收到您分享的链接'
    };
    
    return replyMessage;
}

export default {
    handleTextMessage,
    handleImageMessage,
    handleVoiceMessage,
    handleVideoMessage,
    handleLocationMessage,
    handleLinkMessage
};
