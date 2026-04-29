param(
    [switch] $CheckOnly
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

function Assert-StatusFile {
    param(
        [Parameter(Mandatory = $true)]
        [string] $RelativePath
    )

    $fullPath = Join-Path $repoRoot $RelativePath

    if (-not (Test-Path $fullPath)) {
        throw "Missing architecture status file: $RelativePath"
    }

    Write-Host "OK status file: $RelativePath"
}

function Assert-StatusScript {
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

    Write-Host "OK status script: $ScriptName"
}

Write-Host "==> Architecture v1 status"

$requiredFiles = @(
    "docs\ARCHITECTURE_V1_STATUS.md",
    "docs\ARCHITECTURE_V1_BLUEPRINT.md",
    "docs\ARCHITECTURE_V1_DIAGRAMS.md",
    "docs\ARCHITECTURE_V1_PHASE_GATE.md",
    "docs\ARCHITECTURE_V1_READINESS.md",
    "docs\ARCHITECTURE_V1_ROADMAP.md",
    "docs\DEMO_OPERATOR_V1.md",
    "docs\INVESTOR_TECHNICAL_NARRATIVE.md",
    "docs\CLOUD_EDGE_SYNC.md",
    "docs\CLOUD_EDGE_SYNC_SMOKE.md",
    "scripts\architecture-readiness.ps1",
    "scripts\demo-operator-v1.ps1",
    "scripts\cloud-edge-sync-smoke.ps1"
)

foreach ($requiredFile in $requiredFiles) {
    Assert-StatusFile -RelativePath $requiredFile
}

$requiredScripts = @(
    "architecture:check",
    "architecture:status",
    "demo:operator",
    "sync:smoke",
    "api:smoke",
    "demo:smoke",
    "smoke:runtime",
    "dev:stack:windows"
)

foreach ($requiredScript in $requiredScripts) {
    Assert-StatusScript -ScriptName $requiredScript
}

Write-Host ""
Write-Host "Architecture skeleton status: V1_READY_FOR_DEMO"
Write-Host "Estimated architecture skeleton completion: 90-95%"
Write-Host ""
Write-Host "Ready areas:"
Write-Host "- Monorepo package boundaries"
Write-Host "- Shared DB schema and JSON store"
Write-Host "- Shared API contracts"
Write-Host "- Stockpile lifecycle domain rules"
Write-Host "- Cloud API skeleton"
Write-Host "- Mutation audit skeleton"
Write-Host "- Web cockpit skeleton"
Write-Host "- Edge local-first skeleton"
Write-Host "- Cloud Edge sync preview skeleton"
Write-Host "- Runtime smoke scripts"
Write-Host "- Architecture docs, ADRs and demo narrative"
Write-Host ""
Write-Host "Not production-ready yet:"
Write-Host "- auth and roles"
Write-Host "- Postgres adapter"
Write-Host "- deployment pipeline"
Write-Host "- real sync apply mode"
Write-Host "- mobile capture app"
Write-Host "- production media storage"
Write-Host "- advanced geospatial UX"
Write-Host ""

if ($CheckOnly) {
    Write-Host "==> Architecture v1 status check passed"
    exit 0
}

Write-Host "Recommended validation order:"
Write-Host "1. pnpm architecture:check"
Write-Host "2. pnpm architecture:status -- -CheckOnly"
Write-Host "3. pnpm typecheck"
Write-Host "4. pnpm test"
Write-Host "5. pnpm dev:stack:windows"
Write-Host "6. pnpm api:smoke"
Write-Host "7. pnpm demo:smoke"
Write-Host "8. pnpm sync:smoke"
Write-Host "9. pnpm smoke:runtime"
Write-Host ""
Write-Host "==> Architecture v1 status report complete"