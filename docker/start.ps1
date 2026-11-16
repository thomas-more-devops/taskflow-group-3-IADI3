# TaskFlow + MongoDB: network, volume, database container and app container (assignment 12, step 3).
# Usage (PowerShell, from the repository root): .\docker\start.ps1
# Safe to run more than once: existing network, volume and database are reused,
# the app container is recreated from a fresh build.
param(
    [string]$Image = 'taskflow:2.0',
    [int]$Port = 3000
)
$ErrorActionPreference = 'Stop'

$Network = 'taskflow-net'
$Volume = 'taskflow-db-data'
$DbContainer = 'taskflow-db'
$DbImage = 'mongo:8.0.15'
$AppContainer = 'taskflow-app'

# Windows PowerShell 5.1 turns stderr from docker into a terminating error when
# ErrorActionPreference is Stop, so these helpers switch to Continue while docker
# runs and decide success from the exit code only
function Invoke-Native([scriptblock]$Command) {
    $previous = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        & $Command
    } finally {
        $ErrorActionPreference = $previous
    }
}
function Test-Docker([string[]]$DockerArgs) {
    Invoke-Native { & docker @DockerArgs *> $null }
    return $LASTEXITCODE -eq 0
}
function Invoke-Docker([string[]]$DockerArgs) {
    Invoke-Native { & docker @DockerArgs }
    if ($LASTEXITCODE -ne 0) { throw "docker $($DockerArgs -join ' ') failed" }
}
function Get-AppLogs {
    # database.js writes the MongoDB retries to stderr, so keep both streams as plain text
    Invoke-Native { & docker logs $AppContainer 2>&1 | ForEach-Object { "$_" } } | Out-String
}

# 1. Custom network: containers on it reach each other by container name (DNS)
if (-not (Test-Docker @('network', 'inspect', $Network))) { Invoke-Docker @('network', 'create', $Network) }

# 2. Named volume: MongoDB data lives here, so it survives removing the database container
if (-not (Test-Docker @('volume', 'inspect', $Volume))) { Invoke-Docker @('volume', 'create', $Volume) }

# 3. MongoDB container, only on the network (no -p: not reachable from the laptop)
if (Test-Docker @('container', 'inspect', $DbContainer)) {
    Invoke-Docker @('start', $DbContainer)
} else {
    Invoke-Docker @('run', '-d', '--name', $DbContainer, '--network', $Network, '-v', "${Volume}:/data/db", $DbImage)
}

# 4. Build the TaskFlow image (multi-stage Dockerfile)
Invoke-Docker @('build', '-t', $Image, '.')

# 5. App container, connected to the same network; DB_HOST is the database container name
Test-Docker @('rm', '-f', $AppContainer) | Out-Null
Invoke-Docker @('run', '-d', '--name', $AppContainer, '--network', $Network, '-p', "${Port}:3000",
    '-e', "DB_HOST=$DbContainer", '-e', 'DB_NAME=taskflow', $Image)

# 6. Wait until the app logs "MongoDB connected" (the app retries while MongoDB starts)
for ($i = 0; $i -lt 30; $i++) {
    $logs = Get-AppLogs
    if ($logs -match 'MongoDB connected') {
        Write-Output $logs
        Write-Output "TaskFlow is running on http://localhost:$Port"
        exit 0
    }
    Start-Sleep -Seconds 2
}
Write-Output (Get-AppLogs)
Write-Error 'MongoDB connection not confirmed after 60 s, check the logs above'
exit 1
