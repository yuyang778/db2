// 全局变量
let jsPlumbInstance;
let currentModule = 'er-diagram';
let elementCounter = 0;
let normalizationStep = 1;
let currentCase = 'redundancy';
let lastId = 0;

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 强制隐藏所有模块
    document.querySelectorAll('.module').forEach(module => {
        module.classList.remove('active');
        module.style.display = 'none';  // 额外强制隐藏
    });
    
    // 强制隐藏设计反例博物馆和动态规范化工具
    document.getElementById('anti-patterns').style.display = 'none';
    document.getElementById('dynamic-tool').style.display = 'none';
    
    // 只显示ER图模块
    const erDiagram = document.getElementById('er-diagram');
    erDiagram.classList.add('active');
    erDiagram.style.display = 'flex';  // 强制显示
    
    // 重置所有标签页状态
    document.querySelectorAll('nav ul li a').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 选中ER图标签
    document.getElementById('er-diagram-tab').classList.add('active');
    
    // 初始化模块切换
    initTabNavigation();
    
    // 初始化各个模块
    initERDiagramModule();
    initNormalizationModule();
    initAntiPatternsModule();
    initDynamicToolModule();
    
    // 初始化对话框
    initDialogs();
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize);
    
    // 初始运行一次窗口大小调整
    handleResize();
    
    // 设置状态消息
    setStatusMessage('数据库设计互动套件已准备就绪');
});

// 处理窗口大小变化
function handleResize() {
    // 重新计算主内容区高度
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    const main = document.querySelector('main');
    
    if (header && footer && main) {
        const headerHeight = header.offsetHeight;
        const footerHeight = footer.offsetHeight;
        const windowHeight = window.innerHeight;
        
        // 计算主内容区域的高度
        const mainHeight = windowHeight - headerHeight - footerHeight - 10; // 减去10像素缓冲
        
        // 应用新高度
        main.style.height = `${mainHeight}px`;
        
        // 如果ER图模块当前是活动的，调整其高度
        const erDiagram = document.getElementById('er-diagram');
        if (erDiagram && erDiagram.classList.contains('active')) {
            erDiagram.style.height = `${mainHeight}px`;
            
            // 如果jsPlumb实例存在，重新绘制连接
            if (jsPlumbInstance) {
                setTimeout(() => {
                    jsPlumbInstance.repaintEverything();
                }, 100);
            }
        }
    }
}

// 显示特定模块并隐藏其他模块
function showModule(moduleId) {
    console.log('正在切换到模块:', moduleId);  // 添加调试信息
    
    // 强制隐藏所有模块
    document.querySelectorAll('.module').forEach(module => {
        module.classList.remove('active');
        module.style.display = 'none';  // 额外强制隐藏
    });
    
    // 特别处理可能的问题模块
    document.getElementById('anti-patterns').style.display = 'none';
    document.getElementById('dynamic-tool').style.display = 'none';
    
    // 显示指定模块
    const targetModule = document.getElementById(moduleId);
    if (targetModule) {
        targetModule.classList.add('active');
        
        // 根据不同模块类型设置适当的display值
        if (moduleId === 'anti-patterns') {
            console.log('显示反例博物馆');
            targetModule.style.display = 'flex';
            
            // 重置演示按钮状态
            const demonstrateBtn = document.getElementById('demonstrate');
            if (demonstrateBtn) {
                demonstrateBtn.disabled = false;
            }
            
            showAntiPatternCase(currentCase);
            console.log('当前案例:', currentCase);
        } else if (moduleId === 'normalization') {
            targetModule.style.display = 'flex';
            updateNormalizationStep();
        } else if (moduleId === 'er-diagram') {
            targetModule.style.display = 'flex';
            if (jsPlumbInstance) {
                setTimeout(() => {
                    jsPlumbInstance.repaintEverything();
                }, 100);
            }
        } else if (moduleId === 'dynamic-tool') {
            targetModule.style.display = 'flex';
            // 确保表格正确渲染
            if (decomposedTables.length === 0) {
                addDecomposedTable();
            }
            renderDecomposedTables();
        }
        
        // 重新调整模块高度
        handleResize();
    }
    
    currentModule = moduleId;
    setStatusMessage(`已切换到${getTabName(moduleId)}模块`);
}

// 初始化标签页导航
function initTabNavigation() {
    const tabs = document.querySelectorAll('nav ul li a');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有标签的活动状态
            tabs.forEach(t => t.classList.remove('active'));
            
            // 添加当前标签的活动状态
            this.classList.add('active');
            
            // 获取模块ID
            const moduleId = this.id.replace('-tab', '');
            
            // 显示对应模块
            showModule(moduleId);
        });
    });
}

// 获取标签名称
function getTabName(moduleId) {
    switch(moduleId) {
        case 'er-diagram': return 'ER图协作白板';
        case 'normalization': return '规范化流程向导';
        case 'anti-patterns': return '设计反例博物馆';
        case 'dynamic-tool': return '动态规范化工具';
        default: return '未知';
    }
}

// 设置状态消息
function setStatusMessage(message) {
    document.getElementById('status-message').textContent = message;
}

// 生成唯一ID
function generateId(prefix = 'element') {
    lastId++;
    return `${prefix}-${lastId}`;
}

// ============================================================
// ER图协作白板模块
// ============================================================

function initERDiagramModule() {
    // 创建jsPlumb实例
    jsPlumbInstance = jsPlumb.getInstance({
        Connector: ['Bezier', { curviness: 50 }],
        PaintStyle: { stroke: '#5c96bc', strokeWidth: 2 },
        EndpointStyle: { radius: 5, fill: '#5c96bc' },
        HoverPaintStyle: { stroke: '#1e8151', strokeWidth: 3 },
        EndpointHoverStyle: { fill: '#1e8151' },
        Container: 'drawing-area',
        ConnectionOverlays: [
            ['Arrow', { location: 1, width: 10, length: 10 }]
        ]
    });

    // 设置默认关系模式输出内容 - ER图转换为关系模型的原则
    document.getElementById('relation-output').innerHTML = `<h4>ER图转换为关系模型的原则：</h4>
    <ol>
        <li>每个实体转换为一个关系模式</li>
         <li>实体的属性转换为关系的属性</li>
        <li>1:1关系：在任一方添加对方主键作为外键</li>
        <li>1:n关系：在n端添加1端的主键作为外键</li>
        <li>m:n关系：创建新关系，包含双方主键作为联合主键</li>
    </ol>`;
    
    // 设置默认连接参数
    jsPlumbInstance.registerConnectionType('basic', {
        anchor: ['Continuous', { faces: ['top', 'bottom', 'left', 'right'] }],
        connector: ['Bezier', { curviness: 50 }]
    });

    // 允许连接线可点击和可删除
    jsPlumbInstance.bind('click', function(conn, originalEvent) {
        if (confirm('确定要删除这条连接线吗?')) {
            jsPlumbInstance.deleteConnection(conn);
        }
    });
    
    // 添加点击元素名称事件委托
    document.getElementById('drawing-area').addEventListener('click', function(e) {
        // 检查是否点击了元素名称
        if(e.target.classList.contains('element-name')) {
            // 将元素设置为可编辑模式并获取焦点
            e.target.focus();
        }
    });
    
    // 连接建立事件
    jsPlumbInstance.bind('connection', function(info) {
        // 获取连接的源和目标元素
        const sourceEl = document.getElementById(info.sourceId);
        const targetEl = document.getElementById(info.targetId);
        
        if (!sourceEl || !targetEl) return;
        
        // 根据不同类型的连接设置样式
        const sourceType = sourceEl.dataset.type;
        const targetType = targetEl.dataset.type;
        
        let connColor;
        if ((sourceType === 'entity' && targetType === 'relationship') || 
            (sourceType === 'relationship' && targetType === 'entity')) {
            connColor = '#90caf9'; // 实体-关系连接
        } else if ((sourceType === 'entity' && (targetType === 'attribute' || targetType === 'key-attribute')) || 
                  ((sourceType === 'attribute' || sourceType === 'key-attribute') && targetType === 'entity')) {
            connColor = '#aed581'; // 实体-属性连接
        } else if ((sourceType === 'relationship' && (targetType === 'attribute' || targetType === 'key-attribute')) || 
                  ((sourceType === 'attribute' || sourceType === 'key-attribute') && targetType === 'relationship')) {
            connColor = '#ce93d8'; // 关系-属性连接
        }
        
        if (connColor) {
            info.connection.setPaintStyle({ stroke: connColor, strokeWidth: 2 });
        }
        
        setStatusMessage(`已创建从${getElementTypeName(sourceType)}到${getElementTypeName(targetType)}的连接`);
    });
    
    // 绑定事件处理器
    document.getElementById('generate-relation').addEventListener('click', generateRelationSchema);
    document.getElementById('clear-diagram').addEventListener('click', clearERDiagram);
    document.getElementById('save-diagram').addEventListener('click', saveERDiagram);
    document.getElementById('load-diagram').addEventListener('click', loadERDiagram);
    
    // 调整绘图区域大小
    adjustDrawingAreaSize();
    
    // 添加拖放功能
    initERDiagramDragDrop();
    
    // 窗口大小变化时调整大小
    window.addEventListener('resize', function() {
        adjustDrawingAreaSize();
        jsPlumbInstance.repaintEverything();
    });
}

// 调整画布大小
function adjustDrawingAreaSize() {
    const workspace = document.getElementById('er-workspace');
    const drawingArea = document.getElementById('drawing-area');
    
    if (workspace && drawingArea) {
        drawingArea.style.width = '100%';
        drawingArea.style.height = '100%';
        
        // 确保jsPlumb重绘
        if (jsPlumbInstance) {
            setTimeout(() => {
                jsPlumbInstance.repaintEverything();
            }, 100);
        }
    }
}

// 初始化ER图拖拽功能
function initERDiagramDragDrop() {
    const components = document.querySelectorAll('.component');
    const drawingArea = document.getElementById('drawing-area');
    
    // 为每个组件添加拖拽开始事件
    components.forEach(component => {
        component.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', component.dataset.type);
            e.dataTransfer.effectAllowed = 'copy';
            
            // 创建拖拽时的视觉反馈
            const dragFeedback = document.createElement('div');
            dragFeedback.className = `drag-feedback ${component.dataset.type}`;
            dragFeedback.textContent = component.textContent;
            dragFeedback.style.position = 'absolute';
            dragFeedback.style.left = '-1000px';
            document.body.appendChild(dragFeedback);
            
            // 设置拖拽图像
            e.dataTransfer.setDragImage(dragFeedback, 50, 25);
            
            // 为了IE兼容性，需要延迟删除
            setTimeout(() => {
                document.body.removeChild(dragFeedback);
            }, 0);
        });
    });
    
    // 为画布添加拖拽相关事件
    drawingArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        drawingArea.classList.add('drop-active');
    });
    
    drawingArea.addEventListener('dragleave', function(e) {
        drawingArea.classList.remove('drop-active');
    });
    
    drawingArea.addEventListener('drop', function(e) {
        e.preventDefault();
        drawingArea.classList.remove('drop-active');
        
        const type = e.dataTransfer.getData('text/plain');
        if (!type) {
            console.error('拖拽数据丢失，请重试');
            setStatusMessage('拖拽失败，请重试');
            return;
        }
        
        const elementId = generateId(type);
        
        // 确保在有效的位置创建元素
        let offsetX = e.offsetX;
        let offsetY = e.offsetY;
        
        // 如果事件目标不是画布本身，进行位置调整
        if (e.target !== drawingArea) {
            const rect = drawingArea.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        }
        
        // 创建元素
        createERElement(type, elementId, offsetX, offsetY);
    });

    // 使用interact.js实现画布内元素的拖动
    interact('.er-element')
        .draggable({
            inertia: true,
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: true
                })
            ],
            autoScroll: true,
            listeners: {
                move: dragMoveListener,
                end: function(event) {
                    jsPlumbInstance.repaintEverything();
                }
            }
        });
}

