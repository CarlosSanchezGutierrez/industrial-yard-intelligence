param(
    [switch] $CheckOnly
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

function Assert-DemoFile {
    param(
        [Parameter(Mandatory = $true)]
        [string] $RelativePath
    )

    $fullPath = Join-Path $repoRoot $RelativePath

    if (-not (Test-Path $fullPath)) {
        throw "Missing demo file: $RelativePath"
    }

    Write-Host "OK demo file: $RelativePath"
}

function Assert-DemoScript {
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

    Write-Host "OK demo script: $ScriptName"
}

Write-Host "==> Industrial Yard Intelligence / Modelo Namiki demo operator v1"
Write-Host ""

$requiredFiles = @(
    "docs\ARCHITECTURE_V1_BLUEPRINT.md",
    "docs\ARCHITECTURE_V1_DIAGRAMS.md",
    "docs\ARCHITECTURE_V1_PHASE_GATE.md",
    "docs\ARCHITECTURE_V1_READINESS.md",
    "docs\ARCHITECTURE_V1_ROADMAP.md",
    "docs\CLOUD_EDGE_SYNC.md",
    "docs\CLOUD_EDGE_SYNC_SMOKE.md",
    "docs\EDGE_CLOUD_SYNC_EXPORT_HANDLER.md",
    "docs\WEB_CLOUD_EDGE_SYNC.md",
    "docs\DEMO_OPERATOR_V1.md",
    "docs\INVESTOR_TECHNICAL_NARRATIVE.md"
)

foreach ($requiredFile in $requiredFiles) {
    Assert-DemoFile -RelativePath $requiredFile
}

$requiredScripts = @(
    "architecture:check",
    "dev:stack:windows",
    "api:smoke",
    "demo:smoke",
    "sync:smoke",
    "smoke:runtime",
    "demo:operator"
)

foreach ($requiredScript in $requiredScripts) {
    Assert-DemoScript -ScriptName $requiredScript
}

Write-Host ""
Write-Host "==> Recommended live demo order"
Write-Host "1. pnpm architecture:check"
Write-Host "2. pnpm dev:stack:windows"
Write-Host "3. Open web cockpit from the Vite URL."
Write-Host "4. Show stockpile lifecycle metadata."
Write-Host "5. Create a stockpile from the cockpit."
Write-Host "6. Update stockpile status."
Write-Host "7. Show mutation audit timeline."
Write-Host "8. Show stockpile-specific audit history."
Write-Host "9. Show Cloud Edge sync readiness panel."
Write-Host "10. Run pnpm api:smoke"
Write-Host "11. Run pnpm demo:smoke"
Write-Host "12. Run pnpm sync:smoke"
Write-Host ""
Write-Host "==> Demo narrative"
Write-Host "Local-first edge runtime captures/serves yard data."
Write-Host "Cloud API skeleton centralizes contracts, audit and future SaaS backend."
Write-Host "Web cockpit proves supervisor workflows."
Write-Host "Shared packages prevent contract drift."
Write-Host "Sync preview proves edge-to-cloud path without risking data mutation."
Write-Host ""

if ($CheckOnly) {
    Write-Host "==> Demo operator check passed"
    exit 0
}

Write-Host "==> Command quick reference"
Write-Host "Architecture readiness : pnpm architecture:check"
Write-Host "Local stack            : pnpm dev:stack:windows"
Write-Host "API smoke              : pnpm api:smoke"
Write-Host "Edge smoke             : pnpm demo:smoke"
Write-Host "Integrated sync smoke  : pnpm sync:smoke"
Write-Host "Full runtime smoke     : pnpm smoke:runtime"
Write-Host ""
Write-Host "==> Demo operator v1 ready"