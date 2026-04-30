$ErrorActionPreference = "Stop"

$repoRoot = (git rev-parse --show-toplevel).Trim()
Set-Location $repoRoot

$errors = @()
$warnings = @()

function Ok {
    param([string]$Text)
    Write-Host "[OK] $Text"
}

function Warn {
    param([string]$Text)
    Write-Host "[WARN] $Text"
    $script:warnings += $Text
}

function Fail {
    param([string]$Text)
    Write-Host "[ERROR] $Text"
    $script:errors += $Text
}

function CheckFile {
    param([string]$Path)

    if (Test-Path $Path) {
        Ok "Existe $Path"
    } else {
        Fail "Falta $Path"
    }
}

function CheckText {
    param(
        [string]$Path,
        [string]$Text,
        [string]$Label
    )

    if (-not (Test-Path $Path)) {
        Fail "No existe $Path"
        return
    }

    $content = [System.IO.File]::ReadAllText((Resolve-Path $Path), [System.Text.Encoding]::UTF8)

    if ($content.Contains($Text)) {
        Ok $Label
    } else {
        Fail "No encontré '$Text' en $Path"
    }
}

function WarnText {
    param(
        [string]$Path,
        [string]$Text,
        [string]$Label
    )

    if (-not (Test-Path $Path)) {
        Warn "No existe $Path"
        return
    }

    $content = [System.IO.File]::ReadAllText((Resolve-Path $Path), [System.Text.Encoding]::UTF8)

    if ($content.Contains($Text)) {
        Ok $Label
    } else {
        Warn "No encontré '$Text' en $Path"
    }
}

Write-Host ""
Write-Host "== Supabase readiness check =="
Write-Host ""

CheckFile "docs/sql/aplomo_schema_v1.sql"
CheckFile "docs/sql/aplomo_seed_demo_v1.sql"
CheckFile "docs/sql/aplomo_rls_draft_v1.sql"
CheckFile "apps/web/.env.example"
CheckFile "apps/web/src/integrations/aplomoBackendConfig.ts"
CheckFile "apps/web/src/integrations/supabaseClient.ts"
CheckFile "apps/web/src/integrations/gpsCaptureRepository.ts"
CheckFile "apps/web/src/integrations/gpsSyncService.ts"
CheckFile "apps/web/src/integrations/index.ts"

CheckText "apps/web/package.json" "@supabase/supabase-js" "Dependencia Supabase instalada en web"
CheckText "apps/web/.env.example" "VITE_SUPABASE_URL" "Env example contiene VITE_SUPABASE_URL"
CheckText "apps/web/.env.example" "VITE_SUPABASE_ANON_KEY" "Env example contiene VITE_SUPABASE_ANON_KEY"
CheckText "apps/web/.env.example" "SUPABASE_SERVICE_ROLE_KEY" "Env example advierte sobre service role key"

CheckText "apps/web/src/integrations/supabaseClient.ts" "@supabase/supabase-js" "Cliente importa Supabase"
CheckText "apps/web/src/integrations/supabaseClient.ts" "./aplomoBackendConfig.js" "Cliente usa import ESM con .js"
CheckText "apps/web/src/integrations/gpsCaptureRepository.ts" "./supabaseClient.js" "Repositorio GPS usa import ESM con .js"
CheckText "apps/web/src/integrations/gpsSyncService.ts" "./aplomoBackendConfig.js" "Sync service importa config con .js"
CheckText "apps/web/src/integrations/gpsSyncService.ts" "./gpsCaptureRepository.js" "Sync service importa repo con .js"

CheckText "docs/sql/aplomo_schema_v1.sql" "create table if not exists companies" "Schema crea companies"
CheckText "docs/sql/aplomo_schema_v1.sql" "create table if not exists gps_captures" "Schema crea gps_captures"
CheckText "docs/sql/aplomo_schema_v1.sql" "create table if not exists evidence_files" "Schema crea evidence_files"
CheckText "docs/sql/aplomo_schema_v1.sql" "create table if not exists audit_events" "Schema crea audit_events"

CheckText "docs/sql/aplomo_seed_demo_v1.sql" "Cooper/T. Smith" "Seed incluye Cooper/T. Smith"
CheckText "docs/sql/aplomo_seed_demo_v1.sql" "Puerto Altamira" "Seed incluye Puerto Altamira"
CheckText "docs/sql/aplomo_seed_demo_v1.sql" "gps_captures" "Seed crea captura GPS demo"

WarnText "docs/sql/aplomo_rls_draft_v1.sql" "enable row level security" "RLS draft menciona row level security"
WarnText "docs/sql/aplomo_rls_draft_v1.sql" "auth.uid()" "RLS draft considera auth.uid()"

Write-Host ""
Write-Host "== Resultado =="

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Errores:"
    $errors | ForEach-Object { Write-Host "- $_" }
    throw "Supabase readiness check falló."
}

if ($warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "Advertencias:"
    $warnings | ForEach-Object { Write-Host "- $_" }
}

Write-Host ""
Write-Host "Supabase readiness check terminó sin errores críticos."