// 元素拖动监听器
function dragMoveListener(event) {
    const target = event.target;
    
    // 保持拖动前的位置属性
    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
    
    // 确保元素不会超出绘图区域
    const drawingArea = document.getElementById('drawing-area');
    const drawingRect = drawingArea.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    
    // 限制x坐标在绘图区域内
    let newX = x;
    if (targetRect.width < drawingRect.width) {
        const minX = 0;
        const maxX = drawingRect.width - targetRect.width;
        newX = Math.max(minX, Math.min(maxX, x));
    }
    
    // 限制y坐标在绘图区域内
    let newY = y;
    if (targetRect.height < drawingRect.height) {
        const minY = 0;
        const maxY = drawingRect.height - targetRect.height;
        newY = Math.max(minY, Math.min(maxY, y));
    }
    
    // 更新元素位置
    target.style.transform = `translate(${newX}px, ${newY}px)`;
    
    // 更新位置属性
    target.setAttribute('data-x', newX);
    target.setAttribute('data-y', newY);
    
    // 重绘所有连接
    jsPlumbInstance.revalidateElement(target);
    setStatusMessage(`正在移动元素: ${target.id}`);
}

// 创建ER图元素
function createERElement(type, id, x, y) {
    const element = document.createElement('div');
    element.id = id;
    element.className = `er-element er-${type}`;
    element.dataset.type = type;
    
    // 根据类型设置不同的内容和外观
    switch(type) {
        case 'entity':
            element.innerHTML = `<div class="element-content">
                                    <div class="element-name" contenteditable="true">实体${++elementCounter}</div>
                                 </div>`;
            break;
        case 'relationship':
            element.innerHTML = `<div class="element-content">
                                    <div class="element-name" contenteditable="true">关系${++elementCounter}</div>
                                    <div class="relation-type">
                                        <select class="relation-cardinality">
                                            <option value="1:1">1:1</option>
                                            <option value="1:n" selected>1:n</option>
                                            <option value="n:m">n:m</option>
                                        </select>
                                    </div>
                                 </div>`;
            break;
        case 'attribute':
            element.innerHTML = `<div class="element-content">
                                    <div class="element-name" contenteditable="true">属性${++elementCounter}</div>
                                 </div>`;
            break;
        case 'key-attribute':
            element.innerHTML = `<div class="element-content">
                                    <div class="element-name" contenteditable="true">主键${++elementCounter}</div>
                                 </div>`;
            break;
    }
    
    // 设置元素位置
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    
    // 添加data-x和data-y属性以支持拖拽
    element.setAttribute('data-x', 0);
    element.setAttribute('data-y', 0);
    
    // 添加删除按钮
    const deleteBtn = document.createElement('span');
    deleteBtn.className = 'delete-element';
    deleteBtn.innerHTML = '×';
    deleteBtn.style.position = 'absolute';
    deleteBtn.style.top = '2px';
    deleteBtn.style.right = '5px';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.color = '#d32f2f';
    deleteBtn.style.fontSize = '16px';
    deleteBtn.style.fontWeight = 'bold';
    deleteBtn.style.zIndex = '20';
    
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        jsPlumbInstance.remove(id);
        document.getElementById(id).remove();
    });
    
    element.appendChild(deleteBtn);
    
    // 将元素添加到画布
    document.getElementById('drawing-area').appendChild(element);
    
    // 修复：确保元素已添加到DOM后再进行jsPlumb操作
    setTimeout(() => {
        // 使元素可拖动
        jsPlumbInstance.draggable(id, {
            containment: 'parent',
            start: function() {
                setStatusMessage(`正在移动${getElementTypeName(type)}: ${id}`);
            },
            stop: function() {
                setStatusMessage(`已重新定位${getElementTypeName(type)}: ${id}`);
                jsPlumbInstance.repaintEverything();
            }
        });
        
        // 根据类型添加不同的端点
        if (type === 'entity') {
            jsPlumbInstance.addEndpoint(id, {
                anchor: ['TopCenter', 'RightMiddle', 'BottomCenter', 'LeftMiddle'],
                isSource: true,
                isTarget: true,
                maxConnections: -1,
                endpoint: ['Dot', { radius: 5 }],
                paintStyle: { fill: '#5c96bc' },
                hoverPaintStyle: { fill: '#1e8151' },
                connectorStyle: { stroke: '#5c96bc', strokeWidth: 2 },
                connectorHoverStyle: { stroke: '#1e8151', strokeWidth: 3 }
            });
        } else if (type === 'relationship') {
            jsPlumbInstance.addEndpoint(id, {
                anchor: ['TopCenter', 'RightMiddle', 'BottomCenter', 'LeftMiddle'],
                isSource: true,
                isTarget: true,
                maxConnections: -1,
                endpoint: ['Dot', { radius: 5 }],
                paintStyle: { fill: '#ce93d8' },
                hoverPaintStyle: { fill: '#1e8151' },
                connectorStyle: { stroke: '#ce93d8', strokeWidth: 2 },
                connectorHoverStyle: { stroke: '#1e8151', strokeWidth: 3 }
            });
        } else {
            // 属性和主键属性
            jsPlumbInstance.addEndpoint(id, {
                anchor: ['TopCenter', 'RightMiddle', 'BottomCenter', 'LeftMiddle'],
                isSource: true,
                isTarget: true,
                maxConnections: 1, // 属性只能连接到一个实体
                endpoint: ['Dot', { radius: 5 }],
                paintStyle: { fill: '#aed581' },
                hoverPaintStyle: { fill: '#1e8151' },
                connectorStyle: { stroke: '#aed581', strokeWidth: 2 },
                connectorHoverStyle: { stroke: '#1e8151', strokeWidth: 3 }
            });
        }
        jsPlumbInstance.repaintEverything();
    }, 50);
    
    setStatusMessage(`已添加${getElementTypeName(type)}: ${id}`);
}

// 根据类型获取元素类型名称
function getElementTypeName(type) {
    switch(type) {
        case 'entity': return '实体';
        case 'relationship': return '关系';
        case 'attribute': return '属性';
        case 'key-attribute': return '主键属性';
        default: return type;
    }
}

// 清除ER图
function clearERDiagram() {
    // 确认对话框
    if (confirm('确定要清除当前设计吗？此操作不可撤销。')) {
        jsPlumbInstance.empty('drawing-area');
        elementCounter = 0;
        setStatusMessage('画布已清除');
    }
}

// 生成关系模式
function generateRelationSchema() {
    const entities = Array.from(document.querySelectorAll('.er-entity'));
    let output = '';
    
    // ER图转换为关系模型的原则
    const principles = `<h4>ER图转换为关系模型的原则：</h4>
    <ol>
        <li>每个实体转换为一个关系模式</li>
        <li>1:1关系：在任一方添加对方主键作为外键</li>
        <li>1:n关系：在n端添加1端的主键作为外键</li>
        <li>m:n关系：创建新关系，包含双方主键作为联合主键</li>
    </ol>`;
    
    // 如果是首次生成，显示原则
    if (document.getElementById('relation-output').innerHTML === '') {
        output = principles + '\n\n';
    }
    
    // 存储实体关系信息，用于后续处理外键
    const entityRelations = {};
    
    // 遍历所有实体
    entities.forEach(entity => {
        const entityName = entity.querySelector('.element-name').textContent;
        const entityId = entity.id;
        
        // 获取与该实体相连的所有属性
        const connections = jsPlumbInstance.getConnections({source: entityId});
        const attributes = [];
        const keyAttributes = [];
        
        connections.forEach(conn => {
            const targetElement = document.getElementById(conn.targetId);
            if (targetElement && targetElement.dataset.type === 'attribute') {
                attributes.push(targetElement.querySelector('.element-name').textContent);
            } else if (targetElement && targetElement.dataset.type === 'key-attribute') {
                keyAttributes.push(targetElement.querySelector('.element-name').textContent);
            }
        });
        
        // 构建关系模式
        if (keyAttributes.length > 0 || attributes.length > 0) {
            output += `${entityName}(`;
            
            // 添加主键属性
            if (keyAttributes.length > 0) {
                output += `<u>${keyAttributes.join(', ')}</u>`;
                
                if (attributes.length > 0) {
                    output += ', ';
                }
            }
            
            // 添加普通属性
            if (attributes.length > 0) {
                output += attributes.join(', ');
            }
            
            output += ')\n';
            
            // 存储该实体的信息，用于后续处理
            entityRelations[entityName] = {
                id: entityId,
                keyAttributes: keyAttributes,
                attributes: attributes
            };
        }
    });
    
    // 处理关系
    const relationships = Array.from(document.querySelectorAll('.er-relationship'));
    
    relationships.forEach(relationship => {
        const relationshipName = relationship.querySelector('.element-name').textContent;
        const relationshipId = relationship.id;
        
        // 获取关系的基数
        const cardinalitySelect = relationship.querySelector('.relation-cardinality');
        const cardinality = cardinalitySelect ? cardinalitySelect.value : '1:n'; // 默认为1:n
        
        // 获取与该关系相连的所有实体
        const connections = jsPlumbInstance.getConnections({source: relationshipId});
        const relatedEntities = [];
        
        connections.forEach(conn => {
            const targetElement = document.getElementById(conn.targetId);
            if (targetElement && targetElement.dataset.type === 'entity') {
                relatedEntities.push(targetElement.querySelector('.element-name').textContent);
            }
        });
        
        // 获取关系自身的属性
        const relationAttributes = [];
        jsPlumbInstance.getConnections({source: relationshipId}).forEach(conn => {
            const targetElement = document.getElementById(conn.targetId);
            if (targetElement && targetElement.dataset.type === 'attribute') {
                relationAttributes.push(targetElement.querySelector('.element-name').textContent);
            }
        });
        
        // 根据关系的基数处理外键
        if (relatedEntities.length >= 2) {
            const entity1 = relatedEntities[0];
            const entity2 = relatedEntities[1];
            
            switch(cardinality) {
                case '1:1':
                    // 1:1关系：在任一方添加外键，这里选择添加到第一个实体
                    if (entityRelations[entity1] && entityRelations[entity2]) {
                        const fkAttrs = [];
                        // 获取entity2的主键作为外键
                        if (entityRelations[entity2].keyAttributes.length > 0) {
                            entityRelations[entity2].keyAttributes.forEach(key => {
                                const fkName = `${entity2}_${key}`;
                                fkAttrs.push(`${fkName} -> ${entity2}(${key})`);
                            });
                            output += `\n/* 添加到${entity1}的外键约束 */\n`;
                            output += `ALTER TABLE ${entity1} ADD FOREIGN KEY (${entityRelations[entity2].keyAttributes.map(key => `${entity2}_${key}`).join(', ')}) REFERENCES ${entity2}(${entityRelations[entity2].keyAttributes.join(', ')});\n`;
                        }
                    }
                    break;
                    
                case '1:n':
                    // 1:n关系：在n端添加1端的主键作为外键
                    // 假设entity1是1端，entity2是n端
                    if (entityRelations[entity1] && entityRelations[entity2]) {
                        const fkAttrs = [];
                        // 获取entity1的主键作为外键
                        if (entityRelations[entity1].keyAttributes.length > 0) {
                            entityRelations[entity1].keyAttributes.forEach(key => {
                                const fkName = `${entity1}_${key}`;
                                fkAttrs.push(`${fkName} -> ${entity1}(${key})`);
                            });
                            output += `\n/* 添加到${entity2}的外键约束 */\n`;
                            output += `ALTER TABLE ${entity2} ADD FOREIGN KEY (${entityRelations[entity1].keyAttributes.map(key => `${entity1}_${key}`).join(', ')}) REFERENCES ${entity1}(${entityRelations[entity1].keyAttributes.join(', ')});\n`;
                        }
                    }
                    break;
                    
                case 'n:m':
                    // m:n关系：创建新关系表
                    output += `\n/* 创建m:n关系表 */\n`;
                    output += `${relationshipName}(`;
                    
                    // 添加连接实体的主键作为联合主键
                    const foreignKeys = [];
                    relatedEntities.forEach(entityName => {
                        if (entityRelations[entityName] && entityRelations[entityName].keyAttributes.length > 0) {
                            entityRelations[entityName].keyAttributes.forEach(key => {
                                foreignKeys.push(`${entityName}_${key}`);
                            });
                        } else {
                            foreignKeys.push(`${entityName}_ID`);
                        }
                    });
                    
                    if (foreignKeys.length > 0) {
                        output += `<u>${foreignKeys.join(', ')}</u>`;
                        
                        if (relationAttributes.length > 0) {
                            output += ', ';
                        }
                    }
                    
                    // 添加关系的其他属性
                    if (relationAttributes.length > 0) {
                        output += relationAttributes.join(', ');
                    }
                    
                    output += ')\n';
                    
                    // 添加外键约束
                    relatedEntities.forEach(entityName => {
                        if (entityRelations[entityName] && entityRelations[entityName].keyAttributes.length > 0) {
                            output += `ALTER TABLE ${relationshipName} ADD FOREIGN KEY (${entityRelations[entityName].keyAttributes.map(key => `${entityName}_${key}`).join(', ')}) REFERENCES ${entityName}(${entityRelations[entityName].keyAttributes.join(', ')});\n`;
                        }
                    });
                    break;
            }
        }
    });
    
    // 显示输出
    document.getElementById('relation-output').innerHTML = output || '未检测到有效的ER图结构';
    setStatusMessage('已生成关系模式');
}

