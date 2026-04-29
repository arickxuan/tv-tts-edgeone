import app from './app.js';
const PORT = process.env.PORT || 3000;


app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    // 初始化表格权限
    //await initSheetPermission();
});