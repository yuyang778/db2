// 数据定义
const userRoles = {
    "sa": ["sysadmin"],
    "dbadmin": ["db_owner", "securityadmin"],
    "developer": ["db_datareader", "db_datawriter"],
    "reporter": ["db_datareader"],
    "guest": ["public"]
};

// 权限定义
const serverPermissions = [
    "ALTER ANY DATABASE", 
    "ALTER ANY LOGIN", 
    "ALTER SERVER STATE", 
    "ALTER SETTINGS",
    "CONNECT SQL", 
    "CONTROL SERVER", 
    "CREATE ANY DATABASE", 
    "CREATE DDL EVENT NOTIFICATION",
    "CREATE ENDPOINT", 
    "CREATE TRACE EVENT NOTIFICATION", 
    "SHUTDOWN", 
    "VIEW ANY DATABASE", 
    "VIEW SERVER STATE"
];

const databasePermissions = [
    "ALTER", 
    "ALTER ANY SCHEMA", 
    "ALTER ANY USER", 
    "BACKUP DATABASE", 
    "BACKUP LOG", 
    "CONNECT",
    "CREATE FUNCTION", 
    "CREATE PROCEDURE", 
    "CREATE SCHEMA", 
    "CREATE TABLE", 
    "CREATE VIEW",
    "DELETE", 
    "EXECUTE", 
    "INSERT", 
    "SELECT", 
    "UPDATE" 
];

const objectPermissions = {
    "tables": ["SELECT", "INSERT", "UPDATE", "DELETE", "REFERENCES", "ALTER"],
    "views": ["SELECT", "INSERT", "UPDATE", "DELETE", "REFERENCES", "ALTER"],
    "procedures": ["EXECUTE", "ALTER"],
    "functions": ["EXECUTE", "REFERENCES", "ALTER"]
};

