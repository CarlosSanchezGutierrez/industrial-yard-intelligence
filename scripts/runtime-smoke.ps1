param(
    [string] $ApiBaseUrl = "http://localhost:8788",
    [string] $EdgeBaseUrl = "http://localhost:8787"
)

$ErrorActionPreference = "Stop"

function Invoke-Step {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Name,

        [Parameter(Mandatory = $true)]
        [scriptblock] $Action
    )

    Write-Host ""
    Write-Host "== $Name =="

    $global:LASTEXITCODE = 0
    & $Action

    if ($LASTEXITCODE -ne 0) {
        throw "$Name failed with exit code $LASTEXITCODE."
    }

    Write-Host "OK $Name"
}

function Assert-HttpOk {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Url,

        [Parameter(Mandatory = $true)]
        [string] $Name
    )

    try {
        $response = Invoke-RestMethod -Method "GET" -Uri $Url -Headers @{
            Accept = "application/json"
        }

        if ($response.ok -ne $true) {
            $payload = $response | ConvertTo-Json -Depth 20
            throw "$Name returned non-ok payload: $payload"
        }
    } catch {
        throw "$Name is not reachable at $Url. Start the stack first with pnpm dev:stack:windows."
    }
}

Write-Host ""
Write-Host "== Industrial Yard Intelligence runtime smoke =="
Write-Host "API:  $ApiBaseUrl"
Write-Host "Edge: $EdgeBaseUrl"

Invoke-Step "Check API reachable" {
    Assert-HttpOk -Url "$ApiBaseUrl/health" -Name "API"
}

Invoke-Step "Check Edge reachable" {
    Assert-HttpOk -Url "$EdgeBaseUrl/health" -Name "Edge"
}

Invoke-Step "Run API smoke" {
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts/api-smoke.ps1 -ApiBaseUrl $ApiBaseUrl
}

Invoke-Step "Run Edge demo smoke" {
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts/demo-smoke.ps1 -EdgeBaseUrl $EdgeBaseUrl
}

Write-Host ""
Write-Host "RUNTIME SMOKE PASSED"