// 保存ER图设计
function saveERDiagram() {
    // 收集所有元素数据
    const elements = Array.from(document.querySelectorAll('.er-element')).map(el => {
        // 检查是否是关系，获取关系类型
        let relationCardinality = null;
        if (el.dataset.type === 'relationship') {
            const select = el.querySelector('.relation-cardinality');
            if (select) {
                relationCardinality = select.value;
            }
        }
        
        return {
            id: el.id,
            type: el.dataset.type,
            name: el.querySelector('.element-name').textContent,
            relationCardinality: relationCardinality,
            position: {
                left: el.style.left,
                top: el.style.top,
                x: el.getAttribute('data-x') || 0,
                y: el.getAttribute('data-y') || 0
            }
        };
    });
    
    // 收集所有连接数据
    const connections = jsPlumbInstance.getConnections().map(conn => {
        return {
            sourceId: conn.sourceId,
            targetId: conn.targetId
        };
    });
    
    // 创建保存数据
    const saveData = {
        elements: elements,
        connections: connections,
        elementCounter: elementCounter
    };
    
    // 转换为JSON字符串
    const saveJson = JSON.stringify(saveData);
    
    // 创建下载链接
    const blob = new Blob([saveJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'er-diagram.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setStatusMessage('设计已保存为JSON文件');
}

// 加载ER图设计
function loadERDiagram() {
    // 创建文件输入元素
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                // 清除当前画布
                jsPlumbInstance.empty('drawing-area');
                
                // 恢复元素计数器
                elementCounter = data.elementCounter || 0;
                
                // 创建所有元素
                data.elements.forEach(el => {
                    // 创建元素
                    const element = document.createElement('div');
                    element.id = el.id;
                    element.className = `er-element er-${el.type}`;
                    element.dataset.type = el.type;
                    element.style.left = el.position.left;
                    element.style.top = el.position.top;
                    element.setAttribute('data-x', el.position.x);
                    element.setAttribute('data-y', el.position.y);
                    element.style.transform = `translate(${el.position.x}px, ${el.position.y}px)`;
                    
                    // 设置元素内容
                    if (el.type === 'relationship' && el.relationCardinality) {
                        element.innerHTML = `<div class="element-content">
                                             <div class="element-name" contenteditable="true">${el.name}</div>
                                             <div class="relation-type">
                                                 <select class="relation-cardinality">
                                                     <option value="1:1" ${el.relationCardinality === '1:1' ? 'selected' : ''}>1:1</option>
                                                     <option value="1:n" ${el.relationCardinality === '1:n' ? 'selected' : ''}>1:n</option>
                                                     <option value="n:m" ${el.relationCardinality === 'n:m' ? 'selected' : ''}>n:m</option>
                                                 </select>
                                             </div>
                                           </div>`;
                    } else {
                        element.innerHTML = `<div class="element-content">
                                             <div class="element-name" contenteditable="true">${el.name}</div>
                                           </div>`;
                    }
                    
                    // 添加删除按钮
                    const deleteBtn = document.createElement('span');
                    deleteBtn.className = 'delete-element';
                    deleteBtn.innerHTML = '×';
                    deleteBtn.style.position = 'absolute';
                    deleteBtn.style.top = '2px';
                    deleteBtn.style.right = '5px';
                    deleteBtn.style.cursor = 'pointer';
                    deleteBtn.style.color = '#d32f2f';
                    deleteBtn.style.fontSize = '16px';
                    deleteBtn.style.fontWeight = 'bold';
                    
                    deleteBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        jsPlumbInstance.remove(el.id);
                        document.getElementById(el.id).remove();
                    });
                    
                    element.appendChild(deleteBtn);
                    
                    // 将元素添加到画布
                    document.getElementById('drawing-area').appendChild(element);
                    
                    // 使元素可拖动
                    jsPlumbInstance.draggable(el.id);
                    
                    // 添加端点
                    if (el.type === 'entity') {
                        jsPlumbInstance.addEndpoint(el.id, {
                            anchor: ['Continuous', { faces: ['top', 'bottom', 'left', 'right'] }],
                            isSource: true,
                            isTarget: true,
                            maxConnections: -1,
                            endpoint: ['Dot', { radius: 5 }],
                            paintStyle: { fill: '#5c96bc' },
                            hoverPaintStyle: { fill: '#1e8151' },
                            connectorStyle: { stroke: '#5c96bc', strokeWidth: 2 },
                            connectorHoverStyle: { stroke: '#1e8151', strokeWidth: 3 }
                        });
                    } else if (el.type === 'relationship') {
                        jsPlumbInstance.addEndpoint(el.id, {
                            anchor: ['Continuous', { faces: ['top', 'bottom', 'left', 'right'] }],
                            isSource: true,
                            isTarget: true,
                            maxConnections: -1,
                            endpoint: ['Dot', { radius: 5 }],
                            paintStyle: { fill: '#ce93d8' },
                            hoverPaintStyle: { fill: '#1e8151' },
                            connectorStyle: { stroke: '#ce93d8', strokeWidth: 2 },
                            connectorHoverStyle: { stroke: '#1e8151', strokeWidth: 3 }
                        });
                    } else {
                        // 属性和主键属性
                        jsPlumbInstance.addEndpoint(el.id, {
                            anchor: ['Continuous', { faces: ['top', 'bottom', 'left', 'right'] }],
                            isSource: true,
                            isTarget: true,
                            maxConnections: 1,
                            endpoint: ['Dot', { radius: 5 }],
                            paintStyle: { fill: '#aed581' },
                            hoverPaintStyle: { fill: '#1e8151' },
                            connectorStyle: { stroke: '#aed581', strokeWidth: 2 },
                            connectorHoverStyle: { stroke: '#1e8151', strokeWidth: 3 }
                        });
                    }
                });
                
                // 等待所有元素创建完成后再创建连接
                setTimeout(() => {
                    // 创建所有连接
                    data.connections.forEach(conn => {
                        jsPlumbInstance.connect({
                            source: conn.sourceId,
                            target: conn.targetId,
                            type: 'basic'
                        });
                    });
                    
                    setStatusMessage('设计已加载');
                }, 500);
                
            } catch (error) {
                console.error('加载设计文件时出错：', error);
                setStatusMessage('加载设计文件时出错');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// ============================================================
// 规范化流程向导模块
// ============================================================

function initNormalizationModule() {
    // 确保模块默认隐藏
    const normalization = document.getElementById('normalization');
    normalization.classList.remove('active');
    normalization.style.display = 'none';  // 强制隐藏
    
    // 绑定上一步按钮
    document.getElementById('prev-step').addEventListener('click', function() {
        if (normalizationStep > 1) {
            normalizationStep--;
            updateNormalizationStep();
        }
    });
    
    // 绑定下一步按钮
    document.getElementById('next-step').addEventListener('click', function() {
        if (normalizationStep < 6) {
            normalizationStep++;
            updateNormalizationStep();
        }
    });
    
    // 不要在初始化时自动运行updateNormalizationStep
    // 只在模块被显示时才更新内容
}

// 更新规范化步骤
function updateNormalizationStep() {
    // 更新步骤指示器
    document.getElementById('step-indicator').textContent = `步骤 ${normalizationStep}/6`;
    
    // 更新前进/后退按钮状态
    document.getElementById('prev-step').disabled = (normalizationStep === 1);
    document.getElementById('next-step').disabled = (normalizationStep === 6);
    
    // 更新步骤内容
    const stepTitle = document.getElementById('step-title');
    const stepContent = document.getElementById('step-content');
    const visualArea = document.getElementById('normalization-visual');
    
    switch(normalizationStep) {
        case 1:
            stepTitle.textContent = '规范化入门';
            stepContent.innerHTML = '数据库规范化是一组通过分解关系来消除数据库中冗余和异常的过程。这个过程遵循一系列规则，称为范式。从低级的范式（如1NF）逐步提升到高级范式（如3NF）。';
            visualArea.innerHTML = `
                <div class="intro-animation">
                    <div class="norm-step">未规范化</div>
                    <div class="norm-arrow">↓</div>
                    <div class="norm-step">第一范式 (1NF)</div>
                    <div class="norm-arrow">↓</div>
                    <div class="norm-step">第二范式 (2NF)</div>
                    <div class="norm-arrow">↓</div>
                    <div class="norm-step">第三范式 (3NF)</div>
                </div>
                <p class="norm-description">通过规范化过程，我们可以解决数据冗余、插入异常、更新异常和删除异常问题。</p>
            `;
            setStatusMessage('规范化流程向导: 入门');
            break;
            
        case 2:
            stepTitle.textContent = '未规范化表';
            stepContent.innerHTML = '未规范化的表通常包含重复数据和可能导致异常的结构。让我们看一个课程管理系统的例子，其中包含课程、学生和教师信息。';
            visualArea.innerHTML = `
                <h3>课程管理表（未规范化）</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>课程编号</th>
                            <th>课程名称</th>
                            <th>教师编号</th>
                            <th>教师姓名</th>
                            <th>教师办公室</th>
                            <th>学生编号</th>
                            <th>学生姓名</th>
                            <th>学生年级</th>
                            <th>成绩</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>CS101</td>
                            <td>数据库基础</td>
                            <td>T001</td>
                            <td>张教授</td>
                            <td>A-101</td>
                            <td>S001</td>
                            <td>李明</td>
                            <td>大二</td>
                            <td>85</td>
                        </tr>
                        <tr>
                            <td>CS101</td>
                            <td>数据库基础</td>
                            <td>T001</td>
                            <td>张教授</td>
                            <td>A-101</td>
                            <td>S002</td>
                            <td>王红</td>
                            <td>大二</td>
                            <td>92</td>
                        </tr>
                        <tr>
                            <td>CS101</td>
                            <td>数据库基础</td>
                            <td>T001</td>
                            <td>张教授</td>
                            <td>A-101</td>
                            <td>S003</td>
                            <td>赵刚</td>
                            <td>大三</td>
                            <td>78</td>
                        </tr>
                        <tr>
                            <td>CS102</td>
                            <td>编程入门</td>
                            <td>T002</td>
                            <td>刘教授</td>
                            <td>B-202</td>
                            <td>S001</td>
                            <td>李明</td>
                            <td>大二</td>
                            <td>90</td>
                        </tr>
                        <tr>
                            <td>CS102</td>
                            <td>编程入门</td>
                            <td>T002</td>
                            <td>刘教授</td>
                            <td>B-202</td>
                            <td>S003</td>
                            <td>赵刚</td>
                            <td>大三</td>
                            <td>85</td>
                        </tr>
                    </tbody>
                </table>
                <div class="problem-highlight">
                    <p>问题：</p>
                    <ul>
                        <li>数据冗余：教师信息在多个行中重复</li>
                        <li>插入异常：无法添加没有学生的课程</li>
                        <li>删除异常：删除特定学生可能会丢失课程信息</li>
                        <li>更新异常：更新教师信息需要修改多行</li>
                    </ul>
                </div>
            `;
            setStatusMessage('规范化流程向导: 未规范化表');
            break;
            
        case 3:
            stepTitle.textContent = '第一范式 (1NF)';
            stepContent.innerHTML = '第一范式要求表格中的每个单元格都只包含一个值（原子值），并且每列都具有唯一的名称。这意味着需要消除重复组和数组值。';
            visualArea.innerHTML = `
                <h3>转换为第一范式 (1NF)</h3>
                <p class="step-instruction">第一范式确保每个单元格只包含一个值。在我们的例子中，原表已经满足1NF。</p>
                
                <div class="animation-container">
                    <div class="normalization-table">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th class="primary-key">课程编号</th>
                                    <th>课程名称</th>
                                    <th>教师编号</th>
                                    <th>教师姓名</th>
                                    <th>教师办公室</th>
                                    <th class="primary-key">学生编号</th>
                                    <th>学生姓名</th>
                                    <th>学生年级</th>
                                    <th>成绩</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>CS101</td>
                                    <td>数据库基础</td>
                                    <td>T001</td>
                                    <td>张教授</td>
                                    <td>A-101</td>
                                    <td>S001</td>
                                    <td>李明</td>
                                    <td>大二</td>
                                    <td>85</td>
                                </tr>
                                <tr>
                                    <td>CS101</td>
                                    <td>数据库基础</td>
                                    <td>T001</td>
                                    <td>张教授</td>
                                    <td>A-101</td>
                                    <td>S002</td>
                                    <td>王红</td>
                                    <td>大二</td>
                                    <td>92</td>
                                </tr>
                                <!-- 更多行... -->
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="1nf-rules">
                    <p>第一范式 (1NF) 规则：</p>
                    <ul>
                        <li>每个单元格包含原子值（不可再分）</li>
                        <li>每列有唯一名称</li>
                        <li>列中的值必须具有相同的数据类型</li>
                        <li>不同行的顺序无关紧要</li>
                        <li>不同列的顺序无关紧要</li>
                        <li>不存在重复行</li>
                    </ul>
                </div>
            `;
            setStatusMessage('规范化流程向导: 第一范式 (1NF)');
            break;
            
        case 4:
            stepTitle.textContent = '第二范式 (2NF)';
            stepContent.innerHTML = '第二范式要求表格必须满足第一范式，并且所有非主键属性必须完全依赖于整个主键。简而言之，它消除了对主键的部分依赖。';
            visualArea.innerHTML = `
                <h3>转换为第二范式 (2NF)</h3>
                <p class="step-instruction">我们的主键是（课程编号，学生编号）的组合。观察到有些列只依赖于课程编号，有些只依赖于学生编号，而不是完整的复合主键。</p>
                
                <div class="animation-container">
                    <div class="split-tables">
                        <div class="table-container">
                            <h4>课程表</h4>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th class="primary-key">课程编号</th>
                                        <th>课程名称</th>
                                        <th>教师编号</th>
                                        <th>教师姓名</th>
                                        <th>教师办公室</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>CS101</td>
                                        <td>数据库基础</td>
                                        <td>T001</td>
                                        <td>张教授</td>
                                        <td>A-101</td>
                                    </tr>
                                    <tr>
                                        <td>CS102</td>
                                        <td>编程入门</td>
                                        <td>T002</td>
                                        <td>刘教授</td>
                                        <td>B-202</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="table-container">
                            <h4>学生表</h4>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th class="primary-key">学生编号</th>
                                        <th>学生姓名</th>
                                        <th>学生年级</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>S001</td>
                                        <td>李明</td>
                                        <td>大二</td>
                                    </tr>
                                    <tr>
                                        <td>S002</td>
                                        <td>王红</td>
                                        <td>大二</td>
                                    </tr>
                                    <tr>
                                        <td>S003</td>
                                        <td>赵刚</td>
                                        <td>大三</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="table-container">
                            <h4>选课成绩表</h4>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th class="primary-key">课程编号</th>
                                        <th class="primary-key">学生编号</th>
                                        <th>成绩</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>CS101</td>
                                        <td>S001</td>
                                        <td>85</td>
                                    </tr>
                                    <tr>
                                        <td>CS101</td>
                                        <td>S002</td>
                                        <td>92</td>
                                    </tr>
                                    <tr>
                                        <td>CS101</td>
                                        <td>S003</td>
                                        <td>78</td>
                                    </tr>
                                    <tr>
                                        <td>CS102</td>
                                        <td>S001</td>
                                        <td>90</td>
                                    </tr>
                                    <tr>
                                        <td>CS102</td>
                                        <td>S003</td>
                                        <td>85</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="2nf-rules">
                    <p>第二范式 (2NF) 规则：</p>
                    <ul>
                        <li>表必须已经满足第一范式</li>
                        <li>所有非主键属性必须完全依赖于整个主键</li>
                        <li>如果一个表有复合主键，那么没有属性可以只依赖于主键的一部分</li>
                    </ul>
                </div>
            `;
            setStatusMessage('规范化流程向导: 第二范式 (2NF)');
            break;
            
        case 5:
            stepTitle.textContent = '第三范式 (3NF)';
            stepContent.innerHTML = '第三范式要求表格必须满足第二范式，并且所有非主键属性必须直接依赖于主键，而不是通过其他非主键属性传递依赖。';
            visualArea.innerHTML = `
                <h3>转换为第三范式 (3NF)</h3>
                <p class="step-instruction">观察到在课程表中，教师姓名和办公室依赖于教师编号，而不是直接依赖于课程编号（主键）。我们需要进一步拆分。</p>
                
                <div class="animation-container">
                    <div class="split-tables">
                        <div class="table-container">
                            <h4>课程表</h4>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th class="primary-key">课程编号</th>
                                        <th>课程名称</th>
                                        <th>教师编号</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>CS101</td>
                                        <td>数据库基础</td>
                                        <td>T001</td>
                                    </tr>
                                    <tr>
                                        <td>CS102</td>
                                        <td>编程入门</td>
                                        <td>T002</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="table-container">
                            <h4>教师表</h4>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th class="primary-key">教师编号</th>
                                        <th>教师姓名</th>
                                        <th>教师办公室</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>T001</td>
                                        <td>张教授</td>
                                        <td>A-101</td>
                                    </tr>
                                    <tr>
                                        <td>T002</td>
                                        <td>刘教授</td>
                                        <td>B-202</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="table-container">
                            <h4>学生表</h4>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th class="primary-key">学生编号</th>
                                        <th>学生姓名</th>
                                        <th>学生年级</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>S001</td>
                                        <td>李明</td>
                                        <td>大二</td>
                                    </tr>
                                    <tr>
                                        <td>S002</td>
                                        <td>王红</td>
                                        <td>大二</td>
                                    </tr>
                                    <tr>
                                        <td>S003</td>
                                        <td>赵刚</td>
                                        <td>大三</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div class="table-container">
                            <h4>选课成绩表</h4>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th class="primary-key">课程编号</th>
                                        <th class="primary-key">学生编号</th>
                                        <th>成绩</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>CS101</td>
                                        <td>S001</td>
                                        <td>85</td>
                                    </tr>
                                    <tr>
                                        <td>CS101</td>
                                        <td>S002</td>
                                        <td>92</td>
                                    </tr>
                                    <tr>
                                        <td>CS101</td>
                                        <td>S003</td>
                                        <td>78</td>
                                    </tr>
                                    <tr>
                                        <td>CS102</td>
                                        <td>S001</td>
                                        <td>90</td>
                                    </tr>
                                    <tr>
                                        <td>CS102</td>
                                        <td>S003</td>
                                        <td>85</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="3nf-rules">
                    <p>第三范式 (3NF) 规则：</p>
                    <ul>
                        <li>表必须已经满足第二范式</li>
                        <li>所有非主键属性必须直接依赖于主键</li>
                        <li>非主键属性之间不应存在传递依赖</li>
                    </ul>
                </div>
            `;
            setStatusMessage('规范化流程向导: 第三范式 (3NF)');
            break;
            
        case 6:
            stepTitle.textContent = '规范化总结';
            stepContent.innerHTML = '通过规范化过程，我们将原始的未规范化表分解为遵循第三范式的多个关系表。这减少了数据冗余，并消除了潜在的插入、更新和删除异常。';
            visualArea.innerHTML = `
                <h3>规范化结果</h3>
                <div class="normalization-summary">
                    <h4>解决的问题：</h4>
                    <ul>
                        <li><strong>消除数据冗余</strong>：相同的信息不再多次存储</li>
                        <li><strong>消除更新异常</strong>：修改教师信息只需在一处更改</li>
                        <li><strong>消除删除异常</strong>：删除一个学生不会丢失课程或教师信息</li>
                        <li><strong>消除插入异常</strong>：可以添加没有学生的新课程</li>
                    </ul>
                    
                    <h4>最终模式：</h4>
                    <div class="final-schema">
                        <p><strong>教师</strong>(<u>教师编号</u>, 教师姓名, 教师办公室)</p>
                        <p><strong>课程</strong>(<u>课程编号</u>, 课程名称, 教师编号)
                            <br><small>外键: 教师编号 参照 教师</small>
                        </p>
                        <p><strong>学生</strong>(<u>学生编号</u>, 学生姓名, 学生年级)</p>
                        <p><strong>选课</strong>(<u>课程编号, 学生编号</u>, 成绩)
                            <br><small>外键: 课程编号 参照 课程</small>
                            <br><small>外键: 学生编号 参照 学生</small>
                        </p>
                    </div>
                    
                    <h4>高级范式：</h4>
                    <p>除了3NF，还有更高级的范式，如BCNF、4NF和5NF，用于解决特定的数据依赖问题。</p>
                </div>
            `;
            setStatusMessage('规范化流程向导: 总结');
            break;
    }
}

// ============================================================
// 设计反例博物馆模块
// ============================================================

function initAntiPatternsModule() {
    // 确保模块默认隐藏，避免显示冲突
    const antiPatterns = document.getElementById('anti-patterns');
    antiPatterns.classList.remove('active');
    antiPatterns.style.display = 'none'; // 强制隐藏
    
    // 同时确保内部的案例显示区也被隐藏
    const caseDisplay = document.querySelector('.case-display');
    if (caseDisplay) {
        caseDisplay.style.display = 'none';
    }
    
    // 绑定案例选择点击事件
    const caseItems = document.querySelectorAll('#case-selector li');
    
    caseItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有选中状态
            caseItems.forEach(i => i.classList.remove('selected'));
            
            // 添加当前选中状态
            this.classList.add('selected');
            
            // 更新当前案例
            currentCase = this.dataset.case;
            
            // 显示选中案例
            showAntiPatternCase(currentCase);
        });
    });
    
    // 绑定演示按钮
    document.getElementById('demonstrate').addEventListener('click', function() {
        demonstrateAntiPattern(currentCase);
    });
    
    // 绑定解决方案按钮
    document.getElementById('fix-design').addEventListener('click', function() {
        showFixSolution(currentCase);
    });
}

