// 全局变量
let tables = [];
let currentTableIndex = -1;
let currentFKField = null;

// 数据类型列表
const dataTypes = [
    // 整数类型
    "INT", "TINYINT", "SMALLINT", "BIGINT", 
    // 浮点类型
    "FLOAT", "REAL", "DECIMAL", "NUMERIC", 
    // 字符串类型
    "CHAR", "VARCHAR", "VARCHAR(MAX)", "TEXT", "NCHAR", "NVARCHAR", "NVARCHAR(MAX)", "NTEXT", 
    // 日期时间类型
    "DATE", "DATETIME", "DATETIME2", "SMALLDATETIME", "TIME", 
    // 二进制类型
    "BINARY", "VARBINARY", "VARBINARY(MAX)", "IMAGE",
    // 其他类型
    "BIT", "MONEY", "SMALLMONEY", "UNIQUEIDENTIFIER", "XML"
];

// DOM 元素
const elements = {
    tablesList: document.getElementById('tables-list'),
    addTableBtn: document.getElementById('add-table-btn'),
    tableName: document.getElementById('table-name'),
    fieldsList: document.getElementById('fields-list'),
    addFieldBtn: document.getElementById('add-field-btn'),
    saveTableBtn: document.getElementById('save-table-btn'),
    fkList: document.getElementById('fk-list'),
    sqlOutput: document.getElementById('sql-output'),
    generateSqlBtn: document.getElementById('generate-sql-btn'),
    downloadSqlBtn: document.getElementById('download-sql-btn'),
    copySqlBtn: document.getElementById('copy-sql-btn'),
    
    // 外键模态框
    fkModal: document.getElementById('fk-modal'),
    fkFieldName: document.getElementById('fk-field-name'),
    refTable: document.getElementById('ref-table'),
    refField: document.getElementById('ref-field'),
    onDelete: document.getElementById('on-delete'),
    onUpdate: document.getElementById('on-update'),
    saveFKBtn: document.getElementById('save-fk-btn'),
    cancelFKBtn: document.getElementById('cancel-fk-btn'),
    closeModalBtn: document.querySelector('.close')
};

// 初始化
function init() {
    // 绑定事件
    elements.addTableBtn.addEventListener('click', addNewTable);
    elements.addFieldBtn.addEventListener('click', addNewField);
    elements.saveTableBtn.addEventListener('click', saveCurrentTable);
    elements.generateSqlBtn.addEventListener('click', generateSQL);
    elements.downloadSqlBtn.addEventListener('click', downloadSQL);
    elements.copySqlBtn.addEventListener('click', copySQL);
    
    // 外键模态框事件
    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.cancelFKBtn.addEventListener('click', closeModal);
    elements.saveFKBtn.addEventListener('click', saveForeignKey);
    elements.refTable.addEventListener('change', updateRefFields);
    
    // 初始加载
    renderTablesList();
}

// 表格相关函数
function addNewTable() {
    const newTable = {
        id: Date.now(),
        name: `新建表${tables.length + 1}`,
        fields: [],
        foreignKeys: []
    };
    
    tables.push(newTable);
    currentTableIndex = tables.length - 1;
    renderTablesList();
    renderTableEditor();
}

function renderTablesList() {
    elements.tablesList.innerHTML = '';
    console.log('渲染表格列表，当前选中索引:', currentTableIndex);
    
    tables.forEach((table, index) => {
        const tableItem = document.createElement('div');
        tableItem.className = `table-item ${index === currentTableIndex ? 'active' : ''}`;
        
        // 创建名称元素
        const nameSpan = document.createElement('span');
        nameSpan.textContent = table.name;
        nameSpan.addEventListener('click', () => {
            console.log('点击表名，从', currentTableIndex, '切换到', index);
            currentTableIndex = index;
            renderTablesList();
            renderTableEditor();
        });
        
        // 创建删除按钮
        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '×';
        deleteBtn.dataset.index = index;
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTable(index);
        });
        
        // 添加到表格项
        tableItem.appendChild(nameSpan);
        tableItem.appendChild(deleteBtn);
        
        // 给整个表格项添加点击事件，确保点击任何位置都能选中表格
        tableItem.addEventListener('click', () => {
            console.log('点击表格项，从', currentTableIndex, '切换到', index);
            currentTableIndex = index;
            renderTablesList();
            renderTableEditor();
        });
        
        elements.tablesList.appendChild(tableItem);
    });
}

