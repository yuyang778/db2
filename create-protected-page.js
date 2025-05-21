/**
 * 创建受保护HTML页面的工具脚本
 * 使用方法: node create-protected-page.js 页面名称 页面路径
 */

const fs = require('fs');
const path = require('path');

// 读取命令行参数
const pageName = process.argv[2];
const pagePath = process.argv[3];

if (!pageName || !pagePath) {
    console.error('请提供页面名称和路径。示例: node create-protected-page.js "数据查询学习" "数据查询学习教程"');
    process.exit(1);
}

// 读取模板文件
try {
    const templatePath = path.join(__dirname, 'template.html');
    let templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // 替换模板中的占位符
    templateContent = templateContent.replace('[页面标题]', pageName);
    templateContent = templateContent.replace('[主标题]', pageName);
    
    // 创建目标目录(如果不存在)
    const targetDir = path.join(__dirname, pagePath);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`创建目录: ${targetDir}`);
    }
    
    // 创建目标文件
    const targetFile = path.join(targetDir, 'index.html');
    fs.writeFileSync(targetFile, templateContent);
    
    // 复制保护脚本到目标目录
    const sourceScript = path.join(__dirname, 'page-protector.js');
    const targetScript = path.join(targetDir, 'page-protector.js');
    fs.copyFileSync(sourceScript, targetScript);
    
    console.log(`成功创建受保护的HTML页面: ${targetFile}`);
    console.log(`页面保护脚本已复制到: ${targetScript}`);
    
} catch (error) {
    console.error('创建页面时出错:', error.message);
    process.exit(1);
} 