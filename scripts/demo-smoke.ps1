param(
    [string] $EdgeBaseUrl = "http://localhost:8787",
    [string] $OutputPath = "artifacts/demo-package-smoke.json"
)

$ErrorActionPreference = "Stop"

function Invoke-JsonRequest {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Method,

        [Parameter(Mandatory = $true)]
        [string] $Path,

        [object] $Body = $null
    )

    $uri = "$EdgeBaseUrl$Path"

    $headers = @{
        Accept = "application/json"
    }

    if ($null -eq $Body) {
        return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers
    }

    $json = $Body | ConvertTo-Json -Depth 100

    return Invoke-RestMethod `
        -Method $Method `
        -Uri $uri `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $json
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
        $payload = $Response | ConvertTo-Json -Depth 20
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
Write-Host "== Industrial Yard Intelligence demo smoke test =="
Write-Host "Edge: $EdgeBaseUrl"

Write-Host ""
Write-Host "1. Health check"
$health = Invoke-JsonRequest -Method "GET" -Path "/health"
Assert-OkResponse -Response $health -StepName "Health check"
Write-Host "OK health"

Write-Host ""
Write-Host "2. Reset demo state"
$reset = Invoke-JsonRequest -Method "POST" -Path "/admin/reset-demo-state"
Assert-OkResponse -Response $reset -StepName "Reset demo state"
Assert-Condition -Condition ($reset.data.reset -eq $true) -Message "Reset did not return reset=true."
Write-Host "OK reset"

Write-Host ""
Write-Host "3. Run guided demo"
$guidedDemo = Invoke-JsonRequest -Method "POST" -Path "/admin/run-guided-demo" -Body @{
    resetBeforeRun = $true
}
Assert-OkResponse -Response $guidedDemo -StepName "Run guided demo"
Assert-Condition -Condition ($guidedDemo.data.guidedDemo.firstSyncStatus -eq "accepted") -Message "Expected first sync accepted."
Assert-Condition -Condition ($guidedDemo.data.guidedDemo.secondSyncStatus -eq "conflict") -Message "Expected second sync conflict."
Assert-Condition -Condition ($guidedDemo.data.evidenceSummary.totalEvidenceItems -eq 1) -Message "Expected 1 evidence item."
Assert-Condition -Condition ($guidedDemo.data.auditSummary.totalEntries -eq 1) -Message "Expected 1 audit entry."
Write-Host "OK guided demo"

Write-Host ""
Write-Host "4. Demo readiness"
$readiness = Invoke-JsonRequest -Method "GET" -Path "/admin/demo-readiness"
Assert-OkResponse -Response $readiness -StepName "Demo readiness"
Assert-Condition -Condition ($readiness.data.readiness.hasOperationalData -eq $true) -Message "Readiness should have operational data."
Write-Host "OK readiness status: $($readiness.data.readiness.status)"

Write-Host ""
Write-Host "5. Executive report"
$report = Invoke-JsonRequest -Method "GET" -Path "/admin/demo-report"
Assert-OkResponse -Response $report -StepName "Executive report"
Assert-Condition -Condition ($report.data.report.customer -eq "Cooper/T. Smith") -Message "Unexpected report customer."
Assert-Condition -Condition ($report.data.report.status -ne "empty_demo_state") -Message "Report should not be empty after guided demo."
Write-Host "OK report: $($report.data.report.reportId)"

Write-Host ""
Write-Host "6. Export demo package"
$packageResponse = Invoke-JsonRequest -Method "GET" -Path "/admin/demo-package"
Assert-OkResponse -Response $packageResponse -StepName "Export demo package"

$packageData = $packageResponse.data.package

Assert-Condition -Condition ($packageData.integrity.algorithm -eq "sha256") -Message "Package integrity algorithm should be sha256."
Assert-Condition -Condition ($packageData.integrity.hashValue.Length -eq 64) -Message "Package hash should be 64 characters."
Assert-Condition -Condition ($packageData.backup.syncStore.events.Count -eq 2) -Message "Expected 2 sync events in package."
Assert-Condition -Condition ($packageData.backup.auditStore.entries.Count -eq 1) -Message "Expected 1 audit entry in package."
Assert-Condition -Condition ($packageData.backup.evidenceStore.items.Count -eq 1) -Message "Expected 1 evidence item in package."

$outputFullPath = Join-Path (Get-Location).Path $OutputPath
$outputDirectory = Split-Path $outputFullPath -Parent

if (-not (Test-Path $outputDirectory)) {
    New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
}

$packageJson = $packageData | ConvertTo-Json -Depth 100
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($outputFullPath, "$packageJson`n", $utf8NoBom)

Write-Host "OK package exported to $OutputPath"

Write-Host ""
Write-Host "7. Verify current package"
$currentVerify = Invoke-JsonRequest -Method "GET" -Path "/admin/demo-package/verify"
Assert-OkResponse -Response $currentVerify -StepName "Verify current package"
Assert-Condition -Condition ($currentVerify.data.verification.ok -eq $true) -Message "Current package verification failed."
Write-Host "OK current package hash: $($currentVerify.data.verification.hashValue)"

Write-Host ""
Write-Host "8. Verify exported package payload"
$uploadedVerify = Invoke-JsonRequest -Method "POST" -Path "/admin/demo-package/verify" -Body @{
    package = $packageData
}
Assert-OkResponse -Response $uploadedVerify -StepName "Verify exported package"
Assert-Condition -Condition ($uploadedVerify.data.verification.ok -eq $true) -Message "Exported package verification failed."
Write-Host "OK exported package verification"

