param(
    [string] $EdgeBaseUrl = "",
    [string] $ApiBaseUrl = "",
    [string] $PackageId = "sync_pkg_integrated_smoke_db_projection"
)

$ErrorActionPreference = "Stop"

function Resolve-IyiBaseUrl {
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

$resolvedEdgeBaseUrl = Resolve-IyiBaseUrl `
    -Provided $EdgeBaseUrl `
    -EnvironmentNames @("IYI_EDGE_BASE_URL", "VITE_IYI_EDGE_BASE_URL", "EDGE_BASE_URL") `
    -Default "http://localhost:8787"

$resolvedApiBaseUrl = Resolve-IyiBaseUrl `
    -Provided $ApiBaseUrl `
    -EnvironmentNames @("IYI_API_BASE_URL", "VITE_IYI_API_BASE_URL", "API_BASE_URL") `
    -Default "http://localhost:8788"

Write-Host "==> Cloud Edge integrated sync smoke"
Write-Host "Edge: $resolvedEdgeBaseUrl"
Write-Host "API : $resolvedApiBaseUrl"

Write-Host "==> Export DB projection package from edge"

$encodedPackageId = [System.Uri]::EscapeDataString($PackageId)

$edgeExportResponse = Invoke-RestMethod `
    -Method GET `
    -Uri "$resolvedEdgeBaseUrl/sync/packages/db-projection?packageId=$encodedPackageId" `
    -Headers @{
        "x-request-id" = "cloud-edge-sync-smoke-edge-export"
    }

$edgeExportPayload = Unwrap-IyiPayload -Response $edgeExportResponse

Assert-IyiCondition ($null -ne $edgeExportPayload.generatedAt) "Edge export did not include generatedAt."
Assert-IyiCondition ($null -ne $edgeExportPayload.recordCount) "Edge export did not include recordCount."
Assert-IyiCondition ([int] $edgeExportPayload.recordCount -gt 0) "Edge export expected recordCount > 0."
Assert-IyiCondition ($null -ne $edgeExportPayload.package) "Edge export did not include package."
Assert-IyiCondition ($null -ne $edgeExportPayload.package.manifest) "Edge export package did not include manifest."
Assert-IyiCondition ($null -ne $edgeExportPayload.package.payload) "Edge export package did not include payload."

$syncPackage = $edgeExportPayload.package
$manifest = $syncPackage.manifest

Assert-IyiCondition ($manifest.packageId -eq $PackageId) "Edge export packageId mismatch."
Assert-IyiCondition ($manifest.packageKind -eq "db_projection_snapshot") "Edge export packageKind mismatch."
Assert-IyiCondition ($manifest.direction -eq "edge_to_cloud") "Edge export direction mismatch."
Assert-IyiCondition ($manifest.schemaVersion -eq "cloud-edge-sync-v1") "Edge export schemaVersion mismatch."
Assert-IyiCondition ($manifest.payloadHash -match "^sha256:[a-f0-9]{64}$") "Edge export payloadHash format mismatch."
Assert-IyiCondition ([int] $manifest.payloadRecordCount -eq [int] $edgeExportPayload.recordCount) "Edge export payloadRecordCount mismatch."

Write-Host "==> Preview exported package in Cloud API"

$previewRequest = @{
    package = $syncPackage
    conflictPolicy = "manual_review"
}

$previewResponse = Invoke-RestMethod `
    -Method POST `
    -Uri "$resolvedApiBaseUrl/sync/preview" `
    -ContentType "application/json" `
    -Headers @{
        "x-request-id" = "cloud-edge-sync-smoke-preview"
    } `
    -Body ($previewRequest | ConvertTo-Json -Depth 100)

$previewPayload = Unwrap-IyiPayload -Response $previewResponse

Assert-IyiCondition ($previewPayload.packageId -eq $PackageId) "Sync preview packageId mismatch."
Assert-IyiCondition ($previewPayload.accepted -eq $true) "Sync preview should be accepted."
Assert-IyiCondition ($previewPayload.ingestMode -eq "preview") "Sync preview ingestMode mismatch."
Assert-IyiCondition ($previewPayload.conflictPolicy -eq "manual_review") "Sync preview conflictPolicy mismatch."
Assert-IyiCondition ([int] $previewPayload.detectedRecordCount -eq [int] $manifest.payloadRecordCount) "Sync preview detectedRecordCount mismatch."
Assert-IyiCondition ([int] $previewPayload.detectedConflictCount -eq 0) "Sync preview detectedConflictCount should be 0."

Write-Host "==> Validate apply-mode ingest remains safely disabled"

$ingestRequest = @{
    package = $syncPackage
    ingestMode = "apply"
    conflictPolicy = "reject"
}

$ingestResponse = Invoke-RestMethod `
    -Method POST `
    -Uri "$resolvedApiBaseUrl/sync/ingest" `
    -ContentType "application/json" `
    -Headers @{
        "x-request-id" = "cloud-edge-sync-smoke-ingest"
    } `
    -Body ($ingestRequest | ConvertTo-Json -Depth 100)

$ingestPayload = Unwrap-IyiPayload -Response $ingestResponse

Assert-IyiCondition ($ingestPayload.packageId -eq $PackageId) "Sync ingest packageId mismatch."
Assert-IyiCondition ($ingestPayload.accepted -eq $false) "Sync ingest apply mode should remain disabled."
Assert-IyiCondition ($ingestPayload.ingestMode -eq "apply") "Sync ingest ingestMode mismatch."
Assert-IyiCondition ([int] $ingestPayload.appliedRecordCount -eq 0) "Sync ingest should not apply records yet."
Assert-IyiCondition ([int] $ingestPayload.skippedRecordCount -eq [int] $manifest.payloadRecordCount) "Sync ingest skippedRecordCount mismatch."
Assert-IyiCondition ([int] $ingestPayload.conflictCount -eq 0) "Sync ingest conflictCount should be 0."
Assert-IyiCondition ($null -ne $ingestPayload.auditEntryIds) "Sync ingest should include auditEntryIds."
Assert-IyiCondition ($null -ne $ingestPayload.warnings) "Sync ingest should include warnings."

Write-Host "==> Cloud Edge integrated sync smoke passed"