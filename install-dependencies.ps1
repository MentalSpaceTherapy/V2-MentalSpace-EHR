# PowerShell script to install dependencies

Write-Host "Installing Material UI dependencies..." -ForegroundColor Cyan
npm install @mui/material @mui/icons-material @mui/lab @mui/system @mui/x-data-grid @mui/x-date-pickers
npm install @emotion/react @emotion/styled

Write-Host "Installing React Router..." -ForegroundColor Cyan
npm install react-router-dom

Write-Host "Installing other dependencies..." -ForegroundColor Cyan
npm install axios-cache-interceptor date-fns

Write-Host "Installing dev dependencies..." -ForegroundColor Cyan
npm install -D @types/react-router-dom

Write-Host "Creating necessary directories..." -ForegroundColor Cyan
# Create necessary directories if they don't exist
if (-not (Test-Path "src/types")) { New-Item -ItemType Directory -Path "src/types" -Force }
if (-not (Test-Path "src/components/clients/client-forms")) { New-Item -ItemType Directory -Path "src/components/clients/client-forms" -Force }
if (-not (Test-Path "src/components/clients/tabs")) { New-Item -ItemType Directory -Path "src/components/clients/tabs" -Force }
if (-not (Test-Path "src/lib")) { New-Item -ItemType Directory -Path "src/lib" -Force }

Write-Host "Dependencies installed successfully!" -ForegroundColor Green
Write-Host "Run 'npm run dev' to start the development server." -ForegroundColor Green 