param(
    [switch]$InsertTestCapture,
    [switch]$RequireConfigured
)

$ErrorActionPreference = "Stop"

$repoRoot = (git rev-parse --show-toplevel).Trim()
Set-Location $repoRoot

function Read-EnvFile {
    param([string]$Path)

    $result = @{}

    if (-not (Test-Path $Path)) {
        return $result
    }

    $lines = [System.IO.File]::ReadAllLines((Resolve-Path $Path), [System.Text.Encoding]::UTF8)

    foreach ($line in $lines) {
        $trimmed = $line.Trim()

        if ($trimmed.Length -eq 0) {
            continue
        }

        if ($trimmed.StartsWith("#")) {
            continue
        }

        $index = $trimmed.IndexOf("=")

        if ($index -lt 1) {
            continue
        }

        $key = $trimmed.Substring(0, $index).Trim()
        $value = $trimmed.Substring($index + 1).Trim().Trim('"').Trim("'")

        if ($key.Length -gt 0) {
            $result[$key] = $value
        }
    }

    return $result
}

function Get-EnvValue {
    param(
        [hashtable]$EnvFile,
        [string]$Key
    )

    $processValue = [System.Environment]::GetEnvironmentVariable($Key)

    if (-not [string]::IsNullOrWhiteSpace($processValue)) {
        return $processValue.Trim()
    }

    if ($EnvFile.ContainsKey($Key)) {
        return [string]$EnvFile[$Key]
    }

    return ""
}

function Is-ConfiguredValue {
    param([string]$Value)

    if ([string]::IsNullOrWhiteSpace($Value)) {
        return $false
    }

    $lower = $Value.ToLowerInvariant()

    if ($lower.Contains("your-")) {
        return $false
    }

    if ($lower.Contains("example")) {
        return $false
    }

    if ($lower.Contains("placeholder")) {
        return $false
    }

    return $true
}

Write-Host ""
Write-Host "== Aplomo Supabase smoke test =="
Write-Host ""

$envLocalPath = "apps/web/.env.local"
$envExamplePath = "apps/web/.env.example"

if (Test-Path $envLocalPath) {
    Write-Host "[OK] Existe apps/web/.env.local"
    $envFile = Read-EnvFile $envLocalPath
} else {
    Write-Host "[WARN] No existe apps/web/.env.local"
    Write-Host "[INFO] Puedes copiar apps/web/.env.example como apps/web/.env.local cuando tengas Supabase real."
    $envFile = Read-EnvFile $envExamplePath
}

$supabaseUrl = Get-EnvValue $envFile "VITE_SUPABASE_URL"
$supabaseAnonKey = Get-EnvValue $envFile "VITE_SUPABASE_ANON_KEY"

$urlOk = Is-ConfiguredValue $supabaseUrl
$keyOk = Is-ConfiguredValue $supabaseAnonKey

if (-not $urlOk -or -not $keyOk) {
    Write-Host "[WARN] Supabase no está configurado todavía."
    Write-Host "[WARN] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY."

    if ($RequireConfigured) {
        throw "Supabase requerido, pero no está configurado."
    }

    Write-Host ""
    Write-Host "Smoke test terminado en modo local-demo."
    exit 0
}

if (-not $supabaseUrl.StartsWith("https://")) {
    throw "VITE_SUPABASE_URL debe iniciar con https://"
}

Write-Host "[OK] Variables Supabase detectadas."

$headers = @{
    "apikey" = $supabaseAnonKey
    "Authorization" = "Bearer $supabaseAnonKey"
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

$baseUrl = $supabaseUrl.TrimEnd("/")

Write-Host ""
Write-Host "== Buscando empresa demo =="
$companyUrl = "$baseUrl/rest/v1/companies?slug=eq.cooper-t-smith&select=id,name,slug,status&limit=1"

try {
    $companies = Invoke-RestMethod -Method Get -Uri $companyUrl -Headers $headers -TimeoutSec 30
} catch {
    Write-Host "[ERROR] No se pudo consultar companies."
    Write-Host $_.Exception.Message
    throw "Falló consulta a Supabase. Revisa URL, anon key, schema, RLS y políticas."
}

if (-not $companies -or $companies.Count -lt 1) {
    throw "No encontré empresa demo con slug cooper-t-smith. Ejecuta docs/sql/aplomo_seed_demo_v1.sql."
}

$company = $companies[0]

Write-Host "[OK] Empresa encontrada:"
Write-Host "Nombre: $($company.name)"
Write-Host "Slug: $($company.slug)"
Write-Host "ID: $($company.id)"

Write-Host ""
Write-Host "== Consultando capturas recientes =="
$capturesUrl = "$baseUrl/rest/v1/gps_captures?company_id=eq.$($company.id)&select=id,status,capture_type,created_at&order=created_at.desc&limit=5"

try {
    $captures = Invoke-RestMethod -Method Get -Uri $capturesUrl -Headers $headers -TimeoutSec 30
    Write-Host "[OK] Consulta gps_captures respondió."
    Write-Host "Capturas encontradas: $($captures.Count)"
} catch {
    Write-Host "[WARN] No se pudo consultar gps_captures."
    Write-Host $_.Exception.Message
}

if ($InsertTestCapture) {
    Write-Host ""
    Write-Host "== Insertando captura GPS de prueba =="

    $payload = @{
        company_id = $company.id
        capture_type = "point"
        latitude = 22.4070
        longitude = -97.9385
        accuracy_meters = 8.5
        status = "draft"
        notes = "Smoke test PowerShell Aplomo"
        geometry_geojson = @{
            type = "Point"
            coordinates = @(-97.9385, 22.4070)
        }
    } | ConvertTo-Json -Depth 20

    $insertHeaders = $headers.Clone()
    $insertHeaders["Prefer"] = "return=representation"

    try {
        $insertResult = Invoke-RestMethod -Method Post -Uri "$baseUrl/rest/v1/gps_captures" -Headers $insertHeaders -Body $payload -TimeoutSec 30
        Write-Host "[OK] Captura insertada."
        Write-Host "ID: $($insertResult[0].id)"
    } catch {
        Write-Host "[ERROR] No se pudo insertar captura."
        Write-Host $_.Exception.Message
        throw "Falló inserción de captura. Revisa permisos RLS o schema."
    }
} else {
    Write-Host ""
    Write-Host "[INFO] No se insertó captura. Para insertar prueba usa -InsertTestCapture."
}

Write-Host ""
Write-Host "Supabase smoke test terminó correctamente."