// 用户权限映射
const userPermissions = {
    "sa": {
        server: serverPermissions.reduce((acc, perm) => {
            acc[perm] = { grant: true, deny: false };
            return acc;
        }, {}),
        database: {
            "master": databasePermissions.reduce((acc, perm) => {
                acc[perm] = { grant: true, deny: false };
                return acc;
            }, {}),
            "model": databasePermissions.reduce((acc, perm) => {
                acc[perm] = { grant: true, deny: false };
                return acc;
            }, {}),
            "msdb": databasePermissions.reduce((acc, perm) => {
                acc[perm] = { grant: true, deny: false };
                return acc;
            }, {}),
            "tempdb": databasePermissions.reduce((acc, perm) => {
                acc[perm] = { grant: true, deny: false };
                return acc;
            }, {}),
            "userdb": databasePermissions.reduce((acc, perm) => {
                acc[perm] = { grant: true, deny: false };
                return acc;
            }, {})
        },
        object: {
            "tables": {
                "table1": objectPermissions.tables.reduce((acc, perm) => {
                    acc[perm] = { grant: true, deny: false };
                    return acc;
                }, {})
            }
        }
    },
    "dbadmin": {
        server: serverPermissions.reduce((acc, perm) => {
            if (["ALTER ANY DATABASE", "ALTER ANY LOGIN", "CREATE ANY DATABASE", "VIEW ANY DATABASE"].includes(perm)) {
                acc[perm] = { grant: true, deny: false };
            } else {
                acc[perm] = { grant: false, deny: false };
            }
            return acc;
        }, {}),
        database: {
            "master": databasePermissions.reduce((acc, perm) => {
                if (["CONNECT"].includes(perm)) {
                    acc[perm] = { grant: true, deny: false };
                } else {
                    acc[perm] = { grant: false, deny: false };
                }
                return acc;
            }, {}),
            "userdb": databasePermissions.reduce((acc, perm) => {
                acc[perm] = { grant: true, deny: false };
                return acc;
            }, {})
        },
        object: {
            "tables": {
                "table1": objectPermissions.tables.reduce((acc, perm) => {
                    acc[perm] = { grant: true, deny: false };
                    return acc;
                }, {})
            }
        }
    },
    "developer": {
        server: serverPermissions.reduce((acc, perm) => {
            if (["CONNECT SQL", "VIEW SERVER STATE"].includes(perm)) {
                acc[perm] = { grant: true, deny: false };
            } else {
                acc[perm] = { grant: false, deny: false };
            }
            return acc;
        }, {}),
        database: {
            "master": databasePermissions.reduce((acc, perm) => {
                if (["CONNECT"].includes(perm)) {
                    acc[perm] = { grant: true, deny: false };
                } else {
                    acc[perm] = { grant: false, deny: false };
                }
                return acc;
            }, {}),
            "userdb": databasePermissions.reduce((acc, perm) => {
                if (["SELECT", "INSERT", "UPDATE", "DELETE", "EXECUTE"].includes(perm)) {
                    acc[perm] = { grant: true, deny: false };
                } else {
                    acc[perm] = { grant: false, deny: false };
                }
                return acc;
            }, {})
        },
        object: {
            "tables": {
                "table1": objectPermissions.tables.reduce((acc, perm) => {
                    if (["SELECT", "INSERT", "UPDATE", "DELETE"].includes(perm)) {
                        acc[perm] = { grant: true, deny: false };
                    } else {
                        acc[perm] = { grant: false, deny: false };
                    }
                    return acc;
                }, {})
            }
        }
    },
    "reporter": {
        server: serverPermissions.reduce((acc, perm) => {
            if (["CONNECT SQL"].includes(perm)) {
                acc[perm] = { grant: true, deny: false };
            } else {
                acc[perm] = { grant: false, deny: false };
            }
            return acc;
        }, {}),
        database: {
            "userdb": databasePermissions.reduce((acc, perm) => {
                if (["SELECT"].includes(perm)) {
                    acc[perm] = { grant: true, deny: false };
                } else {
                    acc[perm] = { grant: false, deny: false };
                }
                return acc;
            }, {})
        },
        object: {
            "tables": {
                "table1": objectPermissions.tables.reduce((acc, perm) => {
                    if (["SELECT"].includes(perm)) {
                        acc[perm] = { grant: true, deny: false };
                    } else {
                        acc[perm] = { grant: false, deny: false };
                    }
                    return acc;
                }, {})
            }
        }
    },
    "guest": {
        server: serverPermissions.reduce((acc, perm) => {
            if (["CONNECT SQL"].includes(perm)) {
                acc[perm] = { grant: true, deny: false };
            } else {
                acc[perm] = { grant: false, deny: false };
            }
            return acc;
        }, {}),
        database: {
            "master": databasePermissions.reduce((acc, perm) => {
                if (["CONNECT"].includes(perm)) {
                    acc[perm] = { grant: true, deny: false };
                } else {
                    acc[perm] = { grant: false, deny: false };
                }
                return acc;
            }, {}),
            "userdb": databasePermissions.reduce((acc, perm) => {
                acc[perm] = { grant: false, deny: false };
                return acc;
            }, {})
        },
        object: {
            "tables": {
                "table1": objectPermissions.tables.reduce((acc, perm) => {
                    acc[perm] = { grant: false, deny: false };
                    return acc;
                }, {})
            }
        }
    }
};

// UI交互变量
let currentUser = "sa";
let currentDatabase = "master";
let currentObjectType = "tables";
let currentObject = "table1";

// 工具函数
function addLogEntry(message) {
    const logContainer = document.getElementById("log-container");
    const logEntry = document.createElement("div");
    logEntry.className = "log-entry";
    logEntry.textContent = message;
    logContainer.prepend(logEntry);
}

// 初始化函数
function initializeApp() {
    loadUserList();
    updatePermissionTables();
    setupEventListeners();
    addLogEntry("系统启动 - 权限管理工具已初始化");
}

// 加载用户列表
function loadUserList() {
    const userList = document.querySelector('.user-list');
    const users = userList.querySelectorAll('.user');
    
    users.forEach(user => {
        user.addEventListener('click', function() {
            const userId = this.getAttribute('data-user');
            selectUser(userId);
        });
    });
}