// 显示反面案例
function showAntiPatternCase(caseType) {
    console.log('显示案例:', caseType);
    
    const descriptionEl = document.getElementById('case-description');
    const demoEl = document.getElementById('case-demo');
    
    if (!descriptionEl || !demoEl) {
        console.error('无法找到案例描述或演示元素');
        return;
    }
    
    // 清空之前的内容
    descriptionEl.innerHTML = '';
    demoEl.innerHTML = '';
    
    // 确保case-display正确显示
    const caseDisplay = document.querySelector('.case-display');
    if (caseDisplay) {
        caseDisplay.style.display = 'flex';
    }
    
    // 重置演示按钮状态
    const demonstrateBtn = document.getElementById('demonstrate');
    if (demonstrateBtn) {
        demonstrateBtn.disabled = false;
    }
    
    // 根据案例类型显示不同内容
    switch(caseType) {
        case 'redundancy':
            // 数据冗余问题
            descriptionEl.innerHTML = `
                <h3>数据冗余问题</h3>
                <p>数据冗余是指在数据库中多次存储相同的数据。这不仅浪费存储空间，而且会导致数据不一致性问题。</p>
                <p>以下是一个员工和部门信息表的示例，其中部门信息在多个行中重复出现。</p>
            `;
            demoEl.innerHTML = `
                <h4>员工部门表（存在数据冗余）</h4>
                <table class="data-table" id="redundancy-table">
                    <thead>
                        <tr>
                            <th>员工编号</th>
                            <th>员工姓名</th>
                            <th>部门编号</th>
                            <th>部门名称</th>
                            <th>部门位置</th>
                            <th>部门经理</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>E001</td>
                            <td>张三</td>
                            <td>D001</td>
                            <td>研发部</td>
                            <td>A栋3楼</td>
                            <td>王经理</td>
                        </tr>
                        <tr>
                            <td>E002</td>
                            <td>李四</td>
                            <td>D001</td>
                            <td>研发部</td>
                            <td>A栋3楼</td>
                            <td>王经理</td>
                        </tr>
                        <tr>
                            <td>E003</td>
                            <td>王五</td>
                            <td>D001</td>
                            <td>研发部</td>
                            <td>A栋3楼</td>
                            <td>王经理</td>
                        </tr>
                        <tr>
                            <td>E004</td>
                            <td>赵六</td>
                            <td>D002</td>
                            <td>市场部</td>
                            <td>B栋2楼</td>
                            <td>李经理</td>
                        </tr>
                        <tr>
                            <td>E005</td>
                            <td>钱七</td>
                            <td>D002</td>
                            <td>市场部</td>
                            <td>B栋2楼</td>
                            <td>李经理</td>
                        </tr>
                    </tbody>
                </table>
            `;
            setStatusMessage('设计反例博物馆: 数据冗余问题');
            break;
            
        case 'update-anomaly':
            // 更新异常问题
            descriptionEl.innerHTML = `
                <h3>更新异常</h3>
                <p>更新异常是指在更新某些数据时，需要更新多个记录，否则会导致数据不一致。</p>
                <p>以下示例展示了当需要更新部门位置时可能出现的问题。</p>
            `;
            demoEl.innerHTML = `
                <h4>员工部门表（存在更新异常）</h4>
                <table class="data-table" id="update-table">
                    <thead>
                        <tr>
                            <th>员工编号</th>
                            <th>员工姓名</th>
                            <th>部门编号</th>
                            <th>部门名称</th>
                            <th>部门位置</th>
                            <th>部门经理</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>E001</td>
                            <td>张三</td>
                            <td>D001</td>
                            <td>研发部</td>
                            <td>A栋3楼</td>
                            <td>王经理</td>
                        </tr>
                        <tr>
                            <td>E002</td>
                            <td>李四</td>
                            <td>D001</td>
                            <td>研发部</td>
                            <td>A栋3楼</td>
                            <td>王经理</td>
                        </tr>
                        <tr>
                            <td>E003</td>
                            <td>王五</td>
                            <td>D001</td>
                            <td>研发部</td>
                            <td>A栋3楼</td>
                            <td>王经理</td>
                        </tr>
                    </tbody>
                </table>
                <div class="update-instruction">
                    <p>点击"数据操作"按钮模拟更新研发部位置为"A栋5楼"，但只更新一行。</p>
                </div>
            `;
            setStatusMessage('设计反例博物馆: 更新异常');
            break;
            
        case 'delete-anomaly':
            // 删除异常问题
            descriptionEl.innerHTML = `
                <h3>删除异常</h3>
                <p>删除异常是指在删除某些数据时，可能会无意中删除其他重要信息。</p>
                <p>以下示例展示了当删除部门中最后一名员工时，会丢失该部门的所有信息。</p>
            `;
            demoEl.innerHTML = `
                <h4>员工部门表（存在删除异常）</h4>
                <table class="data-table" id="delete-table">
                    <thead>
                        <tr>
                            <th>员工编号</th>
                            <th>员工姓名</th>
                            <th>部门编号</th>
                            <th>部门名称</th>
                            <th>部门位置</th>
                            <th>部门经理</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>E001</td>
                            <td>张三</td>
                            <td>D001</td>
                            <td>研发部</td>
                            <td>A栋3楼</td>
                            <td>王经理</td>
                        </tr>
                        <tr>
                            <td>E006</td>
                            <td>孙八</td>
                            <td>D003</td>
                            <td>财务部</td>
                            <td>C栋1楼</td>
                            <td>陈经理</td>
                        </tr>
                    </tbody>
                </table>
                <div class="delete-instruction">
                    <p>点击"数据操作"按钮模拟删除财务部唯一员工"孙八"的记录。</p>
                </div>
            `;
            setStatusMessage('设计反例博物馆: 删除异常');
            break;
            
        case 'insert-anomaly':
            // 插入异常问题
            descriptionEl.innerHTML = `
                <h3>插入异常</h3>
                <p>插入异常是指无法插入特定数据，因为缺少其他相关信息。</p>
                <p>以下示例展示了无法添加一个还没有员工的新部门。</p>
            `;
            demoEl.innerHTML = `
                <h4>员工部门表（存在插入异常）</h4>
                <table class="data-table" id="insert-table">
                    <thead>
                        <tr>
                            <th>员工编号</th>
                            <th>员工姓名</th>
                            <th>部门编号</th>
                            <th>部门名称</th>
                            <th>部门位置</th>
                            <th>部门经理</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>E001</td>
                            <td>张三</td>
                            <td>D001</td>
                            <td>研发部</td>
                            <td>A栋3楼</td>
                            <td>王经理</td>
                        </tr>
                        <tr>
                            <td>E004</td>
                            <td>赵六</td>
                            <td>D002</td>
                            <td>市场部</td>
                            <td>B栋2楼</td>
                            <td>李经理</td>
                        </tr>
                    </tbody>
                </table>
                <div class="insert-instruction">
                    <p>点击"数据操作"按钮尝试添加一个新部门"人力资源部"（D004），但没有相关员工。</p>
                </div>
            `;
            setStatusMessage('设计反例博物馆: 插入异常');
            break;
            
        default:
            console.error('未知的案例类型:', caseType);
            descriptionEl.innerHTML = `<h3>错误</h3><p>未知的案例类型: ${caseType}</p>`;
            break;
    }
}

