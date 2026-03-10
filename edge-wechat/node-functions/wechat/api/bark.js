import axios from 'axios';


export async function push(body,key = null) {
    try {
        if (!key) {
            key = process.env.BARK_KEY;
        }
        let title = body.msIsdn + "收到短信"
        let url = `https://api.day.app/${key}/${title}`;
        let content = "/" + "来自" + body.phNum + " 。内容:" + body.smsBd 
        if (content) {
            url += content;
        }
        console.log(url)
        
        const response = await axios.get(url);
        
        if (response.data.code == 200) {
            return response.data;
        } else {
            console.error('bark err:', response.data);
            throw new Error(`bark err: ${response.data.errmsg || '未知错误'}`);
        }
    } catch (error) {
        console.error(`bark err:`, error);
        throw error;
    }
}