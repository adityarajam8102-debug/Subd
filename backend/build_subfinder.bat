@echo off
echo Building Subfinder...
"C:\Program Files\Go\bin\go.exe" build -o subfinder.exe
if %ERRORLEVEL% EQU 0 (
    echo Subfinder built successfully!
    subfinder.exe -version
) else (
    echo Build failed with error: %ERRORLEVEL%
)
pause
