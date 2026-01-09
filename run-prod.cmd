@echo off
REM Script chạy ứng dụng Nuxt ở chế độ production trên Windows
REM Chỉ cần double-click file này trong thư mục project

REM Chuyển vào thư mục chứa script (chính là root project)
cd /d "%~dp0"

echo ============================
echo  TRUYENTRANH - PROD START
echo ============================
echo.

REM Kiểm tra npm đã cài chưa
where npm >nul 2>&1
if errorlevel 1 (
  echo Loi: Khong tim thay npm. Hay cai Node.js va npm truoc khi chay script nay.
  pause
  exit /b 1
)

echo [1/3] Cai dat dependencies (npm install)...
npm install
if errorlevel 1 (
  echo.
  echo Da xay ra loi khi chay "npm install".
  echo Vui long kiem tra lai mang hoac file package.json.
  pause
  exit /b 1
)

echo.
echo [2/3] Build production (npm run build)...
npm run build
if errorlevel 1 (
  echo.
  echo Da xay ra loi khi chay "npm run build".
  echo Vui long xem loi o tren de sua.
  pause
  exit /b 1
)

echo.
echo [3/3] Start server production (npm start)...
echo (Dong cua so nay se dung server, nhuong nen hay de mo neu ban muon server chay tiep)
echo.
npm start

echo.
echo Server da dung (npm start ket thuc).
pause
exit /b 0


