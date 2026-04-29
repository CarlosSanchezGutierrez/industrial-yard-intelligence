param(
    [AllowEmptyString()]
    [string] $ApiBaseUrl = "",

    [AllowEmptyString()]
    [string] $EdgeBaseUrl = "",

    [switch] $SkipReset
)

$ErrorActionPreference = "Stop"

function Resolve-IyiBaseUrl {
    param(
        [AllowEmptyString()]
        [string] $Provided = "",

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

function Unwrap-IyiPayload {
    param(
        [Parameter(Mandatory = $true)]
        [object] $Response
    )

    if ($Response.PSObject.Properties.Name -contains "data") {
        return $Response.data
    }

    return $Response
}

function Assert-IyiCondition {
    param(
        [Parameter(Mandatory = $true)]
        [bool] $Condition,

        [Parameter(Mandatory = $true)]
        [string] $Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

function Invoke-IyiGet {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Name,

        [Parameter(Mandatory = $true)]
        [string] $Uri
    )

    Write-Host "==> GET ${Name}: $Uri"

    try {
        return Invoke-RestMethod `
            -Method GET `
            -Uri $Uri `
            -TimeoutSec 45 `
            -Headers @{
                "x-request-id" = "phase-2-demo-runtime-smoke"
            }
    }
    catch {
        throw "GET $Name failed at $Uri. Start a fresh local stack with: pnpm dev:stack:windows. $($_.Exception.Message)"
    }
}

function Invoke-IyiPost {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Name,

        [Parameter(Mandatory = $true)]
        [string] $Uri,

        [object] $Body = $null
    )

    Write-Host "==> POST ${Name}: $Uri"

    try {
        $jsonBody = "{}"

        if ($null -ne $Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 100
        }

        return Invoke-RestMethod `
            -Method POST `
            -Uri $Uri `
            -TimeoutSec 45 `
            -ContentType "application/json" `
            -Headers @{
                "x-request-id" = "phase-2-demo-runtime-smoke"
            } `
            -Body $jsonBody
    }
    catch {
        throw "POST $Name failed at $Uri. Start a fresh local stack with: pnpm dev:stack:windows. $($_.Exception.Message)"
    }
}

$resolvedApiBaseUrl = Resolve-IyiBaseUrl `
    -Provided $ApiBaseUrl `
    -EnvironmentNames @("IYI_API_BASE_URL", "VITE_IYI_API_BASE_URL", "API_BASE_URL") `
    -Default "http://localhost:8788"

$resolvedEdgeBaseUrl = Resolve-IyiBaseUrl `
    -Provided $EdgeBaseUrl `
    -EnvironmentNames @("IYI_EDGE_BASE_URL", "VITE_IYI_EDGE_BASE_URL", "EDGE_BASE_URL") `
    -Default "http://localhost:8787"

Write-Host "==> Phase 2 demo runtime smoke"
Write-Host "API : $resolvedApiBaseUrl"
Write-Host "Edge: $resolvedEdgeBaseUrl"

$apiHealthResponse = Invoke-IyiGet `
    -Name "Cloud API health" `
    -Uri "$resolvedApiBaseUrl/health"

$apiHealthPayload = Unwrap-IyiPayload -Response $apiHealthResponse
Assert-IyiCondition ($null -ne $apiHealthPayload) "Cloud API health returned empty payload."

$edgeHealthResponse = Invoke-IyiGet `
    -Name "Edge health" `
    -Uri "$resolvedEdgeBaseUrl/health"

$edgeHealthPayload = Unwrap-IyiPayload -Response $edgeHealthResponse
Assert-IyiCondition ($null -ne $edgeHealthPayload) "Edge health returned empty payload."

if (-not $SkipReset) {
    $resetResponse = Invoke-IyiPost `
        -Name "Cloud API demo reset" `
        -Uri "$resolvedApiBaseUrl/admin/db/reset"

    $resetPayload = Unwrap-IyiPayload -Response $resetResponse
    Assert-IyiCondition ($null -ne $resetPayload) "Cloud API reset returned empty payload."
}

$stockpilesResponse = Invoke-IyiGet `
    -Name "Cloud API stockpiles" `
    -Uri "$resolvedApiBaseUrl/stockpiles"

$stockpilesPayload = Unwrap-IyiPayload -Response $stockpilesResponse
Assert-IyiCondition ($null -ne $stockpilesPayload) "Cloud API stockpiles returned empty payload."

$auditResponse = Invoke-IyiGet `
    -Name "Cloud API audit mutations" `
    -Uri "$resolvedApiBaseUrl/audit/mutations"

$auditPayload = Unwrap-IyiPayload -Response $auditResponse
Assert-IyiCondition ($null -ne $auditPayload) "Cloud API audit mutations returned empty payload."

$syncStatusResponse = Invoke-IyiGet `
    -Name "Cloud API sync status" `
    -Uri "$resolvedApiBaseUrl/sync/status"

$syncStatusPayload = Unwrap-IyiPayload -Response $syncStatusResponse
Assert-IyiCondition ($null -ne $syncStatusPayload) "Cloud API sync status returned empty payload."

$packageId = "sync_pkg_phase_2_runtime_smoke"
$encodedPackageId = [System.Uri]::EscapeDataString($packageId)

$edgeExportResponse = Invoke-IyiGet `
    -Name "Edge DB projection sync export" `
    -Uri "$resolvedEdgeBaseUrl/sync/packages/db-projection?packageId=$encodedPackageId"

$edgeExportPayload = Unwrap-IyiPayload -Response $edgeExportResponse
Assert-IyiCondition ($null -ne $edgeExportPayload.package) "Edge export did not include package."
Assert-IyiCondition ($null -ne $edgeExportPayload.package.manifest) "Edge export did not include manifest."
Assert-IyiCondition ($edgeExportPayload.package.manifest.packageId -eq $packageId) "Edge export packageId mismatch."
Assert-IyiCondition ($edgeExportPayload.package.manifest.packageKind -eq "db_projection_snapshot") "Edge export packageKind mismatch."
Assert-IyiCondition ($edgeExportPayload.package.manifest.direction -eq "edge_to_cloud") "Edge export direction mismatch."

$syncPackage = $edgeExportPayload.package

$previewResponse = Invoke-IyiPost `
    -Name "Cloud API sync preview" `
    -Uri "$resolvedApiBaseUrl/sync/preview" `
    -Body @{
        package = $syncPackage
        conflictPolicy = "manual_review"
    }

$previewPayload = Unwrap-IyiPayload -Response $previewResponse
Assert-IyiCondition ($previewPayload.accepted -eq $true) "Sync preview should be accepted."

$ingestResponse = Invoke-IyiPost `
    -Name "Cloud API sync ingest apply blocked" `
    -Uri "$resolvedApiBaseUrl/sync/ingest" `
    -Body @{
        package = $syncPackage
        ingestMode = "apply"
        conflictPolicy = "reject"
    }

$ingestPayload = Unwrap-IyiPayload -Response $ingestResponse
Assert-IyiCondition ($ingestPayload.accepted -eq $false) "Sync ingest apply should remain disabled."
Assert-IyiCondition ([int] $ingestPayload.appliedRecordCount -eq 0) "Sync ingest apply should not apply records."

Write-Host ""
Write-Host "==> Phase 2 demo runtime smoke passed"
Write-Host "Status: PHASE_2_DEMO_RUNTIME_READY"