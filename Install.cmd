@echo off
setlocal EnableExtensions DisableDelayedExpansion
if not defined APPDATA (echo APPDATA is not set. & goto :fail)
tasklist /FI "IMAGENAME eq AfterFX.exe" 2>nul | findstr /I /L /C:"AfterFX.exe" >nul
if not errorlevel 1 (echo Save your work and quit After Effects first. & goto :fail)
if not exist "%~dp0Checksums.txt" (echo Checksums.txt is missing. Extract the original ZIP again. & goto :fail)
for /f "usebackq tokens=1,*" %%A in ("%~dp0Checksums.txt") do (
  call :verify "%%A" "%%B"
  if errorlevel 1 goto :fail
)
set "ae_parent=%APPDATA%\Adobe\CEP\extensions"
set "ae_destination=%ae_parent%\co.sevenapps.paste"
set "ae_stage=%ae_parent%\.ae-emoji-install-%RANDOM%-%RANDOM%"
set "ae_backup="
if not exist "%ae_parent%" mkdir "%ae_parent%" || goto :fail
if exist "%ae_stage%" (echo Temporary installation folder already exists. & goto :fail)
mkdir "%ae_stage%" || goto :fail
xcopy "%~dp0extension\*" "%ae_stage%\" /E /I /H /Y /Q >nul
if errorlevel 1 (echo Could not prepare the extension. & goto :cleanup)
if exist "%ae_destination%" (
  if not exist "%APPDATA%\Sevemoji\Backups" mkdir "%APPDATA%\Sevemoji\Backups"
  if errorlevel 1 goto :cleanup
  call :backup
  if errorlevel 1 goto :cleanup
)
move "%ae_stage%" "%ae_destination%" >nul
if errorlevel 1 goto :rollback
echo AE Emoji installed. Open After Effects ^> Window ^> Extensions ^> AE Emoji.
echo Enable Allow Scripts to Write Files and Access Network in After Effects settings.
if not defined AE_EMOJI_NONINTERACTIVE pause
exit /b 0
:verify
if not exist "%~dp0%~2" (echo Missing package file: %~2 & exit /b 1)
certutil -hashfile "%~dp0%~2" SHA256 2>nul | findstr /I /L /C:"%~1" >nul
if errorlevel 1 (echo Package verification failed: %~2 & exit /b 1)
exit /b 0
:backup
set "ae_backup=%APPDATA%\Sevemoji\Backups\backup-%RANDOM%-%RANDOM%"
if exist "%ae_backup%" exit /b 1
move "%ae_destination%" "%ae_backup%" >nul
exit /b %errorlevel%
:rollback
echo Installation failed. Restoring the previous installation.
if defined ae_backup if not exist "%ae_destination%" move "%ae_backup%" "%ae_destination%" >nul
:cleanup
if exist "%ae_stage%" rmdir /S /Q "%ae_stage%"
:fail
echo Installation was not completed. See README-Windows.txt.
if not defined AE_EMOJI_NONINTERACTIVE pause
exit /b 1
