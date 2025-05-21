// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化标签页切换功能
    initTabs();
    
    // 初始化视图概念图表
    initViewConceptVisualization();
    
    // 初始化视图动画
    initViewAnimation();
    
    // 初始化视图优势图表
    initViewsBenefitsChart();
    
    // 初始化视图性能比较图表
    initViewPerformanceChart();
    
    // 初始化视图使用场景图表
    initViewUsageChart();
    
    // 初始化SQL练习
    initSqlExercise();
    
    // 初始化测验
    initQuiz();
});

// 初始化标签页切换功能
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 获取对应的标签内容区域ID
            const tabId = this.getAttribute('data-tab');
            
            // 移除所有标签和内容区域的激活状态
            const tabsContainer = this.parentElement;
            const tabContents = tabsContainer.parentElement.querySelectorAll('.tab-content');
            
            tabsContainer.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('active');
            });
            
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // 激活当前标签和对应的内容区域
            this.classList.add('active');
            const activeContent = document.getElementById(tabId);
            if (activeContent) {
                activeContent.classList.add('active');
            }
        });
    });
}

// 初始化视图概念图表
function initViewConceptVisualization() {
    const container = document.getElementById('view-concept-viz');
    if (!container) return;
    
    // 创建视图概念图
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '300');
    container.appendChild(svg);
    
    // 原始表格部分
    const tableG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    tableG.setAttribute('transform', 'translate(50, 30)');
    
    // 表格标题
    const tableTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tableTitle.textContent = '原始表: students';
    tableTitle.setAttribute('x', '0');
    tableTitle.setAttribute('y', '-10');
    tableTitle.setAttribute('font-weight', 'bold');
    tableG.appendChild(tableTitle);
    
    // 表格边框
    const tableRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    tableRect.setAttribute('width', '200');
    tableRect.setAttribute('height', '150');
    tableRect.setAttribute('fill', '#f8f9fa');
    tableRect.setAttribute('stroke', '#dee2e6');
    tableG.appendChild(tableRect);
    
    // 表格列标题
    const columns = ['id', 'name', 'age', 'major'];
    columns.forEach((col, index) => {
        const colText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        colText.textContent = col;
        colText.setAttribute('x', 20 + index * 50);
        colText.setAttribute('y', '20');
        colText.setAttribute('font-weight', 'bold');
        tableG.appendChild(colText);
    });
    
    // 表格数据行
    const rows = [
        [1, 'Alice', 20, 'CS'],
        [2, 'Bob', 22, 'Math'],
        [3, 'Carol', 21, 'CS'],
        [4, 'Dave', 23, 'Physics']
    ];
    
    rows.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            cellText.textContent = cell;
            cellText.setAttribute('x', 20 + colIndex * 50);
            cellText.setAttribute('y', 45 + rowIndex * 25);
            tableG.appendChild(cellText);
        });
    });
    
    svg.appendChild(tableG);
    
    // 箭头连接
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrow.setAttribute('d', 'M280,80 L330,80');
    arrow.setAttribute('stroke', '#1a73e8');
    arrow.setAttribute('stroke-width', '2');
    arrow.setAttribute('marker-end', 'url(#arrowhead)');
    svg.appendChild(arrow);
    
    // 添加箭头标记定义
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
    polygon.setAttribute('fill', '#1a73e8');
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);
    
    // 视图部分
    const viewG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    viewG.setAttribute('transform', 'translate(350, 30)');
    
    // 视图标题
    const viewTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    viewTitle.textContent = '视图: cs_students_view';
    viewTitle.setAttribute('x', '0');
    viewTitle.setAttribute('y', '-10');
    viewTitle.setAttribute('font-weight', 'bold');
    viewG.appendChild(viewTitle);
    
    // 视图边框
    const viewRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    viewRect.setAttribute('width', '150');
    viewRect.setAttribute('height', '75');
    viewRect.setAttribute('fill', '#e6f2ff');
    viewRect.setAttribute('stroke', '#1a73e8');
    viewG.appendChild(viewRect);
    
    // 视图列标题
    const viewColumns = ['name', 'age', 'major'];
    viewColumns.forEach((col, index) => {
        const colText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        colText.textContent = col;
        colText.setAttribute('x', 20 + index * 45);
        colText.setAttribute('y', '20');
        colText.setAttribute('font-weight', 'bold');
        viewG.appendChild(colText);
    });
    
    // 视图数据行 (仅CS专业学生)
    const csRows = [
        ['Alice', 20, 'CS'],
        ['Carol', 21, 'CS']
    ];
    
    csRows.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            cellText.textContent = cell;
            cellText.setAttribute('x', 20 + colIndex * 45);
            cellText.setAttribute('y', 45 + rowIndex * 25);
            viewG.appendChild(cellText);
        });
    });
    
    // SQL语句
    const sqlText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    sqlText.setAttribute('x', '250');
    sqlText.setAttribute('y', '200');
    sqlText.setAttribute('fill', '#666');
    sqlText.setAttribute('font-style', 'italic');
    sqlText.textContent = 'CREATE VIEW cs_students_view AS';
    
    const sqlText2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    sqlText2.setAttribute('x', '250');
    sqlText2.setAttribute('y', '220');
    sqlText2.setAttribute('fill', '#666');
    sqlText2.setAttribute('font-style', 'italic');
    sqlText2.textContent = 'SELECT name, age, major FROM students WHERE major = "CS"';
    
    svg.appendChild(sqlText);
    svg.appendChild(sqlText2);
    svg.appendChild(viewG);
}

