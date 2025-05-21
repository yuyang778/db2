# HTML页面保护部署脚本 (PowerShell版)
# 自动为所有子文件夹中的HTML文件添加保护功能

Write-Host "开始部署HTML页面保护..." -ForegroundColor Green
Write-Host ""

# 获取当前目录
$currentDir = $PSScriptRoot
if (!$currentDir) {
    $currentDir = Get-Location
}

# 保护脚本路径
$protectorScriptPath = Join-Path -Path $currentDir -ChildPath "page-protector.js"

# 检查保护脚本是否存在
if (!(Test-Path -Path $protectorScriptPath)) {
    Write-Host "错误: 无法找到保护脚本文件 page-protector.js" -ForegroundColor Red
    Write-Host "请确保该脚本与当前脚本在同一目录" -ForegroundColor Red
    exit 1
}

# 读取保护脚本内容
$protectorScriptContent = Get-Content -Path $protectorScriptPath -Raw

# 计数器
$processedFiles = 0
$protectedFiles = 0
$scriptCopies = 0

# 递归处理目录的函数
function Process-Directory {
    param (
        [string]$dirPath
    )
    
    Write-Host "处理目录: $dirPath" -ForegroundColor Cyan
    
    # 处理当前目录中的HTML文件
    $htmlFiles = Get-ChildItem -Path $dirPath -Filter "*.html" -File
    foreach ($htmlFile in $htmlFiles) {
        Process-HtmlFile -filePath $htmlFile.FullName
    }
    
    # 复制保护脚本到当前目录（如果还没有）
    $scriptTargetPath = Join-Path -Path $dirPath -ChildPath "page-protector.js"
    if (!(Test-Path -Path $scriptTargetPath)) {
        $protectorScriptContent | Out-File -FilePath $scriptTargetPath -Encoding utf8
        Write-Host "  - 复制保护脚本到: $scriptTargetPath" -ForegroundColor Yellow
        $script:scriptCopies++
    }
    
    # 递归处理子目录
    $subDirs = Get-ChildItem -Path $dirPath -Directory
    foreach ($subDir in $subDirs) {
        Process-Directory -dirPath $subDir.FullName
    }
}

# 处理HTML文件的函数
function Process-HtmlFile {
    param (
        [string]$filePath
    )
    
    Write-Host "处理HTML文件: $filePath" -ForegroundColor Gray
    $script:processedFiles++
    
    try {
        # 读取文件内容
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
        $modified = $false
        
        # 检查文件是否已经包含保护脚本
        if ($content -match "page-protector.js") {
            Write-Host "  - 文件已包含保护脚本，跳过" -ForegroundColor Gray
        } else {
            # 添加保护脚本引用
            $content = $content -replace "</head>", "<script src=`"page-protector.js`"></script>`n</head>"
            $modified = $true
            Write-Host "  - 已添加保护脚本引用" -ForegroundColor Green
        }
        
        # 添加target="_blank"到所有链接
        $originalContent = $content
        $pattern = '<a\s+(?![^>]*target=["'']_blank["''])[^>]*href=["''][^"''>]+["''][^>]*>'
        $content = [regex]::Replace($content, $pattern, {
            param($match)
            $linkStr = $match.Value
            
            # 不修改返回首页的链接
            if ($linkStr -match '返回首页' -or ($linkStr -match 'index.html' -and $linkStr -match 'target="_self"')) {
                return $linkStr
            }
            
            # 添加target="_blank"
            if ($linkStr.EndsWith('>')) {
                return $linkStr.Substring(0, $linkStr.Length - 1) + ' target="_blank">'
            } else {
                return $linkStr + ' target="_blank"'
            }
        }, "IgnoreCase,Singleline")
        
        if ($originalContent -ne $content) {
            $modified = $true
            Write-Host "  - 已添加target=`"_blank`"到链接" -ForegroundColor Green
        }
        
        # 如果文件被修改，写回文件
        if ($modified) {
            $content | Out-File -FilePath $filePath -Encoding UTF8
            $script:protectedFiles++
        }
    } catch {
        Write-Host "  - 处理文件时出错: $_" -ForegroundColor Red
    }
}

# 开始处理
Process-Directory -dirPath $currentDir

# 生成报告
Write-Host ""
Write-Host "=== 部署报告 ===" -ForegroundColor Green
Write-Host "扫描的HTML文件总数: $processedFiles"
Write-Host "已保护的HTML文件数: $protectedFiles"
Write-Host "复制保护脚本次数: $scriptCopies"
Write-Host ""
Write-Host "部署完成!" -ForegroundColor Green
Write-Host "若要验证，请打开网站并测试保护功能是否正常工作"
Write-Host ""

# 暂停以查看结果
Write-Host "按任意键退出..." -NoNewline
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 