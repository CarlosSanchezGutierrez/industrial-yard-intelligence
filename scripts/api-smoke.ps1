param(
    [string] $ApiBaseUrl = "http://localhost:8788"
)

$ErrorActionPreference = "Stop"

function Invoke-JsonRequest {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Method,

        [Parameter(Mandatory = $true)]
        [string] $Path
    )

    $uri = "$ApiBaseUrl$Path"

    return Invoke-RestMethod `
        -Method $Method `
        -Uri $uri `
        -Headers @{
            Accept = "application/json"
        }
}

function Invoke-PreflightRequest {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path
    )

    $uri = "$ApiBaseUrl$Path"

    return Invoke-WebRequest `
        -Method "OPTIONS" `
        -Uri $uri `
        -Headers @{
            Origin = "http://localhost:5173"
            "Access-Control-Request-Method" = "GET"
        }
}

function Assert-OkResponse {
    param(
        [Parameter(Mandatory = $true)]
        [object] $Response,

        [Parameter(Mandatory = $true)]
        [string] $StepName
    )

    if ($null -eq $Response) {
        throw "$StepName failed: empty response."
    }

    if ($Response.ok -ne $true) {
        $payload = $Response | ConvertTo-Json -Depth 30
        throw "$StepName failed: $payload"
    }
}

