param(
    [switch] $CheckOnly
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

function Assert-PresenterFile {
    param(
        [Parameter(Mandatory = $true)]
        [string] $RelativePath
    )

    $fullPath = Join-Path $repoRoot $RelativePath

    if (-not (Test-Path $fullPath)) {
        throw "Missing presenter file: $RelativePath"
    }

    Write-Host "OK presenter file: $RelativePath"
}

function Assert-PresenterText {
    param(
        [Parameter(Mandatory = $true)]
        [string] $RelativePath,

        [Parameter(Mandatory = $true)]
        [string] $Needle
    )

    $fullPath = Join-Path $repoRoot $RelativePath

    if (-not (Test-Path $fullPath)) {
        throw "Missing presenter text file: $RelativePath"
    }

    $text = [System.IO.File]::ReadAllText($fullPath)

    if (-not $text.Contains($Needle)) {
        throw "Missing presenter marker in ${RelativePath}: $Needle"
    }

    Write-Host "OK presenter marker: $RelativePath contains $Needle"
}

function Assert-PresenterScript {
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

    Write-Host "OK presenter script: $ScriptName"
}

Write-Host "==> Phase 2 demo presenter script"

$requiredFiles = @(
    "docs\PHASE_2_DEMO_PRESENTER_SCRIPT.md",
    "docs\PHASE_2_DEMO_POLISH.md",
    "docs\PHASE_2_DEMO_POLISH_GATE.md",
    "docs\PHASE_2_DEMO_POLISH_STATUS.md",
    "docs\PHASE_2_DEMO_RUNTIME_SMOKE.md",
    "scripts\phase-2-demo-presenter.ps1",
    "scripts\phase-2-demo-polish-check.ps1",
    "scripts\phase-2-demo-runtime-smoke.ps1",
    "apps\web\src\components\CockpitSectionNavigationPanel.tsx",
    "apps\web\src\components\DemoCommandCenter.tsx",
    "apps\web\src\components\RuntimeConnectionStatusPanel.tsx",
    "apps\web\src\components\IndustrialValueSnapshotPanel.tsx",
    "apps\web\src\components\StockpileDemoSummaryPanel.tsx",
    "apps\web\src\components\AuditTimelineStoryPanel.tsx",
    "apps\web\src\components\SyncDemoStoryPanel.tsx",
    "apps\web\src\components\YardOperationsMapPanel.tsx"
)

foreach ($requiredFile in $requiredFiles) {
    Assert-PresenterFile -RelativePath $requiredFile
}

$requiredScripts = @(
    "phase2:presenter",
    "phase2:check",
    "phase2:status",
    "phase2:runtime",
    "dev:stack:windows"
)

foreach ($requiredScript in $requiredScripts) {
    Assert-PresenterScript -ScriptName $requiredScript
}

$requiredMarkers = @(
    "PHASE_2_DEMO_PRESENTER_READY",
    "Opening line",
    "Demo order",
    "Runtime status",
    "Industrial value",
    "Stockpile workflow",
    "Audit timeline",
    "Sync story",
    "Yard operations map",
    "Closing line"
)

foreach ($requiredMarker in $requiredMarkers) {
    Assert-PresenterText -RelativePath "docs\PHASE_2_DEMO_PRESENTER_SCRIPT.md" -Needle $requiredMarker
}

Write-Host ""
Write-Host "Phase 2 presenter status: PHASE_2_DEMO_PRESENTER_READY"
Write-Host ""
Write-Host "Recommended live order:"
Write-Host "1. pnpm phase2:check"
Write-Host "2. pnpm --filter @iyi/web build"
Write-Host "3. pnpm dev:stack:windows"
Write-Host "4. pnpm phase2:runtime"
Write-Host "5. Open cockpit web"
Write-Host "6. Follow docs/PHASE_2_DEMO_PRESENTER_SCRIPT.md"
Write-Host ""

if ($CheckOnly) {
    Write-Host "==> Phase 2 presenter check passed"
    exit 0
}

Write-Host "Opening line:"
Write-Host "Industrial Yard Intelligence convierte patios de material a granel en una operacion visible, auditable y preparada para sincronizacion edge-to-cloud."
Write-Host ""
Write-Host "Closing line:"
Write-Host "Lo que mostramos no es una pantalla aislada: es la base de una plataforma SaaS industrial local-first para patios, terminales y operaciones con trazabilidad."