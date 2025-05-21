/**
 * SQL Server错误模拟和调试工具
 * 用于教学目的，模拟并解释常见SQL Server错误
 */

// 预设错误场景
const errorScenarios = {
    // 语法错误
    syntax: {
        query: 'SELCT * FROM Users',
        errorType: 'syntax',
        errorMessage: '语法错误，近 \'Users\'。关键字 SELCT 无效。',
        diagnosis: '在SQL语句中存在语法错误。正确的关键字应该是 SELECT 而不是 SELCT。',
        solution: '修改SQL语句，将 SELCT 更正为 SELECT。',
        correctQuery: 'SELECT * FROM Users',
        resources: [
            { title: 'SQL Server SELECT语句语法', url: 'https://docs.microsoft.com/zh-cn/sql/t-sql/queries/select-transact-sql' },
            { title: 'SQL语法基础', url: 'https://www.w3schools.com/sql/sql_syntax.asp' }
        ]
    },
    
    // 数据类型不匹配
    datatype: {
        query: "INSERT INTO Users (UserID, Username, Email, Age, RegisterDate) VALUES (6, '陈八', 'chenba@example.com', 'thirty', '2023-08-01')",
        errorType: 'datatype',
        errorMessage: "无法将 'thirty' 转换为 int 类型。",
        diagnosis: '在INSERT语句中，Age列的数据类型应为整数(int)，但提供的值是字符串 \'thirty\'。',
        solution: '将Age列的值改为数字，如 30，而不是文本 \'thirty\'。',
        correctQuery: "INSERT INTO Users (UserID, Username, Email, Age, RegisterDate) VALUES (6, '陈八', 'chenba@example.com', 30, '2023-08-01')",
        resources: [
            { title: 'SQL Server数据类型', url: 'https://docs.microsoft.com/zh-cn/sql/t-sql/data-types/data-types-transact-sql' },
            { title: 'SQL INSERT语句', url: 'https://www.w3schools.com/sql/sql_insert.asp' }
        ]
    },
    
    // 违反约束
    constraint: {
        query: "INSERT INTO Users (UserID, Username, Email, Age, RegisterDate) VALUES (1, '张三重复', 'zhangsan@example.com', 25, '2023-08-15')",
        errorType: 'constraint',
        errorMessage: "违反了 PRIMARY KEY 约束 'PK_Users'。不能在对象 'dbo.Users' 中插入重复键。重复键值为 (1)。",
        diagnosis: '此INSERT语句尝试插入一个UserID为1的记录，但该ID已存在于表中，违反了主键约束。',
        solution: '使用不同的UserID值，或者让系统自动生成ID（如果该列配置为自增列）。',
        correctQuery: "INSERT INTO Users (UserID, Username, Email, Age, RegisterDate) VALUES (6, '张三重复', 'zhangsan_new@example.com', 25, '2023-08-15')",
        resources: [
            { title: 'SQL Server约束', url: 'https://docs.microsoft.com/zh-cn/sql/relational-databases/tables/create-primary-keys' },
            { title: '主键和外键约束', url: 'https://www.w3schools.com/sql/sql_primarykey.asp' }
        ]
    },
    
    // 连接错误
    connection: {
        query: "SELECT * FROM Products",
        errorType: 'connection',
        errorMessage: "连接错误: 数据库连接已断开或无法建立连接到SQL Server。",
        diagnosis: '无法连接到数据库服务器。可能是网络问题、服务器已关闭或连接字符串错误。',
        solution: '检查网络连接、确认服务器是否运行、验证连接字符串和凭据是否正确。',
        correctQuery: "-- 首先确保数据库连接正常，然后执行：\nSELECT * FROM Products",
        resources: [
            { title: 'SQL Server连接问题排查', url: 'https://docs.microsoft.com/zh-cn/sql/database-engine/configure-windows/troubleshoot-connecting-to-the-sql-server-database-engine' },
            { title: '连接字符串格式', url: 'https://docs.microsoft.com/zh-cn/dotnet/framework/data/adonet/connection-strings' }
        ]
    },
    
    // 表名错误
    tablename: {
        query: "SELECT * FROM User",
        errorType: 'tablename',
        errorMessage: "表错误: 表 'User' 不存在",
        diagnosis: '查询中引用了不存在的表名。正确的表名应为 \'Users\' (复数形式)。',
        solution: '修改SQL语句，将表名 User 更正为 Users。',
        correctQuery: "SELECT * FROM Users",
        resources: [
            { title: 'SQL Server对象命名规则', url: 'https://docs.microsoft.com/zh-cn/sql/relational-databases/databases/database-identifiers' },
            { title: 'SQL基础查询', url: 'https://www.w3schools.com/sql/sql_select.asp' }
        ]
    },
    
    // JOIN错误
    join: {
        query: "SELECT Users.Username, Orders.OrderID FROM Users, Orders",
        errorType: 'join',
        errorMessage: "未指定连接条件，将产生笛卡尔积结果集。这可能不是您的意图。",
        diagnosis: '此查询执行了两个表的笛卡尔积连接，因为没有指定连接条件。这会产生大量无意义的数据组合。',
        solution: '添加适当的JOIN条件，如 WHERE Users.UserID = Orders.UserID 或使用明确的JOIN语法。',
        correctQuery: "SELECT Users.Username, Orders.OrderID FROM Users JOIN Orders ON Users.UserID = Orders.UserID",
        resources: [
            { title: 'SQL JOIN语法', url: 'https://docs.microsoft.com/zh-cn/sql/t-sql/queries/from-transact-sql' },
            { title: 'SQL连接类型', url: 'https://www.w3schools.com/sql/sql_join.asp' }
        ]
    },
    
    // 自定义查询（初始为空）
    custom: {
        query: "",
        errorType: null,
        errorMessage: "",
        diagnosis: "",
        solution: "",
        correctQuery: "",
        resources: []
    }
};

