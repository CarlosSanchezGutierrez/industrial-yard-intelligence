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

Write-Host "==> Phase 2 demo polish check"

$requiredFiles = @(
    "apps\web\src\App.tsx",
    "apps\web\src\components\DemoCommandCenter.tsx",
    "apps\web\src\components\CockpitSectionNavigationPanel.tsx",
    "apps\web\src\components\DemoNavigationPanel.tsx",
    "apps\web\src\components\OperatorWorkflowProgressPanel.tsx",
    "apps\web\src\components\RuntimeConnectionStatusPanel.tsx",
    "apps\web\src\components\DemoDataResetPanel.tsx",
    "apps\web\src\components\IndustrialValueSnapshotPanel.tsx",
    "apps\web\src\components\StockpileDemoSummaryPanel.tsx",
    "apps\web\src\components\AuditTimelineStoryPanel.tsx",
    "apps\web\src\components\SyncDemoStoryPanel.tsx",
    "apps\web\src\components\YardOperationsMapPanel.tsx",
    "docs\PHASE_2_DEMO_POLISH.md",
    "docs\PHASE_2_DEMO_POLISH_GATE.md",
    "scripts\phase-2-demo-polish-check.ps1"
)

foreach ($requiredFile in $requiredFiles) {
    Assert-FileExists -RelativePath $requiredFile
}

$requiredAppMarkers = @(
    "DemoCommandCenter",
    "CockpitSectionNavigationPanel",
    "DemoNavigationPanel",
    "OperatorWorkflowProgressPanel",
    "RuntimeConnectionStatusPanel",
    "DemoDataResetPanel",
    "IndustrialValueSnapshotPanel",
    "StockpileDemoSummaryPanel",
    "AuditTimelineStoryPanel",
    "SyncDemoStoryPanel",
    "YardOperationsMapPanel"
)

foreach ($marker in $requiredAppMarkers) {
    Assert-TextContains -RelativePath "apps\web\src\App.tsx" -Needle $marker
}

$requiredDocMarkers = @(
    "DemoCommandCenter",
    "CockpitSectionNavigationPanel",
    "DemoNavigationPanel",
    "OperatorWorkflowProgressPanel",
    "RuntimeConnectionStatusPanel",
    "DemoDataResetPanel",
    "IndustrialValueSnapshotPanel",
    "StockpileDemoSummaryPanel",
    "AuditTimelineStoryPanel",
    "SyncDemoStoryPanel",
    "YardOperationsMapPanel"
)

foreach ($marker in $requiredDocMarkers) {
    Assert-TextContains -RelativePath "docs\PHASE_2_DEMO_POLISH.md" -Needle $marker
}

$componentChecks = @(
    @{ Path = "apps\web\src\components\RuntimeConnectionStatusPanel.tsx"; Needle = "/sync/status" },
    @{ Path = "apps\web\src\components\DemoDataResetPanel.tsx"; Needle = "/admin/db/reset" },
    @{ Path = "apps\web\src\components\StockpileDemoSummaryPanel.tsx"; Needle = "/stockpiles" },
    @{ Path = "apps\web\src\components\AuditTimelineStoryPanel.tsx"; Needle = "/audit/mutations" },
    @{ Path = "apps\web\src\components\SyncDemoStoryPanel.tsx"; Needle = "/sync/packages/db-projection" },
    @{ Path = "apps\web\src\components\SyncDemoStoryPanel.tsx"; Needle = "/sync/preview" },
    @{ Path = "apps\web\src\components\SyncDemoStoryPanel.tsx"; Needle = "/sync/ingest" },
    @{ Path = "apps\web\src\components\YardOperationsMapPanel.tsx"; Needle = "Yard hub" },
    @{ Path = "apps\web\src\components\CockpitSectionNavigationPanel.tsx"; Needle = "#sync-story" },
    @{ Path = "apps\web\src\components\DemoCommandCenter.tsx"; Needle = 'id="demo-command-center"' },
    @{ Path = "apps\web\src\components\RuntimeConnectionStatusPanel.tsx"; Needle = 'id="runtime-status"' },
    @{ Path = "apps\web\src\components\IndustrialValueSnapshotPanel.tsx"; Needle = 'id="industrial-value"' },
    @{ Path = "apps\web\src\components\StockpileDemoSummaryPanel.tsx"; Needle = 'id="stockpile-summary"' },
    @{ Path = "apps\web\src\components\AuditTimelineStoryPanel.tsx"; Needle = 'id="audit-story"' },
    @{ Path = "apps\web\src\components\SyncDemoStoryPanel.tsx"; Needle = 'id="sync-story"' },
    @{ Path = "apps\web\src\components\YardOperationsMapPanel.tsx"; Needle = 'id="yard-map"' }
)

foreach ($check in $componentChecks) {
    Assert-TextContains -RelativePath $check.Path -Needle $check.Needle
}

if (-not $SkipPackageScripts) {
    Assert-JsonScript -ScriptName "phase2:check"
    Assert-JsonScript -ScriptName "phase2:runtime"
    Assert-JsonScript -ScriptName "dev:web"
    Assert-JsonScript -ScriptName "dev:stack:windows"
}

Write-Host "==> Phase 2 demo polish check passed"