// 初始化视图动画
function initViewAnimation() {
    const container = document.getElementById('view-animation-viz');
    if (!container) return;
    
    // 创建画布
    const canvas = document.createElement('canvas');
    canvas.width = container.clientWidth;
    canvas.height = 300;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let animationFrame;
    let animating = false;
    
    // 播放按钮事件
    document.getElementById('play-animation').addEventListener('click', function() {
        if (!animating) {
            animating = true;
            startAnimation();
        }
    });
    
    // 重置按钮事件
    document.getElementById('reset-animation').addEventListener('click', function() {
        animating = false;
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
        drawInitialState();
    });
    
    // 绘制初始状态
    function drawInitialState() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制原始表
        ctx.fillStyle = '#f8f9fa';
        ctx.strokeStyle = '#dee2e6';
        ctx.fillRect(50, 30, 200, 150);
        ctx.strokeRect(50, 30, 200, 150);
        
        // 表格标题
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('原始表: students', 50, 20);
        
        // 表格列标题
        const columns = ['id', 'name', 'age', 'major'];
        columns.forEach((col, index) => {
            ctx.fillText(col, 70 + index * 50, 50);
        });
        
        // 表格数据行
        ctx.font = '14px Arial';
        const rows = [
            [1, 'Alice', 20, 'CS'],
            [2, 'Bob', 22, 'Math'],
            [3, 'Carol', 21, 'CS'],
            [4, 'Dave', 23, 'Physics']
        ];
        
        rows.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                ctx.fillText(cell.toString(), 70 + colIndex * 50, 75 + rowIndex * 25);
            });
        });
        
        // 虚线框表示视图将要显示的区域
        ctx.setLineDash([5, 3]);
        ctx.strokeStyle = '#1a73e8';
        ctx.strokeRect(70, 62, 180, 58); // 框住Alice和Carol的行
        ctx.setLineDash([]);
        
        // 绘制SQL语句
        ctx.fillStyle = '#666';
        ctx.font = 'italic 12px Arial';
        ctx.fillText('CREATE VIEW cs_students_view AS', 130, 200);
        ctx.fillText('SELECT name, age, major FROM students WHERE major = "CS"', 130, 220);
    }
    
    // 绘制最终状态 (显示视图)
    function drawFinalState() {
        // 保留原始表格
        
        // 添加视图表格
        ctx.fillStyle = '#e6f2ff';
        ctx.strokeStyle = '#1a73e8';
        ctx.fillRect(350, 30, 150, 75);
        ctx.strokeRect(350, 30, 150, 75);
        
        // 视图标题
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('视图: cs_students_view', 350, 20);
        
        // 视图列标题
        const viewColumns = ['name', 'age', 'major'];
        viewColumns.forEach((col, index) => {
            ctx.fillText(col, 370 + index * 45, 50);
        });
        
        // 视图数据行 (仅CS专业学生)
        ctx.font = '14px Arial';
        const csRows = [
            ['Alice', 20, 'CS'],
            ['Carol', 21, 'CS']
        ];
        
        csRows.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                ctx.fillText(cell.toString(), 370 + colIndex * 45, 75 + rowIndex * 25);
            });
        });
        
        // 绘制连接线和箭头
        ctx.beginPath();
        ctx.moveTo(250, 80);
        ctx.lineTo(350, 80);
        ctx.strokeStyle = '#1a73e8';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制箭头
        ctx.beginPath();
        ctx.moveTo(350, 80);
        ctx.lineTo(340, 75);
        ctx.lineTo(340, 85);
        ctx.closePath();
        ctx.fillStyle = '#1a73e8';
        ctx.fill();
    }
    
    // 动画步骤
    function startAnimation() {
        let step = 0;
        const totalSteps = 90; // 动画总步数
        
        function animate() {
            if (!animating) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawInitialState();
            
            if (step > 30) {
                // 绘制视图逐渐出现的动画
                const alpha = Math.min(1, (step - 30) / 30);
                
                // 绘制半透明的视图表格
                ctx.fillStyle = `rgba(230, 242, 255, ${alpha})`;
                ctx.strokeStyle = `rgba(26, 115, 232, ${alpha})`;
                ctx.fillRect(350, 30, 150, 75);
                ctx.strokeRect(350, 30, 150, 75);
                
                // 视图标题
                ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
                ctx.font = 'bold 14px Arial';
                ctx.fillText('视图: cs_students_view', 350, 20);
                
                // 视图列标题和数据行，随着alpha值逐渐显示
                if (alpha > 0.3) {
                    // 视图列标题
                    const viewColumns = ['name', 'age', 'major'];
                    viewColumns.forEach((col, index) => {
                        ctx.fillText(col, 370 + index * 45, 50);
                    });
                }
                
                if (alpha > 0.6) {
                    // 视图数据行 (仅CS专业学生)
                    ctx.font = '14px Arial';
                    const csRows = [
                        ['Alice', 20, 'CS'],
                        ['Carol', 21, 'CS']
                    ];
                    
                    csRows.forEach((row, rowIndex) => {
                        row.forEach((cell, colIndex) => {
                            ctx.fillText(cell.toString(), 370 + colIndex * 45, 75 + rowIndex * 25);
                        });
                    });
                }
                
                // 绘制连接线和箭头
                if (alpha > 0.3) {
                    const lineProgress = Math.min(1, (step - 30) / 20);
                    const lineEnd = 250 + lineProgress * 100;
                    
                    ctx.beginPath();
                    ctx.moveTo(250, 80);
                    ctx.lineTo(lineEnd, 80);
                    ctx.strokeStyle = '#1a73e8';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    
                    // 当线条接近终点时绘制箭头
                    if (lineProgress > 0.9) {
                        ctx.beginPath();
                        ctx.moveTo(lineEnd, 80);
                        ctx.lineTo(lineEnd - 10, 75);
                        ctx.lineTo(lineEnd - 10, 85);
                        ctx.closePath();
                        ctx.fillStyle = '#1a73e8';
                        ctx.fill();
                    }
                }
            }
            
            step++;
            
            if (step < totalSteps) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                drawFinalState();
                animating = false;
            }
        }
        
        animate();
    }
    
    // 初始绘制
    drawInitialState();
}

