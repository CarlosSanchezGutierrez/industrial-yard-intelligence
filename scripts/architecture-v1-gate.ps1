param(
    [switch] $SkipInstall,
    [switch] $SkipCiLocal
)

$ErrorActionPreference = "Stop"

function Invoke-GateStep {
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

Write-Host "==> Architecture v1 final gate"

if (-not $SkipInstall) {
    Invoke-GateStep "pnpm install" {
        pnpm install
    }
}

Invoke-GateStep "architecture:check" {
    pnpm architecture:check
}

Invoke-GateStep "architecture:status" {
    pnpm architecture:status -- -CheckOnly
}

Invoke-GateStep "demo:operator" {
    pnpm demo:operator -- -CheckOnly
}

Invoke-GateStep "@iyi/domain build" {
    pnpm --filter @iyi/domain build
}

Invoke-GateStep "@iyi/domain test" {
    pnpm --filter @iyi/domain test
}

Invoke-GateStep "@iyi/api-contracts build" {
    pnpm --filter @iyi/api-contracts build
}

Invoke-GateStep "@iyi/api-contracts test" {
    pnpm --filter @iyi/api-contracts test
}

Invoke-GateStep "@iyi/api build" {
    pnpm --filter @iyi/api build
}

Invoke-GateStep "@iyi/api test" {
    pnpm --filter @iyi/api test
}

Invoke-GateStep "@iyi/web build" {
    pnpm --filter @iyi/web build
}

Invoke-GateStep "@iyi/edge build" {
    pnpm --filter @iyi/edge build
}

Invoke-GateStep "@iyi/edge test" {
    pnpm --filter @iyi/edge test
}

Invoke-GateStep "@iyi/db build" {
    pnpm --filter @iyi/db build
}

Invoke-GateStep "@iyi/db test" {
    pnpm --filter @iyi/db test
}

Invoke-GateStep "root typecheck" {
    pnpm typecheck
}

Invoke-GateStep "root test" {
    pnpm test
}

if (-not $SkipCiLocal -and (Test-Path "scripts\ci-local.ps1")) {
    Invoke-GateStep "ci-local" {
        powershell -NoProfile -ExecutionPolicy Bypass -File scripts\ci-local.ps1 -SkipInstall -SkipGitStatus
    }
}

Write-Host ""
Write-Host "==> Architecture v1 final gate passed"
Write-Host "Status: V1_SKELETON_READY_FOR_DEMO"