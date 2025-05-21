// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化标签页切换功能
    initTabs();
    
    // 初始化图书类比可视化
    initBookAnalogy();
    
    // 初始化索引结构可视化
    initIndexStructure();
    
    // 初始化索引类型比较图表
    initIndexTypesChart();
    
    // 初始化索引选择器
    initIndexSelector();
    
    // 初始化性能模拟
    initPerformanceSimulation();
    
    // 初始化B树可视化
    initBTreeViz();
    
    // 初始化B+树可视化
    initBPlusTreeViz();
    
    // 初始化场景评估
    initScenarioEvaluation();
    
    // 初始化查询执行计划分析
    initQueryPlanAnalysis();
    
    // 初始化树结构对比可视化
    initTreeComparisonViz();
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

// 初始化图书类比可视化
function initBookAnalogy() {
    const container = document.getElementById('book-analogy-viz');
    if (!container) return;
    
    // 这里使用简单的HTML而不是SVG，以减少代码量
    container.innerHTML = `
        <div class="book-comparison">
            <div class="book">
                <div class="book-title">无索引的数据表</div>
                <div class="book-content no-index">
                    <div class="spine"></div>
                    <div class="pages">
                        <div class="page-number">页1: 数据1</div>
                        <div class="page-number">页2: 数据2</div>
                        <div class="page-number">...</div>
                        <div class="page-number">页999: 数据999</div>
                        <div class="page-number">页1000: 数据1000</div>
                    </div>
                </div>
                <div class="search-process">
                    <div class="search-title">顺序查找</div>
                    <div class="search-path slow"></div>
                    <div class="search-time">查找时间: O(n)</div>
                </div>
            </div>
            
            <div class="book">
                <div class="book-title">有索引的数据表</div>
                <div class="book-content with-index">
                    <div class="spine"></div>
                    <div class="pages">
                        <div class="index-page">
                            <div class="index-title">索引</div>
                            <div class="index-entry">数据1-200...页1</div>
                            <div class="index-entry">数据201-400...页2</div>
                            <div class="index-entry">...</div>
                            <div class="index-entry">数据801-1000...页5</div>
                        </div>
                        <div class="data-pages">
                            <div class="page-number">页1: 数据1-200</div>
                            <div class="page-number">...</div>
                            <div class="page-number">页5: 数据801-1000</div>
                        </div>
                    </div>
                </div>
                <div class="search-process">
                    <div class="search-title">索引查找</div>
                    <div class="search-path fast"></div>
                    <div class="search-time">查找时间: O(log n)</div>
                </div>
            </div>
        </div>
    `;
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .book-comparison {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
        }
        .book {
            width: 45%;
            min-width: 250px;
            margin-bottom: 20px;
        }
        .book-title {
            font-weight: bold;
            text-align: center;
            margin-bottom: 10px;
        }
        .book-content {
            display: flex;
            height: 150px;
            border: 1px solid #ccc;
        }
        .spine {
            width: 30px;
            background-color: #ff9f80;
        }
        .with-index .spine {
            background-color: #80bfff;
        }
        .pages {
            flex-grow: 1;
            background-color: #f8f9fa;
            padding: 10px;
            font-size: 0.8em;
        }
        .index-page {
            background-color: #e6f2ff;
            padding: 5px;
            margin-bottom: 10px;
        }
        .index-title {
            font-weight: bold;
            text-align: center;
        }
        .search-process {
            margin-top: 10px;
            text-align: center;
        }
        .search-path {
            height: 20px;
            margin: 10px auto;
            position: relative;
        }
        .search-path.slow::before {
            content: "";
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, #ff6b6b 0%, #ff6b6b 100%);
            transform: translateY(-50%);
            clip-path: polygon(0 0, 100% 0, 100% 40%, 0 40%, 0 60%, 100% 60%, 100% 100%, 0 100%);
        }
        .search-path.fast::before {
            content: "";
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, #1a73e8 0%, #1a73e8 100%);
            transform: translateY(-50%);
        }
        .search-time {
            font-size: 0.9em;
            color: #666;
        }
    `;
    document.head.appendChild(style);
}

// 初始化索引结构可视化
function initIndexStructure() {
    const container = document.getElementById('index-structure-viz');
    if (!container) return;
    
    // 创建SVG元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '250');
    container.appendChild(svg);
    
    // 添加B+树结构示意图
    function createBPlusTree() {
        const treeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        treeG.setAttribute('transform', 'translate(60, 20)');
        
        // 根节点
        const rootNode = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rootNode.setAttribute('x', '180');
        rootNode.setAttribute('y', '0');
        rootNode.setAttribute('width', '100');
        rootNode.setAttribute('height', '30');
        rootNode.setAttribute('rx', '5');
        rootNode.setAttribute('fill', '#1a73e8');
        rootNode.setAttribute('stroke', '#0d47a1');
        treeG.appendChild(rootNode);
        
        const rootText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        rootText.textContent = '50 | 200';
        rootText.setAttribute('x', '230');
        rootText.setAttribute('y', '20');
        rootText.setAttribute('text-anchor', 'middle');
        rootText.setAttribute('fill', 'white');
        treeG.appendChild(rootText);
        
        // 第二级节点
        const positions = [[80, 70], [230, 70], [380, 70]];
        const values = ['10 | 30', '80 | 150', '250 | 300'];
        
        for (let i = 0; i < 3; i++) {
            const node = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            node.setAttribute('x', positions[i][0]);
            node.setAttribute('y', positions[i][1]);
            node.setAttribute('width', '100');
            node.setAttribute('height', '30');
            node.setAttribute('rx', '5');
            node.setAttribute('fill', '#4dabf5');
            node.setAttribute('stroke', '#1976d2');
            treeG.appendChild(node);
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.textContent = values[i];
            text.setAttribute('x', positions[i][0] + 50);
            text.setAttribute('y', positions[i][1] + 20);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'white');
            treeG.appendChild(text);
        }
        
        // 叶子节点 (数据记录)
        const leafPositions = [
            [30, 140], [90, 140], [150, 140], 
            [210, 140], [270, 140], [330, 140], 
            [390, 140], [450, 140]
        ];
        
        const leafValues = ['5', '15', '25', '60', '100', '180', '220', '280'];
        
        for (let i = 0; i < 8; i++) {
            const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            leaf.setAttribute('x', leafPositions[i][0]);
            leaf.setAttribute('y', leafPositions[i][1]);
            leaf.setAttribute('width', '40');
            leaf.setAttribute('height', '30');
            leaf.setAttribute('rx', '5');
            leaf.setAttribute('fill', '#81c784');
            leaf.setAttribute('stroke', '#388e3c');
            treeG.appendChild(leaf);
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.textContent = leafValues[i];
            text.setAttribute('x', leafPositions[i][0] + 20);
            text.setAttribute('y', leafPositions[i][1] + 20);
            text.setAttribute('text-anchor', 'middle');
            treeG.appendChild(text);
        }
        
        // 连接线
        // 根到第二级的连接
        for (let i = 0; i < 3; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '230');
            line.setAttribute('y1', '30');
            line.setAttribute('x2', positions[i][0] + 50);
            line.setAttribute('y2', positions[i][1]);
            line.setAttribute('stroke', '#1976d2');
            line.setAttribute('stroke-width', '2');
            treeG.appendChild(line);
        }
        
        // 第二级到叶子的连接
        for (let i = 0; i < 8; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', positions[Math.floor(i/3)][0] + 50);
            line.setAttribute('y1', '100');
            line.setAttribute('x2', leafPositions[i][0] + 20);
            line.setAttribute('y2', '140');
            line.setAttribute('stroke', '#388e3c');
            line.setAttribute('stroke-width', '1');
            treeG.appendChild(line);
        }
        
        // 叶子节点之间的链接 (B+树特性)
        for (let i = 0; i < 7; i++) {
            const link = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            link.setAttribute('x1', leafPositions[i][0] + 40);
            link.setAttribute('y1', leafPositions[i][1] + 15);
            link.setAttribute('x2', leafPositions[i+1][0]);
            link.setAttribute('y2', leafPositions[i+1][1] + 15);
            link.setAttribute('stroke', '#4caf50');
            link.setAttribute('stroke-width', '1');
            link.setAttribute('stroke-dasharray', '4,2');
            treeG.appendChild(link);
        }
        
        return treeG;
    }
    
    // 添加原始数据表示
    function createTable() {
        const tableG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        tableG.setAttribute('transform', 'translate(250, 190)');
        
        // 表格框
        const tableBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        tableBox.setAttribute('x', '0');
        tableBox.setAttribute('y', '0');
        tableBox.setAttribute('width', '160');
        tableBox.setAttribute('height', '20');
        tableBox.setAttribute('fill', '#f8f9fa');
        tableBox.setAttribute('stroke', '#dee2e6');
        tableG.appendChild(tableBox);
        
        // 表格标题
        const tableTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tableTitle.textContent = '数据表';
        tableTitle.setAttribute('x', '80');
        tableTitle.setAttribute('y', '15');
        tableTitle.setAttribute('text-anchor', 'middle');
        tableTitle.setAttribute('font-weight', 'bold');
        tableG.appendChild(tableTitle);
        
        // 连接线指向表格
        const connector = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        connector.setAttribute('x1', '80');
        connector.setAttribute('y1', '-20');
        connector.setAttribute('x2', '80');
        connector.setAttribute('y2', '0');
        connector.setAttribute('stroke', '#333');
        connector.setAttribute('stroke-width', '1');
        connector.setAttribute('stroke-dasharray', '4,2');
        tableG.appendChild(connector);
        
        return tableG;
    }
    
    // 创建B+树结构
    svg.appendChild(createBPlusTree());
    
    // 创建表格
    svg.appendChild(createTable());
    
    // 添加说明文字
    const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleText.textContent = 'B+树索引结构';
    titleText.setAttribute('x', '50');
    titleText.setAttribute('y', '15');
    titleText.setAttribute('font-weight', 'bold');
    svg.appendChild(titleText);
    
    const explanationText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    explanationText.textContent = '叶子节点包含实际数据指针，通过链表连接便于范围查询';
    explanationText.setAttribute('x', '250');
    explanationText.setAttribute('y', '240');
    explanationText.setAttribute('text-anchor', 'middle');
    explanationText.setAttribute('font-size', '12px');
    explanationText.setAttribute('fill', '#666');
    svg.appendChild(explanationText);
}

// 初始化索引类型比较图表
function initIndexTypesChart() {
    const ctx = document.getElementById('index-types-comparison');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['等值查询性能', '范围查询性能', '排序效率', '写入速度', '存储效率'],
            datasets: [
                {
                    label: 'B-树索引',
                    data: [85, 90, 85, 65, 70],
                    fill: true,
                    backgroundColor: 'rgba(26, 115, 232, 0.2)',
                    borderColor: 'rgb(26, 115, 232)',
                    pointBackgroundColor: 'rgb(26, 115, 232)',
                    pointBorderColor: '#fff'
                },
                {
                    label: '哈希索引',
                    data: [95, 20, 10, 75, 75],
                    fill: true,
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    borderColor: 'rgb(255, 159, 64)',
                    pointBackgroundColor: 'rgb(255, 159, 64)',
                    pointBorderColor: '#fff'
                },
                {
                    label: '全文索引',
                    data: [60, 75, 40, 45, 40],
                    fill: true,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgb(75, 192, 192)',
                    pointBackgroundColor: 'rgb(75, 192, 192)',
                    pointBorderColor: '#fff'
                }
            ]
        },
        options: {
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

// 初始化索引选择器
function initIndexSelector() {
    const button = document.getElementById('find-index-type');
    const recommendation = document.getElementById('index-recommendation');
    
    if (!button || !recommendation) return;
    
    button.addEventListener('click', function() {
        const equality = document.getElementById('option-equality').checked;
        const range = document.getElementById('option-range').checked;
        const sorting = document.getElementById('option-sorting').checked;
        const text = document.getElementById('option-text').checked;
        const spatial = document.getElementById('option-spatial').checked;
        
        let result = '';
        
        if (text) {
            result = '推荐使用<strong>全文索引</strong>，最适合文本搜索和关键词匹配。';
        } else if (spatial) {
            result = '推荐使用<strong>空间索引</strong>，专为地理位置数据查询设计。';
        } else if (range || sorting) {
            result = '推荐使用<strong>B-树或B+树索引</strong>，支持范围查询和排序操作。';
        } else if (equality && !range && !sorting) {
            result = '推荐使用<strong>哈希索引</strong>，等值查询性能最佳。';
        } else {
            result = '请选择至少一种查询需求以获取推荐。';
        }
        
        recommendation.innerHTML = `<div class="alert">${result}</div>`;
    });
}

// 初始化性能模拟
function initPerformanceSimulation() {
    const button = document.getElementById('run-simulation');
    const performanceViz = document.getElementById('performance-viz');
    
    if (!button || !performanceViz) return;
    
    button.addEventListener('click', function() {
        const tableSize = document.getElementById('table-size').value;
        const indexStatus = document.getElementById('index-status').value;
        const queryType = document.getElementById('query-type').value;
        
        // 简单模拟性能差异，实际上会根据参数计算模拟的查询时间
        let timeNoIndex, timeWithIndex;
        
        if (queryType === 'equality') {
            timeNoIndex = parseInt(tableSize) / 2; // 平均情况
            timeWithIndex = Math.log2(parseInt(tableSize)) * 10;
        } else if (queryType === 'range') {
            timeNoIndex = parseInt(tableSize);
            timeWithIndex = Math.log2(parseInt(tableSize)) * 20 + parseInt(tableSize) * 0.1;
        } else { // join
            timeNoIndex = parseInt(tableSize) * 1.5;
            timeWithIndex = parseInt(tableSize) * 0.3;
        }
        
        // 如果是复合索引，性能可能更好
        if (indexStatus === 'composite') {
            timeWithIndex *= 0.7;
        }
        
        // 限制最小和最大值，以便可视化效果更好
        timeNoIndex = Math.max(100, Math.min(2000, timeNoIndex));
        timeWithIndex = Math.max(10, Math.min(1000, timeWithIndex));
        
        // 创建性能对比图表
        performanceViz.innerHTML = '<canvas id="performance-chart"></canvas>';
        const ctx = document.getElementById('performance-chart');
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['无索引', indexStatus === 'single' ? '单列索引' : '复合索引'],
                datasets: [{
                    label: '查询执行时间 (毫秒，越低越好)',
                    data: [timeNoIndex, timeWithIndex],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)'
                    ],
                    borderColor: [
                        'rgb(255, 99, 132)',
                        'rgb(54, 162, 235)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    });
}

// 初始化场景评估
function initScenarioEvaluation() {
    const button = document.getElementById('check-scenarios');
    const results = document.getElementById('scenario-results');
    
    if (!button || !results) return;
    
    button.addEventListener('click', function() {
        const scenario1 = document.querySelector('input[name="scenario1"]:checked');
        const scenario2 = document.querySelector('input[name="scenario2"]:checked');
        
        if (!scenario1 || !scenario2) {
            results.innerHTML = '<div class="error">请回答所有问题</div>';
            return;
        }
        
        let feedback = '';
        let correctCount = 0;
        
        // 场景1: 用户登录检查，最佳是在username上的单列索引
        if (scenario1.value === 'a') {
            correctCount++;
            feedback += '<p>✓ 场景1回答正确！在username上创建单列索引是最佳选择，因为通常会先根据用户名查询，然后验证密码。</p>';
        } else {
            feedback += '<p>✗ 场景1回答不正确。推荐在username上创建单列索引，因为查询通常先基于用户名，密码通常在应用层验证。</p>';
        }
        
        // 场景2: 订单查询，最佳是在(customer_id, order_date)上的复合索引
        if (scenario2.value === 'c') {
            correctCount++;
            feedback += '<p>✓ 场景2回答正确！在(customer_id, order_date)上创建复合索引是最佳选择，支持WHERE和ORDER BY子句。</p>';
        } else {
            feedback += '<p>✗ 场景2回答不正确。推荐在(customer_id, order_date)上创建复合索引，这样可以同时支持WHERE条件和ORDER BY排序。</p>';
        }
        
        results.innerHTML = `
            <div class="score">得分: ${correctCount} / 2</div>
            <div class="feedback">${feedback}</div>
        `;
    });
}

// 初始化查询执行计划分析
function initQueryPlanAnalysis() {
    const button = document.getElementById('analyze-query');
    const executionPlan = document.getElementById('execution-plan');
    const planExplanation = document.getElementById('plan-explanation');
    
    if (!button || !executionPlan || !planExplanation) return;
    
    button.addEventListener('click', function() {
        const query = document.getElementById('query-input').value.trim();
        const idxCustomerId = document.getElementById('idx-customer-id').checked;
        const idxOrderDate = document.getElementById('idx-order-date').checked;
        const idxCustomerDate = document.getElementById('idx-customer-date').checked;
        
        if (!query) {
            planExplanation.innerHTML = '<div class="error">请输入SQL查询</div>';
            return;
        }
        
        // 默认展示一个简单的执行计划图
        executionPlan.innerHTML = `
            <div class="plan-node">
                <div class="node-type">查询计划根节点</div>
                <div class="node-details">成本: ${idxCustomerDate ? '25' : (idxCustomerId ? '100' : '500')}</div>
            </div>
            <div class="plan-arrow">↑</div>
            <div class="plan-node ${idxCustomerDate ? 'using-index' : ''}">
                <div class="node-type">${idxCustomerDate ? '索引扫描' : '表扫描'}</div>
                <div class="node-details">表: orders${idxCustomerDate ? '<br>使用索引: idx_customer_id_order_date' : (idxCustomerId ? '<br>使用索引: idx_customer_id' : '')}</div>
            </div>
        `;
        
        // 分析SQL，给出执行计划说明
        let explanation = '';
        
        if (query.toLowerCase().includes('where') && query.toLowerCase().includes('customer_id') && query.toLowerCase().includes('order by') && query.toLowerCase().includes('order_date')) {
            if (idxCustomerDate) {
                explanation = `
                    <h4>高效查询计划</h4>
                    <p>该查询使用了 <strong>idx_customer_id_order_date</strong> 复合索引，同时满足了WHERE条件筛选和ORDER BY排序的需求，非常高效。</p>
                    <p>复合索引的列顺序与查询条件匹配（先customer_id，后order_date），实现了最优性能。</p>
                `;
            } else if (idxCustomerId) {
                explanation = `
                    <h4>部分优化的查询计划</h4>
                    <p>该查询仅使用了 <strong>idx_customer_id</strong> 索引满足WHERE条件，但排序操作需要额外的文件排序步骤。</p>
                    <p>建议创建复合索引 (customer_id, order_date) 来进一步优化此查询。</p>
                `;
            } else {
                explanation = `
                    <h4>低效查询计划</h4>
                    <p>该查询未使用任何索引，执行全表扫描并进行文件排序，性能较差。</p>
                    <p>强烈建议为customer_id和order_date创建索引。</p>
                `;
            }
        } else {
            explanation = `
                <h4>查询分析</h4>
                <p>请输入包含WHERE customer_id条件和ORDER BY order_date的查询以查看不同索引对执行计划的影响。</p>
                <p>示例：SELECT * FROM orders WHERE customer_id = 123 ORDER BY order_date DESC LIMIT 10</p>
            `;
        }
        
        planExplanation.innerHTML = explanation;
    });
}

// 初始化B树可视化
function initBTreeViz() {
    const container = document.getElementById('btree-viz');
    if (!container) return;
    
    // 创建SVG元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '300');
    container.appendChild(svg);
    
    // B树节点类
    class BTreeNode {
        constructor(isLeaf = true) {
            this.keys = [];
            this.children = [];
            this.isLeaf = isLeaf;
        }
    }
    
    // B树类 (简化版，阶数为3)
    class BTree {
        constructor() {
            this.root = new BTreeNode();
            this.order = 3; // 简化的B树，每个节点最多有3个键
        }
        
        // 搜索键值
        search(key) {
            return this._search(this.root, key);
        }
        
        _search(node, key) {
            let i = 0;
            while (i < node.keys.length && key > node.keys[i]) {
                i++;
            }
            
            if (i < node.keys.length && key === node.keys[i]) {
                return true; // 找到了
            }
            
            if (node.isLeaf) {
                return false; // 叶子节点中没找到
            }
            
            return this._search(node.children[i], key);
        }
        
        // 插入键值
        insert(key) {
            const root = this.root;
            
            // 如果根节点已满，需要分裂
            if (root.keys.length === (2 * this.order - 1)) {
                const newRoot = new BTreeNode(false);
                this.root = newRoot;
                newRoot.children.push(root);
                this._splitChild(newRoot, 0);
                this._insertNonFull(newRoot, key);
            } else {
                this._insertNonFull(root, key);
            }
        }
        
        // 在非满节点中插入键值
        _insertNonFull(node, key) {
            let i = node.keys.length - 1;
            
            if (node.isLeaf) {
                // 在叶子节点中插入
                while (i >= 0 && key < node.keys[i]) {
                    node.keys[i + 1] = node.keys[i];
                    i--;
                }
                
                node.keys[i + 1] = key;
            } else {
                // 在内部节点中找到正确的子节点
                while (i >= 0 && key < node.keys[i]) {
                    i--;
                }
                i++;
                
                // 如果子节点已满，需要先分裂
                if (node.children[i].keys.length === (2 * this.order - 1)) {
                    this._splitChild(node, i);
                    
                    if (key > node.keys[i]) {
                        i++;
                    }
                }
                
                this._insertNonFull(node.children[i], key);
            }
        }
        
        // 分裂一个满的子节点
        _splitChild(parent, index) {
            const child = parent.children[index];
            const newChild = new BTreeNode(child.isLeaf);
            
            // 将满节点的右半部分移到新节点
            const mid = Math.floor((2 * this.order - 1) / 2);
            
            for (let i = 0; i < mid; i++) {
                newChild.keys.push(child.keys[mid + 1 + i]);
            }
            
            if (!child.isLeaf) {
                for (let i = 0; i <= mid; i++) {
                    newChild.children.push(child.children[mid + 1 + i]);
                }
                
                // 清除已移动的子节点引用
                child.children.splice(mid + 1);
            }
            
            // 将中间键提升到父节点
            parent.keys.splice(index, 0, child.keys[mid]);
            parent.children.splice(index + 1, 0, newChild);
            
            // 清除已移动的键
            child.keys.splice(mid);
        }
    }
    
    // 创建一个简单的B树示例
    const btree = new BTree();
    const initialKeys = [10, 20, 5, 15, 30, 25, 35, 7, 26];
    
    initialKeys.forEach(key => {
        btree.insert(key);
    });
    
    // 绘制B树函数
    function drawBTree() {
        // 清空SVG
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }
        
        // 计算树的高度
        function getHeight(node) {
            if (!node || node.isLeaf) return 1;
            
            let maxHeight = 0;
            for (let child of node.children) {
                const height = getHeight(child);
                maxHeight = Math.max(maxHeight, height);
            }
            
            return maxHeight + 1;
        }
        
        const treeHeight = getHeight(btree.root);
        const levelHeight = 70;
        const nodeWidth = 50;
        const nodeHeight = 30;
        
        // 递归绘制节点
        function drawNode(node, x, y, width) {
            if (!node) return;
            
            const nodeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            
            // 节点背景
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x - (node.keys.length * nodeWidth) / 2);
            rect.setAttribute('y', y);
            rect.setAttribute('width', node.keys.length * nodeWidth);
            rect.setAttribute('height', nodeHeight);
            rect.setAttribute('rx', '5');
            rect.setAttribute('fill', node.isLeaf ? '#81c784' : '#4dabf5');
            rect.setAttribute('stroke', node.isLeaf ? '#388e3c' : '#1976d2');
            nodeG.appendChild(rect);
            
            // 键值文本
            for (let i = 0; i < node.keys.length; i++) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.textContent = node.keys[i];
                text.setAttribute('x', x - (node.keys.length * nodeWidth) / 2 + (i + 0.5) * nodeWidth);
                text.setAttribute('y', y + nodeHeight / 2 + 5);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('fill', 'white');
                nodeG.appendChild(text);
                
                // 如果不是最后一个键，添加分隔线
                if (i < node.keys.length - 1) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', x - (node.keys.length * nodeWidth) / 2 + (i + 1) * nodeWidth);
                    line.setAttribute('y1', y);
                    line.setAttribute('x2', x - (node.keys.length * nodeWidth) / 2 + (i + 1) * nodeWidth);
                    line.setAttribute('y2', y + nodeHeight);
                    line.setAttribute('stroke', node.isLeaf ? '#388e3c' : '#1976d2');
                    line.setAttribute('stroke-width', '1');
                    nodeG.appendChild(line);
                }
            }
            
            svg.appendChild(nodeG);
            
            // 如果不是叶子节点，递归绘制子节点
            if (!node.isLeaf) {
                const childWidth = width / node.children.length;
                
                for (let i = 0; i < node.children.length; i++) {
                    const childX = x - width / 2 + childWidth / 2 + i * childWidth;
                    const childY = y + levelHeight;
                    
                    // 连接线
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', x);
                    line.setAttribute('y1', y + nodeHeight);
                    line.setAttribute('x2', childX);
                    line.setAttribute('y2', childY);
                    line.setAttribute('stroke', '#1976d2');
                    line.setAttribute('stroke-width', '1');
                    svg.appendChild(line);
                    
                    drawNode(node.children[i], childX, childY, childWidth);
                }
            }
        }
        
        // 从根节点开始绘制
        const rootX = parseInt(svg.getAttribute('width')) / 2;
        const rootY = 20;
        const totalWidth = parseInt(svg.getAttribute('width')) * 0.9;
        
        drawNode(btree.root, rootX, rootY, totalWidth);
    }
    
    // 初始绘制
    drawBTree();
    
    // 添加插入和搜索功能
    const insertButton = document.getElementById('btree-insert');
    const searchButton = document.getElementById('btree-search');
    const resetButton = document.getElementById('btree-reset');
    const inputValue = document.getElementById('btree-insert-value');
    
    if (insertButton && inputValue) {
        insertButton.addEventListener('click', function() {
            const value = parseInt(inputValue.value);
            if (!isNaN(value)) {
                btree.insert(value);
                drawBTree();
                inputValue.value = '';
            }
        });
    }
    
    if (searchButton && inputValue) {
        searchButton.addEventListener('click', function() {
            const value = parseInt(inputValue.value);
            if (!isNaN(value)) {
                const found = btree.search(value);
                alert(found ? `找到键值 ${value}!` : `未找到键值 ${value}`);
            }
        });
    }
    
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            btree.root = new BTreeNode();
            initialKeys.forEach(key => {
                btree.insert(key);
            });
            drawBTree();
        });
    }
}

// 初始化B+树可视化
function initBPlusTreeViz() {
    const container = document.getElementById('bplustree-viz');
    if (!container) return;
    
    // 创建SVG元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '300');
    container.appendChild(svg);
    
    // B+树节点类
    class BPlusTreeNode {
        constructor(isLeaf = true) {
            this.keys = [];
            this.children = [];
            this.next = null; // B+树叶子节点链表指针
            this.isLeaf = isLeaf;
        }
    }
    
    // B+树类 (简化版，阶数为3)
    class BPlusTree {
        constructor() {
            this.root = new BPlusTreeNode();
            this.order = 3; // 简化的B+树，每个节点最多有3个键
        }
        
        // 搜索键值
        search(key) {
            let node = this.root;
            
            while (!node.isLeaf) {
                let i = 0;
                while (i < node.keys.length && key >= node.keys[i]) {
                    i++;
                }
                
                node = node.children[i];
            }
            
            for (let i = 0; i < node.keys.length; i++) {
                if (node.keys[i] === key) {
                    return true;
                }
            }
            
            return false;
        }
        
        // 插入键值
        insert(key) {
            if (this.root.keys.length === 0) {
                this.root.keys.push(key);
                return;
            }
            
            // 如果根节点已满，创建新根
            if (this.root.keys.length === (2 * this.order - 1)) {
                const newRoot = new BPlusTreeNode(false);
                const oldRoot = this.root;
                this.root = newRoot;
                
                // 分裂旧根节点
                const mid = Math.floor((2 * this.order - 1) / 2);
                const leftNode = new BPlusTreeNode(oldRoot.isLeaf);
                const rightNode = new BPlusTreeNode(oldRoot.isLeaf);
                
                // 复制键值
                for (let i = 0; i < mid; i++) {
                    leftNode.keys.push(oldRoot.keys[i]);
                }
                
                for (let i = mid; i < oldRoot.keys.length; i++) {
                    rightNode.keys.push(oldRoot.keys[i]);
                }
                
                // 如果不是叶子节点，复制子节点
                if (!oldRoot.isLeaf) {
                    for (let i = 0; i <= mid; i++) {
                        leftNode.children.push(oldRoot.children[i]);
                    }
                    
                    for (let i = mid + 1; i <= oldRoot.keys.length; i++) {
                        rightNode.children.push(oldRoot.children[i]);
                    }
                } else {
                    // 对于叶子节点，链接链表
                    leftNode.next = rightNode;
                    rightNode.next = oldRoot.next;
                }
                
                // 设置新根的键值和子节点
                newRoot.keys.push(rightNode.keys[0]);
                newRoot.children.push(leftNode);
                newRoot.children.push(rightNode);
                
                // 递归插入
                this._insertNonFull(this.root, key);
            } else {
                this._insertNonFull(this.root, key);
            }
        }
        
        // 在非满节点中插入键值
        _insertNonFull(node, key) {
            let i = node.keys.length - 1;
            
            if (node.isLeaf) {
                // 在叶子节点中插入
                while (i >= 0 && key < node.keys[i]) {
                    node.keys[i + 1] = node.keys[i];
                    i--;
                }
                
                node.keys[i + 1] = key;
                
                // 保持有序
                node.keys.sort((a, b) => a - b);
            } else {
                // 在内部节点中找到正确的子节点
                while (i >= 0 && key < node.keys[i]) {
                    i--;
                }
                i++;
                
                // 如果子节点已满，需要先分裂
                if (node.children[i].keys.length === (2 * this.order - 1)) {
                    this._splitChild(node, i);
                    
                    // 调整索引
                    if (i < node.keys.length && key >= node.keys[i]) {
                        i++;
                    }
                }
                
                this._insertNonFull(node.children[i], key);
            }
        }
        
        // 分裂一个满的子节点
        _splitChild(parent, index) {
            const child = parent.children[index];
            const newChild = new BPlusTreeNode(child.isLeaf);
            
            // 将满节点的右半部分移到新节点
            const mid = Math.floor((2 * this.order - 1) / 2);
            
            // 对于B+树，内部节点不存储数据
            if (!child.isLeaf) {
                for (let i = 0; i < mid; i++) {
                    newChild.keys.push(child.keys[mid + 1 + i]);
                }
                
                for (let i = 0; i <= mid; i++) {
                    newChild.children.push(child.children[mid + 1 + i]);
                }
                
                // 清除已移动的部分
                child.keys.splice(mid + 1);
                child.children.splice(mid + 1);
                
                // 将中间键提升到父节点
                parent.keys.splice(index, 0, child.keys[mid]);
                parent.children.splice(index + 1, 0, newChild);
                
                // 清除已提升的键
                child.keys.splice(mid, 1);
            } else {
                // 对于叶子节点，所有键值都保留
                for (let i = mid; i < child.keys.length; i++) {
                    newChild.keys.push(child.keys[i]);
                }
                
                // 清除已移动的键
                child.keys.splice(mid);
                
                // 在父节点中添加分隔键
                parent.keys.splice(index, 0, newChild.keys[0]);
                parent.children.splice(index + 1, 0, newChild);
                
                // 维护叶子节点链表
                newChild.next = child.next;
                child.next = newChild;
            }
        }
    }
    
    // 创建一个简单的B+树示例
    const bplusTree = new BPlusTree();
    const initialKeys = [10, 20, 5, 15, 30, 25, 35, 7, 26];
    
    initialKeys.forEach(key => {
        bplusTree.insert(key);
    });
    
    // 绘制B+树函数
    function drawBPlusTree() {
        // 清空SVG
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }
        
        // 计算树的高度
        function getHeight(node) {
            if (!node || node.isLeaf) return 1;
            
            let maxHeight = 0;
            for (let child of node.children) {
                const height = getHeight(child);
                maxHeight = Math.max(maxHeight, height);
            }
            
            return maxHeight + 1;
        }
        
        const treeHeight = getHeight(bplusTree.root);
        const levelHeight = 70;
        const nodeWidth = 50;
        const nodeHeight = 30;
        
        // 保存所有叶子节点，用于绘制链表
        const leafNodes = [];
        
        // 递归绘制节点
        function drawNode(node, x, y, width) {
            if (!node) return;
            
            const nodeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            
            // 节点背景
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x - (node.keys.length * nodeWidth) / 2);
            rect.setAttribute('y', y);
            rect.setAttribute('width', node.keys.length * nodeWidth);
            rect.setAttribute('height', nodeHeight);
            rect.setAttribute('rx', '5');
            rect.setAttribute('fill', node.isLeaf ? '#81c784' : '#4dabf5');
            rect.setAttribute('stroke', node.isLeaf ? '#388e3c' : '#1976d2');
            nodeG.appendChild(rect);
            
            // 键值文本
            for (let i = 0; i < node.keys.length; i++) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.textContent = node.keys[i];
                text.setAttribute('x', x - (node.keys.length * nodeWidth) / 2 + (i + 0.5) * nodeWidth);
                text.setAttribute('y', y + nodeHeight / 2 + 5);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('fill', 'white');
                nodeG.appendChild(text);
                
                // 如果不是最后一个键，添加分隔线
                if (i < node.keys.length - 1) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', x - (node.keys.length * nodeWidth) / 2 + (i + 1) * nodeWidth);
                    line.setAttribute('y1', y);
                    line.setAttribute('x2', x - (node.keys.length * nodeWidth) / 2 + (i + 1) * nodeWidth);
                    line.setAttribute('y2', y + nodeHeight);
                    line.setAttribute('stroke', node.isLeaf ? '#388e3c' : '#1976d2');
                    line.setAttribute('stroke-width', '1');
                    nodeG.appendChild(line);
                }
            }
            
            svg.appendChild(nodeG);
            
            // 如果是叶子节点，存储位置信息用于绘制链表
            if (node.isLeaf) {
                leafNodes.push({
                    node: node,
                    x: x,
                    y: y,
                    width: node.keys.length * nodeWidth
                });
            }
            
            // 如果不是叶子节点，递归绘制子节点
            if (!node.isLeaf) {
                const childWidth = width / node.children.length;
                
                for (let i = 0; i < node.children.length; i++) {
                    const childX = x - width / 2 + childWidth / 2 + i * childWidth;
                    const childY = y + levelHeight;
                    
                    // 连接线
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', x);
                    line.setAttribute('y1', y + nodeHeight);
                    line.setAttribute('x2', childX);
                    line.setAttribute('y2', childY);
                    line.setAttribute('stroke', '#1976d2');
                    line.setAttribute('stroke-width', '1');
                    svg.appendChild(line);
                    
                    drawNode(node.children[i], childX, childY, childWidth);
                }
            }
        }
        
        // 从根节点开始绘制
        const rootX = parseInt(svg.getAttribute('width')) / 2;
        const rootY = 20;
        const totalWidth = parseInt(svg.getAttribute('width')) * 0.9;
        
        drawNode(bplusTree.root, rootX, rootY, totalWidth);
        
        // 绘制叶子节点间的链表连接
        for (let i = 0; i < leafNodes.length - 1; i++) {
            const current = leafNodes[i];
            const next = leafNodes[i + 1];
            
            // 如果当前节点的next指向下一个节点，绘制链表连接
            if (current.node.next === next.node) {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const currentRight = current.x + current.width / 2;
                const nextLeft = next.x - next.width / 2;
                
                // 弯曲的路径
                const pathD = `M ${currentRight} ${current.y + nodeHeight / 2} 
                              C ${currentRight + 20} ${current.y + nodeHeight / 2}, 
                                ${nextLeft - 20} ${next.y + nodeHeight / 2}, 
                                ${nextLeft} ${next.y + nodeHeight / 2}`;
                
                path.setAttribute('d', pathD);
                path.setAttribute('stroke', '#4caf50');
                path.setAttribute('stroke-width', '2');
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke-dasharray', '5,3');
                path.setAttribute('marker-end', 'url(#bplusarrow)');
                svg.appendChild(path);
            }
        }
        
        // 添加箭头标记
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'bplusarrow');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '10');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');
        
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', '#4caf50');
        marker.appendChild(polygon);
        defs.appendChild(marker);
        svg.appendChild(defs);
    }
    
    // 初始绘制
    drawBPlusTree();
    
    // 添加插入和搜索功能
    const insertButton = document.getElementById('bplustree-insert');
    const searchButton = document.getElementById('bplustree-search');
    const resetButton = document.getElementById('bplustree-reset');
    const inputValue = document.getElementById('bplustree-insert-value');
    
    if (insertButton && inputValue) {
        insertButton.addEventListener('click', function() {
            const value = parseInt(inputValue.value);
            if (!isNaN(value)) {
                bplusTree.insert(value);
                drawBPlusTree();
                inputValue.value = '';
            }
        });
    }
    
    if (searchButton && inputValue) {
        searchButton.addEventListener('click', function() {
            const value = parseInt(inputValue.value);
            if (!isNaN(value)) {
                const found = bplusTree.search(value);
                alert(found ? `找到键值 ${value}!` : `未找到键值 ${value}`);
            }
        });
    }
    
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            bplusTree.root = new BPlusTreeNode();
            initialKeys.forEach(key => {
                bplusTree.insert(key);
            });
            drawBPlusTree();
        });
    }
}

// 初始化树结构对比可视化
function initTreeComparisonViz() {
    const container = document.getElementById('tree-comparison-viz');
    if (!container) return;
    
    // 创建SVG元素
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '350');
    container.appendChild(svg);
    
    // 计算SVG容器的实际宽度以便进行居中
    const svgWidth = container.clientWidth || 800; // 默认宽度为800px
    const svgCenterX = svgWidth / 2;
    
    // 向右移动整体布局，增加左侧边距
    const leftMargin = 80; // 增加左侧边距
    
    // B树和B+树的绘制x位置，基于svg宽度计算，确保居中且向右移动
    const bTreeX = Math.max(leftMargin, svgCenterX - 250);
    const bPlusTreeX = Math.min(svgWidth - 200, svgCenterX + 100);
    
    // 绘制B树和B+树的简化对比图
    // B树示例 - 所有节点存储数据
    function drawBTreeExample(x, y) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${x}, ${y})`);
        
        // 标题
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        title.textContent = 'B树结构';
        title.setAttribute('x', '100');
        title.setAttribute('y', '-20');
        title.setAttribute('text-anchor', 'middle');
        title.setAttribute('font-weight', 'bold');
        title.setAttribute('font-size', '16px');
        g.appendChild(title);
        
        // 根节点
        const rootNode = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rootNode.setAttribute('x', '70');
        rootNode.setAttribute('y', '0');
        rootNode.setAttribute('width', '60');
        rootNode.setAttribute('height', '30');
        rootNode.setAttribute('rx', '5');
        rootNode.setAttribute('fill', '#4dabf5');
        rootNode.setAttribute('stroke', '#1976d2');
        g.appendChild(rootNode);
        
        const rootText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        rootText.textContent = '50';
        rootText.setAttribute('x', '100');
        rootText.setAttribute('y', '20');
        rootText.setAttribute('text-anchor', 'middle');
        rootText.setAttribute('fill', 'white');
        g.appendChild(rootText);
        
        // 数据指示器（所有节点都有数据）
        const rootData = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        rootData.setAttribute('cx', '115');
        rootData.setAttribute('cy', '15');
        rootData.setAttribute('r', '4');
        rootData.setAttribute('fill', '#ffeb3b');
        rootData.setAttribute('stroke', '#f57f17');
        g.appendChild(rootData);
        
        // 左节点
        const leftNode = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        leftNode.setAttribute('x', '20');
        leftNode.setAttribute('y', '60');
        leftNode.setAttribute('width', '60');
        leftNode.setAttribute('height', '30');
        leftNode.setAttribute('rx', '5');
        leftNode.setAttribute('fill', '#4dabf5');
        leftNode.setAttribute('stroke', '#1976d2');
        g.appendChild(leftNode);
        
        const leftText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        leftText.textContent = '20';
        leftText.setAttribute('x', '50');
        leftText.setAttribute('y', '80');
        leftText.setAttribute('text-anchor', 'middle');
        leftText.setAttribute('fill', 'white');
        g.appendChild(leftText);
        
        // 数据指示器
        const leftData = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        leftData.setAttribute('cx', '65');
        leftData.setAttribute('cy', '75');
        leftData.setAttribute('r', '4');
        leftData.setAttribute('fill', '#ffeb3b');
        leftData.setAttribute('stroke', '#f57f17');
        g.appendChild(leftData);
        
        // 右节点
        const rightNode = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rightNode.setAttribute('x', '120');
        rightNode.setAttribute('y', '60');
        rightNode.setAttribute('width', '60');
        rightNode.setAttribute('height', '30');
        rightNode.setAttribute('rx', '5');
        rightNode.setAttribute('fill', '#4dabf5');
        rightNode.setAttribute('stroke', '#1976d2');
        g.appendChild(rightNode);
        
        const rightText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        rightText.textContent = '80';
        rightText.setAttribute('x', '150');
        rightText.setAttribute('y', '80');
        rightText.setAttribute('text-anchor', 'middle');
        rightText.setAttribute('fill', 'white');
        g.appendChild(rightText);
        
        // 数据指示器
        const rightData = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        rightData.setAttribute('cx', '165');
        rightData.setAttribute('cy', '75');
        rightData.setAttribute('r', '4');
        rightData.setAttribute('fill', '#ffeb3b');
        rightData.setAttribute('stroke', '#f57f17');
        g.appendChild(rightData);
        
        // 叶子节点
        const leafNodes = [
            { x: 0, y: 120, width: 40, value: 10 },
            { x: 60, y: 120, width: 40, value: 30 },
            { x: 120, y: 120, width: 40, value: 60 },
            { x: 180, y: 120, width: 40, value: 90 }
        ];
        
        leafNodes.forEach(leaf => {
            const leafNode = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            leafNode.setAttribute('x', leaf.x.toString());
            leafNode.setAttribute('y', leaf.y.toString());
            leafNode.setAttribute('width', leaf.width.toString());
            leafNode.setAttribute('height', '30');
            leafNode.setAttribute('rx', '5');
            leafNode.setAttribute('fill', '#81c784');
            leafNode.setAttribute('stroke', '#388e3c');
            g.appendChild(leafNode);
            
            const leafText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            leafText.textContent = leaf.value.toString();
            leafText.setAttribute('x', (leaf.x + leaf.width / 2).toString());
            leafText.setAttribute('y', (leaf.y + 20).toString());
            leafText.setAttribute('text-anchor', 'middle');
            leafText.setAttribute('fill', 'white');
            g.appendChild(leafText);
            
            // 数据指示器
            const leafData = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            leafData.setAttribute('cx', (leaf.x + leaf.width - 10).toString());
            leafData.setAttribute('cy', (leaf.y + 15).toString());
            leafData.setAttribute('r', '4');
            leafData.setAttribute('fill', '#ffeb3b');
            leafData.setAttribute('stroke', '#f57f17');
            g.appendChild(leafData);
        });
        
        // 连接线
        const lines = [
            { x1: 100, y1: 30, x2: 50, y2: 60 },  // 根到左节点
            { x1: 100, y1: 30, x2: 150, y2: 60 }, // 根到右节点
            { x1: 50, y1: 90, x2: 20, y2: 120 },  // 左节点到叶子1
            { x1: 50, y1: 90, x2: 80, y2: 120 },  // 左节点到叶子2
            { x1: 150, y1: 90, x2: 140, y2: 120 }, // 右节点到叶子3
            { x1: 150, y1: 90, x2: 200, y2: 120 }  // 右节点到叶子4
        ];
        
        lines.forEach(line => {
            const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            l.setAttribute('x1', line.x1.toString());
            l.setAttribute('y1', line.y1.toString());
            l.setAttribute('x2', line.x2.toString());
            l.setAttribute('y2', line.y2.toString());
            l.setAttribute('stroke', '#1976d2');
            l.setAttribute('stroke-width', '1');
            g.appendChild(l);
        });
        
        // 图例
        const legendBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        legendBg.setAttribute('x', '45');
        legendBg.setAttribute('y', '165');
        legendBg.setAttribute('width', '110');
        legendBg.setAttribute('height', '22');
        legendBg.setAttribute('fill', '#f5f5f5');
        legendBg.setAttribute('stroke', '#e0e0e0');
        legendBg.setAttribute('rx', '3');
        g.appendChild(legendBg);
        
        const legendCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        legendCircle.setAttribute('cx', '55');
        legendCircle.setAttribute('cy', '176');
        legendCircle.setAttribute('r', '4');
        legendCircle.setAttribute('fill', '#ffeb3b');
        legendCircle.setAttribute('stroke', '#f57f17');
        g.appendChild(legendCircle);
        
        const legendText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        legendText.textContent = '= 数据存储';
        legendText.setAttribute('x', '65');
        legendText.setAttribute('y', '180');
        legendText.setAttribute('font-size', '12px');
        g.appendChild(legendText);
        
        // 特性标注
        const noteText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        noteText.textContent = '所有节点都存储数据';
        noteText.setAttribute('x', '100');
        noteText.setAttribute('y', '200');
        noteText.setAttribute('text-anchor', 'middle');
        noteText.setAttribute('font-size', '14px');
        noteText.setAttribute('font-weight', 'bold');
        noteText.setAttribute('fill', '#333');
        g.appendChild(noteText);
        
        return g;
    }
    
    // B+树示例 - 只有叶子节点存储数据，叶子节点形成链表
    function drawBPlusTreeExample(x, y) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${x}, ${y})`);
        
        // 标题
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        title.textContent = 'B+树结构';
        title.setAttribute('x', '100');
        title.setAttribute('y', '-20');
        title.setAttribute('text-anchor', 'middle');
        title.setAttribute('font-weight', 'bold');
        title.setAttribute('font-size', '16px');
        g.appendChild(title);
        
        // 根节点
        const rootNode = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rootNode.setAttribute('x', '70');
        rootNode.setAttribute('y', '0');
        rootNode.setAttribute('width', '60');
        rootNode.setAttribute('height', '30');
        rootNode.setAttribute('rx', '5');
        rootNode.setAttribute('fill', '#4dabf5');
        rootNode.setAttribute('stroke', '#1976d2');
        g.appendChild(rootNode);
        
        const rootText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        rootText.textContent = '50';
        rootText.setAttribute('x', '100');
        rootText.setAttribute('y', '20');
        rootText.setAttribute('text-anchor', 'middle');
        rootText.setAttribute('fill', 'white');
        g.appendChild(rootText);
        
        // 左节点
        const leftNode = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        leftNode.setAttribute('x', '20');
        leftNode.setAttribute('y', '60');
        leftNode.setAttribute('width', '60');
        leftNode.setAttribute('height', '30');
        leftNode.setAttribute('rx', '5');
        leftNode.setAttribute('fill', '#4dabf5');
        leftNode.setAttribute('stroke', '#1976d2');
        g.appendChild(leftNode);
        
        const leftText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        leftText.textContent = '20';
        leftText.setAttribute('x', '50');
        leftText.setAttribute('y', '80');
        leftText.setAttribute('text-anchor', 'middle');
        leftText.setAttribute('fill', 'white');
        g.appendChild(leftText);
        
        // 右节点
        const rightNode = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rightNode.setAttribute('x', '120');
        rightNode.setAttribute('y', '60');
        rightNode.setAttribute('width', '60');
        rightNode.setAttribute('height', '30');
        rightNode.setAttribute('rx', '5');
        rightNode.setAttribute('fill', '#4dabf5');
        rightNode.setAttribute('stroke', '#1976d2');
        g.appendChild(rightNode);
        
        const rightText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        rightText.textContent = '80';
        rightText.setAttribute('x', '150');
        rightText.setAttribute('y', '80');
        rightText.setAttribute('text-anchor', 'middle');
        rightText.setAttribute('fill', 'white');
        g.appendChild(rightText);
        
        // 叶子节点
        const leafNodes = [
            { x: 0, y: 120, width: 40, value: 10 },
            { x: 60, y: 120, width: 40, value: 30 },
            { x: 120, y: 120, width: 40, value: 60 },
            { x: 180, y: 120, width: 40, value: 90 }
        ];
        
        leafNodes.forEach(leaf => {
            const leafNode = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            leafNode.setAttribute('x', leaf.x.toString());
            leafNode.setAttribute('y', leaf.y.toString());
            leafNode.setAttribute('width', leaf.width.toString());
            leafNode.setAttribute('height', '30');
            leafNode.setAttribute('rx', '5');
            leafNode.setAttribute('fill', '#81c784');
            leafNode.setAttribute('stroke', '#388e3c');
            g.appendChild(leafNode);
            
            const leafText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            leafText.textContent = leaf.value.toString();
            leafText.setAttribute('x', (leaf.x + leaf.width / 2).toString());
            leafText.setAttribute('y', (leaf.y + 20).toString());
            leafText.setAttribute('text-anchor', 'middle');
            leafText.setAttribute('fill', 'white');
            g.appendChild(leafText);
            
            // 数据指示器（只有叶子节点有数据）
            const leafData = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            leafData.setAttribute('cx', (leaf.x + leaf.width - 10).toString());
            leafData.setAttribute('cy', (leaf.y + 15).toString());
            leafData.setAttribute('r', '4');
            leafData.setAttribute('fill', '#ffeb3b');
            leafData.setAttribute('stroke', '#f57f17');
            g.appendChild(leafData);
        });
        
        // 连接线
        const lines = [
            { x1: 100, y1: 30, x2: 50, y2: 60 },  // 根到左节点
            { x1: 100, y1: 30, x2: 150, y2: 60 }, // 根到右节点
            { x1: 50, y1: 90, x2: 20, y2: 120 },  // 左节点到叶子1
            { x1: 50, y1: 90, x2: 80, y2: 120 },  // 左节点到叶子2
            { x1: 150, y1: 90, x2: 140, y2: 120 }, // 右节点到叶子3
            { x1: 150, y1: 90, x2: 200, y2: 120 }  // 右节点到叶子4
        ];
        
        lines.forEach(line => {
            const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            l.setAttribute('x1', line.x1.toString());
            l.setAttribute('y1', line.y1.toString());
            l.setAttribute('x2', line.x2.toString());
            l.setAttribute('y2', line.y2.toString());
            l.setAttribute('stroke', '#1976d2');
            l.setAttribute('stroke-width', '1');
            g.appendChild(l);
        });
        
        // 叶子节点之间的链表连接
        for (let i = 0; i < leafNodes.length - 1; i++) {
            const current = leafNodes[i];
            const next = leafNodes[i + 1];
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const startX = current.x + current.width;
            const startY = current.y + 15;
            const endX = next.x;
            const endY = next.y + 15;
            
            // 弯曲的路径
            const pathD = `M ${startX} ${startY} 
                          C ${startX + 10} ${startY}, 
                            ${endX - 10} ${endY}, 
                            ${endX} ${endY}`;
            
            path.setAttribute('d', pathD);
            path.setAttribute('stroke', '#4caf50');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke-dasharray', '4,2');
            path.setAttribute('marker-end', 'url(#bplusarrow)');
            g.appendChild(path);
        }
        
        // 图例
        const legendBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        legendBg.setAttribute('x', '45');
        legendBg.setAttribute('y', '165');
        legendBg.setAttribute('width', '110');
        legendBg.setAttribute('height', '22');
        legendBg.setAttribute('fill', '#f5f5f5');
        legendBg.setAttribute('stroke', '#e0e0e0');
        legendBg.setAttribute('rx', '3');
        g.appendChild(legendBg);
        
        const legendCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        legendCircle.setAttribute('cx', '55');
        legendCircle.setAttribute('cy', '176');
        legendCircle.setAttribute('r', '4');
        legendCircle.setAttribute('fill', '#ffeb3b');
        legendCircle.setAttribute('stroke', '#f57f17');
        g.appendChild(legendCircle);
        
        const legendText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        legendText.textContent = '= 数据存储';
        legendText.setAttribute('x', '65');
        legendText.setAttribute('y', '180');
        legendText.setAttribute('font-size', '12px');
        g.appendChild(legendText);
        
        // 特性标注：只有叶子节点存储数据，叶子节点间有链接
        const noteText1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        noteText1.textContent = '只有叶子节点存储数据';
        noteText1.setAttribute('x', '100');
        noteText1.setAttribute('y', '200');
        noteText1.setAttribute('text-anchor', 'middle');
        noteText1.setAttribute('font-size', '14px');
        noteText1.setAttribute('font-weight', 'bold');
        noteText1.setAttribute('fill', '#333');
        g.appendChild(noteText1);
        
        const noteText2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        noteText2.textContent = '叶子节点间通过链表连接，便于范围查询';
        noteText2.setAttribute('x', '100');
        noteText2.setAttribute('y', '220');
        noteText2.setAttribute('text-anchor', 'middle');
        noteText2.setAttribute('font-size', '14px');
        noteText2.setAttribute('font-weight', 'bold');
        noteText2.setAttribute('fill', '#333');
        g.appendChild(noteText2);
        
        // 范围查询示意
        const rangeQueryRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rangeQueryRect.setAttribute('x', '60');
        rangeQueryRect.setAttribute('y', '120');
        rangeQueryRect.setAttribute('width', '160');
        rangeQueryRect.setAttribute('height', '30');
        rangeQueryRect.setAttribute('fill', 'none');
        rangeQueryRect.setAttribute('stroke', '#f44336');
        rangeQueryRect.setAttribute('stroke-width', '2');
        rangeQueryRect.setAttribute('stroke-dasharray', '5,3');
        rangeQueryRect.setAttribute('rx', '5');
        g.appendChild(rangeQueryRect);
        
        const rangeQueryText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        rangeQueryText.textContent = '范围查询 (30-90)';
        rangeQueryText.setAttribute('x', '140');
        rangeQueryText.setAttribute('y', '110');
        rangeQueryText.setAttribute('text-anchor', 'middle');
        rangeQueryText.setAttribute('font-size', '12px');
        rangeQueryText.setAttribute('fill', '#f44336');
        g.appendChild(rangeQueryText);
        
        return g;
    }
    
    // 添加箭头标记
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'bplusarrow');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '10');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
    polygon.setAttribute('fill', '#4caf50');
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);
    
    // 绘制两种树结构
    const bTreeG = drawBTreeExample(bTreeX, 40);
    const bPlusTreeG = drawBPlusTreeExample(bPlusTreeX, 40);
    
    svg.appendChild(bTreeG);
    svg.appendChild(bPlusTreeG);
    
    // 中间的比较标题
    const compareTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    compareTitle.textContent = 'B树与B+树的主要区别';
    compareTitle.setAttribute('x', svgCenterX);
    compareTitle.setAttribute('y', '20');
    compareTitle.setAttribute('text-anchor', 'middle');
    compareTitle.setAttribute('font-size', '18px');
    compareTitle.setAttribute('font-weight', 'bold');
    compareTitle.setAttribute('fill', '#333');
    svg.appendChild(compareTitle);
    
    // 中间的比较箭头
    const compareArrow = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    compareArrow.textContent = '对比';
    compareArrow.setAttribute('x', svgCenterX);
    compareArrow.setAttribute('y', '160');
    compareArrow.setAttribute('text-anchor', 'middle');
    compareArrow.setAttribute('font-size', '14px');
    compareArrow.setAttribute('font-weight', 'bold');
    svg.appendChild(compareArrow);
    
    // 比较箭头图形
    const arrowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    arrowLine.setAttribute('x1', svgCenterX - 15);
    arrowLine.setAttribute('y1', '170');
    arrowLine.setAttribute('x2', svgCenterX + 15);
    arrowLine.setAttribute('y2', '170');
    arrowLine.setAttribute('stroke', '#333');
    arrowLine.setAttribute('stroke-width', '1');
    svg.appendChild(arrowLine);
    
    const arrowHead = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    arrowHead.setAttribute('points', `${svgCenterX + 10},165 ${svgCenterX + 15},170 ${svgCenterX + 10},175`);
    arrowHead.setAttribute('fill', '#333');
    svg.appendChild(arrowHead);
    
    // 添加总结比较表
    const comparisonBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    comparisonBox.setAttribute('x', svgCenterX - 200);
    comparisonBox.setAttribute('y', '280');
    comparisonBox.setAttribute('width', '400');
    comparisonBox.setAttribute('height', '50');
    comparisonBox.setAttribute('fill', '#f5f5f5');
    comparisonBox.setAttribute('stroke', '#ddd');
    comparisonBox.setAttribute('rx', '5');
    svg.appendChild(comparisonBox);
    
    const comparison1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    comparison1.textContent = 'B树: 所有节点存储数据 - 适合存储在内存中需要随机访问的场景';
    comparison1.setAttribute('x', svgCenterX);
    comparison1.setAttribute('y', '300');
    comparison1.setAttribute('text-anchor', 'middle');
    comparison1.setAttribute('font-size', '12px');
    svg.appendChild(comparison1);
    
    const comparison2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    comparison2.textContent = 'B+树: 仅叶子节点存储数据，有链表连接 - 适合在磁盘存储的数据库索引';
    comparison2.setAttribute('x', svgCenterX);
    comparison2.setAttribute('y', '320');
    comparison2.setAttribute('text-anchor', 'middle');
    comparison2.setAttribute('font-size', '12px');
    svg.appendChild(comparison2);
    
    // 添加CSS样式确保SVG容器本身居中
    const style = document.createElement('style');
    style.textContent = `
        #tree-comparison-viz {
            display: flex;
            justify-content: center;
            width: 100%;
            padding: 0 20px;
            box-sizing: border-box;
            margin: 0 auto;
            overflow-x: auto;
        }
    `;
    document.head.appendChild(style);
} 