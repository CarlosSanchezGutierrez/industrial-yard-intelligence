param(
    [int] $ApiPort = 8788,
    [int] $EdgePort = 8787
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

function Start-DevWindow {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Title,

        [Parameter(Mandatory = $true)]
        [string] $Command
    )

    $escapedRepoRoot = $repoRoot.Path.Replace("'", "''")
    $escapedCommand = $Command.Replace("'", "''")

    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        "Set-Location '$escapedRepoRoot'; `$host.UI.RawUI.WindowTitle = '$Title'; $escapedCommand"
    )
}

Write-Host ""
Write-Host "== Starting Industrial Yard Intelligence local stack =="
Write-Host "API port:  $ApiPort"
Write-Host "Edge port: $EdgePort"
Write-Host ""

Start-DevWindow `
    -Title "IYI API :$ApiPort" `
    -Command "`$env:IYI_API_PORT='$ApiPort'; pnpm --filter @iyi/api dev"

Start-DevWindow `
    -Title "IYI Edge :$EdgePort" `
    -Command "`$env:IYI_EDGE_PORT='$EdgePort'; pnpm --filter @iyi/edge dev"

Start-DevWindow `
    -Title "IYI Web" `
    -Command "`$env:VITE_IYI_API_BASE_URL='http://localhost:$ApiPort'; `$env:VITE_IYI_EDGE_BASE_URL='http://localhost:$EdgePort'; pnpm --filter @iyi/web dev"

Write-Host "Started three PowerShell windows:"
Write-Host "1. API"
Write-Host "2. Edge"
Write-Host "3. Web"
Write-Host ""
Write-Host "After they finish starting, run:"
Write-Host "pnpm smoke:runtime"