// 常见SQL Server错误类型说明
const errorTypesExplanation = {
    syntax: {
        title: '语法错误',
        description: '语法错误通常是由于SQL语句中的拼写错误、关键字错误、缺少括号、逗号或其他语法元素导致的。',
        commonCauses: [
            '关键字拼写错误（如SELCT而不是SELECT）',
            '缺少或额外的括号、逗号、引号',
            '子句顺序错误（如WHERE放在GROUP BY之后）',
            '使用了SQL Server不支持的语法'
        ],
        debugTips: [
            '仔细检查SQL关键字的拼写',
            '确保括号、引号和其他分隔符配对完整',
            '检查SQL语句的基本结构和子句顺序',
            '使用SQL Server支持的特定语法'
        ]
    },
    
    datatype: {
        title: '数据类型不匹配',
        description: '当尝试将一个值插入到不兼容数据类型的列中，或在条件比较中比较不兼容的数据类型时，会发生数据类型错误。',
        commonCauses: [
            '向数字列插入文本值',
            '向日期列插入格式不正确的日期字符串',
            '在WHERE条件中比较不同类型的值',
            '数据截断（如向VARCHAR(10)列插入超过10个字符的值）'
        ],
        debugTips: [
            '确认表结构中每列的数据类型',
            '使用适当的数据类型转换函数（如CAST或CONVERT）',
            '确保字符串值用单引号括起来，数字值不需要引号',
            '日期值使用标准格式并用单引号括起来（如\'YYYY-MM-DD\'）'
        ]
    },
    
    constraint: {
        title: '违反约束',
        description: '约束错误发生在数据操作违反表定义的约束条件时，如主键、外键、唯一约束或CHECK约束。',
        commonCauses: [
            '插入重复的主键值',
            '插入一个在父表中不存在的外键值',
            '插入NULL值到非NULL列',
            '插入不满足CHECK约束条件的值'
        ],
        debugTips: [
            '了解表的约束条件',
            '插入前检查主键值是否已存在',
            '外键值操作前确保在父表中存在',
            '对有唯一约束的列检查重复值',
            '检查NOT NULL列确保提供了值'
        ]
    },
    
    connection: {
        title: '连接错误',
        description: '连接错误发生在客户端应用程序无法建立或维持与SQL Server的连接时。',
        commonCauses: [
            'SQL Server服务未运行',
            '网络连接问题',
            '防火墙阻止连接',
            '连接字符串错误（服务器名称、认证方式、数据库名称等）',
            '登录凭据无效'
        ],
        debugTips: [
            '确认SQL Server服务正在运行',
            '检查网络连接和防火墙设置',
            '验证连接字符串的各个部分',
            '确认用户名和密码正确',
            '检查SQL Server是否配置了允许远程连接'
        ]
    },
    
    tablename: {
        title: '表名错误',
        description: '表名错误发生在查询引用了数据库中不存在的表时。这通常是由于拼写错误、表名大小写敏感（依赖于配置）或表未创建导致的。',
        commonCauses: [
            '表名拼写错误',
            '使用了错误的单复数形式（如User而不是Users）',
            '使用了错误的大小写（在区分大小写的配置中）',
            '表存在于不同的架构中，但未指定架构名'
        ],
        debugTips: [
            '检查表名的准确拼写',
            '确认表是否已创建或是否有访问权限',
            '在不确定时使用带架构名的完整表名（如dbo.Users）',
            '查询系统表检查数据库中的实际表名'
        ]
    },
    
    join: {
        title: 'JOIN错误',
        description: 'JOIN错误通常发生在多表查询中，当表之间的关系未正确定义或表之间没有指定连接条件时。这可能导致笛卡尔积（交叉连接）或空结果集。',
        commonCauses: [
            '未指定JOIN条件，导致笛卡尔积',
            'JOIN条件中列数据类型不匹配',
            '使用错误的JOIN类型（如应使用LEFT JOIN时使用INNER JOIN）',
            '连接条件使用了不存在的列'
        ],
        debugTips: [
            '确保每个JOIN操作都有明确的ON条件',
            '检查连接条件中的列是否有相同的数据类型',
            '根据需要的结果选择适当的JOIN类型',
            '在复杂查询中使用表别名提高可读性'
        ]
    }
};

