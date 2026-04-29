param(
    [switch] $SkipPackageScripts
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

function Read-RepoText {
    param(
        [Parameter(Mandatory = $true)]
        [string] $RelativePath
    )

    $fullPath = Join-Path $repoRoot $RelativePath

    if (-not (Test-Path $fullPath)) {
        throw "Missing required file: $RelativePath"
    }

    return [System.IO.File]::ReadAllText($fullPath)
}

function Assert-FileExists {
    param(
        [Parameter(Mandatory = $true)]
        [string] $RelativePath
    )

    $fullPath = Join-Path $repoRoot $RelativePath

    if (-not (Test-Path $fullPath)) {
        throw "Missing required file: $RelativePath"
    }

    Write-Host "OK file: $RelativePath"
}

function Assert-TextContains {
    param(
        [Parameter(Mandatory = $true)]
        [string] $RelativePath,

        [Parameter(Mandatory = $true)]
        [string] $Needle
    )

    $text = Read-RepoText -RelativePath $RelativePath

    if (-not $text.Contains($Needle)) {
        throw "Missing expected text in ${RelativePath}: $Needle"
    }

    Write-Host "OK text: $RelativePath contains $Needle"
}

function Assert-JsonScript {
    param(
        [Parameter(Mandatory = $true)]
        [string] $ScriptName
    )

    $packageJsonPath = Join-Path $repoRoot "package.json"

    if (-not (Test-Path $packageJsonPath)) {
        throw "Missing package.json."
    }

    $packageJson = Get-Content -Raw -Path $packageJsonPath | ConvertFrom-Json

    if (-not ($packageJson.PSObject.Properties.Name -contains "scripts")) {
        throw "package.json does not include scripts."
    }

    if (-not ($packageJson.scripts.PSObject.Properties.Name -contains $ScriptName)) {
        throw "package.json missing script: $ScriptName"
    }

    Write-Host "OK script: $ScriptName"
}

Write-Host "==> Architecture v1 readiness check"

$requiredFiles = @(
    "packages\db\src\index.ts",
    "packages\api-contracts\src\index.ts",
    "packages\api-contracts\src\cloud-api.ts",
    "packages\api-contracts\src\cloud-api-audit.ts",
    "packages\api-contracts\src\cloud-edge-sync.ts",
    "packages\domain\src\stockpile-lifecycle.ts",
    "apps\api\src\routes.ts",
    "apps\api\src\stockpile-service.ts",
    "apps\api\src\audit-mutation-service.ts",
    "apps\api\src\audit-mutation-json-file-store.ts",
    "apps\api\src\audit-mutation-route-wrapper.ts",
    "apps\api\src\cloud-edge-sync-route-wrapper.ts",
    "apps\edge\src\cloud-edge-sync-package.ts",
    "apps\edge\src\db-projection-sync-package.ts",
    "apps\edge\src\edge-cloud-sync-export-handler.ts",
    "apps\edge\src\edge-cloud-sync-export-route-wrapper.ts",
    "apps\web\src\data\api-client.ts",
    "apps\web\src\data\audit-client.ts",
    "apps\web\src\data\cloud-edge-sync-client.ts",
    "apps\web\src\components\StockpileCreatePanel.tsx",
    "apps\web\src\components\StockpileStatusPanel.tsx",
    "apps\web\src\components\AuditMutationPanel.tsx",
    "apps\web\src\components\CloudEdgeSyncPanel.tsx",
    "scripts\api-smoke.ps1",
    "scripts\demo-smoke.ps1",
    "scripts\cloud-edge-sync-smoke.ps1",
    "scripts\ci-local.ps1",
    "docs\API_BACKEND.md",
    "docs\LOCAL_STACK.md",
    "docs\STOCKPILE_LIFECYCLE.md",
    "docs\API_AUDIT_MUTATIONS.md",
    "docs\CLOUD_EDGE_SYNC.md",
    "docs\CLOUD_EDGE_SYNC_SMOKE.md",
    "docs\EDGE_CLOUD_SYNC_EXPORT_HANDLER.md",
    "docs\WEB_CLOUD_EDGE_SYNC.md"
)

foreach ($requiredFile in $requiredFiles) {
    Assert-FileExists -RelativePath $requiredFile
}

$requiredTextChecks = @(
    @{ Path = "packages\domain\src\stockpile-lifecycle.ts"; Text = "stockpileLifecycleStatuses" },
    @{ Path = "packages\api-contracts\src\cloud-api.ts"; Text = "/stockpiles/lifecycle" },
    @{ Path = "packages\api-contracts\src\cloud-api.ts"; Text = "/audit/mutations" },
    @{ Path = "packages\api-contracts\src\cloud-api.ts"; Text = "/audit/stockpiles/:id" },
    @{ Path = "packages\api-contracts\src\cloud-api.ts"; Text = "/sync/status" },
    @{ Path = "packages\api-contracts\src\cloud-api.ts"; Text = "/sync/preview" },
    @{ Path = "packages\api-contracts\src\cloud-api.ts"; Text = "/sync/ingest" },
    @{ Path = "packages\api-contracts\src\cloud-edge-sync.ts"; Text = "CloudEdgeSyncPackageContract" },
    @{ Path = "apps\api\src\routes.ts"; Text = "wrapCloudApiSyncRoutes" },
    @{ Path = "apps\api\src\routes.ts"; Text = "wrapCloudApiRouteRequestWithAudit" },
    @{ Path = "apps\api\src\audit-mutation-route-wrapper.ts"; Text = "/audit/mutations" },
    @{ Path = "apps\api\src\audit-mutation-route-wrapper.ts"; Text = "/audit/summary" },
    @{ Path = "apps\api\src\audit-mutation-route-wrapper.ts"; Text = "/audit/stockpiles/" },
    @{ Path = "apps\api\src\cloud-edge-sync-route-wrapper.ts"; Text = "/sync/status" },
    @{ Path = "apps\api\src\cloud-edge-sync-route-wrapper.ts"; Text = "/sync/preview" },
    @{ Path = "apps\api\src\cloud-edge-sync-route-wrapper.ts"; Text = "/sync/ingest" },
    @{ Path = "apps\edge\src\edge-cloud-sync-export-route-wrapper.ts"; Text = "/sync/packages/db-projection" },
    @{ Path = "apps\edge\src\edge-cloud-sync-export-route-wrapper.ts"; Text = "/db/snapshot" },
    @{ Path = "apps\web\src\App.tsx"; Text = "CloudEdgeSyncPanel" },
    @{ Path = "apps\web\src\App.tsx"; Text = "AuditMutationPanel" },
    @{ Path = "scripts\api-smoke.ps1"; Text = "/sync/status" },
    @{ Path = "scripts\api-smoke.ps1"; Text = "/audit/mutations" },
    @{ Path = "scripts\demo-smoke.ps1"; Text = "/sync/packages/db-projection" },
    @{ Path = "scripts\cloud-edge-sync-smoke.ps1"; Text = "/sync/packages/db-projection" },
    @{ Path = "scripts\cloud-edge-sync-smoke.ps1"; Text = "/sync/preview" },
    @{ Path = "scripts\cloud-edge-sync-smoke.ps1"; Text = "/sync/ingest" }
)

foreach ($check in $requiredTextChecks) {
    Assert-TextContains -RelativePath $check.Path -Needle $check.Text
}

if (-not $SkipPackageScripts) {
    $requiredScripts = @(
        "dev:api",
        "dev:edge",
        "dev:web",
        "dev:stack:windows",
        "smoke:runtime",
        "api:smoke",
        "demo:smoke",
        "sync:smoke",
        "architecture:check",
        "typecheck",
        "test"
    )

    foreach ($requiredScript in $requiredScripts) {
        Assert-JsonScript -ScriptName $requiredScript
    }
}

Write-Host "==> Architecture v1 readiness check passed"