// 选择用户
function selectUser(userId) {
    const users = document.querySelectorAll('.user');
    users.forEach(user => {
        user.classList.remove('selected');
        if (user.getAttribute('data-user') === userId) {
            user.classList.add('selected');
        }
    });
    
    currentUser = userId;
    updateUserDisplay();
    updatePermissionTables();
    addLogEntry(`已选择用户: ${userId}`);
}

// 更新用户显示
function updateUserDisplay() {
    const userDisplayElement = document.getElementById('selected-user-display');
    const userRolesElement = document.getElementById('user-roles');
    
    // 获取用户名称
    const userElement = document.querySelector(`.user[data-user="${currentUser}"]`);
    const userName = userElement.querySelector('.user-name').textContent;
    
    userDisplayElement.textContent = userName;
    userRolesElement.textContent = userRoles[currentUser].join(', ');
}

// 更新权限表格
function updatePermissionTables() {
    updateServerPermissions();
    updateDatabasePermissions();
    updateObjectPermissions();
}

// 更新服务器权限表格
function updateServerPermissions() {
    const serverPermissionsTable = document.getElementById('server-permissions');
    serverPermissionsTable.innerHTML = '';
    
    serverPermissions.forEach(permission => {
        const row = document.createElement('tr');
        
        const permNameCell = document.createElement('td');
        permNameCell.textContent = permission;
        row.appendChild(permNameCell);
        
        const grantCell = document.createElement('td');
        const grantCheckbox = document.createElement('input');
        grantCheckbox.type = 'checkbox';
        grantCheckbox.checked = userPermissions[currentUser].server[permission].grant;
        grantCheckbox.addEventListener('change', function() {
            userPermissions[currentUser].server[permission].grant = this.checked;
            if (this.checked && userPermissions[currentUser].server[permission].deny) {
                userPermissions[currentUser].server[permission].deny = false;
                updateServerPermissions();
            }
            addLogEntry(`${currentUser}的服务器权限 ${permission} 授予: ${this.checked ? '是' : '否'}`);
        });
        grantCell.appendChild(grantCheckbox);
        row.appendChild(grantCell);
        
        const denyCell = document.createElement('td');
        const denyCheckbox = document.createElement('input');
        denyCheckbox.type = 'checkbox';
        denyCheckbox.checked = userPermissions[currentUser].server[permission].deny;
        denyCheckbox.addEventListener('change', function() {
            userPermissions[currentUser].server[permission].deny = this.checked;
            if (this.checked && userPermissions[currentUser].server[permission].grant) {
                userPermissions[currentUser].server[permission].grant = false;
                updateServerPermissions();
            }
            addLogEntry(`${currentUser}的服务器权限 ${permission} 拒绝: ${this.checked ? '是' : '否'}`);
        });
        denyCell.appendChild(denyCheckbox);
        row.appendChild(denyCell);
        
        serverPermissionsTable.appendChild(row);
    });
}

