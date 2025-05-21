/**
 * SQL SERVER数据库错误与调试工具
 * 主应用文件，处理用户交互和错误模拟
 */

document.addEventListener('DOMContentLoaded', function() {
    // 元素引用
    const errorScenarioSelect = document.getElementById('error-scenario');
    const sqlEditor = document.getElementById('sql-editor');
    const runQueryBtn = document.getElementById('run-query');
    const queryResults = document.getElementById('query-results');
    const errorMessages = document.getElementById('error-messages');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const debugContainer = document.getElementById('debug-container');
    const errorDiagnosis = document.getElementById('error-diagnosis');
    const solutionHints = document.getElementById('solution-hints');
    const learningResources = document.getElementById('learning-resources');
    const tableSelect = document.getElementById('table-select');
    const showTableBtn = document.getElementById('show-table');
    const tableDisplay = document.getElementById('table-display');
    
    // 创建数据库连接和错误调试器实例
    const dbConnection = new SQLServerSimulator.DBConnection();
    const errorDebugger = new SQLErrorSimulator.SQLErrorDebugger();
    
    // 默认连接数据库
    dbConnection.connect();
    
    // 初始化错误场景
    initErrorScenarios();
    
    // 设置事件监听器
    setupEventListeners();
    
    // 初始化错误场景下拉菜单
    function initErrorScenarios() {
        // 加载第一个错误场景
        const firstScenario = SQLErrorSimulator.getErrorScenario('syntax');
        if (firstScenario) {
            sqlEditor.value = firstScenario.query;
        }
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // 错误场景选择变化
        errorScenarioSelect.addEventListener('change', function() {
            const selectedScenario = SQLErrorSimulator.getErrorScenario(this.value);
            if (selectedScenario) {
                sqlEditor.value = selectedScenario.query;
                clearResults();
                hideDebugContainer();
            }
        });
        
        // 运行查询按钮
        runQueryBtn.addEventListener('click', function() {
            executeQuery();
        });
        
        // 显示表数据按钮
        showTableBtn.addEventListener('click', function() {
            showTableData();
        });
        
        // 标签页切换
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                
                // 更新活动标签按钮
                tabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // 更新活动标签内容
                tabPanes.forEach(pane => {
                    pane.classList.remove('active');
                    if (pane.id === tabName + '-tab') {
                        pane.classList.add('active');
                    }
                });
            });
        });
    }
    
    // 显示表数据
    function showTableData() {
        const selectedTable = tableSelect.value;
        if (!selectedTable) {
            tableDisplay.innerHTML = '<p class="empty-state">请选择一个表</p>';
            return;
        }
        
        const tableData = SQLServerSimulator.database[selectedTable];
        const tableSchema = SQLServerSimulator.tableSchema[selectedTable];
        
        if (!tableData || !tableSchema) {
            tableDisplay.innerHTML = '<p class="empty-state">无法获取表数据</p>';
            return;
        }
        
        // 创建表结构信息
        let schemaHtml = '<div class="table-info"><h3>表结构：' + selectedTable + '</h3><ul>';
        for (const column in tableSchema) {
            const colInfo = tableSchema[column];
            let colDesc = column + ' (' + colInfo.type + ')';
            
            if (colInfo.isPrimary) colDesc += ' - 主键';
            if (colInfo.isUnique) colDesc += ' - 唯一约束';
            if (!colInfo.nullable) colDesc += ' - 非空';
            if (colInfo.defaultValue) colDesc += ' - 默认值: ' + colInfo.defaultValue;
            if (colInfo.foreignKey) {
                colDesc += ' - 外键引用: ' + colInfo.foreignKey.table + '.' + colInfo.foreignKey.column;
            }
            
            schemaHtml += '<li>' + colDesc + '</li>';
        }
        schemaHtml += '</ul></div>';
        
        // 创建表数据
        let dataHtml = '<table><thead><tr>';
        const columns = Object.keys(tableSchema);
        
        // 表头
        columns.forEach(column => {
            dataHtml += `<th>${column}<br><span class="column-type">${tableSchema[column].type}</span></th>`;
        });
        
        dataHtml += '</tr></thead><tbody>';
        
        // 表数据
        tableData.forEach(row => {
            dataHtml += '<tr>';
            columns.forEach(column => {
                dataHtml += `<td>${row[column] !== undefined ? row[column] : ''}</td>`;
            });
            dataHtml += '</tr>';
        });
        
        dataHtml += '</tbody></table>';
        
        // 显示在页面上
        tableDisplay.innerHTML = schemaHtml + dataHtml;
    }
    
    // 执行查询
    function executeQuery() {
        clearResults();
        const query = sqlEditor.value.trim();
        
        if (!query) {
            showErrorMessage('请输入SQL查询');
            return;
        }
        
        const scenarioKey = errorScenarioSelect.value;
        const scenario = SQLErrorSimulator.getErrorScenario(scenarioKey);
        
        let queryOptions = {};
        
        // 如果是预设错误场景（非自定义），模拟错误
        if (scenarioKey !== 'custom') {
            queryOptions = {
                simulateError: true,
                errorType: scenario.errorType,
                errorMessage: scenario.errorMessage
            };
            
            // 如果是连接错误，先断开连接
            if (scenario.errorType === 'connection') {
                dbConnection.disconnect();
            } else if (!dbConnection.isConnected) {
                // 否则确保连接已建立
                dbConnection.connect();
            }
        } else {
            // 确保连接已建立
            if (!dbConnection.isConnected) {
                dbConnection.connect();
            }
        }
        
        // 执行查询
        const result = dbConnection.executeQuery(query, queryOptions);
        
        // 处理查询结果
        if (result.success) {
            if (result.results) {
                // 显示结果数据
                showQueryResults(result.results, result.resultColumns);
            } else if (result.affectedRows) {
                // 显示影响的行数
                showSuccessMessage(`查询执行成功，影响了 ${result.affectedRows} 行`);
            } else {
                // 显示一般成功消息
                showSuccessMessage(result.message || '查询执行成功');
            }
            
            // 自定义场景下，不显示调试助手
            hideDebugContainer();
        } else {
            // 显示错误消息
            showErrorMessage(result.error.message);
            
            // 分析错误并显示调试助手
            const errorAnalysis = errorDebugger.analyzeError(result.error, query);
            if (errorAnalysis) {
                showDebugContainer();
                
                // 根据场景显示诊断信息
                if (scenarioKey !== 'custom') {
                    // 使用预设场景的诊断信息
                    errorDiagnosis.innerHTML = `
                        <h4>${errorTypesExplanation[scenario.errorType].title}</h4>
                        <p>${scenario.diagnosis}</p>
                        <p>错误信息: ${scenario.errorMessage}</p>
                        <p>错误查询: <code>${scenario.query}</code></p>
                        <p>正确查询: <code>${scenario.correctQuery}</code></p>
                    `;
                } else {
                    // 使用自动诊断
                    errorDiagnosis.innerHTML = errorDebugger.getDiagnosis();
                }
                
                // 显示解决方案提示
                solutionHints.innerHTML = errorDebugger.getSolutionHints();
                
                // 显示学习资源
                learningResources.innerHTML = errorDebugger.getLearningResources();
            }
        }
    }
    
    // 显示查询结果
    function showQueryResults(results, columns) {
        if (!results || !results.length) {
            queryResults.innerHTML = '<p>查询返回0条结果</p>';
            return;
        }
        
        let tableHtml = '<table><thead><tr>';
        
        // 表头
        if (!columns) {
            columns = Object.keys(results[0]);
        }
        
        columns.forEach(column => {
            tableHtml += `<th>${column}</th>`;
        });
        
        tableHtml += '</tr></thead><tbody>';
        
        // 表内容
        results.forEach(row => {
            tableHtml += '<tr>';
            columns.forEach(column => {
                tableHtml += `<td>${row[column] !== undefined ? row[column] : ''}</td>`;
            });
            tableHtml += '</tr>';
        });
        
        tableHtml += '</tbody></table>';
        queryResults.innerHTML = tableHtml;
        
        // 切换到结果标签
        tabButtons[0].click();
    }
    
    // 显示错误消息
    function showErrorMessage(message) {
        const errorHtml = `<div class="error-message">${message}</div>`;
        errorMessages.innerHTML = errorHtml;
        
        // 切换到消息标签
        tabButtons[1].click();
    }
    
    // 显示成功消息
    function showSuccessMessage(message) {
        const successHtml = `<div class="success-message">${message}</div>`;
        errorMessages.innerHTML = successHtml;
        
        // 切换到消息标签
        tabButtons[1].click();
    }
    
    // 清除结果
    function clearResults() {
        queryResults.innerHTML = '<p class="empty-state">运行查询以查看结果</p>';
        errorMessages.innerHTML = '<p class="empty-state">运行查询以查看消息</p>';
    }
    
    // 显示调试助手容器
    function showDebugContainer() {
        debugContainer.classList.remove('hidden');
    }
    
    // 隐藏调试助手容器
    function hideDebugContainer() {
        debugContainer.classList.add('hidden');
    }
}); 