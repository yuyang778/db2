/**
 * HTML页面保护脚本
 * 为所有页面提供基本的保护措施
 */

(function() {
    // 防止在iframe中加载
    if (window.top !== window.self) {
        window.top.location = window.self.location;
        throw new Error("此页面不允许在框架中查看");
    }

    // 页面加载完成后执行保护
    document.addEventListener('DOMContentLoaded', function() {
        // 禁用右键菜单
        document.body.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
        
        // 禁用文本选择
        document.body.addEventListener('selectstart', function(e) {
            e.preventDefault();
            return false;
        });
        
        // 禁用复制
        document.body.addEventListener('copy', function(e) {
            e.preventDefault();
            return false;
        });

        // 禁用打印
        document.body.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.keyCode == 80) { // Ctrl+P
                e.preventDefault();
                return false;
            }
        });
    });

    // 禁用F12、Ctrl+Shift+I、Ctrl+Shift+J等开发者工具快捷键
    document.onkeydown = function(e) {
        if (
            e.keyCode === 123 || // F12
            (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
            (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
            (e.ctrlKey && e.keyCode === 85) // Ctrl+U
        ) {
            return false;
        }
    };

    // 简单的页面加密混淆
    function protectPage() {
        // 生成会话标识
        let sessionToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('_page_auth_token', sessionToken);
        
        // 设置会话有效性
        if (sessionStorage.getItem('_page_validated') !== 'true') {
            sessionStorage.setItem('_page_validated', 'true');
            sessionStorage.setItem('_page_access_time', new Date().getTime());
        }
        
        // 验证环境
        checkEnvironment();
    }
    
    // 检查浏览环境
    function checkEnvironment() {
        // 检查是否开启了调试工具
        setInterval(function() {
            const dateNow = Date.now();
            debugger;
            const dateThen = Date.now();
            
            // 如果执行debugger语句花费了异常长的时间，可能是开发者工具打开了
            if (dateThen - dateNow > 100) {
                // 可以在这里添加额外的防护措施
                document.body.innerHTML = '<h1>页面已被保护</h1>';
            }
        }, 1000);
    }
    
    // 执行保护
    protectPage();
})(); 