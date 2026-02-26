<#
.SYNOPSIS
Starts the VitalLink Frontend and Backend cleanly.
Always restarts the frontend, and starts the backend if it's not already running.
Shows their status neatly. Stops both when exiting the script.
#>

$ErrorActionPreference = "Stop"

$frontendDir = ".\frontend"
$frontendPort = 5173
$backendPort = 8000

function Get-PidByPort($port) {
    # Find listening process on the specified port
    $netstat = netstat -ano | Select-String ":$port\s+.*LISTENING\s+(\d+)"
    if ($netstat -match ":$port\s+.*LISTENING\s+(\d+)") {
        return $matches[1]
    }
    return $null
}

function Kill-ProcessTree($pidToKill) {
    if ($pidToKill) {
        # taskkill /T kills child processes too, /F forces
        # 2>nul 1>nul hides errors if process already died
        cmd.exe /c "taskkill /PID $pidToKill /T /F 2>nul 1>nul"
    }
}

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "   VitalLink Startup Script" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# 1. Handle Frontend Restart
$existingFrontendPid = Get-PidByPort $frontendPort
if ($existingFrontendPid) {
    Write-Host "[Frontend] Stopping existing process (PID $existingFrontendPid)..." -ForegroundColor Yellow
    Kill-ProcessTree $existingFrontendPid
    Start-Sleep -Seconds 1
}

Write-Host "[Frontend] Starting..." -ForegroundColor Cyan
# Start frontend using npm. 
$frontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd $frontendDir && npm run dev" -PassThru -NoNewWindow
$frontendPid = $frontendProcess.Id

# 2. Handle Backend
$backendPid = Get-PidByPort $backendPort
$backendAlreadyRunning = $false

if ($backendPid) {
    $backendAlreadyRunning = $true
    Write-Host "[Backend]  Already running (PID $backendPid)." -ForegroundColor Green
}
else {
    Write-Host "[Backend]  Starting..." -ForegroundColor Cyan
    # Start backend
    $backendProcess = Start-Process -FilePath ".\venv\Scripts\python.exe" -ArgumentList "-m uvicorn backend.main:app --reload --port $backendPort" -PassThru -NoNewWindow
    $backendPid = $backendProcess.Id
    # Wait a moment to let it start
    Start-Sleep -Seconds 2
}

# 3. Status Display
Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "   Services are running!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host " Frontend : http://localhost:$frontendPort" -ForegroundColor White
Write-Host " Backend  : http://localhost:$backendPort" -ForegroundColor White
if ($backendAlreadyRunning) {
    Write-Host " (Backend was already running)" -ForegroundColor DarkGray
}
Write-Host "`nPress Ctrl+C to exit and stop both services..." -ForegroundColor Yellow

# 4. Cleanup on Exit
try {
    # Wait indefinitely until script is interrupted
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    Write-Host "`n===============================================" -ForegroundColor Cyan
    Write-Host "   Shutting down services..." -ForegroundColor Yellow
    Write-Host "===============================================" -ForegroundColor Cyan
    
    if ($frontendPid) {
        Write-Host "Stopping Frontend..." -ForegroundColor Gray
        Kill-ProcessTree $frontendPid
    }
    
    if ($backendPid) {
        Write-Host "Stopping Backend..." -ForegroundColor Gray
        Kill-ProcessTree $backendPid
    }
    
    # Also double check ports to ensure they are freed
    $fPid = Get-PidByPort $frontendPort
    if ($fPid) { Kill-ProcessTree $fPid }
    
    $bPid = Get-PidByPort $backendPort
    if ($bPid) { Kill-ProcessTree $bPid }

    Write-Host "All services stopped. Goodbye!" -ForegroundColor Green
}
