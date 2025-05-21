// 拖拽处理相关的功能

document.addEventListener('DOMContentLoaded', () => {
    initDragAndDrop();
});

function initDragAndDrop() {
    // 获取所有可拖拽的元素
    const draggableFields = document.querySelectorAll('.field');
    const draggableOperators = document.querySelectorAll('.operator');
    const queryArea = document.getElementById('query-area');
    
    // 为字段添加拖拽事件监听器
    draggableFields.forEach(field => {
        field.addEventListener('dragstart', handleDragStart);
        field.addEventListener('dragend', handleDragEnd);
    });
    
    // 为运算符添加拖拽事件监听器
    draggableOperators.forEach(operator => {
        operator.addEventListener('dragstart', handleDragStart);
        operator.addEventListener('dragend', handleDragEnd);
    });
    
    // 为查询区域添加拖拽事件监听器
    queryArea.addEventListener('dragover', handleDragOver);
    queryArea.addEventListener('dragenter', handleDragEnter);
    queryArea.addEventListener('dragleave', handleDragLeave);
    queryArea.addEventListener('drop', handleDrop);
    
    // 清除按钮事件
    document.getElementById('clear-btn').addEventListener('click', clearQueryArea);
}

// 拖拽开始
function handleDragStart(e) {
    this.classList.add('dragging');
    
    // 保存被拖拽元素的数据
    if (this.classList.contains('field')) {
        e.dataTransfer.setData('type', 'field');
        e.dataTransfer.setData('table', this.dataset.table);
        e.dataTransfer.setData('field', this.dataset.field);
    } else if (this.classList.contains('operator')) {
        e.dataTransfer.setData('type', 'operator');
        e.dataTransfer.setData('operator', this.dataset.operator);
    } else if (this.classList.contains('query-item')) {
        e.dataTransfer.setData('type', 'query-item');
        e.dataTransfer.setData('id', this.id);
    }
}

// 拖拽结束
function handleDragEnd() {
    this.classList.remove('dragging');
}

// 拖拽经过目标区域
function handleDragOver(e) {
    e.preventDefault(); // 允许放置
}

// 拖拽进入目标区域
function handleDragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

// 拖拽离开目标区域
function handleDragLeave() {
    this.classList.remove('drag-over');
}

// 放置元素到目标区域
function handleDrop(e) {
    e.preventDefault();
    const queryArea = document.getElementById('query-area');
    queryArea.classList.remove('drag-over');
    
    // 移除占位符
    const placeholder = queryArea.querySelector('.placeholder');
    if (placeholder) {
        placeholder.remove();
    }
    
    const type = e.dataTransfer.getData('type');
    
    if (type === 'field') {
        // 处理字段放置
        const table = e.dataTransfer.getData('table');
        const field = e.dataTransfer.getData('field');
        addFieldToQuery(table, field);
    } else if (type === 'operator') {
        // 处理运算符放置
        const operator = e.dataTransfer.getData('operator');
        addOperatorToQuery(operator);
    }
    
    // 更新查询可视化
    updateQueryVisualization();
}

// 添加字段到查询区域
function addFieldToQuery(table, field) {
    const queryArea = document.getElementById('query-area');
    const fieldElement = document.createElement('div');
    const id = `field-${Date.now()}`;
    
    fieldElement.id = id;
    fieldElement.className = 'query-item query-field';
    fieldElement.dataset.type = 'field';
    fieldElement.dataset.table = table;
    fieldElement.dataset.field = field;
    fieldElement.draggable = true;
    fieldElement.textContent = `${table}.${field}`;
    
    // 添加删除按钮
    const removeBtn = document.createElement('div');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '×';
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fieldElement.remove();
        updateQueryVisualization();
    });
    
    fieldElement.appendChild(removeBtn);
    
    // 为查询项添加拖拽事件
    fieldElement.addEventListener('dragstart', handleDragStart);
    fieldElement.addEventListener('dragend', handleDragEnd);
    
    queryArea.appendChild(fieldElement);
}

