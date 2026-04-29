param(
    [string] $ApiBaseUrl = "",
    [string] $EdgeBaseUrl = "",
    [switch] $SkipSmokeRuntime
)

$ErrorActionPreference = "Stop"

function Resolve-IyiRuntimeBaseUrl {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Provided,

        [Parameter(Mandatory = $true)]
        [string[]] $EnvironmentNames,

        [Parameter(Mandatory = $true)]
        [string] $Default
    )

    if (-not [string]::IsNullOrWhiteSpace($Provided)) {
        return $Provided.TrimEnd("/")
    }

    foreach ($environmentName in $EnvironmentNames) {
        $environmentValue = [System.Environment]::GetEnvironmentVariable($environmentName)

        if (-not [string]::IsNullOrWhiteSpace($environmentValue)) {
            return $environmentValue.TrimEnd("/")
        }
    }

    return $Default.TrimEnd("/")
}

function Invoke-RuntimeGateStep {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Name,

        [Parameter(Mandatory = $true)]
        [scriptblock] $Command
    )

    Write-Host ""
    Write-Host "==> $Name"
    & $Command

    if ($LASTEXITCODE -ne 0) {
        throw "$Name failed."
    }
}

function Assert-HttpOk {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Name,

        [Parameter(Mandatory = $true)]
        [string] $Uri
    )

    Write-Host "==> Checking ${Name}: $Uri"

    try {
        $response = Invoke-RestMethod `
            -Method GET `
            -Uri $Uri `
            -Headers @{
                "x-request-id" = "architecture-v1-runtime-gate"
            }

        if ($null -eq $response) {
            throw "$Name returned empty response."
        }
    }
    catch {
        throw "$Name is not reachable at $Uri. Start the local stack first with pnpm dev:stack:windows. $($_.Exception.Message)"
    }
}

$resolvedApiBaseUrl = Resolve-IyiRuntimeBaseUrl `
    -Provided $ApiBaseUrl `
    -EnvironmentNames @("IYI_API_BASE_URL", "VITE_IYI_API_BASE_URL", "API_BASE_URL") `
    -Default "http://localhost:8788"

$resolvedEdgeBaseUrl = Resolve-IyiRuntimeBaseUrl `
    -Provided $EdgeBaseUrl `
    -EnvironmentNames @("IYI_EDGE_BASE_URL", "VITE_IYI_EDGE_BASE_URL", "EDGE_BASE_URL") `
    -Default "http://localhost:8787"

Write-Host "==> Architecture v1 runtime gate"
Write-Host "API : $resolvedApiBaseUrl"
Write-Host "Edge: $resolvedEdgeBaseUrl"

Assert-HttpOk `
    -Name "Cloud API health" `
    -Uri "$resolvedApiBaseUrl/health"

Assert-HttpOk `
    -Name "Edge health" `
    -Uri "$resolvedEdgeBaseUrl/health"

Assert-HttpOk `
    -Name "Cloud API sync status" `
    -Uri "$resolvedApiBaseUrl/sync/status"

Assert-HttpOk `
    -Name "Edge DB projection sync export" `
    -Uri "$resolvedEdgeBaseUrl/sync/packages/db-projection?packageId=sync_pkg_runtime_gate_probe"

Invoke-RuntimeGateStep "api:smoke" {
    pnpm api:smoke
}

Invoke-RuntimeGateStep "demo:smoke" {
    pnpm demo:smoke
}

Invoke-RuntimeGateStep "sync:smoke" {
    pnpm sync:smoke
}

if (-not $SkipSmokeRuntime) {
    Invoke-RuntimeGateStep "smoke:runtime" {
        pnpm smoke:runtime
    }
}

Write-Host ""
Write-Host "==> Architecture v1 runtime gate passed"
Write-Host "Status: V1_RUNTIME_READY_FOR_DEMO"