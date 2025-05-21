/**
 * SQL Server 数据库事务模拟器
 * 用于模拟数据库事务的ACID特性和不同隔离级别下的并发问题
 */

// 数据库模拟
const Database = {
    // 当前隔离级别
    isolationLevel: 'read-committed',
    
    // 账户表数据
    accounts: [
        { id: 1, username: '张三', balance: 1000 },
        { id: 2, username: '李四', balance: 2000 },
        { id: 3, username: '王五', balance: 3000 }
    ],
    
    // 交易记录表数据
    transactions: [],
    
    // 活动事务
    activeTransactions: {},
    
    // 锁管理
    locks: {
        shared: {}, // 共享锁 (读锁)
        exclusive: {} // 排它锁 (写锁)
    },
    
    // 当前演示类型
    currentDemo: null,
    animationInProgress: false,
    
    // 初始化函数
    init() {
        this.renderTables();
        this.bindEvents();
        this.updateIsolationProtection();
        this.setupAnimationArea();
    },
    
    // 渲染数据表
    renderTables() {
        // 渲染账户表
        const accountsTable = document.getElementById('accounts-table');
        // 清除表头以外的所有行
        accountsTable.innerHTML = `
            <div class="table-row">
                <div class="table-cell"><strong>账号ID</strong></div>
                <div class="table-cell"><strong>用户名</strong></div>
                <div class="table-cell"><strong>余额</strong></div>
            </div>
        `;
        
        // 添加账户数据行
        this.accounts.forEach(account => {
            const row = document.createElement('div');
            row.className = 'table-row';
            row.innerHTML = `
                <div class="table-cell">${account.id}</div>
                <div class="table-cell">${account.username}</div>
                <div class="table-cell">${account.balance}</div>
            `;
            accountsTable.appendChild(row);
        });
        
        // 渲染交易记录表
        const transactionsTable = document.getElementById('transactions-table');
        // 清除表头以外的所有行
        transactionsTable.innerHTML = `
            <div class="table-row">
                <div class="table-cell"><strong>交易ID</strong></div>
                <div class="table-cell"><strong>账号ID</strong></div>
                <div class="table-cell"><strong>金额</strong></div>
                <div class="table-cell"><strong>类型</strong></div>
                <div class="table-cell"><strong>状态</strong></div>
            </div>
        `;
        
        // 添加交易数据行
        this.transactions.forEach(tx => {
            const row = document.createElement('div');
            row.className = 'table-row';
            row.innerHTML = `
                <div class="table-cell">${tx.id}</div>
                <div class="table-cell">${tx.accountId}</div>
                <div class="table-cell">${tx.amount}</div>
                <div class="table-cell">${tx.type}</div>
                <div class="table-cell">${tx.status}</div>
            `;
            transactionsTable.appendChild(row);
        });
        
        // 更新数据库值显示
        if (this.accounts.length > 0) {
            document.getElementById('db-value').textContent = `账户1: ¥${this.accounts[0].balance}`;
        }
    },
    
    // 绑定事件
    bindEvents() {
        // 设置隔离级别
        document.getElementById('apply-isolation').addEventListener('click', () => {
            const level = document.getElementById('isolation-level').value;
            this.setIsolationLevel(level);
        });
        
        // 事务1按钮事件
        document.querySelectorAll('[data-tx="1"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.className.split(' ')[0];
                this.handleTransactionAction(1, action);
            });
        });
        
        // 事务2按钮事件
        document.querySelectorAll('[data-tx="2"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.className.split(' ')[0];
                this.handleTransactionAction(2, action);
            });
        });
        
        // 并发问题演示按钮
        document.getElementById('demo-dirty-read').addEventListener('click', () => {
            this.demoDirtyRead();
        });
        
        document.getElementById('demo-non-repeatable-read').addEventListener('click', () => {
            this.demoNonRepeatableRead();
        });
        
        document.getElementById('demo-phantom-read').addEventListener('click', () => {
            this.demoPhantomRead();
        });
        
        document.getElementById('demo-lost-update').addEventListener('click', () => {
            this.demoLostUpdate();
        });
        
        document.getElementById('reset-demo').addEventListener('click', () => {
            this.resetDemo();
        });
    },
    
    // 设置隔离级别
    setIsolationLevel(level) {
        this.isolationLevel = level;
        const logEntry = `系统: 已将隔离级别设置为 "${this.getIsolationLevelName(level)}"`;
        this.logToTransaction(1, logEntry);
        this.logToTransaction(2, logEntry);
        this.logToDemo(logEntry);
        
        // 更新隔离级别保护说明
        this.updateIsolationProtection();
    },
    
    // 获取隔离级别名称
    getIsolationLevelName(level) {
        const names = {
            'read-uncommitted': '读未提交 (Read Uncommitted)',
            'read-committed': '读已提交 (Read Committed)',
            'repeatable-read': '可重复读 (Repeatable Read)',
            'serializable': '串行化 (Serializable)'
        };
        return names[level] || level;
    },
    
    // 更新隔离级别保护信息
    updateIsolationProtection() {
        const protectionEl = document.getElementById('isolation-protection');
        let protectionText = '';
        
        switch(this.isolationLevel) {
            case 'read-uncommitted':
                protectionText = '❌ 不防止脏读 | ❌ 不防止不可重复读 | ❌ 不防止幻读';
                break;
            case 'read-committed':
                protectionText = '✅ 防止脏读 | ❌ 不防止不可重复读 | ❌ 不防止幻读';
                break;
            case 'repeatable-read':
                protectionText = '✅ 防止脏读 | ✅ 防止不可重复读 | ❌ 不防止幻读';
                break;
            case 'serializable':
                protectionText = '✅ 防止脏读 | ✅ 防止不可重复读 | ✅ 防止幻读';
                break;
        }
        
        protectionEl.innerHTML = protectionText;
    },
    
    // 设置动画区域
    setupAnimationArea() {
        // 创建步骤指示器
        const stepIndicator = document.getElementById('step-indicator');
        stepIndicator.innerHTML = '';
    },
    
    // 更新事务状态显示
    updateTransactionState(txId) {
        const tx = this.activeTransactions[txId];
        const statusText = document.getElementById(`tx${txId}-status-text`);
        const statusBadge = document.getElementById(`tx${txId}-status-badge`);
        const readData = document.getElementById(`tx${txId}-read-data`);
        const writeData = document.getElementById(`tx${txId}-write-data`);
        
        if (!tx) {
            // 事务不存在或已结束
            statusText.textContent = '未开始';
            statusBadge.textContent = '未开始';
            statusBadge.className = 'tx-status status-none';
            readData.textContent = '无';
            writeData.textContent = '无';
            return;
        }
        
        // 更新状态
        statusText.textContent = tx.status === 'active' ? '活动' : tx.status;
        statusBadge.textContent = tx.status === 'active' ? '活动' : tx.status;
        
        // 更新状态样式
        if (tx.status === 'active') {
            statusBadge.className = 'tx-status status-active';
        } else if (tx.status === 'committed') {
            statusBadge.className = 'tx-status status-committed';
        } else if (tx.status === 'rolledback') {
            statusBadge.className = 'tx-status status-rolledback';
        } else {
            statusBadge.className = 'tx-status status-none';
        }
        
        // 更新读取数据
        if (tx.readValues[1]) {
            readData.textContent = `账户1: ¥${tx.readValues[1].balance}`;
        } else {
            readData.textContent = '无';
        }
        
        // 更新写入数据
        if (tx.writeValues[1]) {
            writeData.textContent = `账户1: ¥${tx.writeValues[1].balance}`;
        } else {
            writeData.textContent = '无';
        }
    },
    
    // 更新操作提示
    updateOperationHint(message) {
        const hintEl = document.getElementById('operation-hint');
        hintEl.textContent = message;
    },
    
    // 处理事务操作
    handleTransactionAction(txId, action) {
        switch(action) {
            case 'start-tx':
                this.startTransaction(txId);
                break;
            case 'read-account':
                this.readAccount(txId);
                break;
            case 'update-account':
                this.updateAccount(txId);
                break;
            case 'commit-tx':
                this.commitTransaction(txId);
                break;
            case 'rollback-tx':
                this.rollbackTransaction(txId);
                break;
        }
    },
    
    // 开始事务
    startTransaction(txId) {
        // 创建事务对象
        this.activeTransactions[txId] = {
            id: txId,
            startTime: new Date(),
            status: 'active',
            operations: [],
            readValues: {},
            writeValues: {}
        };
        
        // 启用相关按钮
        this.enableTransactionButtons(txId, true);
        
        // 记录日志
        this.logToTransaction(txId, `事务${txId}已开始`);
        
        // 更新状态显示
        this.updateTransactionState(txId);
        
        // 更新操作提示
        this.updateOperationHint(`事务${txId}已开始，您可以执行读取或更新操作`);
        
        // 如果在演示模式，显示合适的提示
        if (this.currentDemo) {
            this.showDemoStepHint(`事务${txId}已开始`);
        }
        
        // 动画：突出显示事务块
        this.animateTransaction(txId, 'start');
    },
    
    // 读取账户
    readAccount(txId) {
        const tx = this.activeTransactions[txId];
        if (!tx) return;
        
        // 选择账户ID (简化为始终读取账户1)
        const accountId = 1;
        let canRead = true;
        let account = null;
        
        // 动画：显示读取操作
        this.animateTransaction(txId, 'read');
        
        // 根据隔离级别检查是否可以读取
        switch(this.isolationLevel) {
            case 'read-uncommitted':
                // 读未提交: 可以读取其他事务未提交的数据
                // 检查其他事务的写入值
                for (const otherTxId in this.activeTransactions) {
                    if (otherTxId != txId) {
                        const otherTx = this.activeTransactions[otherTxId];
                        if (otherTx.writeValues[accountId]) {
                            // 使用其他事务的未提交写入值
                            account = {...otherTx.writeValues[accountId]};
                            const message = `事务${txId}读取了账户${accountId}(来自事务${otherTxId}的未提交数据): 余额=${account.balance}`;
                            this.logToTransaction(txId, message);
                            
                            // 突出显示脏读问题
                            if (this.currentDemo === 'dirty-read') {
                                this.showDemoStepHint(`脏读发生：事务${txId}读取了事务${otherTxId}未提交的数据`);
                            }
                            
                            tx.readValues[accountId] = account;
                            this.updateTransactionState(txId);
                            this.updateOperationHint(`事务${txId}读取了账户${accountId}的数据（可能是脏数据）`);
                            return;
                        }
                    }
                }
                // 没有其他事务的写入，读取数据库值
                account = this.accounts.find(a => a.id === accountId);
                break;
                
            case 'read-committed':
                // 读已提交: 只能读取已提交的数据
                // 检查是否有排它锁
                if (this.locks.exclusive[accountId] && this.locks.exclusive[accountId] !== txId) {
                    canRead = false;
                    const message = `事务${txId}无法读取账户${accountId}: 该账户被事务${this.locks.exclusive[accountId]}锁定`;
                    this.logToTransaction(txId, message);
                    this.updateOperationHint(message);
                } else {
                    account = this.accounts.find(a => a.id === accountId);
                }
                break;
                
            case 'repeatable-read':
            case 'serializable':
                // 可重复读/串行化: 加共享锁，并且要检查是否已有排它锁
                if (this.locks.exclusive[accountId] && this.locks.exclusive[accountId] !== txId) {
                    canRead = false;
                    const message = `事务${txId}无法读取账户${accountId}: 该账户被事务${this.locks.exclusive[accountId]}锁定`;
                    this.logToTransaction(txId, message);
                    this.updateOperationHint(message);
                } else {
                    // 加共享锁
                    if (!this.locks.shared[accountId]) {
                        this.locks.shared[accountId] = [];
                    }
                    if (!this.locks.shared[accountId].includes(txId)) {
                        this.locks.shared[accountId].push(txId);
                    }
                    
                    // 如果事务已经读取过该账户，返回缓存的值以确保可重复读
                    if (tx.readValues[accountId]) {
                        account = tx.readValues[accountId];
                        const message = `事务${txId}读取了账户${accountId}(缓存数据): 余额=${account.balance}`;
                        this.logToTransaction(txId, message);
                        
                        // 突出显示可重复读
                        if (this.currentDemo === 'non-repeatable-read') {
                            this.showDemoStepHint(`可重复读：事务${txId}第二次读取与第一次结果相同，因为使用了缓存数据`);
                        }
                        
                        this.updateOperationHint(`事务${txId}读取了账户${accountId}的缓存数据`);
                        return;
                    } else {
                        account = this.accounts.find(a => a.id === accountId);
                    }
                }
                break;
        }
        
        if (canRead && account) {
            // 记录读取的值
            tx.readValues[accountId] = {...account};
            const message = `事务${txId}读取了账户${accountId}: 余额=${account.balance}`;
            this.logToTransaction(txId, message);
            this.updateOperationHint(message);
            
            // 更新状态显示
            this.updateTransactionState(txId);
            
            // 检查是否是不可重复读的第二次读取
            if (this.currentDemo === 'non-repeatable-read' && txId === 1 && 
                tx.operations.filter(op => op.type === 'read').length > 0) {
                this.showDemoStepHint(`不可重复读发生：事务1第二次读取结果与第一次不同`);
            }
            
            // 添加读取操作记录
            tx.operations.push({
                type: 'read',
                accountId: accountId,
                value: account.balance,
                timestamp: new Date()
            });
        }
    },
    
    // 更新账户
    updateAccount(txId) {
        const tx = this.activeTransactions[txId];
        if (!tx) return;
        
        // 选择账户ID (简化为始终更新账户1)
        const accountId = 1;
        let canUpdate = true;
        
        // 动画：显示更新操作
        this.animateTransaction(txId, 'update');
        
        // 先检查是否可以获取排它锁
        if (this.locks.exclusive[accountId] && this.locks.exclusive[accountId] !== txId) {
            canUpdate = false;
            const message = `事务${txId}无法更新账户${accountId}: 该账户被事务${this.locks.exclusive[accountId]}锁定`;
            this.logToTransaction(txId, message);
            this.updateOperationHint(message);
        } else if (this.locks.shared[accountId] && this.locks.shared[accountId].some(id => id !== txId)) {
            // 其他事务持有共享锁
            if (this.isolationLevel === 'serializable' || this.isolationLevel === 'repeatable-read') {
                canUpdate = false;
                const message = `事务${txId}无法更新账户${accountId}: 该账户被其他事务共享锁定`;
                this.logToTransaction(txId, message);
                this.updateOperationHint(message);
            }
        }
        
        if (canUpdate) {
            // 设置排它锁
            this.locks.exclusive[accountId] = txId;
            
            // 获取当前余额
            let currentBalance = 0;
            
            // 如果事务已经读取过该账户，使用读取的值
            if (tx.readValues[accountId]) {
                currentBalance = tx.readValues[accountId].balance;
            } else {
                // 否则读取数据库值
                const account = this.accounts.find(a => a.id === accountId);
                if (account) {
                    currentBalance = account.balance;
                }
            }
            
            // 更新值 (简化为增加100)
            const newBalance = currentBalance + 100;
            
            // 存储更新后的值
            tx.writeValues[accountId] = {
                id: accountId,
                username: tx.readValues[accountId]?.username || this.accounts.find(a => a.id === accountId).username,
                balance: newBalance
            };
            
            // 记录更新操作
            tx.operations.push({
                type: 'update',
                accountId: accountId,
                oldValue: currentBalance,
                newValue: newBalance,
                timestamp: new Date()
            });
            
            const message = `事务${txId}更新了账户${accountId}: 余额从${currentBalance}增加到${newBalance}`;
            this.logToTransaction(txId, message);
            this.updateOperationHint(message);
            
            // 更新状态显示
            this.updateTransactionState(txId);
            
            // 检查是否是丢失更新场景的第二次更新
            if (this.currentDemo === 'lost-update' && txId === 2) {
                this.showDemoStepHint(`丢失更新即将发生：事务2的更新将覆盖事务1的更新`);
            }
        }
    },
    
    // 提交事务
    commitTransaction(txId) {
        const tx = this.activeTransactions[txId];
        if (!tx) return;
        
        // 动画：显示提交操作
        this.animateTransaction(txId, 'commit');
        
        // 应用所有写入操作到数据库
        for (const accountId in tx.writeValues) {
            const accountIndex = this.accounts.findIndex(a => a.id === parseInt(accountId));
            if (accountIndex !== -1) {
                this.accounts[accountIndex] = {...tx.writeValues[accountId]};
            }
            
            // 添加交易记录
            this.transactions.push({
                id: this.transactions.length + 1,
                accountId: parseInt(accountId),
                amount: 100, // 简化为固定金额
                type: '转账',
                status: '已完成'
            });
        }
        
        // 释放锁
        this.releaseLocks(txId);
        
        // 更新事务状态
        tx.status = 'committed';
        
        // 记录日志
        const message = `事务${txId}已提交`;
        this.logToTransaction(txId, message);
        this.updateOperationHint(message);
        
        // 更新状态显示
        this.updateTransactionState(txId);
        
        // 禁用事务按钮
        this.enableTransactionButtons(txId, false);
        
        // 检查演示场景
        if (this.currentDemo) {
            if (this.currentDemo === 'lost-update' && txId === 2) {
                this.showDemoStepHint(`丢失更新发生：事务2提交覆盖了事务1的更新`);
            } else if (this.currentDemo === 'non-repeatable-read' && txId === 2) {
                this.showDemoStepHint(`事务2提交了更新，导致事务1可能会读取到不同的数据`);
            }
        }
        
        // 移除活动事务
        setTimeout(() => {
            delete this.activeTransactions[txId];
            this.updateTransactionState(txId); // 更新为未开始状态
        }, 1000);
        
        // 更新表格显示
        this.renderTables();
    },
    
    // 回滚事务
    rollbackTransaction(txId) {
        const tx = this.activeTransactions[txId];
        if (!tx) return;
        
        // 动画：显示回滚操作
        this.animateTransaction(txId, 'rollback');
        
        // 释放锁
        this.releaseLocks(txId);
        
        // 更新事务状态
        tx.status = 'rolledback';
        
        // 记录日志
        const message = `事务${txId}已回滚`;
        this.logToTransaction(txId, message);
        this.updateOperationHint(message);
        
        // 更新状态显示
        this.updateTransactionState(txId);
        
        // 禁用事务按钮
        this.enableTransactionButtons(txId, false);
        
        // 检查演示场景
        if (this.currentDemo === 'dirty-read' && txId === 1) {
            this.showDemoStepHint(`事务1回滚：事务2读取的数据实际上是无效的`);
        }
        
        // 移除活动事务
        setTimeout(() => {
            delete this.activeTransactions[txId];
            this.updateTransactionState(txId); // 更新为未开始状态
        }, 1000);
    },
    
    // 释放事务持有的所有锁
    releaseLocks(txId) {
        // 释放排它锁
        for (const accountId in this.locks.exclusive) {
            if (this.locks.exclusive[accountId] === txId) {
                delete this.locks.exclusive[accountId];
            }
        }
        
        // 释放共享锁
        for (const accountId in this.locks.shared) {
            this.locks.shared[accountId] = this.locks.shared[accountId].filter(id => id !== txId);
            if (this.locks.shared[accountId].length === 0) {
                delete this.locks.shared[accountId];
            }
        }
    },
    
    // 启用/禁用事务按钮
    enableTransactionButtons(txId, enable) {
        const startBtn = document.querySelector(`.start-tx[data-tx="${txId}"]`);
        const readBtn = document.querySelector(`.read-account[data-tx="${txId}"]`);
        const updateBtn = document.querySelector(`.update-account[data-tx="${txId}"]`);
        const commitBtn = document.querySelector(`.commit-tx[data-tx="${txId}"]`);
        const rollbackBtn = document.querySelector(`.rollback-tx[data-tx="${txId}"]`);
        
        startBtn.disabled = enable;
        readBtn.disabled = !enable;
        updateBtn.disabled = !enable;
        commitBtn.disabled = !enable;
        rollbackBtn.disabled = !enable;
    },
    
    // 记录日志到事务日志
    logToTransaction(txId, message) {
        const logDiv = document.getElementById(`tx${txId}-log`);
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        logDiv.appendChild(logEntry);
        logDiv.scrollTop = logDiv.scrollHeight;
    },
    
    // 记录日志到演示日志
    logToDemo(message) {
        const logDiv = document.getElementById('demo-log');
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        logDiv.appendChild(logEntry);
        logDiv.scrollTop = logDiv.scrollHeight;
    },
    
    // 显示演示步骤提示
    showDemoStepHint(message) {
        this.updateOperationHint(message);
        
        // 显示工具提示
        const tooltip = document.getElementById('animation-tooltip');
        tooltip.style.display = 'block';
        tooltip.textContent = message;
        
        // 设置位置
        const animationArea = document.getElementById('animation-area');
        tooltip.style.top = '10px';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translateX(-50%)';
        
        // 3秒后隐藏
        setTimeout(() => {
            tooltip.style.display = 'none';
        }, 3000);
    },
    
    // 执行事务动画
    animateTransaction(txId, action) {
        if (this.animationInProgress) return;
        this.animationInProgress = true;
        
        const txBlock = document.getElementById(`tx${txId}-block`);
        const dbBlock = document.getElementById('db-block');
        const arrow = document.getElementById(`tx${txId}-arrow`);
        
        // 计算位置
        const txRect = txBlock.getBoundingClientRect();
        const dbRect = dbBlock.getBoundingClientRect();
        const areaRect = document.getElementById('animation-area').getBoundingClientRect();
        
        // 调整相对于动画区域的位置
        const startX = txRect.left - areaRect.left + txRect.width;
        const startY = txRect.top - areaRect.top + txRect.height / 2;
        const endX = dbRect.left - areaRect.left;
        const endY = dbRect.top - areaRect.top + dbRect.height / 2;
        
        // 计算箭头长度和角度
        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
        
        // 设置箭头样式
        arrow.style.width = `${length}px`;
        arrow.style.left = `${startX}px`;
        arrow.style.top = `${startY}px`;
        arrow.style.transform = `rotate(${angle}deg)`;
        
        // 设置箭头颜色
        let arrowColor = '#0078d4';
        if (action === 'read') arrowColor = '#5cb85c';
        if (action === 'update') arrowColor = '#f0ad4e';
        if (action === 'commit') arrowColor = '#5cb85c';
        if (action === 'rollback') arrowColor = '#d9534f';
        
        arrow.style.backgroundColor = arrowColor;
        arrow.style.display = 'block';
        
        // 高亮事务块
        txBlock.style.boxShadow = `0 0 10px ${arrowColor}`;
        
        // 显示操作说明
        let actionText = '';
        switch(action) {
            case 'start': actionText = '开始事务'; break;
            case 'read': actionText = '读取数据'; break;
            case 'update': actionText = '更新数据'; break;
            case 'commit': actionText = '提交事务'; break;
            case 'rollback': actionText = '回滚事务'; break;
        }
        
        const tooltip = document.getElementById('animation-tooltip');
        tooltip.textContent = `事务${txId}: ${actionText}`;
        tooltip.style.display = 'block';
        
        // 计算提示位置
        tooltip.style.top = `${startY - 30}px`;
        tooltip.style.left = `${startX + length/2}px`;
        tooltip.style.transform = 'translateX(-50%)';
        
        // 1秒后恢复
        setTimeout(() => {
            arrow.style.display = 'none';
            txBlock.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            tooltip.style.display = 'none';
            this.animationInProgress = false;
        }, 1000);
    },
    
    // 设置演示问题说明
    setDemoProblemExplanation(demoType) {
        const demoExplanation = document.getElementById('demo-explanation');
        const demoTypeEl = document.getElementById('demo-type');
        const demoDescEl = document.getElementById('demo-description');
        const demoSolutionEl = document.getElementById('demo-solution');
        
        demoExplanation.style.display = 'block';
        
        switch(demoType) {
            case 'dirty-read':
                demoTypeEl.textContent = '脏读 (Dirty Read)';
                demoDescEl.textContent = '当一个事务读取了另一个事务未提交的数据，如果该事务回滚，则读取的数据无效。';
                demoSolutionEl.textContent = '使用"读已提交"或更高的隔离级别来防止脏读。';
                break;
                
            case 'non-repeatable-read':
                demoTypeEl.textContent = '不可重复读 (Non-repeatable Read)';
                demoDescEl.textContent = '当一个事务多次读取同一数据，但在这期间另一个事务修改了数据并提交，导致第一个事务两次读取的结果不一致。';
                demoSolutionEl.textContent = '使用"可重复读"或更高的隔离级别来防止不可重复读。';
                break;
                
            case 'phantom-read':
                demoTypeEl.textContent = '幻读 (Phantom Read)';
                demoDescEl.textContent = '当一个事务第一次查询得到一些数据，但第二次同样的查询得到了不同的结果集（有新增或删除的行）。';
                demoSolutionEl.textContent = '使用"串行化"隔离级别来防止幻读。';
                break;
                
            case 'lost-update':
                demoTypeEl.textContent = '丢失更新 (Lost Update)';
                demoDescEl.textContent = '当两个事务同时读取然后更新相同的数据，后提交的事务会覆盖先提交事务的更新。';
                demoSolutionEl.textContent = '使用悲观锁（SELECT FOR UPDATE）或乐观锁（版本控制）来防止丢失更新。';
                break;
                
            default:
                demoExplanation.style.display = 'none';
        }
    },
    
    // 脏读演示
    async demoDirtyRead() {
        // 防止同时运行多个演示
        if (this.animationInProgress) return;
        
        // 清空日志
        document.getElementById('demo-log').innerHTML = '';
        
        // 重置数据库
        this.resetDemo();
        
        // 设置当前演示类型
        this.currentDemo = 'dirty-read';
        
        // 设置演示问题说明
        this.setDemoProblemExplanation('dirty-read');
        
        // 设置为读未提交隔离级别
        this.setIsolationLevel('read-uncommitted');
        
        this.logToDemo('脏读演示开始...');
        this.logToDemo('将展示在"读未提交"隔离级别下，事务2读取了事务1未提交的数据，然后事务1回滚的情况');
        
        this.updateOperationHint('脏读演示：在读未提交隔离级别下，事务可以读取未提交的数据');
        
        await this.sleep(1000);
        
        // 开始事务1
        this.startTransaction(1);
        this.logToDemo('事务1开始');
        
        await this.sleep(1000);
        
        // 事务1更新账户
        this.updateAccount(1);
        this.logToDemo('事务1更新账户1余额，但尚未提交');
        
        await this.sleep(1000);
        
        // 开始事务2
        this.startTransaction(2);
        this.logToDemo('事务2开始');
        
        await this.sleep(1000);
        
        // 事务2读取账户（将会读取到事务1未提交的数据）
        this.readAccount(2);
        this.logToDemo('事务2读取账户1，读到了事务1未提交的数据 (脏读)');
        
        await this.sleep(1000);
        
        // 事务1回滚
        this.rollbackTransaction(1);
        this.logToDemo('事务1回滚，事务2读取的数据无效');
        
        await this.sleep(1000);
        
        // 结束事务2
        this.commitTransaction(2);
        this.logToDemo('事务2已提交，但它基于无效数据做出的决策也是无效的');
        
        this.logToDemo('脏读演示结束：在读未提交隔离级别下，事务2读取了事务1未提交的数据，导致了脏读问题');
        this.updateOperationHint('脏读演示结束：在"读已提交"或更高的隔离级别下可以防止脏读');
        
        // 清除当前演示
        this.currentDemo = null;
    },
    
    // 不可重复读演示
    async demoNonRepeatableRead() {
        // 防止同时运行多个演示
        if (this.animationInProgress) return;
        
        // 清空日志
        document.getElementById('demo-log').innerHTML = '';
        
        // 重置数据库
        this.resetDemo();
        
        // 设置当前演示类型
        this.currentDemo = 'non-repeatable-read';
        
        // 设置演示问题说明
        this.setDemoProblemExplanation('non-repeatable-read');
        
        // 设置为读已提交隔离级别
        this.setIsolationLevel('read-committed');
        
        this.logToDemo('不可重复读演示开始...');
        this.logToDemo('将展示在"读已提交"隔离级别下，事务1两次读取同一数据得到不同结果的情况');
        
        this.updateOperationHint('不可重复读演示：在读已提交隔离级别下，事务可能读取到其他事务已提交的修改');
        
        await this.sleep(1000);
        
        // 开始事务1
        this.startTransaction(1);
        this.logToDemo('事务1开始');
        
        await this.sleep(1000);
        
        // 事务1第一次读取账户
        this.readAccount(1);
        this.logToDemo('事务1第一次读取账户1');
        
        await this.sleep(1000);
        
        // 开始事务2
        this.startTransaction(2);
        this.logToDemo('事务2开始');
        
        await this.sleep(1000);
        
        // 事务2更新账户
        this.updateAccount(2);
        this.logToDemo('事务2更新账户1');
        
        await this.sleep(1000);
        
        // 事务2提交
        this.commitTransaction(2);
        this.logToDemo('事务2提交');
        
        await this.sleep(1000);
        
        // 事务1再次读取账户（将会读取到不同的值）
        this.readAccount(1);
        this.logToDemo('事务1第二次读取账户1，得到与第一次不同的结果 (不可重复读)');
        
        await this.sleep(1000);
        
        // 结束事务1
        this.commitTransaction(1);
        this.logToDemo('事务1已提交');
        
        this.logToDemo('不可重复读演示结束：在读已提交隔离级别下，事务1两次读取同一数据得到不同结果，导致了不可重复读问题');
        this.updateOperationHint('不可重复读演示结束：在"可重复读"或更高的隔离级别下可以防止不可重复读');
        
        // 清除当前演示
        this.currentDemo = null;
    },
    
    // 幻读演示
    async demoPhantomRead() {
        // 防止同时运行多个演示
        if (this.animationInProgress) return;
        
        // 清空日志
        document.getElementById('demo-log').innerHTML = '';
        
        // 重置数据库
        this.resetDemo();
        
        // 设置当前演示类型
        this.currentDemo = 'phantom-read';
        
        // 设置演示问题说明
        this.setDemoProblemExplanation('phantom-read');
        
        // 设置为可重复读隔离级别
        this.setIsolationLevel('repeatable-read');
        
        this.logToDemo('幻读演示开始...');
        this.logToDemo('将展示在"可重复读"隔离级别下，事务1两次查询得到不同行集的情况');
        
        this.updateOperationHint('幻读演示：在可重复读隔离级别下，虽然数据行不会变，但可能出现新行或丢失行');
        
        await this.sleep(1000);
        
        // 开始事务1
        this.startTransaction(1);
        this.logToDemo('事务1开始');
        
        await this.sleep(1000);
        
        // 事务1第一次读取所有账户
        this.logToDemo(`事务1第一次查询所有账户，共${this.accounts.length}个账户`);
        
        await this.sleep(1000);
        
        // 开始事务2
        this.startTransaction(2);
        this.logToDemo('事务2开始');
        
        await this.sleep(1000);
        
        // 事务2插入新账户
        this.accounts.push({ id: this.accounts.length + 1, username: '新用户', balance: 500 });
        this.logToDemo('事务2插入了新账户');
        this.showDemoStepHint('事务2插入了新的账户记录');
        
        await this.sleep(1000);
        
        // 事务2提交
        this.commitTransaction(2);
        this.logToDemo('事务2提交');
        
        await this.sleep(1000);
        
        // 事务1再次读取所有账户（在可重复读级别下应该返回相同结果，但在实际SQL中会出现幻读）
        this.logToDemo(`事务1第二次查询所有账户，现在共${this.accounts.length}个账户 (幻读)`);
        this.logToDemo('注意：在真实SQL可重复读隔离级别中，COUNT(*)查询也会产生幻读，但本模拟器简化了这一点');
        this.showDemoStepHint('幻读发生：事务1看到了不在其第一次查询结果中的新行');
        
        await this.sleep(1000);
        
        // 结束事务1
        this.commitTransaction(1);
        this.logToDemo('事务1已提交');
        
        this.logToDemo('幻读演示结束：在可重复读隔离级别下，事务1两次查询得到不同的行集，导致了幻读问题');
        this.updateOperationHint('幻读演示结束：在"串行化"隔离级别下可以防止幻读');
        
        // 清除当前演示
        this.currentDemo = null;
    },
    
    // 丢失更新演示
    async demoLostUpdate() {
        // 防止同时运行多个演示
        if (this.animationInProgress) return;
        
        // 清空日志
        document.getElementById('demo-log').innerHTML = '';
        
        // 重置数据库
        this.resetDemo();
        
        // 设置当前演示类型
        this.currentDemo = 'lost-update';
        
        // 设置演示问题说明
        this.setDemoProblemExplanation('lost-update');
        
        // 设置为读已提交隔离级别
        this.setIsolationLevel('read-committed');
        
        this.logToDemo('丢失更新演示开始...');
        this.logToDemo('将展示两个事务同时更新同一数据，导致先提交事务的更新被覆盖的情况');
        
        this.updateOperationHint('丢失更新演示：当两个事务同时更新同一数据时，后提交的事务会覆盖先提交的事务的修改');
        
        await this.sleep(1000);
        
        // 开始事务1
        this.startTransaction(1);
        this.logToDemo('事务1开始');
        
        await this.sleep(1000);
        
        // 事务1读取账户
        this.readAccount(1);
        this.logToDemo('事务1读取账户1');
        
        await this.sleep(1000);
        
        // 开始事务2
        this.startTransaction(2);
        this.logToDemo('事务2开始');
        
        await this.sleep(1000);
        
        // 事务2读取账户
        this.readAccount(2);
        this.logToDemo('事务2读取账户1');
        
        await this.sleep(1000);
        
        // 事务1更新账户
        this.updateAccount(1);
        this.logToDemo('事务1更新账户1');
        
        await this.sleep(1000);
        
        // 事务1提交
        this.commitTransaction(1);
        this.logToDemo('事务1提交');
        
        await this.sleep(1000);
        
        // 事务2更新账户（基于原始值，忽略了事务1的更新）
        this.updateAccount(2);
        this.logToDemo('事务2更新账户1 (基于原始值，覆盖了事务1的更新)');
        
        await this.sleep(1000);
        
        // 事务2提交
        this.commitTransaction(2);
        this.logToDemo('事务2提交，导致事务1的更新被丢失');
        
        this.logToDemo('丢失更新演示结束：事务2的更新覆盖了事务1的更新，导致了丢失更新问题');
        this.updateOperationHint('丢失更新演示结束：使用悲观锁或乐观锁可以防止丢失更新问题');
        
        // 清除当前演示
        this.currentDemo = null;
    },
    
    // 重置演示
    resetDemo() {
        // 重置账户数据
        this.accounts = [
            { id: 1, username: '张三', balance: 1000 },
            { id: 2, username: '李四', balance: 2000 },
            { id: 3, username: '王五', balance: 3000 }
        ];
        
        // 清空交易记录
        this.transactions = [];
        
        // 清空活动事务
        this.activeTransactions = {};
        
        // 清空锁
        this.locks = {
            shared: {},
            exclusive: {}
        };
        
        // 禁用所有事务按钮
        this.enableTransactionButtons(1, false);
        this.enableTransactionButtons(2, false);
        
        // 启用开始事务按钮
        document.querySelector('.start-tx[data-tx="1"]').disabled = false;
        document.querySelector('.start-tx[data-tx="2"]').disabled = false;
        
        // 清空事务日志
        document.getElementById('tx1-log').innerHTML = '';
        document.getElementById('tx2-log').innerHTML = '';
        
        // 更新表格显示
        this.renderTables();
        
        // 记录日志
        this.logToDemo('系统已重置');
        
        // 重置状态显示
        this.updateTransactionState(1);
        this.updateTransactionState(2);
        
        // 隐藏演示问题说明
        document.getElementById('demo-explanation').style.display = 'none';
        
        // 重置操作提示
        this.updateOperationHint('系统已重置，您可以选择隔离级别并开始新的事务');
        
        // 清除当前演示
        this.currentDemo = null;
    },
    
    // 辅助函数：延迟执行
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    Database.init();
}); 