// 演示反面模式
function demonstrateAntiPattern(caseType) {
    console.log('演示案例:', caseType);
    
    // 移除之前的问题说明
    const existingNotes = document.querySelectorAll('.problem-note');
    existingNotes.forEach(note => note.remove());
    
    // 根据案例类型执行不同的演示
    switch(caseType) {
        case 'redundancy':
            // 数据冗余问题演示
            demonstrateRedundancy();
            break;
            
        case 'update-anomaly':
            // 更新异常问题演示
            demonstrateUpdateAnomaly();
            break;
            
        case 'delete-anomaly':
            // 删除异常问题演示
            demonstrateDeleteAnomaly();
            break;
            
        case 'insert-anomaly':
            // 插入异常问题演示
            demonstrateInsertAnomaly();
            break;
            
        default:
            console.error('未知的案例类型:', caseType);
            break;
    }
    
    // 禁用演示按钮，避免重复演示
    document.getElementById('demonstrate').disabled = true;
}

// 演示数据冗余问题
function demonstrateRedundancy() {
    const redundancyTable = document.getElementById('redundancy-table');
    if (!redundancyTable) {
        console.error('无法找到冗余表格元素');
        return;
    }
    
    // 添加一个新员工，需要再次输入相同的部门信息
    const newRow = redundancyTable.insertRow(-1);
    
    newRow.innerHTML = `
        <td>E006</td>
        <td>周八</td>
        <td>D001</td>
        <td>研发部</td>
        <td>A栋3楼</td>
        <td>王经理</td>
    `;
    
    // 高亮显示新行
    newRow.classList.add('highlight');
    
    // 高亮显示冗余数据
    const cells = newRow.querySelectorAll('td:nth-child(3), td:nth-child(4), td:nth-child(5), td:nth-child(6)');
    cells.forEach(cell => {
        cell.style.backgroundColor = '#ffe0e0';
        cell.style.border = '2px solid #ff9999';
    });
    
    // 添加问题说明
    const problemNote = document.createElement('div');
    problemNote.className = 'problem-note';
    problemNote.innerHTML = `
        <p class="note-title" style="font-weight:bold; color:#d32f2f; margin-top:15px; font-size:16px">⚠️ 问题展示：数据冗余</p>
        <p>添加新员工时，必须重复输入相同的部门信息（红色高亮部分），增加了数据冗余。</p>
        <p>如果部门信息发生变化，需要更新<strong>所有</strong>含有该部门的记录，否则会导致数据不一致。</p>
        <p>例如：如果研发部搬迁到新位置，必须找到并更新<strong>所有</strong>研发部员工的记录。</p>
    `;
    
    document.getElementById('case-demo').appendChild(problemNote);
    setStatusMessage('演示：数据冗余导致的问题');
}

