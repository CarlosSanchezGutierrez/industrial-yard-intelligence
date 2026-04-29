param(
    [switch] $CheckOnly
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

function Assert-Phase2File {
    param(
        [Parameter(Mandatory = $true)]
        [string] $RelativePath
    )

    $fullPath = Join-Path $repoRoot $RelativePath

    if (-not (Test-Path $fullPath)) {
        throw "Missing Phase 2 file: $RelativePath"
    }

    Write-Host "OK Phase 2 file: $RelativePath"
}

function Assert-Phase2Text {
    param(
        [Parameter(Mandatory = $true)]
        [string] $RelativePath,

        [Parameter(Mandatory = $true)]
        [string] $Needle
    )

    $fullPath = Join-Path $repoRoot $RelativePath

    if (-not (Test-Path $fullPath)) {
        throw "Missing Phase 2 text file: $RelativePath"
    }

    $text = [System.IO.File]::ReadAllText($fullPath)

    if (-not $text.Contains($Needle)) {
        throw "Missing Phase 2 marker in ${RelativePath}: $Needle"
    }

    Write-Host "OK Phase 2 marker: $RelativePath contains $Needle"
}

function Assert-Phase2Script {
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
        throw "Missing package.json script: $ScriptName"
    }

    Write-Host "OK Phase 2 script: $ScriptName"
}

Write-Host "==> Phase 2 demo polish status"

$requiredFiles = @(
    "apps\web\src\App.tsx",
    "apps\web\src\components\DemoCommandCenter.tsx",
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
    "docs\PHASE_2_DEMO_RUNTIME_SMOKE.md",
    "docs\PHASE_2_DEMO_POLISH_STATUS.md",
    "scripts\phase-2-demo-polish-check.ps1",
    "scripts\phase-2-demo-runtime-smoke.ps1",
    "scripts\phase-2-demo-polish-status.ps1"
)

foreach ($requiredFile in $requiredFiles) {
    Assert-Phase2File -RelativePath $requiredFile
}

$requiredScripts = @(
    "phase2:check",
    "phase2:runtime",
    "phase2:status",
    "dev:web",
    "dev:stack:windows"
)

foreach ($requiredScript in $requiredScripts) {
    Assert-Phase2Script -ScriptName $requiredScript
}

$requiredPanels = @(
    "DemoCommandCenter",
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

foreach ($requiredPanel in $requiredPanels) {
    Assert-Phase2Text -RelativePath "apps\web\src\App.tsx" -Needle $requiredPanel
    Assert-Phase2Text -RelativePath "docs\PHASE_2_DEMO_POLISH.md" -Needle $requiredPanel
}

Assert-Phase2Text -RelativePath "docs\PHASE_2_DEMO_POLISH_STATUS.md" -Needle "PHASE_2_DEMO_POLISH_STATIC_READY"
Assert-Phase2Text -RelativePath "docs\PHASE_2_DEMO_RUNTIME_SMOKE.md" -Needle "PHASE_2_DEMO_RUNTIME_READY"
Assert-Phase2Text -RelativePath "scripts\phase-2-demo-runtime-smoke.ps1" -Needle "PHASE_2_DEMO_RUNTIME_READY"
Assert-Phase2Text -RelativePath "scripts\phase-2-demo-polish-check.ps1" -Needle "Phase 2 demo polish check passed"

Write-Host ""
Write-Host "Phase 2 static status: PHASE_2_DEMO_POLISH_STATIC_READY"
Write-Host "Estimated Phase 2 demo polish completion: 80-85%"
Write-Host ""
Write-Host "Ready areas:"
Write-Host "- Demo command center"
Write-Host "- Guided demo navigation"
Write-Host "- Operator workflow progress"
Write-Host "- Runtime connection status"
Write-Host "- Demo data reset"
Write-Host "- Industrial value snapshot"
Write-Host "- Stockpile demo summary"
Write-Host "- Audit timeline story"
Write-Host "- Sync demo story"
Write-Host "- Conceptual yard operations map"
Write-Host "- Static Phase 2 gate"
Write-Host "- Runtime Phase 2 smoke"
Write-Host ""
Write-Host "Remaining Phase 2 work:"
Write-Host "- reduce cockpit clutter with sections/tabs"
Write-Host "- improve visual grouping/order"
Write-Host "- add final demo script for presenter"
Write-Host "- add Phase 2 closure tag after runtime validation"
Write-Host ""

if ($CheckOnly) {
    Write-Host "==> Phase 2 demo polish status check passed"
    exit 0
}

Write-Host "Recommended validation order:"
Write-Host "1. pnpm phase2:check"
Write-Host "2. pnpm phase2:status -- -CheckOnly"
Write-Host "3. pnpm --filter @iyi/web build"
Write-Host "4. pnpm dev:stack:windows"
Write-Host "5. pnpm phase2:runtime"
Write-Host ""
Write-Host "==> Phase 2 demo polish status complete"