function deleteTable(index) {
    if (confirm(`确定要删除表"${tables[index].name}"吗？`)) {
        tables.splice(index, 1);
        
        if (tables.length === 0) {
            currentTableIndex = -1;
        } else if (currentTableIndex === index) {
            currentTableIndex = 0;
        } else if (currentTableIndex > index) {
            currentTableIndex--;
        }
        
        renderTablesList();
        renderTableEditor();
    }
}

function renderTableEditor() {
    if (currentTableIndex === -1) {
        document.getElementById('current-table-editor').style.display = 'none';
        return;
    }
    
    document.getElementById('current-table-editor').style.display = 'block';
    const currentTable = tables[currentTableIndex];
    
    elements.tableName.value = currentTable.name;
    renderFieldsList();
    renderForeignKeysList();
}

// 字段相关函数
function addNewField() {
    if (currentTableIndex === -1) return;
    
    const newField = {
        id: Date.now(),
        name: '',
        type: 'VARCHAR',
        length: '255',
        nullable: true,
        defaultValue: '',
        primaryKey: false,
        autoIncrement: false
    };
    
    tables[currentTableIndex].fields.push(newField);
    renderFieldsList();
}

function renderFieldsList() {
    if (currentTableIndex === -1) return;
    
    elements.fieldsList.innerHTML = '';
    const currentTable = tables[currentTableIndex];
    
    currentTable.fields.forEach((field, index) => {
        const fieldRow = document.createElement('div');
        fieldRow.className = 'field-row';
        fieldRow.dataset.index = index;
        
        // 创建数据类型选择下拉框
        const typeOptions = dataTypes.map(type => 
            `<option value="${type}" ${field.type === type ? 'selected' : ''}>${type}</option>`
        ).join('');
        
        // 添加SQL Server常用默认值提示
        let defaultValuePlaceholder = '默认值';
        if (field.type.toUpperCase().includes('DATETIME')) {
            defaultValuePlaceholder = '例如: GETDATE()';
        } else if (field.type.toUpperCase().includes('INT')) {
            defaultValuePlaceholder = '例如: 0';
        }
        
        fieldRow.innerHTML = `
            <input type="text" class="field-name" value="${field.name}" placeholder="字段名" />
            
            <select class="field-type">
                ${typeOptions}
            </select>
            
            <input type="text" class="field-length" value="${field.length || ''}" placeholder="长度/值" />
            
            <div class="field-null">
                <input type="checkbox" id="null-${field.id}" ${field.nullable ? 'checked' : ''} />
            </div>
            
            <input type="text" class="field-default" value="${field.defaultValue || ''}" placeholder="${defaultValuePlaceholder}" />
            
            <div class="field-pk">
                <input type="checkbox" id="pk-${field.id}" ${field.primaryKey ? 'checked' : ''} />
            </div>
            
            <div class="field-fk">
                <button class="fk-btn" data-field-index="${index}">FK</button>
            </div>
            
            <div class="field-actions">
                <span class="field-action-btn up" title="上移">&uarr;</span>
                <span class="field-action-btn down" title="下移">&darr;</span>
                <span class="field-action-btn delete" title="删除">&times;</span>
            </div>
        `;
        
        // 字段名称变化
        fieldRow.querySelector('.field-name').addEventListener('input', (e) => {
            currentTable.fields[index].name = e.target.value;
        });
        
        // 数据类型变化
        fieldRow.querySelector('.field-type').addEventListener('change', (e) => {
            currentTable.fields[index].type = e.target.value;
        });
        
        // 长度/值变化
        fieldRow.querySelector('.field-length').addEventListener('input', (e) => {
            currentTable.fields[index].length = e.target.value;
        });
        
        // 是否可为空变化
        fieldRow.querySelector(`#null-${field.id}`).addEventListener('change', (e) => {
            currentTable.fields[index].nullable = e.target.checked;
        });
        
        // 默认值变化
        fieldRow.querySelector('.field-default').addEventListener('input', (e) => {
            currentTable.fields[index].defaultValue = e.target.value;
        });
        
        // 主键变化
        fieldRow.querySelector(`#pk-${field.id}`).addEventListener('change', (e) => {
            currentTable.fields[index].primaryKey = e.target.checked;
            
            // 如果设为主键，则不可为空
            if (e.target.checked) {
                currentTable.fields[index].nullable = false;
                fieldRow.querySelector(`#null-${field.id}`).checked = false;
                fieldRow.querySelector(`#null-${field.id}`).disabled = true;
            } else {
                fieldRow.querySelector(`#null-${field.id}`).disabled = false;
            }
        });
        
        // 禁用主键字段的可空选项
        if (field.primaryKey) {
            fieldRow.querySelector(`#null-${field.id}`).disabled = true;
        }
        
        // 外键按钮点击
        fieldRow.querySelector('.fk-btn').addEventListener('click', (e) => {
            openForeignKeyModal(index);
        });
        
        // 上移字段
        fieldRow.querySelector('.field-action-btn.up').addEventListener('click', () => {
            if (index > 0) {
                [currentTable.fields[index], currentTable.fields[index - 1]] = 
                [currentTable.fields[index - 1], currentTable.fields[index]];
                renderFieldsList();
            }
        });
        
        // 下移字段
        fieldRow.querySelector('.field-action-btn.down').addEventListener('click', () => {
            if (index < currentTable.fields.length - 1) {
                [currentTable.fields[index], currentTable.fields[index + 1]] = 
                [currentTable.fields[index + 1], currentTable.fields[index]];
                renderFieldsList();
            }
        });
        
        // 删除字段
        fieldRow.querySelector('.field-action-btn.delete').addEventListener('click', () => {
            if (confirm(`确定要删除字段"${field.name || '未命名'}"吗？`)) {
                // 检查是否有外键引用了这个字段
                const fkReferences = currentTable.foreignKeys.filter(fk => fk.fieldId === field.id);
                
                if (fkReferences.length > 0) {
                    if (confirm(`此字段被用作外键，删除字段将同时删除相关的外键关联。是否继续？`)) {
                        // 删除相关外键
                        currentTable.foreignKeys = currentTable.foreignKeys.filter(fk => fk.fieldId !== field.id);
                    } else {
                        return;
                    }
                }
                
                currentTable.fields.splice(index, 1);
                renderFieldsList();
                renderForeignKeysList();
            }
        });
        
        elements.fieldsList.appendChild(fieldRow);
    });
}

