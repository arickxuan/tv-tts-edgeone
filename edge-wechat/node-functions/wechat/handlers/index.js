/**
 * 消息和事件处理器入口
 */

import * as messageHandlers from './message.js';
import * as eventHandlers from './event.js';

/**
 * 处理微信消息或事件
 * @param {object} message - 微信消息对象
 * @returns {object|null} 回复消息对象
 */
export function handleMessage(message) {
    let replyMessage = null;
    
    try {
        // 根据消息类型处理
        switch (message.MsgType) {
            case 'text':
                replyMessage = messageHandlers.handleTextMessage(message);
                break;
                
            case 'image':
                replyMessage = messageHandlers.handleImageMessage(message);
                break;
                
            case 'voice':
                replyMessage = messageHandlers.handleVoiceMessage(message);
                break;
                
            case 'video':
            case 'shortvideo':
                replyMessage = messageHandlers.handleVideoMessage(message);
                break;
                
            case 'location':
                replyMessage = messageHandlers.handleLocationMessage(message);
                break;
                
            case 'link':
                replyMessage = messageHandlers.handleLinkMessage(message);
                break;
                
            case 'event':
                // 处理事件消息
                switch (message.Event) {
                    case 'subscribe':
                    case 'unsubscribe':
                        replyMessage = eventHandlers.handleSubscribeEvent(message);
                        break;
                        
                    case 'CLICK':
                        replyMessage = eventHandlers.handleClickEvent(message);
                        break;
                        
                    case 'VIEW':
                        replyMessage = eventHandlers.handleViewEvent(message);
                        break;
                        
                    case 'SCAN':
                        replyMessage = eventHandlers.handleScanEvent(message);
                        break;
                        
                    default:
                        console.log('未处理的事件类型:', message.Event);
                }
                break;
                
            default:
                console.log('未处理的消息类型:', message.MsgType);
        }
    } catch (error) {
        console.error('处理消息时出错:', error);
    }
    
    return replyMessage;
}

export default {
    handleMessage,
    ...messageHandlers,
    ...eventHandlers
};
