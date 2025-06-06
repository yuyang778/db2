# 关系代数交互沙盒

## 项目介绍

这是一个用于数据库原理与应用课程教学的交互式工具，旨在帮助学生学习关系代数概念。学生可以通过拖拽字段和运算符来构建查询，并实时查看SQL等价表示、查询树和结果表。

## 主要功能

- **可视化关系代数运算符**：σ(选择)、π(投影)、⋈(连接)、∪(并集)、∩(交集)、-(差集)
- **拖拽式查询构建**：学生可以通过拖拽字段和运算符到查询区域构建查询
- **实时查询结果**：显示查询的SQL等价表示、查询树和结果表

## 使用方法

1. 打开 `index.html` 文件
2. 从左侧的数据表中拖拽字段到查询区域
3. 从顶部的运算符列表中拖拽运算符到查询区域
4. 点击运算符可以设置条件（例如 σ 运算符需要设置选择条件）
5. 点击"执行查询"按钮查看结果
6. 点击"清除"按钮重新开始

## 数据表说明

系统中内置了三个示例数据表：

1. **Students**（学生表）
   - id: 学生ID
   - name: 学生姓名
   - age: 年龄
   - major: 专业

2. **Courses**（课程表）
   - id: 课程ID
   - name: 课程名称
   - credit: 学分
   - teacher: 教师

3. **Enrollment**（选课表）
   - student_id: 学生ID
   - course_id: 课程ID
   - grade: 成绩

## 示例查询

1. **查询年龄大于20岁的学生**
   - 拖拽 σ(选择) 运算符到查询区域
   - 点击 σ 设置条件为 `age > 20`
   - 拖拽 Students 表的字段到查询区域
   - 点击"执行查询"按钮

2. **查询所有学生的姓名和专业**
   - 拖拽 π(投影) 运算符到查询区域
   - 点击 π 设置投影字段为 `Students.name, Students.major`
   - 拖拽 Students 表到查询区域
   - 点击"执行查询"按钮

3. **查询学生及其选修课程**
   - 拖拽 ⋈(连接) 运算符到查询区域
   - 点击 ⋈ 设置连接条件为 `Students.id = Enrollment.student_id`
   - 点击"执行查询"按钮

## 项目结构

- `index.html`：主页面
- `css/style.css`：样式文件
- `js/data.js`：示例数据
- `js/drag-drop.js`：拖拽功能
- `js/query-builder.js`：查询构建器
- `js/query-executor.js`：查询执行器
- `js/main.js`：主脚本文件

## 技术说明

本项目使用纯 HTML、CSS 和 JavaScript 实现，无需任何外部依赖，可以在任何现代浏览器中运行。

## 适用场景

- 数据库原理与应用课程教学
- 关系代数概念学习
- SQL查询语句学习 