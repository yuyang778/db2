// 主JavaScript文件，用于初始化和协调各部分功能

document.addEventListener('DOMContentLoaded', () => {
    console.log('关系代数交互沙盒已加载');
    
    // 初始化界面
    initUI();
    
    // 绑定事件处理器
    bindEventHandlers();
});

// 初始化用户界面
function initUI() {
    // 检查数据是否加载
    if (!window.dbData) {
        console.error('错误: 数据未加载');
        return;
    }
    
    // 显示数据表格预览（可选功能）
    // showTablePreviews();
    
    // 初始化提示信息
    displayTips();
}

// 绑定事件处理器
function bindEventHandlers() {
    // 执行按钮事件
    const executeBtn = document.getElementById('execute-btn');
    if (executeBtn) {
        executeBtn.addEventListener('click', executeQuery);
    }
    
    // 清除按钮事件已在drag-drop.js中处理
}

// 显示提示信息
function displayTips() {
    // 可以在界面上添加一些提示信息或说明
    // 这里是一个示例实现，实际应用中可以根据需要修改
    
    const tipMessages = [
        '拖拽字段和运算符到查询区域构建查询',
        '点击运算符可设置条件，如 "σ" 可以设置选择条件 "age > 20"',
        '点击执行按钮查看查询结果和SQL等价表示',
        '使用清除按钮重新开始构建查询'
    ];
    
    // 添加提示信息到页面（可选）
    const header = document.querySelector('header p');
    if (header) {
        let currentTipIndex = 0;
        
        // 定期切换提示信息
        setInterval(() => {
            header.textContent = tipMessages[currentTipIndex];
            currentTipIndex = (currentTipIndex + 1) % tipMessages.length;
        }, 5000);
    }
}

// 显示数据表预览功能（可选）
function showTablePreviews() {
    // 为每个表创建预览按钮
    const tables = document.querySelectorAll('.table');
    
    tables.forEach(table => {
        const tableName = table.querySelector('h3').textContent;
        const previewBtn = document.createElement('button');
        previewBtn.className = 'preview-btn';
        previewBtn.textContent = '预览';
        previewBtn.addEventListener('click', () => {
            previewTable(tableName);
        });
        
        table.appendChild(previewBtn);
    });
}

// 预览表数据（可选功能）
function previewTable(tableName) {
    if (!window.dbData || !window.dbData.tables[tableName]) {
        alert(`表 ${tableName} 不存在`);
        return;
    }
    
    const data = window.dbData.tables[tableName];
    
    // 创建一个模态对话框显示表数据
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    const title = document.createElement('h3');
    title.textContent = `${tableName} 表预览`;
    
    const table = createTableFromData(data);
    
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(title);
    modalContent.appendChild(table);
    modal.appendChild(modalContent);
    
    document.body.appendChild(modal);
}

// 从数据创建表格（辅助函数）
function createTableFromData(data) {
    if (!data || data.length === 0) {
        const p = document.createElement('p');
        p.textContent = '无数据';
        return p;
    }
    
    const table = document.createElement('table');
    
    // 创建表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // 从第一行数据获取列名
    const columns = Object.keys(data[0]);
    
    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // 创建表格内容
    const tbody = document.createElement('tbody');
    
    data.forEach(row => {
        const tr = document.createElement('tr');
        
        columns.forEach(column => {
            const td = document.createElement('td');
            td.textContent = row[column];
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    return table;
} 