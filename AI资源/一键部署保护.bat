@echo off
echo 正在启动HTML页面保护部署工具...
echo.

PowerShell -ExecutionPolicy Bypass -File "%~dp0简化版保护脚本.ps1"

echo.
if %ERRORLEVEL% NEQ 0 (
    echo 部署过程中发生错误，请查看上面的详细信息。
    echo 如果是PowerShell执行策略问题，请以管理员身份运行PowerShell并执行:
    echo Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
    pause
    exit /b 1
)

echo 部署已完成！
pause 