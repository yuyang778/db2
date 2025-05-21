// 查询构建器相关功能

// 初始化查询构建器
document.addEventListener('DOMContentLoaded', () => {
    // 绑定执行按钮事件
    document.getElementById('execute-btn').addEventListener('click', () => {
        executeQuery();
    });
});

// 从UI构建查询
function buildQueryFromUI() {
    const queryArea = document.getElementById('query-area');
    const queryItems = queryArea.querySelectorAll('.query-item');
    
    if (queryItems.length === 0) {
        clearResults();
        return;
    }
    
    // 构建查询对象
    const queryTree = buildQueryTree(queryItems);
    
    // 生成SQL等价表达式
    const sqlQuery = generateSQLQuery(queryTree);
    displaySQLQuery(sqlQuery);
    
    // 生成语法树
    displayQueryTree(queryTree);
}

// 构建查询树
function buildQueryTree(queryItems) {
    // 简化版查询树构建，仅处理简单的情况
    
    // 初始化基础查询对象
    let queryTree = {
        type: 'base',
        tables: new Set(),
        fields: []
    };
    
    // 收集所有表和字段
    const fields = [];
    const operators = [];
    
    queryItems.forEach(item => {
        if (item.dataset.type === 'field') {
            const table = item.dataset.table;
            const field = item.dataset.field;
            
            queryTree.tables.add(table);
            fields.push({ table, field });
        } else if (item.dataset.type === 'operator') {
            operators.push({
                type: item.dataset.operator,
                condition: item.dataset.condition || ''
            });
        }
    });
    
    // 将表集合转换为数组
    queryTree.tables = Array.from(queryTree.tables);
    
    // 处理运算符
    operators.forEach(op => {
        switch (op.type) {
            case 'select':
                queryTree = {
                    type: 'select',
                    condition: op.condition,
                    child: queryTree
                };
                break;
                
            case 'project':
                const projectionFields = op.condition ? op.condition.split(',').map(f => f.trim()) : [];
                queryTree = {
                    type: 'project',
                    fields: projectionFields,
                    child: queryTree
                };
                break;
                
            case 'join':
                // 解析连接条件
                if (op.condition) {
                    const parts = op.condition.split('=').map(p => p.trim());
                    if (parts.length === 2) {
                        const leftParts = parts[0].split('.');
                        const rightParts = parts[1].split('.');
                        
                        if (leftParts.length === 2 && rightParts.length === 2) {
                            queryTree = {
                                type: 'join',
                                leftTable: leftParts[0],
                                leftField: leftParts[1],
                                rightTable: rightParts[0],
                                rightField: rightParts[1],
                                child: queryTree
                            };
                        }
                    }
                }
                break;
                
            case 'union':
            case 'intersection':
            case 'difference':
                queryTree = {
                    type: op.type,
                    left: queryTree,
                    right: { type: 'base', tables: [], fields: [] }  // 简化处理
                };
                break;
        }
    });
    
    // 如果没有特定的字段投影，使用所有字段
    if (queryTree.type !== 'project' && fields.length > 0) {
        queryTree = {
            type: 'project',
            fields: fields.map(f => `${f.table}.${f.field}`),
            child: queryTree
        };
    }
    
    return queryTree;
}

