@echo off
echo 开始部署HTML页面保护...
echo.

echo 复制保护脚本到所有子目录...
for /d /r "%~dp0" %%d in (*) do (
    echo 复制到: %%d
    copy /Y "%~dp0page-protector.js" "%%d\" > nul 2>&1
)

echo.
echo 保护脚本已复制到所有子目录。
echo.
echo 注意：您需要在每个HTML文件中手动添加以下内容：
echo 1. 在&lt;/head&gt;标签前添加: ^<script src="page-protector.js"^>^</script^>
echo 2. 为链接添加target="_blank"属性
echo.
echo 已完成保护脚本的复制工作！
pause 