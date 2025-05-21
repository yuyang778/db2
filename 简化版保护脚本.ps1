# 简化版HTML页面保护部署脚本
# 自动为所有子文件夹中的HTML文件添加保护功能

# 获取当前目录
$currentDir = Get-Location

# 保护脚本路径
$protectorScriptPath = Join-Path -Path $currentDir -ChildPath "page-protector.js"

# 检查保护脚本是否存在
if (!(Test-Path -Path $protectorScriptPath)) {
    Write-Host "错误: 无法找到保护脚本文件 page-protector.js"
    Write-Host "请确保该脚本与当前脚本在同一目录"
    pause
    exit
}

# 读取保护脚本内容
$protectorScriptContent = Get-Content -Path $protectorScriptPath -Raw

# 计数器
$processedFiles = 0
$protectedFiles = 0
$scriptCopies = 0

Write-Host "开始为所有HTML文件添加保护功能..."

# 获取所有子目录（包括当前目录）
$allDirs = Get-ChildItem -Path $currentDir -Directory -Recurse
$allDirs = @($currentDir) + $allDirs.FullName

# 处理每个目录
foreach ($dir in $allDirs) {
    Write-Host "处理目录: $dir"
    
    # 1. 复制保护脚本到目录
    $scriptTargetPath = Join-Path -Path $dir -ChildPath "page-protector.js"
    if (!(Test-Path -Path $scriptTargetPath)) {
        Copy-Item -Path $protectorScriptPath -Destination $scriptTargetPath
        Write-Host "  - 已复制保护脚本到: $scriptTargetPath"
        $scriptCopies++
    }
    
    # 2. 处理目录中的HTML文件
    $htmlFiles = Get-ChildItem -Path $dir -Filter "*.html" -File
    
    foreach ($htmlFile in $htmlFiles) {
        $processedFiles++
        Write-Host "  - 处理文件: $($htmlFile.Name)"
        
        # 读取HTML内容
        $content = Get-Content -Path $htmlFile.FullName -Raw -Encoding UTF8
        $modified = $false
        
        # 检查是否已包含保护脚本
        if ($content -match "page-protector.js") {
            Write-Host "    - 已包含保护脚本，跳过"
        } else {
            # 添加保护脚本引用
            $content = $content -replace "</head>", "<script src=`"page-protector.js`"></script>`r`n</head>"
            Write-Host "    - 已添加保护脚本引用"
            $modified = $true
        }
        
        # 为链接添加target="_blank"
        $lines = $content -split "`r`n"
        $newLines = @()
        $linksModified = $false
        
        foreach ($line in $lines) {
            # 简单地查找不包含target="_blank"的<a标签
            if ($line -match "<a.*href=" -and $line -notmatch "target=`"_blank`"" -and $line -notmatch "返回首页" -and $line -notmatch 'target="_self"') {
                # 替换最后的 > 为 target="_blank">
                $newLine = $line -replace ">", ' target="_blank">'
                $newLines += $newLine
                $linksModified = $true
            } else {
                $newLines += $line
            }
        }
        
        if ($linksModified) {
            $content = $newLines -join "`r`n"
            Write-Host "    - 已添加target=`"_blank`"到链接"
            $modified = $true
        }
        
        # 保存修改后的内容
        if ($modified) {
            Set-Content -Path $htmlFile.FullName -Value $content -Encoding UTF8
            $protectedFiles++
        }
    }
}

# 生成报告
Write-Host ""
Write-Host "=== 部署报告 ==="
Write-Host "扫描的HTML文件总数: $processedFiles"
Write-Host "已保护的HTML文件数: $protectedFiles"
Write-Host "复制保护脚本次数: $scriptCopies"
Write-Host ""
Write-Host "部署完成!"
Write-Host "若要验证，请打开网站并测试保护功能是否正常工作"

# 等待用户按键退出
Write-Host ""
Write-Host "按任意键退出..." -NoNewline
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null 