// 生成等价SQL查询
function generateSQLQuery(queryTree) {
    // 递归生成SQL查询
    function generateSQL(node) {
        if (!node) return '';
        
        switch (node.type) {
            case 'base':
                if (node.tables.length === 0) return '';
                return `SELECT * FROM ${node.tables.join(', ')}`;
                
            case 'select':
                const childSQL = generateSQL(node.child);
                // 如果基础查询已经包含了WHERE，则使用AND连接
                if (childSQL.includes('WHERE')) {
                    return `${childSQL} AND ${node.condition}`;
                } else {
                    return `${childSQL} WHERE ${node.condition}`;
                }
                
            case 'project':
                const projectionFields = node.fields.length > 0 ? node.fields.join(', ') : '*';
                // 如果子查询是简单查询，直接修改SELECT部分
                if (node.child.type === 'base') {
                    return `SELECT ${projectionFields} FROM ${node.child.tables.join(', ')}`;
                } else {
                    // 否则将子查询作为子查询
                    const subQuery = generateSQL(node.child);
                    return `SELECT ${projectionFields} FROM (${subQuery}) AS subquery`;
                }
                
            case 'join':
                if (node.child.type === 'base' && node.child.tables.length > 0) {
                    return `SELECT * FROM ${node.leftTable} JOIN ${node.rightTable} ON ${node.leftTable}.${node.leftField} = ${node.rightTable}.${node.rightField}`;
                } else {
                    const subQuery = generateSQL(node.child);
                    return `${subQuery} JOIN ${node.rightTable} ON ${node.leftTable}.${node.leftField} = ${node.rightTable}.${node.rightField}`;
                }
                
            case 'union':
                return `(${generateSQL(node.left)}) UNION (${generateSQL(node.right)})`;
                
            case 'intersection':
                return `(${generateSQL(node.left)}) INTERSECT (${generateSQL(node.right)})`;
                
            case 'difference':
                return `(${generateSQL(node.left)}) EXCEPT (${generateSQL(node.right)})`;
                
            default:
                return '';
        }
    }
    
    return generateSQL(queryTree);
}

// 显示SQL查询
function displaySQLQuery(sqlQuery) {
    const sqlDisplay = document.getElementById('sql-display');
    sqlDisplay.textContent = sqlQuery || '-- 尚未构建查询 --';
}

// 显示查询树（简化版可视化）
function displayQueryTree(queryTree) {
    const treeDisplay = document.getElementById('tree-display');
    treeDisplay.innerHTML = '';
    
    // 简单的树可视化
    const treeDiv = document.createElement('div');
    treeDiv.className = 'query-tree-visualization';
    treeDiv.innerHTML = generateTreeHTML(queryTree);
    
    treeDisplay.appendChild(treeDiv);
}

// 生成树的HTML表示
function generateTreeHTML(node, depth = 0) {
    if (!node) return '';
    
    const indent = '&nbsp;'.repeat(depth * 4);
    let html = '';
    
    switch (node.type) {
        case 'base':
            html += `${indent}<div class="tree-node">基础查询: ${node.tables.join(', ')}</div>`;
            break;
            
        case 'select':
            html += `${indent}<div class="tree-node">选择 (σ): ${node.condition}</div>`;
            html += generateTreeHTML(node.child, depth + 1);
            break;
            
        case 'project':
            html += `${indent}<div class="tree-node">投影 (π): ${node.fields.join(', ')}</div>`;
            html += generateTreeHTML(node.child, depth + 1);
            break;
            
        case 'join':
            html += `${indent}<div class="tree-node">连接 (⋈): ${node.leftTable}.${node.leftField} = ${node.rightTable}.${node.rightField}</div>`;
            html += generateTreeHTML(node.child, depth + 1);
            break;
            
        case 'union':
            html += `${indent}<div class="tree-node">并集 (∪)</div>`;
            html += generateTreeHTML(node.left, depth + 1);
            html += generateTreeHTML(node.right, depth + 1);
            break;
            
        case 'intersection':
            html += `${indent}<div class="tree-node">交集 (∩)</div>`;
            html += generateTreeHTML(node.left, depth + 1);
            html += generateTreeHTML(node.right, depth + 1);
            break;
            
        case 'difference':
            html += `${indent}<div class="tree-node">差集 (-)</div>`;
            html += generateTreeHTML(node.left, depth + 1);
            html += generateTreeHTML(node.right, depth + 1);
            break;
    }
    
    return html;
}

// 执行查询
function executeQuery() {
    buildQueryFromUI();
} 