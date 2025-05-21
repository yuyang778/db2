/**
 * HTML页面保护部署脚本
 * 自动为所有子文件夹中的HTML文件添加保护功能
 * 使用方法: node deploy-protection.js
 */

const fs = require('fs');
const path = require('path');

// 保护脚本内容
const protectorScriptPath = path.join(__dirname, 'page-protector.js');
let protectorScriptContent;

try {
    protectorScriptContent = fs.readFileSync(protectorScriptPath, 'utf8');
} catch (error) {
    console.error('无法读取保护脚本:', error.message);
    process.exit(1);
}

// 递归处理目录
function processDirectory(dirPath) {
    console.log(`处理目录: ${dirPath}`);
    
    // 读取目录内容
    const items = fs.readdirSync(dirPath);
    
    // 遍历所有文件和子目录
    for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
            // 处理子目录
            processDirectory(itemPath);
            
            // 复制保护脚本到子目录
            const scriptTargetPath = path.join(itemPath, 'page-protector.js');
            if (!fs.existsSync(scriptTargetPath)) {
                fs.writeFileSync(scriptTargetPath, protectorScriptContent);
                console.log(`复制保护脚本到: ${scriptTargetPath}`);
            }
        } else if (stat.isFile() && item.toLowerCase().endsWith('.html')) {
            // 处理HTML文件
            processHtmlFile(itemPath);
        }
    }
}

// 处理HTML文件
function processHtmlFile(filePath) {
    console.log(`处理HTML文件: ${filePath}`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 检查文件是否已经包含保护脚本
        if (content.includes('page-protector.js')) {
            console.log(`  - 文件已包含保护脚本，跳过`);
            
            // 检查链接是否有target="_blank"
            content = addTargetBlankToLinks(content, filePath);
            
            return;
        }
        
        // 添加保护脚本引用
        content = addProtectorScript(content, filePath);
        
        // 添加target="_blank"到所有链接
        content = addTargetBlankToLinks(content, filePath);
        
        // 写回文件
        fs.writeFileSync(filePath, content);
        console.log(`  - 已添加保护功能`);
        
    } catch (error) {
        console.error(`  - 处理文件时出错: ${error.message}`);
    }
}

// 添加保护脚本到HTML文件
function addProtectorScript(content, filePath) {
    // 获取相对路径
    const dirPath = path.dirname(filePath);
    const relativePath = path.relative(dirPath, __dirname);
    let scriptPath = relativePath ? path.join(relativePath, 'page-protector.js') : 'page-protector.js';
    
    // 使用正确的路径分隔符
    scriptPath = scriptPath.replace(/\\/g, '/');
    
    // 如果不是以/开头且不是相对路径，添加./
    if (!scriptPath.startsWith('/') && !scriptPath.startsWith('./') && !scriptPath.startsWith('../')) {
        scriptPath = './' + scriptPath;
    }
    
    // 在</head>前添加脚本引用
    const scriptTag = `<script src="${scriptPath}"></script>\n</head>`;
    return content.replace('</head>', scriptTag);
}

// 添加target="_blank"到所有链接
function addTargetBlankToLinks(content, filePath) {
    // 寻找所有没有target="_blank"的链接
    const regex = /<a\s+(?![^>]*target=["']_blank["'])[^>]*href=["'][^"'>]+["'][^>]*>/gi;
    let modified = false;
    
    const newContent = content.replace(regex, (match) => {
        // 不修改返回首页的链接
        if (match.includes('返回首页') || match.includes('index.html') && match.includes('target="_self"')) {
            return match;
        }
        
        // 添加target="_blank"
        modified = true;
        if (match.endsWith('>')) {
            return match.slice(0, -1) + ' target="_blank">';
        } else {
            return match + ' target="_blank"';
        }
    });
    
    if (modified) {
        console.log(`  - 已添加target="_blank"到链接`);
    }
    
    return newContent;
}

// 开始处理
console.log('开始部署HTML页面保护...');
processDirectory(__dirname);
console.log('部署完成!');

// 生成报告
console.log('\n=== 部署报告 ===');
console.log('保护脚本已部署到所有子目录');
console.log('所有HTML文件已添加保护功能');
console.log('所有链接已设置为在新窗口打开');
console.log('\n若要验证，请打开网站并测试保护功能是否正常工作'); 