// 演示更新异常问题
function demonstrateUpdateAnomaly() {
    const updateTable = document.getElementById('update-table');
    if (!updateTable) {
        console.error('无法找到更新异常表格元素');
        return;
    }
    
    const rows = updateTable.querySelectorAll('tbody tr');
    if (rows.length === 0) {
        console.error('更新异常表格没有行');
        return;
    }
    
    // 只更新第一行的部门位置
    if (rows[0] && rows[0].cells && rows[0].cells.length > 4) {
        rows[0].cells[4].textContent = 'A栋5楼';
        rows[0].cells[4].classList.add('highlight');
        rows[0].cells[4].style.backgroundColor = '#ffe0e0';
        rows[0].cells[4].style.border = '2px solid #ff9999';
        
        // 添加箭头指示更新不一致
        for (let i = 1; i < rows.length; i++) {
            if (rows[i] && rows[i].cells && rows[i].cells.length > 4) {
                const cell = rows[i].cells[4];
                cell.innerHTML += ` <span style="color:red; font-weight:bold;">≠</span> <span style="color:red;">A栋5楼</span>`;
                cell.style.backgroundColor = '#fff3cd';
                cell.style.border = '2px solid #ffcc80';
            }
        }
        
        // 添加问题说明
        const updateNote = document.createElement('div');
        updateNote.className = 'problem-note';
        updateNote.innerHTML = `
            <p class="note-title" style="font-weight:bold; color:#d32f2f; margin-top:15px; font-size:16px">⚠️ 问题展示：更新异常</p>
            <p>只更新了张三所在行的部门位置（红色高亮），其他行的部门位置仍然是旧值（黄色高亮）。</p>
            <p>这导致了<strong>数据不一致</strong>：同一部门在不同记录中有不同的位置信息。</p>
            <p>实际上，如果要正确更新部门位置，需要找到并修改<strong>所有</strong>相关员工记录。</p>
        `;
        
        document.getElementById('case-demo').appendChild(updateNote);
        setStatusMessage('演示：更新异常导致的数据不一致');
    } else {
        console.error('更新异常表格结构不正确');
    }
}

// 演示删除异常问题
function demonstrateDeleteAnomaly() {
    const deleteTable = document.getElementById('delete-table');
    if (!deleteTable) {
        console.error('无法找到删除异常表格元素');
        return;
    }
    
    const tbody = deleteTable.querySelector('tbody');
    if (!tbody || tbody.rows.length < 2) {
        console.error('删除异常表格结构不正确');
        return;
    }
    
    // 保存表格状态用于对比
    const beforeDeleteHTML = deleteTable.outerHTML;
    
    // 获取财务部信息（假设在第二行）
    if (tbody.rows.length > 1 && tbody.rows[1].cells.length > 5) {
        const departmentInfo = tbody.rows[1].cells[3].textContent + 
                              " (" + tbody.rows[1].cells[5].textContent + 
                              ", " + tbody.rows[1].cells[4].textContent + ")";
        
        // 删除第二行（财务部唯一员工）
        tbody.deleteRow(1);
        
        // 添加问题说明
        const deleteNote = document.createElement('div');
        deleteNote.className = 'problem-note';
        deleteNote.innerHTML = `
            <p class="note-title" style="font-weight:bold; color:#d32f2f; margin-top:15px; font-size:16px">⚠️ 问题展示：删除异常</p>
            <p>删除孙八（财务部唯一员工）的记录后，<strong>财务部的所有信息也一并丢失</strong>。</p>
            <p>现在数据库中不再包含关于"${departmentInfo}"的任何信息，即使该部门仍然存在。</p>
            <details style="margin-top:10px;">
                <summary style="cursor:pointer; color:#0078d7;">查看删除前的表格</summary>
                <div style="margin-top:10px;">${beforeDeleteHTML}</div>
            </details>
        `;
        
        document.getElementById('case-demo').appendChild(deleteNote);
        setStatusMessage('演示：删除异常导致的数据丢失');
    } else {
        console.error('删除异常表格行数不足或结构不正确');
    }
}

// 演示插入异常问题
function demonstrateInsertAnomaly() {
    const insertTable = document.getElementById('insert-table');
    if (!insertTable) {
        console.error('无法找到插入异常表格元素');
        return;
    }
    
    // 创建一个表单来展示插入操作
    const insertForm = document.createElement('div');
    insertForm.className = 'insert-form';
    insertForm.style.marginTop = '15px';
    insertForm.style.padding = '10px';
    insertForm.style.border = '2px dashed #ff6b6b';
    insertForm.style.borderRadius = '8px';
    insertForm.style.backgroundColor = '#fff5f5';
    
    insertForm.innerHTML = `
        <h5 style="margin-bottom:10px; color:#d32f2f;">尝试添加新部门记录</h5>
        <form id="insert-dept-form">
            <table class="data-table">
                <tr>
                    <th>员工编号</th>
                    <th>员工姓名</th>
                    <th>部门编号</th>
                    <th>部门名称</th>
                    <th>部门位置</th>
                    <th>部门经理</th>
                </tr>
                <tr>
                    <td><input type="text" value="?" disabled style="width:30px; text-align:center; color:red;"></td>
                    <td><input type="text" value="?" disabled style="width:30px; text-align:center; color:red;"></td>
                    <td><input type="text" value="D004" style="width:50px;"></td>
                    <td><input type="text" value="人力资源部" style="width:80px;"></td>
                    <td><input type="text" value="B栋3楼" style="width:60px;"></td>
                    <td><input type="text" value="周经理" style="width:60px;"></td>
                </tr>
            </table>
            <p style="color:red; margin-top:10px; text-align:center;">❌ 插入失败：员工编号和员工姓名不能为空</p>
        </form>
    `;
    
    document.getElementById('case-demo').appendChild(insertForm);
    
    // 添加问题说明
    const insertNote = document.createElement('div');
    insertNote.className = 'problem-note error';
    insertNote.innerHTML = `
        <p class="note-title" style="font-weight:bold; color:#d32f2f; margin-top:15px; font-size:16px">⚠️ 问题展示：插入异常</p>
        <p>无法添加新部门"人力资源部"的信息，因为员工编号和员工姓名是表的必填字段。</p>
        <p>由于当前表结构，<strong>必须同时拥有员工信息才能添加部门信息</strong>。</p>
        <p>这种设计使得无法记录尚未有员工的新部门，阻止了有效信息的存储。</p>
    `;
    
    document.getElementById('case-demo').appendChild(insertNote);
    setStatusMessage('演示：插入异常阻止了有效数据的添加');
}

// ============================================================
// 动态规范化工具模块
// ============================================================

// 原始表字段和数据
const originalTableData = {
    name: '课程选修表',
    fields: [
        { name: '学号', isPrimaryKey: true },
        { name: '学生姓名', isPrimaryKey: false },
        { name: '课程编号', isPrimaryKey: true },
        { name: '课程名称', isPrimaryKey: false },
        { name: '教师编号', isPrimaryKey: false },
        { name: '教师姓名', isPrimaryKey: false },
        { name: '分数', isPrimaryKey: false }
    ],
    data: [
        ['S001', '张三', 'C001', '数据库', 'T001', '王教授', 85],
        ['S001', '张三', 'C002', '编程基础', 'T002', '李教授', 90],
        ['S002', '李四', 'C001', '数据库', 'T001', '王教授', 78],
        ['S003', '王五', 'C002', '编程基础', 'T002', '李教授', 92]
    ],
    dependencies: [
        { determinant: ['学号'], dependent: ['学生姓名'] },
        { determinant: ['课程编号'], dependent: ['课程名称'] },
        { determinant: ['教师编号'], dependent: ['教师姓名'] },
        { determinant: ['学号', '课程编号'], dependent: ['分数'] },
        { determinant: ['课程编号'], dependent: ['教师编号'] }
    ]
};

let decomposedTables = [];
let tableCounter = 0;

function initDynamicToolModule() {
    // 确保模块默认隐藏
    const dynamicTool = document.getElementById('dynamic-tool');
    dynamicTool.classList.remove('active');
    dynamicTool.style.display = 'none';  // 强制隐藏
    
    // 显示原始表
    renderOriginalTable();
    
    // 添加表按钮
    document.getElementById('add-table').addEventListener('click', function() {
        addDecomposedTable();
    });
    
    // 检查规范化等级按钮
    document.getElementById('check-normalization').addEventListener('click', function() {
        checkNormalizationLevel();
    });
    
    // 获取提示按钮
    document.getElementById('get-hint').addEventListener('click', function() {
        provideNormalizationHint();
    });
    
    // 重置按钮
    document.getElementById('reset-tables').addEventListener('click', function() {
        resetDecomposedTables();
    });
    
    // 初始化一个分解表，但只在第一次显示模块时创建
    if (decomposedTables.length === 0) {
        addDecomposedTable();
    }
}