// 添加运算符到查询区域
function addOperatorToQuery(operator) {
    const queryArea = document.getElementById('query-area');
    const operatorElement = document.createElement('div');
    const id = `operator-${Date.now()}`;
    
    operatorElement.id = id;
    operatorElement.className = 'query-item query-operator';
    operatorElement.dataset.type = 'operator';
    operatorElement.dataset.operator = operator;
    operatorElement.draggable = true;
    
    // 设置运算符显示内容
    switch (operator) {
        case 'select':
            operatorElement.innerHTML = 'σ <span class="condition-placeholder">(条件)</span>';
            break;
        case 'project':
            operatorElement.innerHTML = 'π <span class="condition-placeholder">(字段)</span>';
            break;
        case 'join':
            operatorElement.innerHTML = '⋈ <span class="condition-placeholder">(连接条件)</span>';
            break;
        case 'union':
            operatorElement.innerHTML = '∪';
            break;
        case 'intersection':
            operatorElement.innerHTML = '∩';
            break;
        case 'difference':
            operatorElement.innerHTML = '-';
            break;
    }
    
    // 添加删除按钮
    const removeBtn = document.createElement('div');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '×';
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        operatorElement.remove();
        updateQueryVisualization();
    });
    
    operatorElement.appendChild(removeBtn);
    
    // 为查询项添加拖拽事件
    operatorElement.addEventListener('dragstart', handleDragStart);
    operatorElement.addEventListener('dragend', handleDragEnd);
    
    // 如果是选择操作，添加条件输入
    if (operator === 'select') {
        operatorElement.addEventListener('click', () => {
            const condition = prompt('请输入选择条件 (例如: age > 20)');
            if (condition) {
                const conditionPlaceholder = operatorElement.querySelector('.condition-placeholder');
                if (conditionPlaceholder) {
                    conditionPlaceholder.textContent = condition;
                }
                operatorElement.dataset.condition = condition;
                updateQueryVisualization();
            }
        });
    }
    
    // 如果是投影操作，可以选择多个字段
    if (operator === 'project') {
        operatorElement.addEventListener('click', () => {
            const fields = getAvailableFields();
            const selectedFields = prompt(`请输入要投影的字段 (用逗号分隔)\n可用字段: ${fields.join(', ')}`);
            if (selectedFields) {
                const conditionPlaceholder = operatorElement.querySelector('.condition-placeholder');
                if (conditionPlaceholder) {
                    conditionPlaceholder.textContent = selectedFields;
                }
                operatorElement.dataset.condition = selectedFields;
                updateQueryVisualization();
            }
        });
    }
    
    // 如果是连接操作，添加连接条件
    if (operator === 'join') {
        operatorElement.addEventListener('click', () => {
            const tables = Object.keys(window.dbData.tables);
            const condition = prompt(`请输入连接条件 (例如: Students.id = Enrollment.student_id)\n可用表: ${tables.join(', ')}`);
            if (condition) {
                const conditionPlaceholder = operatorElement.querySelector('.condition-placeholder');
                if (conditionPlaceholder) {
                    conditionPlaceholder.textContent = condition;
                }
                operatorElement.dataset.condition = condition;
                updateQueryVisualization();
            }
        });
    }
    
    queryArea.appendChild(operatorElement);
}

// 清除查询区域
function clearQueryArea() {
    const queryArea = document.getElementById('query-area');
    queryArea.innerHTML = '<div class="placeholder">拖拽运算符和字段到此区域构建查询</div>';
    
    // 清除结果区域
    document.getElementById('sql-display').textContent = '';
    document.getElementById('tree-display').innerHTML = '';
    document.getElementById('result-table').innerHTML = '';
}

// 获取可用字段列表
function getAvailableFields() {
    const fields = [];
    for (const table in window.dbData.tableSchema) {
        window.dbData.tableSchema[table].forEach(field => {
            fields.push(`${table}.${field}`);
        });
    }
    return fields;
}

// 更新查询可视化（用于触发查询构建和执行）
function updateQueryVisualization() {
    // 这个函数将在query-builder.js中定义，这里只是调用
    if (typeof buildQueryFromUI === 'function') {
        buildQueryFromUI();
    }
} 