// 错误调试助手
class SQLErrorDebugger {
    constructor() {
        this.currentError = null;
    }
    
    // 分析错误并提供诊断
    analyzeError(error, query) {
        if (!error) return null;
        
        // 简单的错误类型匹配
        let errorType = 'unknown';
        
        if (error.message.includes('语法错误') || error.message.includes('关键字无效')) {
            errorType = 'syntax';
        } else if (error.message.includes('转换') || error.message.includes('数据类型')) {
            errorType = 'datatype';
        } else if (error.message.includes('约束') || error.message.includes('主键') || 
                   error.message.includes('外键') || error.message.includes('NULL')) {
            errorType = 'constraint';
        } else if (error.message.includes('连接') || error.message.includes('网络') || 
                   error.message.includes('服务器')) {
            errorType = 'connection';
        } else if (error.message.includes('表') && error.message.includes('不存在')) {
            errorType = 'tablename';
        } else if (error.message.includes('笛卡尔积') || error.message.includes('JOIN')) {
            errorType = 'join';
        }
        
        this.currentError = {
            type: errorType,
            message: error.message,
            query: query
        };
        
        return this.currentError;
    }
    
    // 获取错误诊断
    getDiagnosis() {
        if (!this.currentError) return '';
        
        const errorType = this.currentError.type;
        if (errorTypesExplanation[errorType]) {
            return `
                <h4>${errorTypesExplanation[errorType].title}</h4>
                <p>${errorTypesExplanation[errorType].description}</p>
                <p>错误信息: ${this.currentError.message}</p>
                <p>查询: <code>${this.currentError.query}</code></p>
            `;
        }
        
        return `<p>未能识别的错误类型: ${this.currentError.message}</p>`;
    }
    
    // 获取解决方案提示
    getSolutionHints() {
        if (!this.currentError) return '';
        
        const errorType = this.currentError.type;
        if (errorTypesExplanation[errorType]) {
            let hints = `<h4>常见原因:</h4><ul>`;
            
            errorTypesExplanation[errorType].commonCauses.forEach(cause => {
                hints += `<li>${cause}</li>`;
            });
            
            hints += `</ul><h4>调试提示:</h4><ul>`;
            
            errorTypesExplanation[errorType].debugTips.forEach(tip => {
                hints += `<li>${tip}</li>`;
            });
            
            hints += `</ul>`;
            return hints;
        }
        
        return '<p>暂无相关解决方案提示</p>';
    }
    
    // 获取学习资源
    getLearningResources() {
        if (!this.currentError) return '';
        
        const errorType = this.currentError.type;
        if (errorScenarios[errorType]) {
            let resources = `<ul>`;
            
            errorScenarios[errorType].resources.forEach(resource => {
                resources += `<li><a href="${resource.url}" target="_blank">${resource.title}</a></li>`;
            });
            
            resources += `</ul>`;
            return resources;
        }
        
        return '<p>暂无相关学习资源</p>';
    }
    
    // 获取正确的查询
    getCorrectQuery(scenarioKey) {
        if (errorScenarios[scenarioKey]) {
            return errorScenarios[scenarioKey].correctQuery;
        }
        return '';
    }
}

// 导出模拟的错误和调试工具
window.SQLErrorSimulator = {
    errorScenarios,
    errorTypesExplanation,
    SQLErrorDebugger,
    
    // 获取错误场景
    getErrorScenario(key) {
        return errorScenarios[key] || null;
    },
    
    // 获取所有错误场景键
    getErrorScenarioKeys() {
        return Object.keys(errorScenarios);
    },
    
    // 自定义错误场景
    setCustomScenario(query, errorType, errorMessage) {
        errorScenarios.custom.query = query;
        errorScenarios.custom.errorType = errorType;
        errorScenarios.custom.errorMessage = errorMessage;
    }
}; 