/**
 * 模拟SQL Server数据库环境
 * 用于教学目的，模拟数据库操作和常见错误
 */

// 模拟数据库表结构和数据
const database = {
    // 用户表
    Users: [
        { UserID: 1, Username: '张三', Email: 'zhangsan@example.com', Age: 25, RegisterDate: '2023-01-15' },
        { UserID: 2, Username: '李四', Email: 'lisi@example.com', Age: 30, RegisterDate: '2023-02-20' },
        { UserID: 3, Username: '王五', Email: 'wangwu@example.com', Age: 22, RegisterDate: '2023-03-10' },
        { UserID: 4, Username: '赵六', Email: 'zhaoliu@example.com', Age: 28, RegisterDate: '2023-04-05' },
        { UserID: 5, Username: '孙七', Email: 'sunqi@example.com', Age: 35, RegisterDate: '2023-05-12' }
    ],
    
    // 产品表
    Products: [
        { ProductID: 101, ProductName: '笔记本电脑', Price: 5999.00, Category: '电子产品', Stock: 50 },
        { ProductID: 102, ProductName: '智能手机', Price: 3999.00, Category: '电子产品', Stock: 100 },
        { ProductID: 103, ProductName: '耳机', Price: 299.00, Category: '配件', Stock: 200 },
        { ProductID: 104, ProductName: '鼠标', Price: 99.00, Category: '配件', Stock: 150 },
        { ProductID: 105, ProductName: '键盘', Price: 199.00, Category: '配件', Stock: 80 }
    ],
    
    // 订单表
    Orders: [
        { OrderID: 1001, UserID: 1, OrderDate: '2023-06-10', TotalAmount: 6298.00, Status: '已完成' },
        { OrderID: 1002, UserID: 2, OrderDate: '2023-06-15', TotalAmount: 3999.00, Status: '处理中' },
        { OrderID: 1003, UserID: 3, OrderDate: '2023-06-20', TotalAmount: 598.00, Status: '已完成' },
        { OrderID: 1004, UserID: 1, OrderDate: '2023-06-25', TotalAmount: 4098.00, Status: '已完成' },
        { OrderID: 1005, UserID: 4, OrderDate: '2023-07-01', TotalAmount: 99.00, Status: '已取消' }
    ],
    
    // 订单明细表
    OrderDetails: [
        { OrderDetailID: 10001, OrderID: 1001, ProductID: 101, Quantity: 1, UnitPrice: 5999.00 },
        { OrderDetailID: 10002, OrderID: 1001, ProductID: 103, Quantity: 1, UnitPrice: 299.00 },
        { OrderDetailID: 10003, OrderID: 1002, ProductID: 102, Quantity: 1, UnitPrice: 3999.00 },
        { OrderDetailID: 10004, OrderID: 1003, ProductID: 103, Quantity: 1, UnitPrice: 299.00 },
        { OrderDetailID: 10005, OrderID: 1003, ProductID: 104, Quantity: 3, UnitPrice: 99.00 },
        { OrderDetailID: 10006, OrderID: 1004, ProductID: 102, Quantity: 1, UnitPrice: 3999.00 },
        { OrderDetailID: 10007, OrderID: 1004, ProductID: 104, Quantity: 1, UnitPrice: 99.00 },
        { OrderDetailID: 10008, OrderID: 1005, ProductID: 104, Quantity: 1, UnitPrice: 99.00 }
    ]
};

// 表结构定义（用于模拟约束和数据类型）
const tableSchema = {
    Users: {
        UserID: { type: 'int', isPrimary: true, isIdentity: true, nullable: false },
        Username: { type: 'nvarchar(50)', nullable: false },
        Email: { type: 'varchar(100)', nullable: false, isUnique: true },
        Age: { type: 'int', nullable: true },
        RegisterDate: { type: 'date', nullable: false }
    },
    Products: {
        ProductID: { type: 'int', isPrimary: true, isIdentity: true, nullable: false },
        ProductName: { type: 'nvarchar(100)', nullable: false },
        Price: { type: 'decimal(10,2)', nullable: false },
        Category: { type: 'nvarchar(50)', nullable: false },
        Stock: { type: 'int', nullable: false, defaultValue: 0 }
    },
    Orders: {
        OrderID: { type: 'int', isPrimary: true, isIdentity: true, nullable: false },
        UserID: { type: 'int', nullable: false, foreignKey: { table: 'Users', column: 'UserID' } },
        OrderDate: { type: 'date', nullable: false },
        TotalAmount: { type: 'decimal(10,2)', nullable: false },
        Status: { type: 'nvarchar(20)', nullable: false, defaultValue: '处理中' }
    },
    OrderDetails: {
        OrderDetailID: { type: 'int', isPrimary: true, isIdentity: true, nullable: false },
        OrderID: { type: 'int', nullable: false, foreignKey: { table: 'Orders', column: 'OrderID' } },
        ProductID: { type: 'int', nullable: false, foreignKey: { table: 'Products', column: 'ProductID' } },
        Quantity: { type: 'int', nullable: false },
        UnitPrice: { type: 'decimal(10,2)', nullable: false }
    }
};

// 模拟数据库用户权限
const dbUsers = {
    'admin': { role: 'db_owner', canSelect: true, canInsert: true, canUpdate: true, canDelete: true },
    'reader': { role: 'db_datareader', canSelect: true, canInsert: false, canUpdate: false, canDelete: false },
    'editor': { role: 'db_datawriter', canSelect: true, canInsert: true, canUpdate: true, canDelete: false }
};

