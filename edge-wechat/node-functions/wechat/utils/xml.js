/**
 * XML 处理工具
 */

/**
 * 解析 XML 消息
 * @param {string} xml - XML 字符串
 * @returns {object} 解析后的对象
 */
export function parseXML(xml) {
    const result = {};
    const regex = /<(\w+)><!?\[CDATA\[(.*?)\]\]><\/\1>|<(\w+)>(.*?)<\/\3>/g;
    let match;
    
    while ((match = regex.exec(xml)) !== null) {
        const key = match[1] || match[3];
        const value = match[2] || match[4];
        result[key] = value;
    }
    
    return result;
}

/**
 * 构建 XML 响应消息
 * @param {object} message - 消息对象
 * @returns {string} XML 字符串
 */
export function buildXML(message) {
    let xml = '<xml>';
    for (const [key, value] of Object.entries(message)) {
        if (typeof value === 'number') {
            xml += `<${key}>${value}</${key}>`;
        } else {
            xml += `<${key}><![CDATA[${value}]]></${key}>`;
        }
    }
    xml += '</xml>';
    return xml;
}

/**
 * 智能解析消息（支持 JSON 和 XML）
 * @param {string|object} data - 消息数据
 * @param {string} contentType - Content-Type 头
 * @returns {object} { message: 解析后的消息对象, isJson: 是否为 JSON 格式 }
 */
export function parseMessage(data, contentType = '') {
    
    if(contentType == 'application/json') {
        return { message: JSON.parse(data), isJson: true };
    }
    if(contentType == 'text/xml' || contentType == 'application/xml') {
        return { message: parseXML(data), isJson: false };
    }

    // 如果是字符串，根据 Content-Type 或内容判断格式
    if (typeof data === 'string') {
        const trimmed = data.trim();
        
        // 优先检查 Content-Type 和 XML 格式
        if (contentType.includes('text/xml') || contentType.includes('application/xml') || trimmed.startsWith('<xml>')) {
            console.log('✅ 识别为 XML 格式');
            return { message: parseXML(data), isJson: false };
        }
        
        // 检查 JSON Content-Type
        if (contentType.includes('application/json')) {
            try {
                console.log('✅ 识别为 JSON 格式（根据 Content-Type）');
                return { message: JSON.parse(data), isJson: true };
            } catch (e) {
                console.error('❌ JSON 解析失败:', e.message);
            }
        }
        
        // 尝试判断是否是 JSON 字符串
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
                console.log('✅ 识别为 JSON 格式（根据内容）');
                return { message: JSON.parse(data), isJson: true };
            } catch (e) {
                // 不是有效的 JSON，继续尝试 XML
                console.log('⚠️ 看起来像 JSON 但解析失败，尝试 XML');
            }
        }
        
        // 默认尝试 XML 解析
        console.log('📄 默认使用 XML 解析');
        return { message: parseXML(data), isJson: false };
    }
    
    // 其他情况，尝试 XML 解析
    console.log('⚠️ 未知数据类型，尝试 XML 解析');
    return { message: parseXML(String(data)), isJson: false };
}

export default {
    parseXML,
    buildXML,
    parseMessage
};
