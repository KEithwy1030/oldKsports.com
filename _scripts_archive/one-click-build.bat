@echo off
setlocal

echo Building OldK Sports frontend...
call npm run build
if errorlevel 1 (
  echo Build failed.
  exit /b 1
)

echo Build output is in .\dist
echo Done.

endlocal