// 渲染原始表
function renderOriginalTable() {
    const container = document.getElementById('original-table-container');
    
    // 创建表格
    const table = document.createElement('table');
    table.className = 'data-table';
    
    // 创建表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    originalTableData.fields.forEach(field => {
        const th = document.createElement('th');
        th.textContent = field.name;
        if (field.isPrimaryKey) {
            th.className = 'primary-key';
        }
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // 创建表体
    const tbody = document.createElement('tbody');
    
    originalTableData.data.forEach(row => {
        const tr = document.createElement('tr');
        
        row.forEach((cell, index) => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
    
    // 添加原始表的功能依赖描述
    const fdDescription = document.createElement('div');
    fdDescription.className = 'functional-dependencies';
    fdDescription.innerHTML = '<h5>功能依赖：</h5>';
    
    const fdList = document.createElement('ul');
    originalTableData.dependencies.forEach(fd => {
        const li = document.createElement('li');
        li.textContent = `${fd.determinant.join(', ')} → ${fd.dependent.join(', ')}`;
        fdList.appendChild(li);
    });
    
    fdDescription.appendChild(fdList);
    container.appendChild(fdDescription);
    
    // 添加可拖拽的字段容器
    const fieldsContainer = document.createElement('div');
    fieldsContainer.className = 'available-fields';
    fieldsContainer.innerHTML = '<h5>可用字段：</h5>';
    
    const fieldContainer = document.createElement('div');
    fieldContainer.className = 'field-container';
    
    originalTableData.fields.forEach(field => {
        const fieldElement = document.createElement('div');
        fieldElement.className = 'field-draggable';
        fieldElement.setAttribute('draggable', 'true');
        fieldElement.dataset.field = field.name;
        fieldElement.dataset.isPrimaryKey = field.isPrimaryKey;
        fieldElement.textContent = field.name;
        
        // 添加拖拽事件
        fieldElement.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', field.name);
        });
        
        fieldContainer.appendChild(fieldElement);
    });
    
    fieldsContainer.appendChild(fieldContainer);
    container.appendChild(fieldsContainer);
}

// 添加分解表
function addDecomposedTable() {
    tableCounter++;
    
    const newTable = {
        id: `table-${tableCounter}`,
        name: `表${tableCounter}`,
        fields: [],
        primaryKeys: [] // 新增主键字段数组
    };
    
    decomposedTables.push(newTable);
    renderDecomposedTables();
}

// 向表中添加字段
function addFieldToTable(tableId, fieldName) {
    const table = decomposedTables.find(t => t.id === tableId);
    
    if (table && !table.fields.includes(fieldName)) {
        table.fields.push(fieldName);
        
        // 检查原表中该字段是否为主键，如果是，自动加入主键集合
        const originalField = originalTableData.fields.find(f => f.name === fieldName);
        if (originalField && originalField.isPrimaryKey) {
            table.primaryKeys.push(fieldName);
        }
        
        renderDecomposedTables();
        
        // 清除反馈消息
        document.getElementById('feedback-message').textContent = '';
    }
}

// 从表中移除字段
function removeFieldFromTable(tableId, fieldName) {
    const table = decomposedTables.find(t => t.id === tableId);
    
    if (table) {
        table.fields = table.fields.filter(f => f !== fieldName);
        // 同时从主键集合中移除
        table.primaryKeys = table.primaryKeys.filter(pk => pk !== fieldName);
        renderDecomposedTables();
    }
}

// 切换字段的主键状态
function togglePrimaryKey(tableId, fieldName) {
    const table = decomposedTables.find(t => t.id === tableId);
    
    if (table) {
        if (table.primaryKeys.includes(fieldName)) {
            // 从主键集合中移除
            table.primaryKeys = table.primaryKeys.filter(pk => pk !== fieldName);
        } else {
            // 添加到主键集合中
            table.primaryKeys.push(fieldName);
        }
        renderDecomposedTables();
    }
}

// 渲染分解表
function renderDecomposedTables() {
    const container = document.getElementById('decomposed-tables-container');
    container.innerHTML = '';
    
    decomposedTables.forEach(table => {
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        tableContainer.id = table.id;
        
        // 表头
        const tableHeader = document.createElement('h5');
        tableHeader.innerHTML = `${table.name} <span class="remove-table" data-table-id="${table.id}">×</span>`;
        tableContainer.appendChild(tableHeader);
        
        // 添加表说明
        const tableInfo = document.createElement('div');
        tableInfo.className = 'table-info';
        tableInfo.innerHTML = `<small>点击字段可切换主键状态 (🔑)</small>`;
        tableContainer.appendChild(tableInfo);
        
        // 字段容器
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'field-container';
        fieldContainer.dataset.tableId = table.id;
        
        // 显示已添加的字段
        table.fields.forEach(field => {
            const fieldElement = document.createElement('div');
            fieldElement.className = 'field-draggable';
            // 如果是主键，添加主键标识
            if (table.primaryKeys.includes(field)) {
                fieldElement.classList.add('primary-key-field');
                fieldElement.innerHTML = `${field} 🔑`;
            } else {
                fieldElement.textContent = field;
            }
            
            // 添加点击切换主键状态功能
            fieldElement.addEventListener('click', function(e) {
                if (e.target === fieldElement) { // 确保不是点击删除按钮
                    togglePrimaryKey(table.id, field);
                }
            });
            
            // 添加删除按钮
            const removeBtn = document.createElement('span');
            removeBtn.className = 'remove-field';
            removeBtn.innerHTML = '×';
            removeBtn.style.marginLeft = '5px';
            removeBtn.style.cursor = 'pointer';
            removeBtn.style.color = '#d32f2f';
            
            removeBtn.addEventListener('click', function() {
                removeFieldFromTable(table.id, field);
            });
            
            fieldElement.appendChild(removeBtn);
            fieldContainer.appendChild(fieldElement);
        });
        
        // 添加拖拽目标事件
        fieldContainer.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            this.classList.add('drop-target');
        });
        
        fieldContainer.addEventListener('dragleave', function(e) {
            this.classList.remove('drop-target');
        });
        
        fieldContainer.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drop-target');
            
            const fieldName = e.dataTransfer.getData('text/plain');
            addFieldToTable(this.dataset.tableId, fieldName);
        });
        
        tableContainer.appendChild(fieldContainer);
        
        // 添加关系模式表示法
        const schemaNotation = document.createElement('div');
        schemaNotation.className = 'schema-notation';
        let schemaText = `<strong>${table.name}</strong>(`;
        
        // 处理字段，主键加下划线
        if (table.fields.length > 0) {
            const fieldTexts = table.fields.map(field => {
                if (table.primaryKeys.includes(field)) {
                    return `<u>${field}</u>`;
                }
                return field;
            });
            schemaText += fieldTexts.join(', ');
        }
        schemaText += ')';
        schemaNotation.innerHTML = schemaText;
        tableContainer.appendChild(schemaNotation);
        
        container.appendChild(tableContainer);
    });
    
    // 绑定删除表事件
    document.querySelectorAll('.remove-table').forEach(btn => {
        btn.addEventListener('click', function() {
            removeDecomposedTable(this.dataset.tableId);
        });
    });
}

// 检查规范化等级
function checkNormalizationLevel() {
    // 检查表是否为空
    const emptyTables = decomposedTables.filter(table => table.fields.length === 0);
    if (emptyTables.length > 0) {
        document.getElementById('feedback-message').textContent = '错误：存在没有字段的表！';
        return;
    }
    
    // 检查是否所有原始字段都被包含
    const allDecomposedFields = decomposedTables.flatMap(table => table.fields);
    const allOriginalFields = originalTableData.fields.map(f => f.name);
    
    const missingFields = allOriginalFields.filter(field => !allDecomposedFields.includes(field));
    if (missingFields.length > 0) {
        document.getElementById('feedback-message').textContent = `错误：缺少字段 ${missingFields.join(', ')}！`;
        return;
    }
    
    // 检查每个表是否都有主键
    const tablesWithoutPK = decomposedTables.filter(table => table.primaryKeys.length === 0);
    if (tablesWithoutPK.length > 0) {
        const tableNames = tablesWithoutPK.map(t => t.name).join(', ');
        document.getElementById('feedback-message').textContent = `错误：以下表没有定义主键: ${tableNames}`;
        return;
    }
    
    // 检查主键完整性
    const is1NF = check1NF();
    const is2NF = is1NF && check2NF();
    const is3NF = is2NF && check3NF();
    
    // 检查是否存在无效的分解
    const hasInvalidDecomposition = checkInvalidDecomposition();
    
    let normLevel = '未规范化';
    if (is3NF && !hasInvalidDecomposition) {
        normLevel = '第三范式 (3NF)';
    } else if (is2NF) {
        normLevel = '第二范式 (2NF)';
    } else if (is1NF) {
        normLevel = '第一范式 (1NF)';
    }
    
    document.getElementById('normalization-level').textContent = normLevel;
    
    // 提供反馈
    let feedback = '';
    if (hasInvalidDecomposition) {
        feedback = '错误：当前分解可能丢失原有关系，导致无法恢复原始表';
    } else {
        feedback = `当前设计满足${normLevel}`;
        if (!is3NF) {
            feedback += '，但仍可改进';
        }
    }
    document.getElementById('feedback-message').textContent = feedback;
    
    setStatusMessage(`规范化等级检查完成：${normLevel}`);
}

// 检查是否存在无效的分解
function checkInvalidDecomposition() {
    // 检查是否每个功能依赖都被正确保留
    for (const fd of originalTableData.dependencies) {
        let fdPreserved = false;
        
        for (const table of decomposedTables) {
            // 检查该表是否包含完整的功能依赖
            const containsDeterminant = fd.determinant.every(attr => table.fields.includes(attr));
            const containsDependent = fd.dependent.every(attr => table.fields.includes(attr));
            
            if (containsDeterminant && containsDependent) {
                fdPreserved = true;
                break;
            }
        }
        
        if (!fdPreserved) {
            return true; // 存在未被保留的功能依赖
        }
    }
    
    // 检查是否存在表的主键不能唯一确定的情况
    for (const table of decomposedTables) {
        const primaryKeys = table.primaryKeys;
        // 跳过没有主键的表
        if (primaryKeys.length === 0) continue;
        
        // 检查主键是否能够确定表中的所有属性
        let allAttributesDetermined = true;
        
        for (const attr of table.fields) {
            if (primaryKeys.includes(attr)) continue; // 跳过主键本身
            
            // 检查是否有功能依赖：主键 -> 属性
            let attrDetermined = false;
            
            for (const fd of originalTableData.dependencies) {
                if (fd.dependent.includes(attr) && 
                    fd.determinant.every(det => primaryKeys.includes(det))) {
                    attrDetermined = true;
                    break;
                }
            }
            
            if (!attrDetermined) {
                allAttributesDetermined = false;
                break;
            }
        }
        
        if (!allAttributesDetermined) {
            return true; // 存在主键不能唯一确定的属性
        }
    }
    
    return false; // 分解有效
}

