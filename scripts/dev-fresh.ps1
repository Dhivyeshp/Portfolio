$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "Stopping Node dev processes..."
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

Start-Sleep -Seconds 1

Write-Host "Removing .next..."
if (Test-Path ".next") {
  Remove-Item -Recurse -Force ".next"
}

Write-Host "Starting Next dev server..."
npm run dev