// 初始化视图优势图表
function initViewsBenefitsChart() {
    const ctx = document.getElementById('views-benefits-chart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['简化复杂查询', '数据安全', '数据独立性', '减少数据冗余', '自定义数据呈现'],
            datasets: [
                {
                    label: '直接查询',
                    data: [30, 20, 25, 40, 35],
                    fill: true,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgb(54, 162, 235)',
                    pointBackgroundColor: 'rgb(54, 162, 235)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(54, 162, 235)'
                },
                {
                    label: '使用视图',
                    data: [85, 90, 80, 70, 95],
                    fill: true,
                    backgroundColor: 'rgba(26, 115, 232, 0.2)',
                    borderColor: 'rgb(26, 115, 232)',
                    pointBackgroundColor: 'rgb(26, 115, 232)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(26, 115, 232)'
                }
            ]
        },
        options: {
            elements: {
                line: {
                    borderWidth: 3
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });
}

// 初始化视图性能比较图表
function initViewPerformanceChart() {
    const ctx = document.getElementById('view-performance-chart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['简单视图', '复杂视图', '物化视图'],
            datasets: [
                {
                    label: '查询性能 (越低越好)',
                    data: [40, 70, 15],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(54, 162, 235, 0.6)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                },
                {
                    label: '存储开销 (越低越好)',
                    data: [10, 10, 80],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(54, 162, 235, 0.2)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// 初始化视图使用场景图表
function initViewUsageChart() {
    const ctx = document.getElementById('view-usage-chart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [
                '简化复杂查询',
                '数据安全管理',
                '应用层数据分离',
                '报表生成',
                '数据集成'
            ],
            datasets: [{
                data: [30, 25, 15, 20, 10],
                backgroundColor: [
                    'rgba(26, 115, 232, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(255, 205, 86, 0.7)'
                ],
                hoverOffset: 4
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// 初始化SQL练习
function initSqlExercise() {
    const sqlInput = document.getElementById('sql-input');
    const runSqlButton = document.getElementById('run-sql');
    const showSolutionButton = document.getElementById('show-solution');
    const resultDiv = document.getElementById('sql-result');
    
    if (!sqlInput || !runSqlButton || !showSolutionButton || !resultDiv) return;
    
    // 示例解决方案
    const solutionSQL = `CREATE VIEW student_scores AS
SELECT students.name, courses.course_name, scores.score
FROM students
JOIN scores ON students.id = scores.student_id
JOIN courses ON scores.course_id = courses.id;`;
    
    // 显示SQL解决方案
    showSolutionButton.addEventListener('click', function() {
        sqlInput.value = solutionSQL;
    });
    
    // 运行SQL
    runSqlButton.addEventListener('click', function() {
        const sql = sqlInput.value.trim();
        
        if (!sql) {
            resultDiv.innerHTML = '<div class="error">请输入SQL语句</div>';
            return;
        }
        
        // 检查是否是创建视图的语句
        if (!sql.toUpperCase().includes('CREATE VIEW')) {
            resultDiv.innerHTML = '<div class="error">SQL语句应该创建一个视图。请使用CREATE VIEW语句。</div>';
            return;
        }
        
        // 简单的模拟执行
        try {
            // 在实际应用中这里会连接到一个数据库或使用SQL.js等库执行SQL
            // 这里仅做简单模拟
            const viewName = sql.match(/CREATE\s+VIEW\s+(\w+)/i)[1];
            
            let result = `<div class="success">视图 ${viewName} 创建成功!</div>`;
            
            // 如果包含学生分数的视图，显示模拟结果
            if (sql.toLowerCase().includes('student') && sql.toLowerCase().includes('score')) {
                result += `<table class="result-table">
                    <thead>
                        <tr>
                            <th>name</th>
                            <th>course_name</th>
                            <th>score</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>张三</td>
                            <td>数据库原理</td>
                            <td>92</td>
                        </tr>
                        <tr>
                            <td>李四</td>
                            <td>数据库原理</td>
                            <td>88</td>
                        </tr>
                        <tr>
                            <td>王五</td>
                            <td>数据库原理</td>
                            <td>95</td>
                        </tr>
                        <tr>
                            <td>赵六</td>
                            <td>数据库原理</td>
                            <td>78</td>
                        </tr>
                    </tbody>
                </table>`;
            }
            
            resultDiv.innerHTML = result;
        } catch (error) {
            resultDiv.innerHTML = `<div class="error">SQL语句有误: ${error.message}</div>`;
        }
    });
}

// 初始化测验
function initQuiz() {
    const submitButton = document.getElementById('submit-quiz');
    const resultDiv = document.getElementById('quiz-result');
    
    if (!submitButton || !resultDiv) return;
    
    submitButton.addEventListener('click', function() {
        // 获取答案
        const q1Answer = document.querySelector('input[name="q1"]:checked');
        const q2Answer = document.querySelector('input[name="q2"]:checked');
        
        if (!q1Answer || !q2Answer) {
            resultDiv.innerHTML = '<div class="error">请回答所有问题</div>';
            return;
        }
        
        // 检查答案
        let correctCount = 0;
        let feedback = '';
        
        // 问题1: 物化视图可以存储实际数据
        if (q1Answer.value === 'c') {
            correctCount++;
            feedback += '<p>✓ 问题1回答正确！物化视图确实存储实际数据。</p>';
        } else {
            feedback += '<p>✗ 问题1回答错误。正确答案是：物化视图。物化视图会存储查询结果，而简单视图和复杂视图都是在查询时动态生成结果。</p>';
        }
        
        // 问题2: 多表连接视图通常只能执行SELECT
        if (q2Answer.value === 'd') {
            correctCount++;
            feedback += '<p>✓ 问题2回答正确！基于多表连接的视图通常只能执行SELECT操作。</p>';
        } else {
            feedback += '<p>✗ 问题2回答错误。正确答案是：只能执行SELECT。基于多表连接的视图通常不支持直接的INSERT/UPDATE/DELETE操作，因为这些操作可能导致歧义。</p>';
        }
        
        // 显示总分和反馈
        resultDiv.innerHTML = `
            <div class="score">得分: ${correctCount} / 2</div>
            <div class="feedback">${feedback}</div>
        `;
    });
} 