// 更新数据库权限表格
function updateDatabasePermissions() {
    const dbPermissionsTable = document.getElementById('db-permissions');
    dbPermissionsTable.innerHTML = '';
    
    // 如果用户没有当前选择的数据库权限配置，初始化一个
    if (!userPermissions[currentUser].database[currentDatabase]) {
        userPermissions[currentUser].database[currentDatabase] = {};
        databasePermissions.forEach(perm => {
            userPermissions[currentUser].database[currentDatabase][perm] = { grant: false, deny: false };
        });
    }
    
    databasePermissions.forEach(permission => {
        const row = document.createElement('tr');
        
        const permNameCell = document.createElement('td');
        permNameCell.textContent = permission;
        row.appendChild(permNameCell);
        
        const grantCell = document.createElement('td');
        const grantCheckbox = document.createElement('input');
        grantCheckbox.type = 'checkbox';
        grantCheckbox.checked = userPermissions[currentUser].database[currentDatabase][permission].grant;
        grantCheckbox.addEventListener('change', function() {
            userPermissions[currentUser].database[currentDatabase][permission].grant = this.checked;
            if (this.checked && userPermissions[currentUser].database[currentDatabase][permission].deny) {
                userPermissions[currentUser].database[currentDatabase][permission].deny = false;
                updateDatabasePermissions();
            }
            addLogEntry(`${currentUser}在数据库${currentDatabase}的权限 ${permission} 授予: ${this.checked ? '是' : '否'}`);
        });
        grantCell.appendChild(grantCheckbox);
        row.appendChild(grantCell);
        
        const denyCell = document.createElement('td');
        const denyCheckbox = document.createElement('input');
        denyCheckbox.type = 'checkbox';
        denyCheckbox.checked = userPermissions[currentUser].database[currentDatabase][permission].deny;
        denyCheckbox.addEventListener('change', function() {
            userPermissions[currentUser].database[currentDatabase][permission].deny = this.checked;
            if (this.checked && userPermissions[currentUser].database[currentDatabase][permission].grant) {
                userPermissions[currentUser].database[currentDatabase][permission].grant = false;
                updateDatabasePermissions();
            }
            addLogEntry(`${currentUser}在数据库${currentDatabase}的权限 ${permission} 拒绝: ${this.checked ? '是' : '否'}`);
        });
        denyCell.appendChild(denyCheckbox);
        row.appendChild(denyCell);
        
        dbPermissionsTable.appendChild(row);
    });
}