function Assert-Condition {
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

Write-Host ""
Write-Host "== Industrial Yard Intelligence API smoke test =="
Write-Host "API: $ApiBaseUrl"

Write-Host ""
Write-Host "1. Health check"
$health = Invoke-JsonRequest -Method "GET" -Path "/health"
Assert-OkResponse -Response $health -StepName "Health check"
Assert-Condition -Condition ($health.data.status -eq "ok") -Message "Health status should be ok."
Assert-Condition -Condition ($health.data.service -eq "@iyi/api") -Message "Unexpected API service."
Assert-Condition -Condition ($health.data.repositoryMode -eq "json_file") -Message "Expected json_file repository mode."
Write-Host "OK health"

Write-Host ""
Write-Host "2. CORS preflight"
$preflight = Invoke-PreflightRequest -Path "/health"
Assert-Condition -Condition ($preflight.StatusCode -eq 204) -Message "Expected OPTIONS /health to return 204."
Assert-Condition -Condition ($preflight.Headers["Access-Control-Allow-Origin"] -eq "*") -Message "Missing CORS allow origin."
Assert-Condition -Condition ($preflight.Headers["Access-Control-Allow-Methods"] -like "*OPTIONS*") -Message "Missing OPTIONS in CORS methods."
Write-Host "OK CORS"

Write-Host ""
Write-Host "3. Manifest"
$manifest = Invoke-JsonRequest -Method "GET" -Path "/"
Assert-OkResponse -Response $manifest -StepName "Manifest"
Assert-Condition -Condition ($manifest.data.service -eq "@iyi/api") -Message "Unexpected manifest service."
Assert-Condition -Condition (($manifest.data.routes | Where-Object { $_.path -eq "/system/overview" }).Count -gt 0) -Message "Manifest missing /system/overview."
Write-Host "OK manifest"

Write-Host ""
Write-Host "4. DB schema"
$schema = Invoke-JsonRequest -Method "GET" -Path "/db/schema"
Assert-OkResponse -Response $schema -StepName "DB schema"
Assert-Condition -Condition ($schema.data.migrationId -like "*core_schema*") -Message "Unexpected DB migration id."
Assert-Condition -Condition ($schema.data.sql -like "*CREATE TABLE IF NOT EXISTS app_tenants*") -Message "DB schema missing app_tenants."
Assert-Condition -Condition ($schema.data.sql -like "*CREATE TABLE IF NOT EXISTS evidence_items*") -Message "DB schema missing evidence_items."
Write-Host "OK DB schema"

Write-Host ""
Write-Host "5. DB tables"
$tables = Invoke-JsonRequest -Method "GET" -Path "/db/tables"
Assert-OkResponse -Response $tables -StepName "DB tables"
Assert-Condition -Condition ($tables.data.tables -contains "app_tenants") -Message "Missing app_tenants table."
Assert-Condition -Condition ($tables.data.tables -contains "stockpiles") -Message "Missing stockpiles table."
Assert-Condition -Condition ($tables.data.tables -contains "sync_events") -Message "Missing sync_events table."
Assert-Condition -Condition ($tables.data.tables -contains "audit_entries") -Message "Missing audit_entries table."
Assert-Condition -Condition ($tables.data.tables -contains "evidence_items") -Message "Missing evidence_items table."
Write-Host "OK DB tables"

Write-Host ""
Write-Host "6. Tenants"
$tenants = Invoke-JsonRequest -Method "GET" -Path "/tenants"
Assert-OkResponse -Response $tenants -StepName "Tenants"
Assert-Condition -Condition ($tenants.data.tenants.Count -ge 1) -Message "Expected at least one tenant."
Assert-Condition -Condition ($tenants.data.tenants[0].id -eq "tenant_cooper_tsmith") -Message "Expected Cooper tenant."
Write-Host "OK tenants"

Write-Host ""
Write-Host "7. Stockpiles"
$stockpiles = Invoke-JsonRequest -Method "GET" -Path "/stockpiles?tenantId=tenant_cooper_tsmith"
Assert-OkResponse -Response $stockpiles -StepName "Stockpiles"
Assert-Condition -Condition ($stockpiles.data.stockpiles.Count -ge 1) -Message "Expected at least one stockpile."
Assert-Condition -Condition ($stockpiles.data.stockpiles[0].tenantId -eq "tenant_cooper_tsmith") -Message "Expected stockpiles scoped to Cooper tenant."
Write-Host "OK stockpiles"

Write-Host ""
Write-Host "8. Create stockpile"
$createdStockpile = Invoke-RestMethod `
    -Method "POST" `
    -Uri "$ApiBaseUrl/stockpiles" `
    -Headers @{
        Accept = "application/json"
    } `
    -ContentType "application/json" `
    -Body (@{
        id = "stockpile_api_smoke_created"
        tenantId = "tenant_cooper_tsmith"
        terminalId = "terminal_altamira"
        name = "API Smoke Stockpile"
        material = "pet coke"
        category = "bulk"
        estimatedTons = 321
        status = "draft"
    } | ConvertTo-Json -Depth 20)

Assert-OkResponse -Response $createdStockpile -StepName "Create stockpile"
Assert-Condition -Condition ($createdStockpile.data.stockpile.id -eq "stockpile_api_smoke_created") -Message "Unexpected created stockpile id."
Write-Host "OK create stockpile"
Write-Host ""
Write-Host "9. Update stockpile status"
$updatedStockpile = Invoke-RestMethod `
    -Method "PATCH" `
    -Uri "$ApiBaseUrl/stockpiles/stockpile_api_smoke_created/status" `
    -Headers @{
        Accept = "application/json"
    } `
    -ContentType "application/json" `
    -Body (@{
        status = "validated"
        validationState = "supervisor_validated"
        confidenceLevel = "reviewed"
    } | ConvertTo-Json -Depth 20)

Assert-OkResponse -Response $updatedStockpile -StepName "Update stockpile status"
Assert-Condition -Condition ($updatedStockpile.data.stockpile.status -eq "validated") -Message "Expected validated stockpile."
Write-Host "OK update stockpile status"
Write-Host ""
Write-Host "10. System overview"
$overview = Invoke-JsonRequest -Method "GET" -Path "/system/overview"
Assert-OkResponse -Response $overview -StepName "System overview"
Assert-Condition -Condition ($overview.data.tenantCount -eq 1) -Message "Expected tenantCount = 1."
Assert-Condition -Condition ($overview.data.terminalCount -eq 1) -Message "Expected terminalCount = 1."
Assert-Condition -Condition ($overview.data.stockpileCount -ge 1) -Message "Expected stockpileCount >= 1."
Assert-Condition -Condition ($overview.data.syncEventCount -eq 0) -Message "Expected syncEventCount = 0 in API seed mode."
Write-Host "OK system overview"


Write-Host ""
Write-Host "11. Admin DB snapshot"
$dbSnapshot = Invoke-JsonRequest -Method "GET" -Path "/admin/db/snapshot"
Assert-OkResponse -Response $dbSnapshot -StepName "Admin DB snapshot"
Assert-Condition -Condition ($dbSnapshot.data.storeFile -like "*api-db.json*") -Message "Expected api-db.json store file."
Assert-Condition -Condition ($dbSnapshot.data.snapshot.version -eq 1) -Message "Expected DB snapshot version 1."
Assert-Condition -Condition ($dbSnapshot.data.snapshot.tables.app_tenants.Count -eq 1) -Message "Expected 1 tenant in DB snapshot."
Write-Host "OK admin DB snapshot"

Write-Host ""
Write-Host "12. Admin DB reset"
$dbReset = Invoke-RestMethod `
    -Method "POST" `
    -Uri "$ApiBaseUrl/admin/db/reset" `
    -Headers @{
        Accept = "application/json"
    }
Assert-OkResponse -Response $dbReset -StepName "Admin DB reset"
Assert-Condition -Condition ($dbReset.data.reset -eq $true) -Message "Expected reset=true."
Assert-Condition -Condition ($dbReset.data.overview.tenantCount -eq 1) -Message "Expected tenantCount = 1 after reset."
Write-Host "OK admin DB reset"
Write-Host ""
Write-Host "API SMOKE TEST PASSED"

Write-Host "==> Cloud API stockpile lifecycle"

function Get-IyiApiSmokeBaseUrl {
    $candidateVariableNames = @(
        "ApiBaseUrl",
        "BaseUrl",
        "IyiApiBaseUrl",
        "CloudApiBaseUrl"
    )

    foreach ($candidateVariableName in $candidateVariableNames) {
        $candidateVariable = Get-Variable -Name $candidateVariableName -Scope Script -ErrorAction SilentlyContinue

        if ($null -ne $candidateVariable -and -not [string]::IsNullOrWhiteSpace([string] $candidateVariable.Value)) {
            return ([string] $candidateVariable.Value).TrimEnd("/")
        }
    }

    $candidateEnvironmentNames = @(
        "IYI_API_BASE_URL",
        "VITE_IYI_API_BASE_URL",
        "API_BASE_URL"
    )

    foreach ($candidateEnvironmentName in $candidateEnvironmentNames) {
        $candidateEnvironmentValue = [System.Environment]::GetEnvironmentVariable($candidateEnvironmentName)

        if (-not [string]::IsNullOrWhiteSpace($candidateEnvironmentValue)) {
            return $candidateEnvironmentValue.TrimEnd("/")
        }
    }

    return "http://localhost:8788"
}

$stockpileLifecycleBaseUrl = Get-IyiApiSmokeBaseUrl
$stockpileLifecycleUri = "$stockpileLifecycleBaseUrl/stockpiles/lifecycle"

$stockpileLifecycleResponse = Invoke-RestMethod `
    -Method GET `
    -Uri $stockpileLifecycleUri `
    -Headers @{
        "x-request-id" = "api-smoke-stockpile-lifecycle"
    }

if ($null -eq $stockpileLifecycleResponse) {
    throw "Stockpile lifecycle response was empty."
}

$stockpileLifecyclePayload = $stockpileLifecycleResponse

if ($stockpileLifecycleResponse.PSObject.Properties.Name -contains "data") {
    $stockpileLifecyclePayload = $stockpileLifecycleResponse.data
}

if ($null -eq $stockpileLifecyclePayload) {
    throw "Stockpile lifecycle payload was empty."
}

if ($null -eq $stockpileLifecyclePayload.statuses) {
    throw "Stockpile lifecycle payload did not include statuses."
}

if ($null -eq $stockpileLifecyclePayload.transitions) {
    throw "Stockpile lifecycle payload did not include transitions."
}

if ($null -eq $stockpileLifecyclePayload.allowedTransitionsByStatus) {
    throw "Stockpile lifecycle payload did not include allowedTransitionsByStatus."
}

$requiredLifecycleStatuses = @(
    "draft",
    "operational",
    "pending_review",
    "validated",
    "archived"
)

$actualLifecycleStatuses = @($stockpileLifecyclePayload.statuses)

foreach ($requiredLifecycleStatus in $requiredLifecycleStatuses) {
    if ($actualLifecycleStatuses -notcontains $requiredLifecycleStatus) {
        throw "Stockpile lifecycle payload is missing status: $requiredLifecycleStatus"
    }
}

$hasDraftToOperationalTransition = $false

foreach ($transition in @($stockpileLifecyclePayload.transitions)) {
    if ($transition.from -eq "draft" -and $transition.to -eq "operational") {
        $hasDraftToOperationalTransition = $true
        break
    }
}

if (-not $hasDraftToOperationalTransition) {
    throw "Stockpile lifecycle transitions should include draft -> operational."
}

$hasValidatedToArchivedTransition = $false

foreach ($transition in @($stockpileLifecyclePayload.transitions)) {
    if ($transition.from -eq "validated" -and $transition.to -eq "archived") {
        $hasValidatedToArchivedTransition = $true
        break
    }
}

if (-not $hasValidatedToArchivedTransition) {
    throw "Stockpile lifecycle transitions should include validated -> archived."
}

if ($null -eq $stockpileLifecyclePayload.allowedTransitionsByStatus.draft) {
    throw "Stockpile lifecycle payload is missing draft transitions."
}

$draftTransitions = @($stockpileLifecyclePayload.allowedTransitionsByStatus.draft)

if ($draftTransitions -notcontains "operational") {
    throw "Stockpile lifecycle draft transitions should include operational."
}

if ($null -eq $stockpileLifecyclePayload.allowedTransitionsByStatus.archived) {
    throw "Stockpile lifecycle payload is missing archived transitions."
}

$archivedTransitions = @($stockpileLifecyclePayload.allowedTransitionsByStatus.archived)

if ($archivedTransitions.Count -ne 0) {
    throw "Stockpile lifecycle archived status should not allow outgoing transitions."
}

Write-Host "==> Cloud API mutation audit"

function Get-IyiApiAuditSmokeBaseUrl {
    $candidateVariableNames = @(
        "ApiBaseUrl",
        "BaseUrl",
        "IyiApiBaseUrl",
        "CloudApiBaseUrl"
    )

    foreach ($candidateVariableName in $candidateVariableNames) {
        $candidateVariable = Get-Variable -Name $candidateVariableName -Scope Script -ErrorAction SilentlyContinue

        if ($null -ne $candidateVariable -and -not [string]::IsNullOrWhiteSpace([string] $candidateVariable.Value)) {
            return ([string] $candidateVariable.Value).TrimEnd("/")
        }
    }

    $candidateEnvironmentNames = @(
        "IYI_API_BASE_URL",
        "VITE_IYI_API_BASE_URL",
        "API_BASE_URL"
    )

    foreach ($candidateEnvironmentName in $candidateEnvironmentNames) {
        $candidateEnvironmentValue = [System.Environment]::GetEnvironmentVariable($candidateEnvironmentName)

        if (-not [string]::IsNullOrWhiteSpace($candidateEnvironmentValue)) {
            return $candidateEnvironmentValue.TrimEnd("/")
        }
    }

    return "http://localhost:8788"
}

$auditSmokeBaseUrl = Get-IyiApiAuditSmokeBaseUrl

$auditSummaryResponse = Invoke-RestMethod `
    -Method GET `
    -Uri "$auditSmokeBaseUrl/audit/summary" `
    -Headers @{
        "x-request-id" = "api-smoke-audit-summary"
    }

if ($null -eq $auditSummaryResponse) {
    throw "Audit summary response was empty."
}

$auditSummaryPayload = $auditSummaryResponse

if ($auditSummaryResponse.PSObject.Properties.Name -contains "data") {
    $auditSummaryPayload = $auditSummaryResponse.data
}

if ($null -eq $auditSummaryPayload.auditEntryCount) {
    throw "Audit summary did not include auditEntryCount."
}

if ($null -eq $auditSummaryPayload.mutationCountsByType) {
    throw "Audit summary did not include mutationCountsByType."
}

if ([int] $auditSummaryPayload.auditEntryCount -lt 1) {
    throw "Audit summary expected at least one mutation entry after smoke mutations."
}

$auditMutationsResponse = Invoke-RestMethod `
    -Method GET `
    -Uri "$auditSmokeBaseUrl/audit/mutations" `
    -Headers @{
        "x-request-id" = "api-smoke-audit-mutations"
    }

if ($null -eq $auditMutationsResponse) {
    throw "Audit mutations response was empty."
}

$auditMutationsPayload = $auditMutationsResponse

if ($auditMutationsResponse.PSObject.Properties.Name -contains "data") {
    $auditMutationsPayload = $auditMutationsResponse.data
}

if ($null -eq $auditMutationsPayload.entries) {
    throw "Audit mutations response did not include entries."
}

$auditEntries = @($auditMutationsPayload.entries)

if ($auditEntries.Count -lt 1) {
    throw "Audit mutations expected at least one entry after smoke mutations."
}

$hasStockpileCreatedAudit = $false
$hasStockpileStatusUpdatedAudit = $false

foreach ($auditEntry in $auditEntries) {
    if ($null -eq $auditEntry.mutation) {
        continue
    }

    if ($auditEntry.mutation.type -eq "stockpile.created") {
        $hasStockpileCreatedAudit = $true
    }

    if ($auditEntry.mutation.type -eq "stockpile.status_updated") {
        $hasStockpileStatusUpdatedAudit = $true
    }
}

if (-not $hasStockpileCreatedAudit) {
    throw "Audit mutations should include stockpile.created."
}

if (-not $hasStockpileStatusUpdatedAudit) {
    throw "Audit mutations should include stockpile.status_updated."
}