// 保存当前表
function saveCurrentTable() {
    if (currentTableIndex === -1) return;
    
    const tableName = elements.tableName.value.trim();
    
    if (!tableName) {
        alert('请输入表名');
        elements.tableName.focus();
        return;
    }
    
    // 检查字段
    const invalidFields = tables[currentTableIndex].fields.filter(field => !field.name.trim());
    
    if (invalidFields.length > 0) {
        alert('请为所有字段提供名称');
        return;
    }
    
    // 检查主键
    const pks = tables[currentTableIndex].fields.filter(field => field.primaryKey);
    
    if (pks.length === 0) {
        if (!confirm('当前表没有设置主键，确定要继续吗？')) {
            return;
        }
    }
    
    // 保存表名
    const savedIndex = currentTableIndex; // 保存当前索引
    tables[currentTableIndex].name = tableName;
    
    // 更新界面
    renderTablesList();
    // 确保当前表索引不变
    currentTableIndex = savedIndex;
    renderTableEditor();
    alert('表结构已保存');
}

// 外键相关函数
function openForeignKeyModal(fieldIndex) {
    if (currentTableIndex === -1) return;
    
    const currentTable = tables[currentTableIndex];
    const field = currentTable.fields[fieldIndex];
    
    currentFKField = field;
    elements.fkFieldName.textContent = field.name || '未命名字段';
    
    // 填充引用表下拉框
    elements.refTable.innerHTML = '';
    tables.forEach((table, index) => {
        if (index !== currentTableIndex) { // 排除当前表
            const option = document.createElement('option');
            option.value = table.id;
            option.textContent = table.name;
            elements.refTable.appendChild(option);
        }
    });
    
    // 更新引用字段下拉框
    updateRefFields();
    
    // 显示模态框
    elements.fkModal.style.display = 'block';
}

function updateRefFields() {
    elements.refField.innerHTML = '';
    
    if (elements.refTable.value) {
        const refTableId = parseInt(elements.refTable.value);
        const refTable = tables.find(t => t.id === refTableId);
        
        if (refTable) {
            refTable.fields.forEach(field => {
                if (field.primaryKey) { // 只显示主键字段
                    const option = document.createElement('option');
                    option.value = field.id;
                    option.textContent = field.name;
                    elements.refField.appendChild(option);
                }
            });
        }
    }
}

