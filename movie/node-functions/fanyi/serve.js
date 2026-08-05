import app from './app.js';

// 独立运行时监听端口
const PORT = process.env.FANYI_PORT || 8089;
if (import.meta.url === `file://${process.argv[1]}`) {
    app.listen(PORT, () => {
        console.log(`翻译服务已启动: http://localhost:${PORT}`);
    });
}



app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    // 初始化表格权限
    //await initSheetPermission();
});
