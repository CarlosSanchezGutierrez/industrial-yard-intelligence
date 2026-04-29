param(
    [int] $ApiPort = 8788,
    [int] $EdgePort = 8787
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

function New-IyiWindowCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Title,

        [Parameter(Mandatory = $true)]
        [string] $Command
    )

    $escapedRepoRoot = $repoRoot.Replace("'", "''")
    $escapedTitle = $Title.Replace("'", "''")

    return @"
`$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath '$escapedRepoRoot'
`$Host.UI.RawUI.WindowTitle = '$escapedTitle'
$Command
"@
}

function Start-IyiPowerShellWindow {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Title,

        [Parameter(Mandatory = $true)]
        [string] $Command
    )

    $windowCommand = New-IyiWindowCommand `
        -Title $Title `
        -Command $Command

    Start-Process `
        -FilePath "powershell" `
        -ArgumentList @(
            "-NoExit",
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-Command",
            $windowCommand
        ) | Out-Null
}

Write-Host "== Starting Industrial Yard Intelligence local stack =="
Write-Host "API port:  $ApiPort"
Write-Host "Edge port: $EdgePort"
Write-Host ""

Start-IyiPowerShellWindow `
    -Title "IYI API :$ApiPort" `
    -Command @"
`$env:IYI_API_PORT = '$ApiPort'
`$env:PORT = '$ApiPort'
pnpm --filter @iyi/api dev
"@

Start-IyiPowerShellWindow `
    -Title "IYI Edge :$EdgePort" `
    -Command @"
`$env:IYI_EDGE_PORT = '$EdgePort'
`$env:PORT = '$EdgePort'
pnpm --filter @iyi/edge dev
"@

Start-IyiPowerShellWindow `
    -Title "IYI Web" `
    -Command @"
`$env:VITE_IYI_API_BASE_URL = 'http://localhost:$ApiPort'
`$env:VITE_IYI_EDGE_BASE_URL = 'http://localhost:$EdgePort'
pnpm --filter @iyi/web dev
"@

Write-Host "Started three PowerShell windows:"
Write-Host "1. API"
Write-Host "2. Edge"
Write-Host "3. Web"
Write-Host ""
Write-Host "After they finish starting, run:"
Write-Host "pnpm smoke:runtime"
Write-Host "pnpm phase2:runtime"