function saveForeignKey() {
    if (!currentFKField || currentTableIndex === -1) return;
    
    const refTableId = parseInt(elements.refTable.value);
    const refFieldId = parseInt(elements.refField.value);
    const onDelete = elements.onDelete.value;
    const onUpdate = elements.onUpdate.value;
    
    if (!refTableId || !refFieldId) {
        alert('请选择引用表和字段');
        return;
    }
    
    const refTable = tables.find(t => t.id === refTableId);
    const refField = refTable.fields.find(f => f.id === refFieldId);
    
    // 检查是否已存在相同的外键
    const existingFK = tables[currentTableIndex].foreignKeys.find(
        fk => fk.fieldId === currentFKField.id && 
              fk.refTableId === refTableId && 
              fk.refFieldId === refFieldId
    );
    
    if (existingFK) {
        alert('此外键关系已存在');
        return;
    }
    
    // 创建新外键
    const newFK = {
        id: Date.now(),
        fieldId: currentFKField.id,
        fieldName: currentFKField.name,
        refTableId: refTableId,
        refTableName: refTable.name,
        refFieldId: refFieldId,
        refFieldName: refField.name,
        onDelete: onDelete,
        onUpdate: onUpdate
    };
    
    tables[currentTableIndex].foreignKeys.push(newFK);
    
    // 关闭模态框并更新界面
    closeModal();
    renderForeignKeysList();
}

function renderForeignKeysList() {
    if (currentTableIndex === -1) return;
    
    elements.fkList.innerHTML = '';
    const currentTable = tables[currentTableIndex];
    
    if (currentTable.foreignKeys.length === 0) {
        elements.fkList.innerHTML = '<div class="fk-empty">暂无外键定义</div>';
        return;
    }
    
    currentTable.foreignKeys.forEach((fk, index) => {
        const fkItem = document.createElement('div');
        fkItem.className = 'fk-item';
        fkItem.innerHTML = `
            <div>
                <strong>${fk.fieldName}</strong> → 
                ${fk.refTableName}.${fk.refFieldName}
                <span class="fk-actions">
                    ON DELETE ${fk.onDelete} | ON UPDATE ${fk.onUpdate}
                </span>
            </div>
            <span class="delete-fk" data-index="${index}">&times;</span>
        `;
        
        fkItem.querySelector('.delete-fk').addEventListener('click', () => {
            if (confirm(`确定要删除此外键关联吗？`)) {
                currentTable.foreignKeys.splice(index, 1);
                renderForeignKeysList();
            }
        });
        
        elements.fkList.appendChild(fkItem);
    });
}

function closeModal() {
    elements.fkModal.style.display = 'none';
    currentFKField = null;
}

// SQL 生成相关函数
function generateSQL() {
    if (tables.length === 0) {
        alert('请先创建至少一个表');
        return;
    }
    
    let sql = '';
    
    // 生成建表语句
    tables.forEach(table => {
        sql += `-- 创建表 ${table.name}\n`;
        sql += `CREATE TABLE [${table.name}] (\n`;
        
        // 添加字段
        const fieldLines = table.fields.map(field => {
            // 调整数据类型映射（MySQL到SQL Server）
            let sqlServerType = mapToSqlServerType(field.type, field.length);
            
            let line = `  [${field.name}] ${sqlServerType}`;
            
            // 是否可为空
            line += field.nullable ? ' NULL' : ' NOT NULL';
            
            // 默认值
            if (field.defaultValue) {
                if (['CURRENT_TIMESTAMP', 'GETDATE()'].includes(field.defaultValue.toUpperCase())) {
                    line += ` DEFAULT GETDATE()`;
                } else if (field.defaultValue.toUpperCase() === 'NULL') {
                    line += ` DEFAULT NULL`;
                } else {
                    line += ` DEFAULT '${field.defaultValue}'`;
                }
            }
            
            // 主键自增
            if (field.primaryKey && field.type.toUpperCase().includes('INT')) {
                line += ' IDENTITY(1,1)';
            }
            
            return line;
        });
        
        // 添加主键约束
        const primaryKeys = table.fields.filter(field => field.primaryKey);
        if (primaryKeys.length > 0) {
            const pkName = `PK_${table.name}`;
            const pkLine = `  CONSTRAINT [${pkName}] PRIMARY KEY ([${primaryKeys.map(pk => pk.name).join('], [')}])`;
            fieldLines.push(pkLine);
        }
        
        sql += fieldLines.join(',\n');
        sql += '\n);\n\n';
        
        // 在表创建后添加外键约束（SQL Server通常单独添加外键）
        if (table.foreignKeys.length > 0) {
            table.foreignKeys.forEach(fk => {
                const constraintName = `FK_${table.name}_${fk.refTableName}`;
                sql += `-- 添加外键 ${fk.fieldName} -> ${fk.refTableName}.${fk.refFieldName}\n`;
                sql += `ALTER TABLE [${table.name}] ADD CONSTRAINT [${constraintName}] FOREIGN KEY ([${fk.fieldName}])\n`;
                sql += `    REFERENCES [${fk.refTableName}] ([${fk.refFieldName}]) ON DELETE ${mapDeleteUpdateAction(fk.onDelete)} ON UPDATE ${mapDeleteUpdateAction(fk.onUpdate)};\n\n`;
            });
        }
    });
    
    elements.sqlOutput.value = sql;
}

