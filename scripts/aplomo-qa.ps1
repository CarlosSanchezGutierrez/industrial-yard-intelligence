param(
    [switch]$Strict
)

$ErrorActionPreference = "Stop"

$repoRoot = (git rev-parse --show-toplevel).Trim()
Set-Location $repoRoot

$errors = @()
$warnings = @()

function Check-File {
    param([string]$Path)

    if (Test-Path $Path) {
        Write-Host "[OK] Existe $Path"
    } else {
        Write-Host "[ERROR] Falta $Path"
        $script:errors += "Falta $Path"
    }
}

function Check-Text {
    param(
        [string]$Path,
        [string]$Text,
        [string]$Label
    )

    if (-not (Test-Path $Path)) {
        Write-Host "[ERROR] No existe $Path"
        $script:errors += "No existe $Path"
        return
    }

    $content = [System.IO.File]::ReadAllText((Resolve-Path $Path), [System.Text.Encoding]::UTF8)

    if ($content.Contains($Text)) {
        Write-Host "[OK] $Label"
    } else {
        Write-Host "[ERROR] Falta texto en ${Path}: $Text"
        $script:errors += "Falta texto en ${Path}: $Text"
    }
}

function Warn-Text {
    param(
        [string]$Path,
        [string]$Text,
        [string]$Label
    )

    if (-not (Test-Path $Path)) {
        Write-Host "[WARN] No existe $Path"
        $script:warnings += "No existe $Path"
        return
    }

    $content = [System.IO.File]::ReadAllText((Resolve-Path $Path), [System.Text.Encoding]::UTF8)

    if ($content.Contains($Text)) {
        Write-Host "[OK] $Label"
    } else {
        Write-Host "[WARN] Falta texto en ${Path}: $Text"
        $script:warnings += "Falta texto en ${Path}: $Text"
    }
}

Write-Host ""
Write-Host "== QA Aplomo Systems =="
Write-Host ""

Check-File "package.json"
Check-File "pnpm-lock.yaml"
Check-File "pnpm-workspace.yaml"
Check-File "vercel.json"
Check-File "apps/web/index.html"
Check-File "apps/web/public/site.webmanifest"
Check-File "scripts/aplomo-qa.ps1"
Check-File "docs/APLOMO-QA-INTERNAL.md"

Warn-Text "apps/web/index.html" "Aplomo Systems" "Marca en index.html"
Warn-Text "apps/web/index.html" "og-aplomo.png" "Imagen social en index.html"
Warn-Text "apps/web/index.html" "https://aplomosystems.com/" "Dominio canónico en index.html"

Check-Text "vercel.json" "apps/web/dist" "Vercel apunta a apps/web/dist"
Check-Text "vercel.json" "pnpm --filter @iyi/web... build" "Vercel usa build correcto"

Warn-Text "apps/web/public/site.webmanifest" "Aplomo" "Manifest contiene Aplomo"

if (Test-Path "apps/web/src/namikiIntroOverlay.ts") {
    Warn-Text "apps/web/src/namikiIntroOverlay.ts" "Entrar al sistema" "Intro tiene botón de entrada"
} else {
    Write-Host "[WARN] No encontré namikiIntroOverlay.ts"
    $warnings += "No encontré namikiIntroOverlay.ts"
}

Write-Host ""
Write-Host "== Resultado QA =="

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Errores:"
    $errors | ForEach-Object { Write-Host "- $_" }
    throw "QA falló con errores."
}

if ($Strict -and $warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "Advertencias:"
    $warnings | ForEach-Object { Write-Host "- $_" }
    throw "QA strict falló con advertencias."
}

if ($warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "Advertencias:"
    $warnings | ForEach-Object { Write-Host "- $_" }
}

Write-Host ""
Write-Host "QA terminado sin errores críticos."
