import express from 'express';
import musicApp from './node-functions/music/[[default]].js';
import movieApp from './node-functions/movie/[[default]].js';
import supabaseApp from './node-functions/supabase/[[default]].js';

const app = express();

// 解析 JSON 和表单
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 子应用挂载
app.use('/music', musicApp);
app.use('/movie', movieApp);
app.use('/supabase', supabaseApp);

// 健康检查
app.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(8088, () => {
    console.log('服务器启动成功');
});