Write-Host ""
Write-Host "9. Reset and import exported package"
$resetAgain = Invoke-JsonRequest -Method "POST" -Path "/admin/reset-demo-state"
Assert-OkResponse -Response $resetAgain -StepName "Second reset"

$imported = Invoke-JsonRequest -Method "POST" -Path "/admin/demo-package/import" -Body @{
    replaceExistingStore = $true
    package = $packageData
}
Assert-OkResponse -Response $imported -StepName "Import demo package"
Assert-Condition -Condition ($imported.data.imported -eq $true) -Message "Package import did not confirm imported=true."
Assert-Condition -Condition ($imported.data.summary.totalEvents -eq 2) -Message "Imported package should restore 2 events."
Assert-Condition -Condition ($imported.data.auditSummary.totalEntries -eq 1) -Message "Imported package should restore 1 audit entry."
Assert-Condition -Condition ($imported.data.evidenceSummary.totalEvidenceItems -eq 1) -Message "Imported package should restore 1 evidence item."
Write-Host "OK package import restored state"

Write-Host ""
Write-Host "SMOKE TEST PASSED"
Write-Host "Package: $OutputPath"

Write-Host "==> Edge DB projection sync export package"

function Get-IyiEdgeSyncExportSmokeBaseUrl {
    $candidateVariableNames = @(
        "EdgeBaseUrl",
        "BaseUrl",
        "IyiEdgeBaseUrl"
    )

    foreach ($candidateVariableName in $candidateVariableNames) {
        $candidateVariable = Get-Variable -Name $candidateVariableName -Scope Script -ErrorAction SilentlyContinue

        if ($null -ne $candidateVariable -and -not [string]::IsNullOrWhiteSpace([string] $candidateVariable.Value)) {
            return ([string] $candidateVariable.Value).TrimEnd("/")
        }
    }

    $candidateEnvironmentNames = @(
        "IYI_EDGE_BASE_URL",
        "VITE_IYI_EDGE_BASE_URL",
        "EDGE_BASE_URL"
    )

    foreach ($candidateEnvironmentName in $candidateEnvironmentNames) {
        $candidateEnvironmentValue = [System.Environment]::GetEnvironmentVariable($candidateEnvironmentName)

        if (-not [string]::IsNullOrWhiteSpace($candidateEnvironmentValue)) {
            return $candidateEnvironmentValue.TrimEnd("/")
        }
    }

    return "http://localhost:8787"
}

function Unwrap-IyiEdgeSyncExportPayload {
    param(
        [Parameter(Mandatory = $true)]
        [object] $Response
    )

    if ($Response.PSObject.Properties.Name -contains "data") {
        return $Response.data
    }

    return $Response
}

$edgeSyncExportBaseUrl = Get-IyiEdgeSyncExportSmokeBaseUrl
$edgeSyncExportPackageId = "sync_pkg_edge_smoke_db_projection"

$edgeSyncExportResponse = Invoke-RestMethod `
    -Method GET `
    -Uri "$edgeSyncExportBaseUrl/sync/packages/db-projection?packageId=$edgeSyncExportPackageId" `
    -Headers @{
        "x-request-id" = "edge-smoke-sync-export-db-projection"
    }

if ($null -eq $edgeSyncExportResponse) {
    throw "Edge DB projection sync export response was empty."
}

$edgeSyncExportPayload = Unwrap-IyiEdgeSyncExportPayload -Response $edgeSyncExportResponse

if ($null -eq $edgeSyncExportPayload.generatedAt) {
    throw "Edge DB projection sync export did not include generatedAt."
}

if ($null -eq $edgeSyncExportPayload.recordCount) {
    throw "Edge DB projection sync export did not include recordCount."
}

if ([int] $edgeSyncExportPayload.recordCount -lt 1) {
    throw "Edge DB projection sync export expected at least one record."
}

if ($null -eq $edgeSyncExportPayload.package) {
    throw "Edge DB projection sync export did not include package."
}

if ($null -eq $edgeSyncExportPayload.package.manifest) {
    throw "Edge DB projection sync export package did not include manifest."
}

if ($edgeSyncExportPayload.package.manifest.packageId -ne $edgeSyncExportPackageId) {
    throw "Edge DB projection sync export packageId mismatch."
}

if ($edgeSyncExportPayload.package.manifest.packageKind -ne "db_projection_snapshot") {
    throw "Edge DB projection sync export packageKind mismatch."
}

if ($edgeSyncExportPayload.package.manifest.direction -ne "edge_to_cloud") {
    throw "Edge DB projection sync export direction mismatch."
}

if ($edgeSyncExportPayload.package.manifest.schemaVersion -ne "cloud-edge-sync-v1") {
    throw "Edge DB projection sync export schemaVersion mismatch."
}

if ($null -eq $edgeSyncExportPayload.package.manifest.payloadHash) {
    throw "Edge DB projection sync export did not include payloadHash."
}

if ($edgeSyncExportPayload.package.manifest.payloadHash -notmatch "^sha256:[a-f0-9]{64}$") {
    throw "Edge DB projection sync export payloadHash format is invalid."
}

if ([int] $edgeSyncExportPayload.package.manifest.payloadRecordCount -ne [int] $edgeSyncExportPayload.recordCount) {
    throw "Edge DB projection sync export payloadRecordCount should match recordCount."
}

if ($null -eq $edgeSyncExportPayload.package.payload) {
    throw "Edge DB projection sync export package did not include payload."
}