// 当前登录用户（默认为reader，用于模拟权限错误）
let currentUser = 'reader';

// 模拟SQL解析器
class SQLParser {
    static parseQuery(sql) {
        // 这只是一个非常简单的解析器，仅用于教学演示
        sql = sql.trim();
        
        // 检查基本命令类型
        if (sql.toLowerCase().startsWith('select')) {
            return { type: 'SELECT', query: sql };
        } else if (sql.toLowerCase().startsWith('insert')) {
            return { type: 'INSERT', query: sql };
        } else if (sql.toLowerCase().startsWith('update')) {
            return { type: 'UPDATE', query: sql };
        } else if (sql.toLowerCase().startsWith('delete')) {
            return { type: 'DELETE', query: sql };
        } else if (sql.toLowerCase().startsWith('create')) {
            return { type: 'CREATE', query: sql };
        } else if (sql.toLowerCase().startsWith('alter')) {
            return { type: 'ALTER', query: sql };
        } else if (sql.toLowerCase().startsWith('drop')) {
            return { type: 'DROP', query: sql };
        } else {
            return { type: 'UNKNOWN', query: sql };
        }
    }
}

// 模拟数据库连接
class DBConnection {
    constructor() {
        this.isConnected = false;
        this.lastError = null;
    }
    
    connect() {
        // 模拟成功连接
        this.isConnected = true;
        return { success: true };
    }
    
    disconnect() {
        this.isConnected = false;
        return { success: true };
    }
    
    executeQuery(sql, options = {}) {
        // 模拟连接错误
        if (!this.isConnected && !options.ignoreConnectionState) {
            this.lastError = new Error('连接错误: 数据库连接已断开');
            return { success: false, error: this.lastError };
        }
        
        try {
            const parsedQuery = SQLParser.parseQuery(sql);
            
            // 检查权限
            if (!this.checkPermission(parsedQuery.type)) {
                this.lastError = new Error(`权限错误: 用户 ${currentUser} 没有执行 ${parsedQuery.type} 操作的权限`);
                return { success: false, error: this.lastError };
            }
            
            // 这里只是一个简化的查询执行模拟
            // 在实际的SQL Server中，会有更复杂的执行过程
            return this.simulateQueryExecution(sql, parsedQuery, options);
        } catch (error) {
            this.lastError = error;
            return { success: false, error };
        }
    }
    
    checkPermission(operationType) {
        const user = dbUsers[currentUser];
        if (!user) return false;
        
        switch (operationType) {
            case 'SELECT': return user.canSelect;
            case 'INSERT': return user.canInsert;
            case 'UPDATE': return user.canUpdate;
            case 'DELETE': return user.canDelete;
            default: return false;
        }
    }
    
    simulateQueryExecution(sql, parsedQuery, options) {
        // 如果请求故意触发错误，则返回相应的错误
        if (options.simulateError) {
            switch (options.errorType) {
                case 'syntax':
                    return { 
                        success: false, 
                        error: new Error('语法错误: ' + options.errorMessage || '无效的SQL语法')
                    };
                case 'datatype':
                    return { 
                        success: false, 
                        error: new Error('数据类型错误: ' + options.errorMessage || '数据类型不匹配')
                    };
                case 'constraint':
                    return { 
                        success: false, 
                        error: new Error('约束违反: ' + options.errorMessage || '违反了表约束')
                    };
                case 'permission':
                    return { 
                        success: false, 
                        error: new Error('权限错误: ' + options.errorMessage || '没有足够的权限执行此操作')
                    };
                case 'connection':
                    return { 
                        success: false, 
                        error: new Error('连接错误: ' + options.errorMessage || '无法连接到数据库服务器')
                    };
                default:
                    return { 
                        success: false, 
                        error: new Error('未知错误: ' + options.errorMessage || '执行查询时发生错误')
                    };
            }
        }
        
        // 简单的模拟查询执行
        // 在实际项目中，这里会有真正的SQL解析和执行逻辑
        switch (parsedQuery.type) {
            case 'SELECT':
                return this.simulateSelect(sql);
            case 'INSERT':
            case 'UPDATE':
            case 'DELETE':
                return { success: true, affectedRows: Math.floor(Math.random() * 5) + 1 };
            default:
                return { success: true, message: '命令执行成功' };
        }
    }
    
    // 非常简单的SELECT查询模拟
    simulateSelect(sql) {
        // 从SQL中提取表名（非常简化的版本）
        const tableMatch = sql.match(/from\s+([a-z0-9_]+)/i);
        if (!tableMatch) {
            return { success: false, error: new Error('语法错误: 无法识别表名') };
        }
        
        const tableName = tableMatch[1];
        
        // 检查表是否存在
        if (!database[tableName]) {
            return { success: false, error: new Error(`表错误: 表 '${tableName}' 不存在`) };
        }
        
        // 简单返回表中的所有数据（在实际情况中应该根据WHERE子句等过滤）
        return { 
            success: true, 
            results: database[tableName],
            resultColumns: Object.keys(tableSchema[tableName])
        };
    }
}

// 导出模拟的数据库环境
window.SQLServerSimulator = {
    database,
    tableSchema,
    dbUsers,
    currentUser,
    DBConnection,
    SQLParser,
    
    // 设置当前用户（用于模拟不同权限）
    setCurrentUser(username) {
        if (dbUsers[username]) {
            currentUser = username;
            return true;
        }
        return false;
    },
    
    // 获取当前用户
    getCurrentUser() {
        return { username: currentUser, ...dbUsers[currentUser] };
    }
}; 