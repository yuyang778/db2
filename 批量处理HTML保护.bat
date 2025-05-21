@echo off
echo 开始部署HTML页面保护...
echo.

rem 设置当前目录
set CURRENT_DIR=%~dp0
cd /d %CURRENT_DIR%

echo 正在创建复制保护脚本到所有子目录...
for /d /r %%D in (*) do (
    echo 复制保护脚本到目录: %%D
    copy /Y "%CURRENT_DIR%page-protector.js" "%%D\" > nul 2>&1
)

echo.
echo 所有子目录已复制保护脚本
echo.
echo 注意：由于无法使用Node.js，无法自动修改HTML文件
echo 请按照以下步骤手动修改HTML文件：
echo.
echo 1. 在每个HTML文件的&lt;head&gt;标签内添加以下代码：
echo    &lt;script src="page-protector.js"&gt;&lt;/script&gt;
echo.
echo 2. 为所有链接添加target="_blank"属性，如：
echo    &lt;a href="链接地址" target="_blank"&gt;链接文本&lt;/a&gt;
echo.
echo 已完成保护脚本的复制，请手动完成HTML文件修改！
echo.
pause 