@echo off
powershell.exe -NoProfile -File "%~dp0Install.ps1"
if errorlevel 1 (
  echo Installation failed. See the message above and README-Windows.txt.
  pause
  exit /b 1
)
pause
