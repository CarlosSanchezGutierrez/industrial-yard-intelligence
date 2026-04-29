param(
    [switch] $CheckOnly,
    [switch] $SkipBuild
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

function Invoke-Phase2CloseStep {
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

function Assert-Phase2CloseFile {
    param(
        [Parameter(Mandatory = $true)]
        [string] $RelativePath
    )

    $fullPath = Join-Path $repoRoot $RelativePath

    if (-not (Test-Path $fullPath)) {
        throw "Missing Phase 2 closure file: $RelativePath"
    }

    Write-Host "OK Phase 2 closure file: $RelativePath"
}

function Assert-Phase2CloseText {
    param(
        [Parameter(Mandatory = $true)]
        [string] $RelativePath,

        [Parameter(Mandatory = $true)]
        [string] $Needle
    )

    $fullPath = Join-Path $repoRoot $RelativePath

    if (-not (Test-Path $fullPath)) {
        throw "Missing Phase 2 closure text file: $RelativePath"
    }

    $text = [System.IO.File]::ReadAllText($fullPath)

    if (-not $text.Contains($Needle)) {
        throw "Missing Phase 2 closure marker in ${RelativePath}: $Needle"
    }

    Write-Host "OK Phase 2 closure marker: $RelativePath contains $Needle"
}

function Assert-Phase2CloseScript {
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

    Write-Host "OK Phase 2 closure script: $ScriptName"
}

Write-Host "==> Phase 2 demo polish closure"

$requiredFiles = @(
    "docs\PHASE_2_DEMO_POLISH_CLOSURE.md",
    "docs\PHASE_2_DEMO_POLISH.md",
    "docs\PHASE_2_DEMO_POLISH_GATE.md",
    "docs\PHASE_2_DEMO_POLISH_STATUS.md",
    "docs\PHASE_2_DEMO_RUNTIME_SMOKE.md",
    "docs\PHASE_2_DEMO_PRESENTER_SCRIPT.md",
    "scripts\phase-2-demo-polish-close.ps1",
    "scripts\phase-2-demo-polish-check.ps1",
    "scripts\phase-2-demo-polish-status.ps1",
    "scripts\phase-2-demo-runtime-smoke.ps1",
    "scripts\phase-2-demo-presenter.ps1",
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
    "apps\web\src\components\YardOperationsMapPanel.tsx"
)

foreach ($requiredFile in $requiredFiles) {
    Assert-Phase2CloseFile -RelativePath $requiredFile
}

$requiredScripts = @(
    "phase2:close",
    "phase2:check",
    "phase2:status",
    "phase2:runtime",
    "phase2:presenter",
    "dev:web",
    "dev:stack:windows"
)

foreach ($requiredScript in $requiredScripts) {
    Assert-Phase2CloseScript -ScriptName $requiredScript
}

$requiredPanels = @(
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

foreach ($requiredPanel in $requiredPanels) {
    Assert-Phase2CloseText -RelativePath "apps\web\src\App.tsx" -Needle $requiredPanel
    Assert-Phase2CloseText -RelativePath "docs\PHASE_2_DEMO_POLISH.md" -Needle $requiredPanel
}

Assert-Phase2CloseText -RelativePath "docs\PHASE_2_DEMO_POLISH_CLOSURE.md" -Needle "PHASE_2_DEMO_POLISH_CLOSED_FOR_DEMO"
Assert-Phase2CloseText -RelativePath "docs\PHASE_2_DEMO_POLISH_STATUS.md" -Needle "PHASE_2_DEMO_POLISH_STATIC_READY"
Assert-Phase2CloseText -RelativePath "docs\PHASE_2_DEMO_RUNTIME_SMOKE.md" -Needle "PHASE_2_DEMO_RUNTIME_READY"
Assert-Phase2CloseText -RelativePath "docs\PHASE_2_DEMO_PRESENTER_SCRIPT.md" -Needle "PHASE_2_DEMO_PRESENTER_READY"

Invoke-Phase2CloseStep "phase2:check" {
    pnpm phase2:check
}

Invoke-Phase2CloseStep "phase2:status" {
    pnpm phase2:status -- -CheckOnly
}

Invoke-Phase2CloseStep "phase2:presenter" {
    pnpm phase2:presenter -- -CheckOnly
}

if (-not $CheckOnly -and -not $SkipBuild) {
    Invoke-Phase2CloseStep "web build" {
        pnpm --filter @iyi/web build
    }
}

Write-Host ""
Write-Host "==> Phase 2 demo polish closure passed"
Write-Host "Status: PHASE_2_DEMO_POLISH_CLOSED_FOR_DEMO"
Write-Host ""
Write-Host "Next required live validation:"
Write-Host "1. pnpm dev:stack:windows"
Write-Host "2. pnpm phase2:runtime"