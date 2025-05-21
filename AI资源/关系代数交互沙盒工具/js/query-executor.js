// 查询执行器相关功能

// 执行查询并显示结果
function executeQuery() {
    const queryArea = document.getElementById('query-area');
    const queryItems = queryArea.querySelectorAll('.query-item');
    
    if (queryItems.length === 0) {
        clearResults();
        return;
    }
    
    try {
        // 构建查询对象
        const queryTree = buildQueryTree(queryItems);
        
        // 执行查询
        const result = executeQueryTree(queryTree);
        
        // 显示结果
        displayResult(result);
    } catch (error) {
        showError(`查询执行错误: ${error.message}`);
    }
}

// 执行查询树并返回结果
function executeQueryTree(queryTree) {
    // 递归执行查询树
    function execute(node) {
        if (!node) return [];
        
        switch (node.type) {
            case 'base':
                if (node.tables.length === 0) return [];
                // 如果只有一个表，直接返回该表的数据
                if (node.tables.length === 1) {
                    const tableName = node.tables[0];
                    return [...window.dbData.tables[tableName]];
                }
                // 如果有多个表，执行笛卡尔积
                return cartesianProduct(node.tables.map(tableName => window.dbData.tables[tableName]));
                
            case 'select':
                const data = execute(node.child);
                // 解析条件并过滤
                return data.filter(row => evaluateCondition(row, node.condition));
                
            case 'project':
                const sourceData = execute(node.child);
                // 执行投影操作
                return projectFields(sourceData, node.fields);
                
            case 'join':
                // 简化实现，仅处理两个表的等值连接
                const leftTable = window.dbData.tables[node.leftTable];
                const rightTable = window.dbData.tables[node.rightTable];
                
                return leftTable.flatMap(leftRow => {
                    return rightTable
                        .filter(rightRow => leftRow[node.leftField] === rightRow[node.rightField])
                        .map(rightRow => {
                            // 合并两行数据
                            const result = {};
                            // 添加左表字段
                            for (const key in leftRow) {
                                result[`${node.leftTable}.${key}`] = leftRow[key];
                            }
                            // 添加右表字段
                            for (const key in rightRow) {
                                result[`${node.rightTable}.${key}`] = rightRow[key];
                            }
                            return result;
                        });
                });
                
            case 'union':
                const leftResult = execute(node.left);
                const rightResult = execute(node.right);
                // 简化实现，假设两个结果集有相同的结构
                return [...leftResult, ...rightResult];
                
            case 'intersection':
                const leftSet = execute(node.left);
                const rightSet = execute(node.right);
                // 简化实现，通过JSON字符串比较对象
                return leftSet.filter(leftItem => 
                    rightSet.some(rightItem => 
                        JSON.stringify(leftItem) === JSON.stringify(rightItem)
                    )
                );
                
            case 'difference':
                const minuendSet = execute(node.left);
                const subtrahendSet = execute(node.right);
                // 简化实现，通过JSON字符串比较对象
                return minuendSet.filter(leftItem => 
                    !subtrahendSet.some(rightItem => 
                        JSON.stringify(leftItem) === JSON.stringify(rightItem)
                    )
                );
                
            default:
                return [];
        }
    }
    
    return execute(queryTree);
}

// 生成表的笛卡尔积
function cartesianProduct(tables) {
    if (tables.length === 0) return [];
    if (tables.length === 1) return tables[0];
    
    const result = [];
    const recurse = (current, tableIndex) => {
        if (tableIndex === tables.length) {
            result.push(Object.assign({}, ...current));
            return;
        }
        
        for (const row of tables[tableIndex]) {
            recurse([...current, row], tableIndex + 1);
        }
    };
    
    recurse([], 0);
    return result;
}

// 评估条件表达式
function evaluateCondition(row, condition) {
    if (!condition) return true;
    
    try {
        // 创建一个函数来评估条件
        // 注意：这是简化实现，实际上应该使用解析器处理条件
        const conditionFn = new Function(
            ...Object.keys(row),
            `return ${condition}`
        );
        
        return conditionFn(...Object.values(row));
    } catch (error) {
        console.error('条件评估错误:', error);
        return false;
    }
}

// 投影字段
function projectFields(data, fields) {
    if (fields.length === 0) return data;
    
    return data.map(row => {
        const projectedRow = {};
        fields.forEach(field => {
            const [table, column] = field.split('.');
            if (column) {
                // 处理表.字段格式
                projectedRow[field] = row[field] || row[column];
            } else {
                // 处理仅字段名的情况
                projectedRow[field] = row[field];
            }
        });
        return projectedRow;
    });
}

// 显示查询结果
function displayResult(resultData) {
    const resultTable = document.getElementById('result-table');
    resultTable.innerHTML = '';
    
    if (!resultData || resultData.length === 0) {
        resultTable.innerHTML = '<p>查询结果为空</p>';
        return;
    }
    
    // 创建表格
    const table = document.createElement('table');
    
    // 创建表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // 从第一行数据获取列名
    const columns = Object.keys(resultData[0]);
    
    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // 创建表格内容
    const tbody = document.createElement('tbody');
    
    resultData.forEach(row => {
        const tr = document.createElement('tr');
        
        columns.forEach(column => {
            const td = document.createElement('td');
            td.textContent = row[column] !== undefined ? row[column] : '';
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    resultTable.appendChild(table);
}

// 显示错误信息
function showError(message) {
    const resultTable = document.getElementById('result-table');
    resultTable.innerHTML = `<p class="error">${message}</p>`;
}

// 清除结果区域
function clearResults() {
    document.getElementById('sql-display').textContent = '';
    document.getElementById('tree-display').innerHTML = '';
    document.getElementById('result-table').innerHTML = '';
} 