// 检查是否满足第一范式
function check1NF() {
    // 基本的1NF检查：确保每个表都有主键
    for (const table of decomposedTables) {
        if (table.primaryKeys.length === 0) {
            return false;
        }
    }
    
    return true;
}

// 检查是否满足第二范式
function check2NF() {
    // 确保已满足1NF
    if (!check1NF()) return false;
    
    // 检查每个表中的非主键属性是否完全依赖于该表的主键
    for (const table of decomposedTables) {
        // 跳过只有一个主键的表（这些表自动满足2NF）
        if (table.primaryKeys.length <= 1) continue;
        
        // 找出表中的非主键字段
        const nonPrimaryKeys = table.fields.filter(field => !table.primaryKeys.includes(field));
        
        // 如果表中没有非主键字段，它满足2NF
        if (nonPrimaryKeys.length === 0) continue;
        
        // 检查每个非主键字段是否依赖于部分主键
        for (const nonPK of nonPrimaryKeys) {
            // 查找与该非主键相关的所有功能依赖
            const relevantFDs = originalTableData.dependencies.filter(fd => 
                fd.dependent.includes(nonPK)
            );
            
            // 检查是否存在对部分主键的依赖
            const hasPartialDependency = relevantFDs.some(fd => {
                // 如果决定因子是主键的子集但不是完整主键，那么存在部分依赖
                const isSubsetOfPK = fd.determinant.every(det => table.primaryKeys.includes(det));
                const isProperSubset = isSubsetOfPK && fd.determinant.length < table.primaryKeys.length;
                
                return isProperSubset;
            });
            
            if (hasPartialDependency) {
                return false;
            }
        }
    }
    
    return true;
}

// 检查是否满足第三范式
function check3NF() {
    // 确保已满足2NF
    if (!check2NF()) return false;
    
    // 检查每个表中是否存在传递依赖
    for (const table of decomposedTables) {
        // 找出表中的非主键字段
        const nonPrimaryKeys = table.fields.filter(field => !table.primaryKeys.includes(field));
        const primaryKeys = table.primaryKeys;
        
        // 如果表中没有非主键字段，它自动满足3NF
        if (nonPrimaryKeys.length === 0) continue;
        
        // 检查是否所有非主键属性都直接依赖于主键
        for (const nonPK of nonPrimaryKeys) {
            let dependsOnPK = false;
            let dependsOnNonPK = false;
            
            // 检查该非主键是否直接依赖于表的主键
            for (const fd of originalTableData.dependencies) {
                // 如果决定因子完全包含在表的主键中，则该属性直接依赖于主键
                if (fd.dependent.includes(nonPK) && 
                    fd.determinant.every(det => primaryKeys.includes(det))) {
                    dependsOnPK = true;
                }
                
                // 检查是否存在从其他非主键属性到该属性的依赖关系
                if (fd.dependent.includes(nonPK) && 
                    fd.determinant.some(det => nonPrimaryKeys.includes(det))) {
                    dependsOnNonPK = true;
                }
            }
            
            // 如果存在传递依赖（依赖于非主键属性但不直接依赖于主键）
            // 或者该属性不是对主键的直接依赖，则不满足3NF
            if (dependsOnNonPK || !dependsOnPK) {
                return false;
            }
        }
    }
    
    // 还需检查所有的功能依赖是否都在表中正确表达
    // 遍历所有原始功能依赖
    for (const fd of originalTableData.dependencies) {
        // 检查是否有一个表能完整表达这个依赖
        let fdCaptured = false;
        
        for (const table of decomposedTables) {
            // 检查决定因子和依赖项是否都在同一个表中
            const determinantInTable = fd.determinant.every(attr => table.fields.includes(attr));
            const dependentInTable = fd.dependent.every(attr => table.fields.includes(attr));
            
            if (determinantInTable && dependentInTable) {
                fdCaptured = true;
                break;
            }
        }
        
        if (!fdCaptured) {
            // 如果有依赖关系没有被任何表捕获，则分解可能不保持功能依赖
            return false;
        }
    }
    
    return true;
}

// 提供规范化提示
function provideNormalizationHint() {
    // 检查每个表是否都有主键
    const tablesWithoutPK = decomposedTables.filter(table => table.primaryKeys.length === 0);
    if (tablesWithoutPK.length > 0) {
        const tableNames = tablesWithoutPK.map(t => t.name).join(', ');
        document.getElementById('feedback-message').innerHTML = `提示：请为以下表定义主键（点击字段切换主键状态）: <strong>${tableNames}</strong>`;
        return;
    }
    
    const is1NF = check1NF();
    const is2NF = is1NF && check2NF();
    const is3NF = is2NF && check3NF();
    const hasInvalidDecomposition = checkInvalidDecomposition();
    
    if (hasInvalidDecomposition) {
        document.getElementById('feedback-message').innerHTML = `
            <strong>提示：当前分解可能无效</strong><br>
            1. 确保每个功能依赖都被完整保留在某个表中<br>
            2. 每个表的主键应能唯一确定表中的所有非主键属性<br>
            3. 检查是否有表包含了不相关的属性集合
        `;
    } else if (!is1NF) {
        document.getElementById('feedback-message').innerHTML = '提示：确保每个表都包含至少一个主键字段。点击字段可切换主键状态。';
    } else if (!is2NF) {
        document.getElementById('feedback-message').innerHTML = '提示：将只依赖于部分主键的属性分离到单独的表中。例如，将学生姓名（只依赖于学号）放在单独的表里。';
    } else if (!is3NF) {
        document.getElementById('feedback-message').innerHTML = '提示：消除非主键属性之间的传递依赖。例如，教师姓名依赖于教师编号，而教师编号依赖于课程编号，这形成了传递依赖。';
    } else {
        document.getElementById('feedback-message').innerHTML = '很好！您的设计已经满足第三范式。每个表都有适当的主键，并且消除了部分依赖和传递依赖。';
    }
    
    setStatusMessage('已提供规范化提示');
}

// 重置分解表
function resetDecomposedTables() {
    decomposedTables = [];
    tableCounter = 0;
    addDecomposedTable();
    
    document.getElementById('normalization-level').textContent = '未规范化';
    document.getElementById('feedback-message').textContent = '';
    
    setStatusMessage('表已重置');
}

// ============================================================
// 对话框初始化
// ============================================================

function initDialogs() {
    // 帮助对话框
    const helpDialog = document.getElementById('help-dialog');
    const showHelpBtn = document.getElementById('show-help');
    const helpCloseBtn = helpDialog.querySelector('.close-btn');
    
    showHelpBtn.addEventListener('click', function(e) {
        e.preventDefault();
        helpDialog.style.display = 'block';
    });
    
    helpCloseBtn.addEventListener('click', function() {
        helpDialog.style.display = 'none';
    });
    
    // 教程对话框
    const tutorialDialog = document.getElementById('tutorial-dialog');
    const showTutorialBtn = document.getElementById('show-tutorial');
    const tutorialCloseBtn = tutorialDialog.querySelector('.close-btn');
    
    showTutorialBtn.addEventListener('click', function(e) {
        e.preventDefault();
        tutorialDialog.style.display = 'block';
    });
    
    tutorialCloseBtn.addEventListener('click', function() {
        tutorialDialog.style.display = 'none';
    });
    
    // 点击对话框外部关闭对话框
    window.addEventListener('click', function(e) {
        if (e.target === helpDialog) {
            helpDialog.style.display = 'none';
        }
        if (e.target === tutorialDialog) {
            tutorialDialog.style.display = 'none';
        }
    });
}

// 显示解决方案
function showFixSolution(caseType) {
    // 清除现有内容
    const demoEl = document.getElementById('case-demo');
    demoEl.innerHTML = '';
    
    // 显示解决方案
    switch(caseType) {
        case 'redundancy':
        case 'update-anomaly':
        case 'delete-anomaly':
        case 'insert-anomaly':
            // 所有问题的解决方案类似：规范化设计
            demoEl.innerHTML = `
                <h4>解决方案：规范化表设计</h4>
                <p>将原表分解为两个独立的表，消除冗余和异常。</p>
                
                <div class="solution-tables">
                    <div class="table-container">
                        <h5>员工表</h5>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th class="primary-key">员工编号</th>
                                    <th>员工姓名</th>
                                    <th>部门编号</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>E001</td>
                                    <td>张三</td>
                                    <td>D001</td>
                                </tr>
                                <tr>
                                    <td>E002</td>
                                    <td>李四</td>
                                    <td>D001</td>
                                </tr>
                                <tr>
                                    <td>E003</td>
                                    <td>王五</td>
                                    <td>D001</td>
                                </tr>
                                <tr>
                                    <td>E004</td>
                                    <td>赵六</td>
                                    <td>D002</td>
                                </tr>
                                <tr>
                                    <td>E005</td>
                                    <td>钱七</td>
                                    <td>D002</td>
                                </tr>
                                <tr>
                                    <td>E006</td>
                                    <td>孙八</td>
                                    <td>D003</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="table-container">
                        <h5>部门表</h5>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th class="primary-key">部门编号</th>
                                    <th>部门名称</th>
                                    <th>部门位置</th>
                                    <th>部门经理</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>D001</td>
                                    <td>研发部</td>
                                    <td>A栋3楼</td>
                                    <td>王经理</td>
                                </tr>
                                <tr>
                                    <td>D002</td>
                                    <td>市场部</td>
                                    <td>B栋2楼</td>
                                    <td>李经理</td>
                                </tr>
                                <tr>
                                    <td>D003</td>
                                    <td>财务部</td>
                                    <td>C栋1楼</td>
                                    <td>陈经理</td>
                                </tr>
                                <tr class="highlight">
                                    <td>D004</td>
                                    <td>人力资源部</td>
                                    <td>B栋3楼</td>
                                    <td>周经理</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="solution-explanation">
                    <h5>规范化设计解决的问题：</h5>
                    <ul>
                        <li><strong>数据冗余</strong>：部门信息只存储一次，不再重复</li>
                        <li><strong>更新异常</strong>：更新部门位置只需修改部门表中的一行</li>
                        <li><strong>删除异常</strong>：删除部门最后一名员工不会导致部门信息丢失</li>
                        <li><strong>插入异常</strong>：可以添加没有员工的新部门</li>
                    </ul>
                    
                    <h5>关系模式：</h5>
                    <p><strong>部门</strong>(<u>部门编号</u>, 部门名称, 部门位置, 部门经理)</p>
                    <p><strong>员工</strong>(<u>员工编号</u>, 员工姓名, 部门编号)
                        <br><small>外键: 部门编号 参照 部门</small>
                    </p>
                </div>
            `;
            break;
    }
    
    // 重置演示按钮
    document.getElementById('demonstrate').disabled = false;
    
    setStatusMessage('显示解决方案');
} 