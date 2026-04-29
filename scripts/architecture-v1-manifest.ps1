param(
    [switch] $CheckOnly
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

function Assert-ManifestFile {
    param(
        [Parameter(Mandatory = $true)]
        [string] $RelativePath
    )

    $fullPath = Join-Path $repoRoot $RelativePath

    if (-not (Test-Path $fullPath)) {
        throw "Missing manifest file: $RelativePath"
    }

    Write-Host "OK manifest file: $RelativePath"
}

function Assert-ManifestText {
    param(
        [Parameter(Mandatory = $true)]
        [string] $RelativePath,

        [Parameter(Mandatory = $true)]
        [string] $Needle
    )

    $fullPath = Join-Path $repoRoot $RelativePath

    if (-not (Test-Path $fullPath)) {
        throw "Missing manifest text file: $RelativePath"
    }

    $text = [System.IO.File]::ReadAllText($fullPath)

    if (-not $text.Contains($Needle)) {
        throw "Missing manifest marker in ${RelativePath}: $Needle"
    }

    Write-Host "OK manifest marker: $RelativePath contains $Needle"
}

function Assert-ManifestScript {
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

    Write-Host "OK manifest script: $ScriptName"
}

Write-Host "==> Architecture v1 manifest"

$requiredFiles = @(
    "docs\ARCHITECTURE_V1_MANIFEST.md",
    "docs\ARCHITECTURE_V1_STATUS.md",
    "docs\ARCHITECTURE_V1_BLUEPRINT.md",
    "docs\ARCHITECTURE_V1_DIAGRAMS.md",
    "docs\ARCHITECTURE_V1_PHASE_GATE.md",
    "docs\ARCHITECTURE_V1_FINAL_GATE.md",
    "docs\ARCHITECTURE_V1_RUNTIME_GATE.md",
    "docs\DEMO_OPERATOR_V1.md",
    "docs\INVESTOR_TECHNICAL_NARRATIVE.md",
    "docs\CLOUD_EDGE_SYNC.md",
    "docs\CLOUD_EDGE_SYNC_SMOKE.md",
    "scripts\architecture-readiness.ps1",
    "scripts\architecture-v1-status.ps1",
    "scripts\architecture-v1-gate.ps1",
    "scripts\architecture-v1-runtime-gate.ps1",
    "scripts\demo-operator-v1.ps1",
    "scripts\cloud-edge-sync-smoke.ps1"
)

foreach ($requiredFile in $requiredFiles) {
    Assert-ManifestFile -RelativePath $requiredFile
}

$requiredScripts = @(
    "architecture:check",
    "architecture:status",
    "architecture:gate",
    "architecture:runtime",
    "architecture:manifest",
    "demo:operator",
    "api:smoke",
    "demo:smoke",
    "sync:smoke",
    "smoke:runtime",
    "dev:stack:windows"
)

foreach ($requiredScript in $requiredScripts) {
    Assert-ManifestScript -ScriptName $requiredScript
}

Assert-ManifestText -RelativePath "docs\ARCHITECTURE_V1_STATUS.md" -Needle "V1_READY_FOR_DEMO"
Assert-ManifestText -RelativePath "docs\ARCHITECTURE_V1_FINAL_GATE.md" -Needle "V1_SKELETON_READY_FOR_DEMO"
Assert-ManifestText -RelativePath "docs\ARCHITECTURE_V1_RUNTIME_GATE.md" -Needle "V1_RUNTIME_READY_FOR_DEMO"
Assert-ManifestText -RelativePath "docs\ARCHITECTURE_V1_MANIFEST.md" -Needle "V1_DEMO_MANIFEST_READY"

Write-Host ""
Write-Host "Architecture v1 manifest status: V1_DEMO_MANIFEST_READY"
Write-Host ""
Write-Host "Core commands:"
Write-Host "- pnpm architecture:check"
Write-Host "- pnpm architecture:status -- -CheckOnly"
Write-Host "- pnpm architecture:gate"
Write-Host "- pnpm dev:stack:windows"
Write-Host "- pnpm architecture:runtime"
Write-Host "- pnpm demo:operator"
Write-Host ""
Write-Host "Core docs:"
Write-Host "- docs/ARCHITECTURE_V1_MANIFEST.md"
Write-Host "- docs/ARCHITECTURE_V1_STATUS.md"
Write-Host "- docs/ARCHITECTURE_V1_BLUEPRINT.md"
Write-Host "- docs/ARCHITECTURE_V1_DIAGRAMS.md"
Write-Host "- docs/DEMO_OPERATOR_V1.md"
Write-Host "- docs/INVESTOR_TECHNICAL_NARRATIVE.md"
Write-Host ""

if ($CheckOnly) {
    Write-Host "==> Architecture v1 manifest check passed"
    exit 0
}

Write-Host "==> Architecture v1 manifest complete"