// 帮助函数：将MySQL数据类型映射到SQL Server数据类型
function mapToSqlServerType(mysqlType, length) {
    // 处理特殊的VARCHAR(MAX)和类似情况
    if (mysqlType === 'VARCHAR(MAX)') return 'VARCHAR(MAX)';
    if (mysqlType === 'NVARCHAR(MAX)') return 'NVARCHAR(MAX)';
    if (mysqlType === 'VARBINARY(MAX)') return 'VARBINARY(MAX)';
    
    const typeMap = {
        'INT': 'INT',
        'TINYINT': 'TINYINT',
        'SMALLINT': 'SMALLINT',
        'MEDIUMINT': 'INT',
        'BIGINT': 'BIGINT',
        'FLOAT': 'FLOAT',
        'DOUBLE': 'FLOAT(53)',
        'REAL': 'REAL',
        'DECIMAL': length ? `DECIMAL(${length})` : 'DECIMAL(18,2)',
        'NUMERIC': length ? `NUMERIC(${length})` : 'NUMERIC(18,2)',
        'CHAR': length ? `CHAR(${length})` : 'CHAR(1)',
        'VARCHAR': length ? `VARCHAR(${length})` : 'VARCHAR(255)',
        'TEXT': 'TEXT',
        'TINYTEXT': 'VARCHAR(255)',
        'MEDIUMTEXT': 'TEXT',
        'LONGTEXT': 'VARCHAR(MAX)',
        'NCHAR': length ? `NCHAR(${length})` : 'NCHAR(1)',
        'NVARCHAR': length ? `NVARCHAR(${length})` : 'NVARCHAR(255)',
        'NTEXT': 'NTEXT',
        'DATE': 'DATE',
        'DATETIME': 'DATETIME',
        'DATETIME2': 'DATETIME2',
        'SMALLDATETIME': 'SMALLDATETIME',
        'TIMESTAMP': 'DATETIME',
        'TIME': 'TIME',
        'YEAR': 'INT',
        'ENUM': 'VARCHAR(255)',
        'SET': 'VARCHAR(255)',
        'BIT': 'BIT',
        'BOOLEAN': 'BIT',
        'BINARY': length ? `BINARY(${length})` : 'BINARY(1)',
        'VARBINARY': length ? `VARBINARY(${length})` : 'VARBINARY(255)',
        'BLOB': 'VARBINARY(MAX)',
        'TINYBLOB': 'VARBINARY(255)',
        'MEDIUMBLOB': 'VARBINARY(MAX)',
        'LONGBLOB': 'VARBINARY(MAX)',
        'IMAGE': 'IMAGE',
        'MONEY': 'MONEY',
        'SMALLMONEY': 'SMALLMONEY',
        'UNIQUEIDENTIFIER': 'UNIQUEIDENTIFIER',
        'XML': 'XML'
    };
    
    return typeMap[mysqlType.toUpperCase()] || 'VARCHAR(255)';
}

// 帮助函数：映射删除/更新动作
function mapDeleteUpdateAction(action) {
    // SQL Server支持的操作：NO ACTION, CASCADE, SET NULL, SET DEFAULT
    if (action === 'RESTRICT') {
        return 'NO ACTION'; // SQL Server没有RESTRICT，用NO ACTION替代
    }
    return action;
}

function downloadSQL() {
    const sql = elements.sqlOutput.value;
    
    if (!sql) {
        alert('请先生成 SQL 脚本');
        return;
    }
    
    const blob = new Blob([sql], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'database_script.sql';
    a.click();
    
    URL.revokeObjectURL(url);
}

function copySQL() {
    const sql = elements.sqlOutput.value;
    
    if (!sql) {
        alert('请先生成 SQL 脚本');
        return;
    }
    
    navigator.clipboard.writeText(sql)
        .then(() => alert('SQL 脚本已复制到剪贴板'))
        .catch(err => console.error('复制失败:', err));
}

// 启动应用
document.addEventListener('DOMContentLoaded', init); 