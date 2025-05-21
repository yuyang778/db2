// 示例数据表
const tables = {
    Students: [
        { id: 1, name: '张三', age: 20, major: '计算机科学' },
        { id: 2, name: '李四', age: 22, major: '数据科学' },
        { id: 3, name: '王五', age: 19, major: '软件工程' },
        { id: 4, name: '赵六', age: 21, major: '计算机科学' },
        { id: 5, name: '钱七', age: 20, major: '人工智能' },
        { id: 6, name: '孙八', age: 23, major: '数据科学' },
        { id: 7, name: '周九', age: 22, major: '软件工程' },
        { id: 8, name: '吴十', age: 19, major: '人工智能' }
    ],
    
    Courses: [
        { id: 101, name: '数据库原理', credit: 4, teacher: '张教授' },
        { id: 102, name: '操作系统', credit: 3, teacher: '李教授' },
        { id: 103, name: '数据结构', credit: 4, teacher: '王教授' },
        { id: 104, name: '计算机网络', credit: 3, teacher: '赵教授' },
        { id: 105, name: '软件工程', credit: 3, teacher: '钱教授' }
    ],
    
    Enrollment: [
        { student_id: 1, course_id: 101, grade: 85 },
        { student_id: 1, course_id: 102, grade: 90 },
        { student_id: 2, course_id: 101, grade: 78 },
        { student_id: 2, course_id: 103, grade: 88 },
        { student_id: 3, course_id: 102, grade: 92 },
        { student_id: 3, course_id: 104, grade: 95 },
        { student_id: 4, course_id: 103, grade: 80 },
        { student_id: 4, course_id: 105, grade: 75 },
        { student_id: 5, course_id: 101, grade: 93 },
        { student_id: 5, course_id: 104, grade: 89 },
        { student_id: 6, course_id: 102, grade: 82 },
        { student_id: 6, course_id: 105, grade: 87 },
        { student_id: 7, course_id: 103, grade: 94 },
        { student_id: 7, course_id: 104, grade: 91 },
        { student_id: 8, course_id: 101, grade: 79 },
        { student_id: 8, course_id: 105, grade: 86 }
    ]
};

// 表结构元数据
const tableSchema = {
    Students: ['id', 'name', 'age', 'major'],
    Courses: ['id', 'name', 'credit', 'teacher'],
    Enrollment: ['student_id', 'course_id', 'grade']
};

// 导出数据和元数据
window.dbData = {
    tables,
    tableSchema
}; 