// 更新对象权限表格
function updateObjectPermissions() {
    const objectPermissionsTable = document.getElementById('object-permissions');
    objectPermissionsTable.innerHTML = '';
    
    // 如果该对象类型没有定义该对象
    if (!userPermissions[currentUser].object[currentObjectType]) {
        userPermissions[currentUser].object[currentObjectType] = {};
    }
    
    // 如果该对象没有权限定义
    if (!userPermissions[currentUser].object[currentObjectType][currentObject]) {
        userPermissions[currentUser].object[currentObjectType][currentObject] = {};
        objectPermissions[currentObjectType].forEach(perm => {
            userPermissions[currentUser].object[currentObjectType][currentObject][perm] = { grant: false, deny: false };
        });
    }
    
    objectPermissions[currentObjectType].forEach(permission => {
        const row = document.createElement('tr');
        
        const permNameCell = document.createElement('td');
        permNameCell.textContent = permission;
        row.appendChild(permNameCell);
        
        const grantCell = document.createElement('td');
        const grantCheckbox = document.createElement('input');
        grantCheckbox.type = 'checkbox';
        grantCheckbox.checked = userPermissions[currentUser].object[currentObjectType][currentObject][permission].grant;
        grantCheckbox.addEventListener('change', function() {
            userPermissions[currentUser].object[currentObjectType][currentObject][permission].grant = this.checked;
            if (this.checked && userPermissions[currentUser].object[currentObjectType][currentObject][permission].deny) {
                userPermissions[currentUser].object[currentObjectType][currentObject][permission].deny = false;
                updateObjectPermissions();
            }
            addLogEntry(`${currentUser}对${currentObjectType}:${currentObject}的权限 ${permission} 授予: ${this.checked ? '是' : '否'}`);
        });
        grantCell.appendChild(grantCheckbox);
        row.appendChild(grantCell);
        
        const denyCell = document.createElement('td');
        const denyCheckbox = document.createElement('input');
        denyCheckbox.type = 'checkbox';
        denyCheckbox.checked = userPermissions[currentUser].object[currentObjectType][currentObject][permission].deny;
        denyCheckbox.addEventListener('change', function() {
            userPermissions[currentUser].object[currentObjectType][currentObject][permission].deny = this.checked;
            if (this.checked && userPermissions[currentUser].object[currentObjectType][currentObject][permission].grant) {
                userPermissions[currentUser].object[currentObjectType][currentObject][permission].grant = false;
                updateObjectPermissions();
            }
            addLogEntry(`${currentUser}对${currentObjectType}:${currentObject}的权限 ${permission} 拒绝: ${this.checked ? '是' : '否'}`);
        });
        denyCell.appendChild(denyCheckbox);
        row.appendChild(denyCell);
        
        objectPermissionsTable.appendChild(row);
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 数据库选择下拉框
    const databaseSelect = document.getElementById('database-select');
    databaseSelect.addEventListener('change', function() {
        currentDatabase = this.value;
        updateDatabasePermissions();
        addLogEntry(`已选择数据库: ${currentDatabase}`);
    });
    
    // 对象类型选择下拉框
    const objectTypeSelect = document.getElementById('object-type-select');
    objectTypeSelect.addEventListener('change', function() {
        currentObjectType = this.value;
        updateObjectSelect();
        updateObjectPermissions();
        addLogEntry(`已选择对象类型: ${currentObjectType}`);
    });
    
    // 对象选择下拉框
    const objectSelect = document.getElementById('object-select');
    objectSelect.addEventListener('change', function() {
        currentObject = this.value;
        updateObjectPermissions();
        addLogEntry(`已选择对象: ${currentObject}`);
    });
    
    // 重置权限按钮
    const resetPermissionsBtn = document.getElementById('reset-permissions-btn');
    resetPermissionsBtn.addEventListener('click', function() {
        resetUserPermissions();
        addLogEntry(`已重置用户 ${currentUser} 的权限设置`);
    });
    
    // 保存权限按钮
    const savePermissionsBtn = document.getElementById('save-permissions-btn');
    savePermissionsBtn.addEventListener('click', function() {
        addLogEntry(`已保存用户 ${currentUser} 的权限设置`);
        alert('权限设置已保存！');
    });
    
    // 添加用户按钮
    const addUserBtn = document.getElementById('add-user-btn');
    addUserBtn.addEventListener('click', function() {
        showAddUserModal();
    });
    
    // 编辑角色按钮
    const editRoleBtn = document.getElementById('edit-role-btn');
    editRoleBtn.addEventListener('click', function() {
        showEditRoleModal();
    });
    
    // 模态框关闭按钮
    const closeBtn = document.querySelector('.close-btn');
    closeBtn.addEventListener('click', function() {
        hideModal();
    });
    
    // 模态框取消按钮
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    modalCancelBtn.addEventListener('click', function() {
        hideModal();
    });
    
    // 模态框确认按钮
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    modalConfirmBtn.addEventListener('click', function() {
        const modalTitle = document.getElementById('modal-title').textContent;
        if (modalTitle === '添加用户') {
            addNewUser();
        } else if (modalTitle === '编辑角色') {
            saveUserRoles();
        }
        hideModal();
    });
}

// 更新对象选择下拉框
function updateObjectSelect() {
    const objectSelect = document.getElementById('object-select');
    objectSelect.innerHTML = '';
    
    let objects = [];
    
    if (currentObjectType === 'tables') {
        objects = ['客户表', '订单表', '产品表'];
    } else if (currentObjectType === 'views') {
        objects = ['客户视图', '订单视图', '销售统计视图'];
    } else if (currentObjectType === 'procedures') {
        objects = ['添加客户', '更新订单', '处理支付'];
    } else if (currentObjectType === 'functions') {
        objects = ['计算折扣', '验证Email', '获取客户信息'];
    }
    
    objects.forEach((obj, index) => {
        const option = document.createElement('option');
        option.value = `${currentObjectType}${index + 1}`;
        option.textContent = obj;
        objectSelect.appendChild(option);
    });
    
    currentObject = objectSelect.value;
}

// 重置用户权限
function resetUserPermissions() {
    // 重置服务器权限
    serverPermissions.forEach(permission => {
        if (currentUser === 'sa') {
            userPermissions[currentUser].server[permission].grant = true;
            userPermissions[currentUser].server[permission].deny = false;
        } else if (currentUser === 'dbadmin' && ["ALTER ANY DATABASE", "ALTER ANY LOGIN", "CREATE ANY DATABASE", "VIEW ANY DATABASE"].includes(permission)) {
            userPermissions[currentUser].server[permission].grant = true;
            userPermissions[currentUser].server[permission].deny = false;
        } else if ((currentUser === 'developer' || currentUser === 'reporter' || currentUser === 'guest') && permission === "CONNECT SQL") {
            userPermissions[currentUser].server[permission].grant = true;
            userPermissions[currentUser].server[permission].deny = false;
        } else {
            userPermissions[currentUser].server[permission].grant = false;
            userPermissions[currentUser].server[permission].deny = false;
        }
    });
    
    // 重置数据库权限
    Object.keys(userPermissions[currentUser].database).forEach(db => {
        databasePermissions.forEach(permission => {
            if (currentUser === 'sa') {
                userPermissions[currentUser].database[db][permission].grant = true;
                userPermissions[currentUser].database[db][permission].deny = false;
            } else if (currentUser === 'dbadmin' && db === 'userdb') {
                userPermissions[currentUser].database[db][permission].grant = true;
                userPermissions[currentUser].database[db][permission].deny = false;
            } else if (currentUser === 'developer' && db === 'userdb' && ["SELECT", "INSERT", "UPDATE", "DELETE", "EXECUTE"].includes(permission)) {
                userPermissions[currentUser].database[db][permission].grant = true;
                userPermissions[currentUser].database[db][permission].deny = false;
            } else if (currentUser === 'reporter' && db === 'userdb' && permission === "SELECT") {
                userPermissions[currentUser].database[db][permission].grant = true;
                userPermissions[currentUser].database[db][permission].deny = false;
            } else if (permission === "CONNECT" && db === "master") {
                userPermissions[currentUser].database[db][permission].grant = true;
                userPermissions[currentUser].database[db][permission].deny = false;
            } else {
                userPermissions[currentUser].database[db][permission].grant = false;
                userPermissions[currentUser].database[db][permission].deny = false;
            }
        });
    });
    
    // 重置对象权限
    Object.keys(userPermissions[currentUser].object).forEach(objType => {
        Object.keys(userPermissions[currentUser].object[objType]).forEach(obj => {
            objectPermissions[objType].forEach(permission => {
                if (currentUser === 'sa') {
                    userPermissions[currentUser].object[objType][obj][permission].grant = true;
                    userPermissions[currentUser].object[objType][obj][permission].deny = false;
                } else if (currentUser === 'dbadmin') {
                    userPermissions[currentUser].object[objType][obj][permission].grant = true;
                    userPermissions[currentUser].object[objType][obj][permission].deny = false;
                } else if (currentUser === 'developer' && ["SELECT", "INSERT", "UPDATE", "DELETE"].includes(permission)) {
                    userPermissions[currentUser].object[objType][obj][permission].grant = true;
                    userPermissions[currentUser].object[objType][obj][permission].deny = false;
                } else if (currentUser === 'reporter' && permission === "SELECT") {
                    userPermissions[currentUser].object[objType][obj][permission].grant = true;
                    userPermissions[currentUser].object[objType][obj][permission].deny = false;
                } else {
                    userPermissions[currentUser].object[objType][obj][permission].grant = false;
                    userPermissions[currentUser].object[objType][obj][permission].deny = false;
                }
            });
        });
    });
    
    updatePermissionTables();
}

// 显示添加用户模态框
function showAddUserModal() {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = '添加用户';
    
    modalBody.innerHTML = `
        <div class="form-group">
            <label for="new-user-name">用户名:</label>
            <input type="text" id="new-user-name" placeholder="输入新用户名">
        </div>
        <div class="form-group">
            <label for="new-user-role">角色:</label>
            <select id="new-user-role" multiple>
                <option value="sysadmin">系统管理员 (sysadmin)</option>
                <option value="db_owner">数据库所有者 (db_owner)</option>
                <option value="securityadmin">安全管理员 (securityadmin)</option>
                <option value="db_datareader">数据库读取者 (db_datareader)</option>
                <option value="db_datawriter">数据库写入者 (db_datawriter)</option>
                <option value="public">公共角色 (public)</option>
            </select>
            <div class="hint">按住 Ctrl 键可多选</div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// 显示编辑角色模态框
function showEditRoleModal() {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = '编辑角色';
    
    const currentRoles = userRoles[currentUser];
    
    modalBody.innerHTML = `
        <div class="form-group">
            <label>用户: ${document.getElementById('selected-user-display').textContent}</label>
        </div>
        <div class="form-group">
            <label for="edit-user-role">角色:</label>
            <select id="edit-user-role" multiple>
                <option value="sysadmin" ${currentRoles.includes('sysadmin') ? 'selected' : ''}>系统管理员 (sysadmin)</option>
                <option value="db_owner" ${currentRoles.includes('db_owner') ? 'selected' : ''}>数据库所有者 (db_owner)</option>
                <option value="securityadmin" ${currentRoles.includes('securityadmin') ? 'selected' : ''}>安全管理员 (securityadmin)</option>
                <option value="db_datareader" ${currentRoles.includes('db_datareader') ? 'selected' : ''}>数据库读取者 (db_datareader)</option>
                <option value="db_datawriter" ${currentRoles.includes('db_datawriter') ? 'selected' : ''}>数据库写入者 (db_datawriter)</option>
                <option value="public" ${currentRoles.includes('public') ? 'selected' : ''}>公共角色 (public)</option>
            </select>
            <div class="hint">按住 Ctrl 键可多选</div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// 隐藏模态框
function hideModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

// 添加新用户
function addNewUser() {
    const newUserName = document.getElementById('new-user-name').value.trim();
    const newUserRoleSelect = document.getElementById('new-user-role');
    const selectedRoles = Array.from(newUserRoleSelect.selectedOptions).map(option => option.value);
    
    if (!newUserName) {
        alert('请输入用户名!');
        return;
    }
    
    if (selectedRoles.length === 0) {
        alert('请至少选择一个角色!');
        return;
    }
    
    const userId = newUserName.toLowerCase().replace(/\s+/g, '_');
    
    // 检查用户是否已存在
    if (userRoles[userId]) {
        alert('该用户已存在!');
        return;
    }
    
    // 创建新用户
    userRoles[userId] = selectedRoles;
    
    // 初始化用户权限
    userPermissions[userId] = {
        server: serverPermissions.reduce((acc, perm) => {
            acc[perm] = { grant: false, deny: false };
            return acc;
        }, {}),
        database: {
            "master": databasePermissions.reduce((acc, perm) => {
                acc[perm] = { grant: false, deny: false };
                return acc;
            }, {}),
            "userdb": databasePermissions.reduce((acc, perm) => {
                acc[perm] = { grant: false, deny: false };
                return acc;
            }, {})
        },
        object: {
            "tables": {
                "table1": objectPermissions.tables.reduce((acc, perm) => {
                    acc[perm] = { grant: false, deny: false };
                    return acc;
                }, {})
            }
        }
    };
    
    // 添加用户到列表
    const userList = document.querySelector('.user-list');
    const newUserElement = document.createElement('div');
    newUserElement.className = 'user';
    newUserElement.setAttribute('data-user', userId);
    newUserElement.innerHTML = `
        <span class="user-icon">👤</span>
        <span class="user-name">${newUserName}</span>
    `;
    newUserElement.addEventListener('click', function() {
        selectUser(userId);
    });
    userList.appendChild(newUserElement);
    
    addLogEntry(`已添加新用户: ${newUserName}`);
    selectUser(userId);
}

// 保存用户角色
function saveUserRoles() {
    const editUserRoleSelect = document.getElementById('edit-user-role');
    const selectedRoles = Array.from(editUserRoleSelect.selectedOptions).map(option => option.value);
    
    if (selectedRoles.length === 0) {
        alert('请至少选择一个角色!');
        return;
    }
    
    userRoles[currentUser] = selectedRoles;
    updateUserDisplay();
    addLogEntry(`已更新用户 ${currentUser} 的角色: ${selectedRoles.join(', ')}`);
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initializeApp); 