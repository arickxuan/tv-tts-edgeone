import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPURL; //'https://bhziqtdetzehtjngvjpy.supabase.co'
const supabaseKey = process.env.SUPSECRET;

export function getDB() {
    return createClient(supabaseUrl, supabaseKey);
}

// 只在需要的路由使用的中间件
export async function authMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.replace("Bearer ", "");

    // 校验并获取 user
    const { data: { user }, error } = await getDB().auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ error: "Invalid token" });
    }

    req.userId = user.id; // 存到 request 对象
    next();
}