param(
    [switch] $CheckOnly
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

function Invoke-CloseStep {
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

function Assert-CloseFile {
    param(
        [Parameter(Mandatory = $true)]
        [string] $RelativePath
    )

    $fullPath = Join-Path $repoRoot $RelativePath

    if (-not (Test-Path $fullPath)) {
        throw "Missing closure file: $RelativePath"
    }

    Write-Host "OK closure file: $RelativePath"
}

function Assert-CloseText {
    param(
        [Parameter(Mandatory = $true)]
        [string] $RelativePath,

        [Parameter(Mandatory = $true)]
        [string] $Needle
    )

    $fullPath = Join-Path $repoRoot $RelativePath

    if (-not (Test-Path $fullPath)) {
        throw "Missing closure text file: $RelativePath"
    }

    $text = [System.IO.File]::ReadAllText($fullPath)

    if (-not $text.Contains($Needle)) {
        throw "Missing closure marker in ${RelativePath}: $Needle"
    }

    Write-Host "OK closure marker: $RelativePath contains $Needle"
}

function Assert-CloseScript {
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

    Write-Host "OK closure script: $ScriptName"
}

Write-Host "==> Architecture v1 closure baseline"

$requiredFiles = @(
    "docs\ARCHITECTURE_V1_CLOSURE.md",
    "docs\ARCHITECTURE_V1_MANIFEST.md",
    "docs\ARCHITECTURE_V1_STATUS.md",
    "docs\ARCHITECTURE_V1_FINAL_GATE.md",
    "docs\ARCHITECTURE_V1_RUNTIME_GATE.md",
    "docs\ARCHITECTURE_V1_BLUEPRINT.md",
    "docs\ARCHITECTURE_V1_DIAGRAMS.md",
    "docs\DEMO_OPERATOR_V1.md",
    "docs\INVESTOR_TECHNICAL_NARRATIVE.md",
    "scripts\architecture-v1-close.ps1",
    "scripts\architecture-v1-manifest.ps1",
    "scripts\architecture-v1-gate.ps1",
    "scripts\architecture-v1-runtime-gate.ps1",
    "scripts\architecture-readiness.ps1"
)

foreach ($requiredFile in $requiredFiles) {
    Assert-CloseFile -RelativePath $requiredFile
}

$requiredScripts = @(
    "architecture:close",
    "architecture:manifest",
    "architecture:check",
    "architecture:status",
    "architecture:gate",
    "architecture:runtime",
    "demo:operator"
)

foreach ($requiredScript in $requiredScripts) {
    Assert-CloseScript -ScriptName $requiredScript
}

Assert-CloseText -RelativePath "docs\ARCHITECTURE_V1_CLOSURE.md" -Needle "V1_SKELETON_CLOSED_FOR_DEMO"
Assert-CloseText -RelativePath "docs\ARCHITECTURE_V1_MANIFEST.md" -Needle "V1_DEMO_MANIFEST_READY"
Assert-CloseText -RelativePath "docs\ARCHITECTURE_V1_STATUS.md" -Needle "V1_READY_FOR_DEMO"
Assert-CloseText -RelativePath "docs\ARCHITECTURE_V1_FINAL_GATE.md" -Needle "V1_SKELETON_READY_FOR_DEMO"
Assert-CloseText -RelativePath "docs\ARCHITECTURE_V1_RUNTIME_GATE.md" -Needle "V1_RUNTIME_READY_FOR_DEMO"

Invoke-CloseStep "architecture:manifest check" {
    pnpm architecture:manifest -- -CheckOnly
}

Invoke-CloseStep "architecture:check" {
    pnpm architecture:check
}

Invoke-CloseStep "architecture:status check" {
    pnpm architecture:status -- -CheckOnly
}

Invoke-CloseStep "demo:operator check" {
    pnpm demo:operator -- -CheckOnly
}

if (-not $CheckOnly) {
    Invoke-CloseStep "architecture:gate" {
        pnpm architecture:gate -- -SkipInstall
    }
}

Write-Host ""
Write-Host "==> Architecture v1 closure passed"
Write-Host "Status: V1_SKELETON_CLOSED_FOR_DEMO"