param(
    [switch]$SkipBuild,
    [switch]$RequireSupabase,
    [switch]$InsertGpsTestCapture,
    [switch]$UploadEvidenceTest
)

$ErrorActionPreference = "Stop"

$repoRoot = (git rev-parse --show-toplevel).Trim()
Set-Location $repoRoot

function Check-Ok {
    param([string]$Step)

    if ($LASTEXITCODE -ne 0) {
        throw "Falló: $Step"
    }
}

function Run-OptionalScript {
    param(
        [string]$Path,
        [string]$Name,
        [string[]]$ArgsList = @()
    )

    Write-Host ""
    Write-Host "== $Name =="

    if (-not (Test-Path $Path)) {
        Write-Host "[WARN] No existe $Path. Se omite."
        return
    }

    powershell -NoProfile -ExecutionPolicy Bypass -File $Path @ArgsList
    Check-Ok $Name
}

Write-Host ""
Write-Host "========================================"
Write-Host " Aplomo Systems · Validación pre-piloto"
Write-Host "========================================"
Write-Host ""

Write-Host "Repo:"
Write-Host $repoRoot
Write-Host ""

Write-Host "Branch:"
git branch --show-current
Check-Ok "git branch"

Write-Host ""
Write-Host "Últimos commits:"
git log --oneline -5
Check-Ok "git log"

Write-Host ""
Write-Host "Estado git:"
git status --short
Check-Ok "git status"

$status = git status --porcelain
if ($status) {
    Write-Host "[WARN] Hay cambios locales pendientes."
} else {
    Write-Host "[OK] No hay cambios locales pendientes."
}

if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "== Build web =="
    pnpm --filter @iyi/web... build
    Check-Ok "build web"

    Write-Host ""
    Write-Host "== Typecheck =="
    pnpm typecheck
    Check-Ok "typecheck"
} else {
    Write-Host ""
    Write-Host "[WARN] Se omitió build/typecheck por -SkipBuild."
}

Run-OptionalScript ".\scripts\aplomo-qa.ps1" "QA interno"

Run-OptionalScript ".\scripts\aplomo-supabase-check.ps1" "Supabase readiness check"

$supabaseSmokeArgs = @()
if ($RequireSupabase) {
    $supabaseSmokeArgs += "-RequireConfigured"
}
if ($InsertGpsTestCapture) {
    $supabaseSmokeArgs += "-InsertTestCapture"
}
Run-OptionalScript ".\scripts\aplomo-supabase-smoke.ps1" "Supabase smoke test" $supabaseSmokeArgs

$evidenceSmokeArgs = @()
if ($RequireSupabase) {
    $evidenceSmokeArgs += "-RequireConfigured"
}
if ($UploadEvidenceTest) {
    $evidenceSmokeArgs += "-UploadTestEvidence"
}
Run-OptionalScript ".\scripts\aplomo-evidence-smoke.ps1" "Evidence smoke test" $evidenceSmokeArgs

Write-Host ""
Write-Host "== Producción =="
try {
    $response = Invoke-WebRequest -Uri "https://aplomosystems.com" -UseBasicParsing -TimeoutSec 25

    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
        Write-Host "[OK] Producción responde: $($response.StatusCode)"
    } else {
        Write-Host "[WARN] Producción respondió con status: $($response.StatusCode)"
    }

    if ($response.Content -match "Aplomo Systems") {
        Write-Host "[OK] HTML inicial contiene Aplomo Systems."
    } else {
        Write-Host "[WARN] No detecté Aplomo Systems en HTML inicial. Puede estar renderizado por JS."
    }

    if ($response.Content -match "og-aplomo.png") {
        Write-Host "[OK] HTML inicial contiene og-aplomo.png."
    } else {
        Write-Host "[WARN] No detecté og-aplomo.png en HTML inicial."
    }
} catch {
    Write-Host "[WARN] No se pudo revisar producción desde PowerShell."
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "== Checklist manual final =="
Write-Host "[ ] Abrir https://aplomosystems.com"
Write-Host "[ ] Revisar intro en celular"
Write-Host "[ ] Entrar a la consola"
Write-Host "[ ] Confirmar mapa"
Write-Host "[ ] Probar GPS"
Write-Host "[ ] Abrir https://aplomosystems.com/?aplomoInternal=1"
Write-Host "[ ] Cargar contexto demo"
Write-Host "[ ] Probar sincronización cloud si Supabase ya está configurado"
Write-Host "[ ] Listar capturas"
Write-Host "[ ] Subir evidencia si Storage ya está configurado"
Write-Host "[ ] Listar y abrir evidencia"

Write-Host ""
Write-Host "Validación pre-piloto terminada."
