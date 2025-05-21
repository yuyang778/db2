document.addEventListener('DOMContentLoaded', function() {
    // 数据库模拟
    const database = {
        // 数据库表结构和初始数据
        tables: {
            users: [
                { id: 1, name: "张三", email: "zhangsan@example.com", created_at: "2023-01-01 10:00:00" },
                { id: 2, name: "李四", email: "lisi@example.com", created_at: "2023-01-02 11:30:00" }
            ],
            products: [
                { id: 1, name: "笔记本电脑", price: 5999, stock: 100 },
                { id: 2, name: "智能手机", price: 3999, stock: 200 }
            ]
        },
        // 数据库版本，用于跟踪变更
        version: 1,
        // 最后更新时间
        lastUpdate: new Date().toLocaleString()
    };

    // 备份存储
    const backups = {
        full: [],       // 完整备份
        differential: [], // 差异备份
        logs: []        // 事务日志备份
    };

    // 事务日志
    const transactionLogs = [];

    // 时间线数据存储
    const timelineEvents = [];

    // 数据库当前状态标记
    let databaseStatus = 'online';  // 可能的状态: online, crashed, restoring
    let lastFullBackupVersion = 0;  // 最后一次完整备份的版本号

    // DOM元素引用
    const databaseContentEl = document.getElementById('databaseContent');
    const timelineContentEl = document.getElementById('timelineContent');
    const logsContentEl = document.getElementById('logsContent');
    const infoContentEl = document.getElementById('infoContent');
    const timelineChartEl = document.getElementById('timelineChart');
    const chartStatusEl = document.getElementById('chartStatus');

    // 时间线图表
    let timelineChart;

    // 按钮事件监听
    document.getElementById('fullBackup').addEventListener('click', performFullBackup);
    document.getElementById('diffBackup').addEventListener('click', performDifferentialBackup);
    document.getElementById('logBackup').addEventListener('click', performLogBackup);
    document.getElementById('addData').addEventListener('click', addData);
    document.getElementById('modifyData').addEventListener('click', modifyData);
    document.getElementById('simulateCrash').addEventListener('click', simulateCrash);
    document.getElementById('restoreFromFull').addEventListener('click', restoreFromFullBackup);
    document.getElementById('restoreWithDiff').addEventListener('click', restoreWithDifferentialBackup);
    document.getElementById('restoreWithLogs').addEventListener('click', restoreWithLogs);

    // 初始化界面
    init();

    // 初始化函数，显示初始数据库状态
    function init() {
        updateDatabaseView();
        addInfoMessage('数据库模拟器已启动，当前数据库状态: 在线');
        addTimelineItem('数据库初始化', '系统启动，数据库已就绪');
        
        // 稍微延迟初始化图表，确保DOM已完全加载
        setTimeout(() => {
            initTimelineChart();
            addTimelineEvent('数据库初始化', 'init', database.version);
        }, 500);
    }

    // 初始化时间线图表
    function initTimelineChart() {
        try {
            // 更新图表状态
            chartStatusEl.textContent = "正在初始化图表...";
            console.log('正在初始化图表...');
            
            // 确保Canvas元素存在
            if (!timelineChartEl) {
                const errorMsg = '找不到图表Canvas元素';
                chartStatusEl.textContent = errorMsg;
                console.error(errorMsg);
                return;
            }
            
            // 检查Chart.js是否可用
            if (typeof Chart === 'undefined') {
                const errorMsg = 'Chart.js库未正确加载，请检查网络连接';
                chartStatusEl.textContent = errorMsg;
                console.error(errorMsg);
                return;
            }
            
            // 创建图表
            timelineChart = new Chart(timelineChartEl, {
                type: 'line', // 使用线图而不是散点图，更容易显示
                data: {
                    labels: ['初始'], // 初始X轴标签
                    datasets: [{
                        label: '数据库版本',
                        data: [database.version],
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                title: function(tooltipItems) {
                                    const idx = tooltipItems[0].dataIndex;
                                    return timelineEvents[idx] ? timelineEvents[idx].title : '初始';
                                },
                                label: function(context) {
                                    return `版本: ${context.parsed.y}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: '数据库版本'
                            },
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
            
            chartStatusEl.textContent = "图表已初始化";
            console.log('图表初始化完成');
        } catch (error) {
            const errorMsg = `图表初始化失败: ${error.message}`;
            chartStatusEl.textContent = errorMsg;
            console.error(errorMsg, error);
        }
    }

    // 添加时间线事件 - 简化版
    function addTimelineEvent(title, eventType, version, description = '') {
        try {
            if (!timelineChart) {
                console.error('图表未初始化');
                return;
            }
            
            // 存储事件数据
            const eventData = {
                title,
                description: description || title,
                type: eventType,
                version
            };
            
            timelineEvents.push(eventData);
            
            // 更新图表数据
            timelineChart.data.labels.push(title);
            timelineChart.data.datasets[0].data.push(version);
            
            // 根据事件类型设置颜色
            let bgColor, borderColor;
            switch(eventType) {
                case 'full-backup':
                    bgColor = 'rgba(76, 175, 80, 0.2)';
                    borderColor = 'rgba(76, 175, 80, 1)';
                    break;
                case 'diff-backup':
                    bgColor = 'rgba(33, 150, 243, 0.2)';
                    borderColor = 'rgba(33, 150, 243, 1)';
                    break;
                case 'log-backup':
                    bgColor = 'rgba(255, 152, 0, 0.2)';
                    borderColor = 'rgba(255, 152, 0, 1)';
                    break;
                case 'operation':
                    bgColor = 'rgba(156, 39, 176, 0.2)';
                    borderColor = 'rgba(156, 39, 176, 1)';
                    break;
                case 'crash':
                    bgColor = 'rgba(244, 67, 54, 0.2)';
                    borderColor = 'rgba(244, 67, 54, 1)';
                    break;
                case 'restore':
                    bgColor = 'rgba(233, 30, 99, 0.2)';
                    borderColor = 'rgba(233, 30, 99, 1)';
                    break;
                default:
                    bgColor = 'rgba(96, 125, 139, 0.2)';
                    borderColor = 'rgba(96, 125, 139, 1)';
            }
            
            // 为新点设置颜色
            const dataLength = timelineChart.data.datasets[0].data.length;
            if (!timelineChart.data.datasets[0].backgroundColor) {
                timelineChart.data.datasets[0].backgroundColor = [];
                timelineChart.data.datasets[0].borderColor = [];
            }
            
            if (Array.isArray(timelineChart.data.datasets[0].backgroundColor)) {
                timelineChart.data.datasets[0].backgroundColor.push(bgColor);
                timelineChart.data.datasets[0].borderColor.push(borderColor);
            }
            
            timelineChart.update();
            chartStatusEl.textContent = `最后更新: ${title}`;
            console.log(`添加了事件: ${title}, 类型: ${eventType}, 版本: ${version}`);
        } catch (error) {
            console.error('添加事件时出错:', error);
            chartStatusEl.textContent = `图表更新失败: ${error.message}`;
        }
    }

    // 更新数据库视图
    function updateDatabaseView() {
        databaseContentEl.innerHTML = '';

        // 为每个表创建视图
        for (const tableName in database.tables) {
            const tableDiv = document.createElement('div');
            tableDiv.innerHTML = `<h4>表: ${tableName}</h4>`;

            // 创建表格
            const table = document.createElement('table');
            table.className = 'database-table';

            // 表头
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            // 获取列名（假设第一行数据包含所有列）
            if (database.tables[tableName].length > 0) {
                const columns = Object.keys(database.tables[tableName][0]);
                columns.forEach(column => {
                    const th = document.createElement('th');
                    th.textContent = column;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                table.appendChild(thead);
            }

            // 表内容
            const tbody = document.createElement('tbody');
            database.tables[tableName].forEach(row => {
                const tr = document.createElement('tr');
                Object.values(row).forEach(value => {
                    const td = document.createElement('td');
                    td.textContent = value;
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);

            tableDiv.appendChild(table);
            databaseContentEl.appendChild(tableDiv);
        }

        // 添加数据库元信息
        const metaInfo = document.createElement('div');
        metaInfo.innerHTML = `
            <div style="margin-top: 20px; font-style: italic;">
                <p>数据库版本: ${database.version}</p>
                <p>最后更新: ${database.lastUpdate}</p>
                <p>状态: ${getStatusInChinese(databaseStatus)}</p>
            </div>
        `;
        databaseContentEl.appendChild(metaInfo);
    }

    // 获取中文状态描述
    function getStatusInChinese(status) {
        switch(status) {
            case 'online': return '在线';
            case 'crashed': return '崩溃';
            case 'restoring': return '正在恢复';
            default: return status;
        }
    }

    // 添加信息消息
    function addInfoMessage(message) {
        const now = new Date().toLocaleTimeString();
        const infoItem = document.createElement('div');
        infoItem.textContent = `[${now}] ${message}`;
        infoContentEl.appendChild(infoItem);
        infoContentEl.scrollTop = infoContentEl.scrollHeight;
    }

    // 添加时间线项目
    function addTimelineItem(title, description) {
        const now = new Date().toLocaleTimeString();
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        timelineItem.innerHTML = `
            <strong>${title}</strong> [${now}]<br>
            <span>${description}</span>
        `;
        timelineContentEl.appendChild(timelineItem);
        timelineContentEl.scrollTop = timelineContentEl.scrollHeight;
    }

    // 添加日志条目
    function addLogEntry(operation, details, className = '') {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${className}`;
        const timestamp = new Date().toLocaleTimeString();
        
        logEntry.innerHTML = `[${timestamp}] ${operation}: ${details}`;
        logsContentEl.appendChild(logEntry);
        logsContentEl.scrollTop = logsContentEl.scrollHeight;

        // 记录到事务日志
        transactionLogs.push({
            timestamp: new Date(),
            operation,
            details,
            databaseVersion: database.version
        });
    }

    // 执行完整备份
    function performFullBackup() {
        if (databaseStatus !== 'online') {
            addInfoMessage('错误: 无法在数据库' + getStatusInChinese(databaseStatus) + '状态下执行备份');
            return;
        }

        const backupTime = new Date();
        const backupData = JSON.parse(JSON.stringify(database)); // 深拷贝

        // 存储完整备份
        backups.full.push({
            timestamp: backupTime,
            data: backupData,
            version: database.version
        });

        // 更新最后完整备份版本
        lastFullBackupVersion = database.version;

        addLogEntry('完整备份', `数据库版本 ${database.version} 的完整备份已创建`, 'full-backup');
        addTimelineItem('完整备份', `创建了数据库版本 ${database.version} 的完整备份`);
        addTimelineEvent('完整备份', 'full-backup', database.version, `数据库版本 ${database.version} 的完整备份`);
        addInfoMessage(`完整备份已成功创建，备份时间: ${backupTime.toLocaleString()}`);
    }

    // 执行差异备份
    function performDifferentialBackup() {
        if (databaseStatus !== 'online') {
            addInfoMessage('错误: 无法在数据库' + getStatusInChinese(databaseStatus) + '状态下执行备份');
            return;
        }

        if (backups.full.length === 0) {
            addInfoMessage('错误: 无法创建差异备份，因为尚未创建完整备份');
            return;
        }

        const backupTime = new Date();
        const backupData = JSON.parse(JSON.stringify(database)); // 深拷贝

        // 存储差异备份
        backups.differential.push({
            timestamp: backupTime,
            data: backupData,
            baseVersion: lastFullBackupVersion,
            currentVersion: database.version
        });

        addLogEntry('差异备份', `基于版本 ${lastFullBackupVersion} 的差异备份已创建，当前版本 ${database.version}`, 'diff-backup');
        addTimelineItem('差异备份', `创建了基于版本 ${lastFullBackupVersion} 的差异备份`);
        addTimelineEvent('差异备份', 'diff-backup', database.version, `基于版本 ${lastFullBackupVersion} 的差异备份`);
        addInfoMessage(`差异备份已成功创建，备份时间: ${backupTime.toLocaleString()}`);
    }

    // 执行日志备份
    function performLogBackup() {
        if (databaseStatus !== 'online') {
            addInfoMessage('错误: 无法在数据库' + getStatusInChinese(databaseStatus) + '状态下执行备份');
            return;
        }

        if (transactionLogs.length === 0) {
            addInfoMessage('错误: 没有事务日志可备份');
            return;
        }

        const backupTime = new Date();
        
        // 获取上次日志备份后的所有日志
        const lastLogBackup = backups.logs.length > 0 ? backups.logs[backups.logs.length - 1].timestamp : new Date(0);
        const newLogs = transactionLogs.filter(log => log.timestamp > lastLogBackup);

        if (newLogs.length === 0) {
            addInfoMessage('没有新的事务日志需要备份');
            return;
        }

        // 存储日志备份
        backups.logs.push({
            timestamp: backupTime,
            logs: JSON.parse(JSON.stringify(newLogs)),
            fromVersion: newLogs[0].databaseVersion,
            toVersion: newLogs[newLogs.length - 1].databaseVersion
        });

        addLogEntry('日志备份', `从版本 ${newLogs[0].databaseVersion} 到 ${newLogs[newLogs.length - 1].databaseVersion} 的事务日志已备份`, 'log-backup');
        addTimelineItem('日志备份', `备份了 ${newLogs.length} 条事务日志`);
        addTimelineEvent('日志备份', 'log-backup', database.version, `备份了 ${newLogs.length} 条事务日志`);
        addInfoMessage(`日志备份已成功创建，包含 ${newLogs.length} 条事务日志`);
    }

    // 添加测试数据
    function addData() {
        if (databaseStatus !== 'online') {
            addInfoMessage('错误: 无法在数据库' + getStatusInChinese(databaseStatus) + '状态下添加数据');
            return;
        }

        // 添加用户
        const userId = database.tables.users.length + 1 + Math.floor(Math.random() * 1000);
        const newUser = {
            id: userId,
            name: `用户${userId}`,
            email: `user${userId}@example.com`,
            created_at: new Date().toLocaleString()
        };
        database.tables.users.push(newUser);

        // 添加产品
        const productId = database.tables.products.length + 1 + Math.floor(Math.random() * 1000);
        const newProduct = {
            id: productId,
            name: `产品${productId}`,
            price: Math.floor(Math.random() * 10000),
            stock: Math.floor(Math.random() * 1000)
        };
        database.tables.products.push(newProduct);

        // 更新数据库版本和时间
        database.version++;
        database.lastUpdate = new Date().toLocaleString();

        updateDatabaseView();
        addLogEntry('添加数据', `添加了新用户 ID: ${userId} 和新产品 ID: ${productId}`, 'operation');
        addTimelineItem('数据操作', '添加了新用户和新产品');
        addTimelineEvent('添加数据', 'operation', database.version, `添加了新用户和新产品`);
        addInfoMessage(`数据添加成功，数据库版本更新至 ${database.version}`);
    }

    // 修改现有数据
    function modifyData() {
        if (databaseStatus !== 'online') {
            addInfoMessage('错误: 无法在数据库' + getStatusInChinese(databaseStatus) + '状态下修改数据');
            return;
        }

        if (database.tables.users.length === 0 || database.tables.products.length === 0) {
            addInfoMessage('错误: 没有数据可修改');
            return;
        }

        // 修改随机用户
        const userIndex = Math.floor(Math.random() * database.tables.users.length);
        const oldUserName = database.tables.users[userIndex].name;
        database.tables.users[userIndex].name = oldUserName + '(已修改)';

        // 修改随机产品
        const productIndex = Math.floor(Math.random() * database.tables.products.length);
        const oldProductPrice = database.tables.products[productIndex].price;
        database.tables.products[productIndex].price = Math.floor(oldProductPrice * (1 + Math.random() * 0.5));
        database.tables.products[productIndex].stock = Math.floor(database.tables.products[productIndex].stock * 0.9);

        // 更新数据库版本和时间
        database.version++;
        database.lastUpdate = new Date().toLocaleString();

        updateDatabaseView();
        addLogEntry('修改数据', `修改了用户 ID: ${database.tables.users[userIndex].id} 和产品 ID: ${database.tables.products[productIndex].id}`, 'operation');
        addTimelineItem('数据操作', '修改了用户和产品数据');
        addTimelineEvent('修改数据', 'operation', database.version, `修改了用户和产品数据`);
        addInfoMessage(`数据修改成功，数据库版本更新至 ${database.version}`);
    }

    // 模拟数据库崩溃
    function simulateCrash() {
        if (databaseStatus !== 'online') {
            addInfoMessage('数据库已经处于' + getStatusInChinese(databaseStatus) + '状态');
            return;
        }

        databaseStatus = 'crashed';
        updateDatabaseView();
        
        addLogEntry('系统崩溃', '数据库发生严重错误', 'crash');
        addTimelineItem('系统崩溃', '数据库意外崩溃，需要恢复');
        addTimelineEvent('系统崩溃', 'crash', database.version, `数据库意外崩溃`);
        addInfoMessage('数据库已崩溃！请使用备份进行恢复');
    }

    // 从完整备份恢复
    function restoreFromFullBackup() {
        if (backups.full.length === 0) {
            addInfoMessage('错误: 无完整备份可恢复');
            return;
        }

        databaseStatus = 'restoring';
        addInfoMessage('开始从最新完整备份恢复数据库...');
        
        // 获取最新的完整备份
        const latestFullBackup = backups.full[backups.full.length - 1];
        
        // 恢复数据库
        database.tables = JSON.parse(JSON.stringify(latestFullBackup.data.tables));
        database.version = latestFullBackup.data.version;
        database.lastUpdate = new Date().toLocaleString();
        
        databaseStatus = 'online';
        updateDatabaseView();
        
        addLogEntry('恢复操作', `从版本 ${latestFullBackup.version} 的完整备份恢复数据库`, 'restore');
        addTimelineItem('数据库恢复', `使用完整备份恢复到版本 ${latestFullBackup.version}`);
        addTimelineEvent('完整备份恢复', 'restore', database.version, `使用完整备份恢复到版本 ${latestFullBackup.version}`);
        addInfoMessage(`数据库已从完整备份成功恢复至版本 ${latestFullBackup.version}`);
    }

    // 使用差异备份恢复
    function restoreWithDifferentialBackup() {
        if (backups.full.length === 0) {
            addInfoMessage('错误: 无完整备份可恢复');
            return;
        }

        if (backups.differential.length === 0) {
            addInfoMessage('错误: 无差异备份可恢复，尝试使用仅完整备份恢复');
            restoreFromFullBackup();
            return;
        }

        databaseStatus = 'restoring';
        addInfoMessage('开始从完整备份和最新差异备份恢复数据库...');
        
        // 获取最新的完整备份
        const latestFullBackup = backups.full[backups.full.length - 1];
        
        // 获取基于该完整备份的最新差异备份
        const relevantDiffBackups = backups.differential.filter(backup => 
            backup.baseVersion === latestFullBackup.version
        );
        
        if (relevantDiffBackups.length === 0) {
            addInfoMessage('未找到基于最新完整备份的差异备份，仅使用完整备份恢复');
            restoreFromFullBackup();
            return;
        }
        
        const latestDiffBackup = relevantDiffBackups[relevantDiffBackups.length - 1];
        
        // 恢复数据库
        database.tables = JSON.parse(JSON.stringify(latestDiffBackup.data.tables));
        database.version = latestDiffBackup.data.version;
        database.lastUpdate = new Date().toLocaleString();
        
        databaseStatus = 'online';
        updateDatabaseView();
        
        addLogEntry('恢复操作', `使用完整备份(版本 ${latestFullBackup.version})和差异备份恢复到版本 ${latestDiffBackup.currentVersion}`, 'restore');
        addTimelineItem('数据库恢复', `使用完整备份和差异备份恢复到版本 ${latestDiffBackup.currentVersion}`);
        addTimelineEvent('差异备份恢复', 'restore', database.version, `使用完整备份和差异备份恢复到版本 ${latestDiffBackup.currentVersion}`);
        addInfoMessage(`数据库已从完整备份和差异备份成功恢复至版本 ${latestDiffBackup.currentVersion}`);
    }

    // 使用日志备份恢复
    function restoreWithLogs() {
        if (backups.full.length === 0) {
            addInfoMessage('错误: 无完整备份可恢复');
            return;
        }

        // 先从完整备份和差异备份恢复
        restoreWithDifferentialBackup();
        
        if (backups.logs.length === 0) {
            addInfoMessage('没有日志备份可应用');
            return;
        }
        
        databaseStatus = 'restoring';
        addInfoMessage('正在应用事务日志...');
        
        // 获取当前数据库版本之后的日志备份
        const currentVersion = database.version;
        const relevantLogBackups = backups.logs.filter(backup => 
            backup.fromVersion >= currentVersion
        );
        
        if (relevantLogBackups.length === 0) {
            addInfoMessage('没有适用的日志备份');
            databaseStatus = 'online';
            return;
        }
        
        // 模拟应用日志备份
        // 注意：在真实场景中，这涉及重放事务，但这里我们简化为直接设置最终状态
        
        // 假设我们能够重放日志到最新状态
        let logCount = 0;
        relevantLogBackups.forEach(logBackup => {
            logCount += logBackup.logs.length;
        });
        
        // 找到拥有最高版本号的日志备份
        const latestLogBackup = relevantLogBackups.reduce((latest, current) => 
            latest.toVersion > current.toVersion ? latest : current
        );
        
        // 更新版本号
        database.version = latestLogBackup.toVersion;
        database.lastUpdate = new Date().toLocaleString();
        
        databaseStatus = 'online';
        updateDatabaseView();
        
        addLogEntry('恢复操作', `应用了 ${logCount} 条事务日志，恢复到版本 ${database.version}`, 'restore');
        addTimelineItem('日志恢复', `应用事务日志将数据库恢复到版本 ${database.version}`);
        addTimelineEvent('日志恢复', 'restore', database.version, `应用了 ${logCount} 条事务日志，恢复到版本 ${database.version}`);
        addInfoMessage(`成功应用了 ${logCount} 条事务日志，数据库恢复到版本 ${database.version}`);
    }
}); 