# -------------------------------------------------------------------------
# FlowSphere AI – Development server starter
# --------------------------------------------------------------
# Usage:
#   1️⃣ Open PowerShell and navigate to the project root:
#          cd "C:\Users\Krishnan\Downloads\sk"
#   2️⃣ Run the script:
#          .\run_all.ps1
#
# The script launches two new PowerShell windows:
#   • Backend – runs `pnpm dev` in apps\server (port 4000)
#   • Frontend – runs `pnpm dev` in apps\web   (port 3000)
#
# Logs are saved under `logs/` for quick troubleshooting.
# -------------------------------------------------------------------------

function Start-LogWindow {
    param(
        [string]$Title,
        [string]$WorkingDir,
        [string]$Command,
        [string]$LogFile
    )
    # Ensure logs folder exists
    $logDir = Split-Path $LogFile -Parent
    if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
    $scriptBlock = @"
        Set-Location -Path "$WorkingDir"
        Write-Host "`n--- $Title started at $(Get-Date) ---`n" -ForegroundColor Cyan
        & $Command 2>&1 | Tee-Object -FilePath "$LogFile"
"@
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $scriptBlock `
        -WindowStyle Normal -WorkingDirectory $WorkingDir `
        -PassThru | Out-Null
}

$projectRoot = "C:\Users\Krishnan\Downloads\sk"

# Backend settings
$backendDir = Join-Path $projectRoot "backend"
$backendCmd = "pnpm dev"
$backendLog = Join-Path $projectRoot "logs\backend.log"

# Frontend settings
$frontendDir = Join-Path $projectRoot "frontend"
$frontendCmd = "pnpm dev"
$frontendLog = Join-Path $projectRoot "logs\frontend.log"

Write-Host "`n🚀 Starting FlowSphere AI development environment`n" -ForegroundColor Green

Start-LogWindow -Title "Backend (Port 4000)" -WorkingDir $backendDir -Command $backendCmd -LogFile $backendLog
Start-LogWindow -Title "Frontend (Port 3000)" -WorkingDir $frontendDir -Command $frontendCmd -LogFile $frontendLog

Write-Host "`n✅ Two windows have been opened:" `
           "`n   - Backend  - logs -> $backendLog" `
           "`n   - Frontend - logs -> $frontendLog" `
           "`nOpen your browser and visit:" `
           "`n   - Frontend UI -> http://localhost:3000" `
           "`n   - API Docs    -> http://localhost:4000/api/docs`n" -ForegroundColor Yellow
