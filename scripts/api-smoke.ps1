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
Write-Host "8. System overview"
$overview = Invoke-JsonRequest -Method "GET" -Path "/system/overview"
Assert-OkResponse -Response $overview -StepName "System overview"
Assert-Condition -Condition ($overview.data.tenantCount -eq 1) -Message "Expected tenantCount = 1."
Assert-Condition -Condition ($overview.data.terminalCount -eq 1) -Message "Expected terminalCount = 1."
Assert-Condition -Condition ($overview.data.stockpileCount -ge 1) -Message "Expected stockpileCount >= 1."
Assert-Condition -Condition ($overview.data.syncEventCount -eq 0) -Message "Expected syncEventCount = 0 in API seed mode."
Write-Host "OK system overview"


Write-Host ""
Write-Host "9. Admin DB snapshot"
$dbSnapshot = Invoke-JsonRequest -Method "GET" -Path "/admin/db/snapshot"
Assert-OkResponse -Response $dbSnapshot -StepName "Admin DB snapshot"
Assert-Condition -Condition ($dbSnapshot.data.storeFile -like "*api-db.json*") -Message "Expected api-db.json store file."
Assert-Condition -Condition ($dbSnapshot.data.snapshot.version -eq 1) -Message "Expected DB snapshot version 1."
Assert-Condition -Condition ($dbSnapshot.data.snapshot.tables.app_tenants.Count -eq 1) -Message "Expected 1 tenant in DB snapshot."
Write-Host "OK admin DB snapshot"

Write-Host ""
Write-Host "10. Admin DB reset"
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