param(
    [switch]$UploadTestEvidence,
    [switch]$RequireConfigured
)

$ErrorActionPreference = "Stop"

$repoRoot = (git rev-parse --show-toplevel).Trim()
Set-Location $repoRoot

function Read-EnvFile {
    param([string]$Path)

    $values = @{}

    if (-not (Test-Path $Path)) {
        return $values
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
            $values[$key] = $value
        }
    }

    return $values
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

function Is-RealValue {
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
Write-Host "== Aplomo evidence smoke test =="
Write-Host ""

$envFile = Read-EnvFile "apps/web/.env.local"

$supabaseUrl = Get-EnvValue $envFile "VITE_SUPABASE_URL"
$supabaseAnonKey = Get-EnvValue $envFile "VITE_SUPABASE_ANON_KEY"

if (-not (Is-RealValue $supabaseUrl) -or -not (Is-RealValue $supabaseAnonKey)) {
    Write-Host "[WARN] Supabase no está configurado."
    Write-Host "[INFO] Crea apps/web/.env.local con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY."

    if ($RequireConfigured) {
        throw "Supabase requerido, pero no está configurado."
    }

    Write-Host ""
    Write-Host "Evidence smoke test terminado en modo local-demo."
    exit 0
}

if (-not $supabaseUrl.StartsWith("https://")) {
    throw "VITE_SUPABASE_URL debe iniciar con https://"
}

$baseUrl = $supabaseUrl.TrimEnd("/")
$bucket = "aplomo-evidence"

$headers = @{
    "apikey" = $supabaseAnonKey
    "Authorization" = "Bearer $supabaseAnonKey"
    "Accept" = "application/json"
}

$jsonHeaders = @{
    "apikey" = $supabaseAnonKey
    "Authorization" = "Bearer $supabaseAnonKey"
    "Accept" = "application/json"
    "Content-Type" = "application/json"
}

Write-Host "[OK] Variables Supabase detectadas."

Write-Host ""
Write-Host "== Buscando empresa demo =="
$companyUrl = "$baseUrl/rest/v1/companies?slug=eq.cooper-t-smith&select=id,name,slug,status&limit=1"

$companies = Invoke-RestMethod -Method Get -Uri $companyUrl -Headers $headers -TimeoutSec 30
$companyList = @($companies)

if ($companyList.Count -lt 1) {
    throw "No encontré empresa demo cooper-t-smith. Ejecuta docs/sql/aplomo_seed_demo_v1.sql."
}

$company = $companyList[0]

Write-Host "[OK] Empresa encontrada:"
Write-Host "Nombre: $($company.name)"
Write-Host "ID: $($company.id)"

Write-Host ""
Write-Host "== Buscando captura GPS reciente =="
$captureUrl = "$baseUrl/rest/v1/gps_captures?company_id=eq.$($company.id)&select=id,status,capture_type,created_at&order=created_at.desc&limit=1"

$captures = Invoke-RestMethod -Method Get -Uri $captureUrl -Headers $headers -TimeoutSec 30
$captureList = @($captures)

if ($captureList.Count -lt 1) {
    Write-Host "[WARN] No hay capturas GPS para la empresa demo."
    Write-Host "[INFO] Primero crea una captura con scripts/aplomo-supabase-smoke.ps1 -InsertTestCapture o desde el panel interno."

    if ($UploadTestEvidence) {
        throw "No puedo subir evidencia sin gps_capture_id."
    }

    Write-Host ""
    Write-Host "Evidence smoke test terminó sin subir archivo."
    exit 0
}

$capture = $captureList[0]

Write-Host "[OK] Captura encontrada:"
Write-Host "Capture ID: $($capture.id)"
Write-Host "Estado: $($capture.status)"

Write-Host ""
Write-Host "== Consultando evidencia reciente =="
$evidenceUrl = "$baseUrl/rest/v1/evidence_files?company_id=eq.$($company.id)&select=id,gps_capture_id,file_name,mime_type,storage_path,created_at&order=created_at.desc&limit=5"

try {
    $evidenceRows = Invoke-RestMethod -Method Get -Uri $evidenceUrl -Headers $headers -TimeoutSec 30
    Write-Host "[OK] Consulta evidence_files respondió."
    Write-Host "Evidencias encontradas: $(@($evidenceRows).Count)"
} catch {
    Write-Host "[WARN] No se pudo consultar evidence_files."
    Write-Host $_.Exception.Message
}

if (-not $UploadTestEvidence) {
    Write-Host ""
    Write-Host "[INFO] No se subió evidencia. Para subir una imagen PNG demo usa -UploadTestEvidence."
    Write-Host "Evidence smoke test terminó correctamente."
    exit 0
}

Write-Host ""
Write-Host "== Subiendo evidencia PNG demo =="

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$fileName = "aplomo-evidence-smoke-$timestamp.png"
$storagePath = "$($company.id)/gps-captures/$($capture.id)/$fileName"

# PNG 1x1 mínimo.
$pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/l4jX6wAAAABJRU5ErkJggg=="
$fileBytes = [System.Convert]::FromBase64String($pngBase64)

$uploadHeaders = @{
    "apikey" = $supabaseAnonKey
    "Authorization" = "Bearer $supabaseAnonKey"
    "x-upsert" = "false"
}

$uploadUrl = "$baseUrl/storage/v1/object/$bucket/$storagePath"

try {
    Invoke-RestMethod -Method Post -Uri $uploadUrl -Headers $uploadHeaders -Body $fileBytes -ContentType "image/png" -TimeoutSec 30 | Out-Null
    Write-Host "[OK] Archivo subido a Storage."
    Write-Host "Storage path: $storagePath"
} catch {
    Write-Host "[ERROR] Falló subida a Storage."
    Write-Host $_.Exception.Message
    throw "Revisa bucket aplomo-evidence y permisos de Storage."
}

Write-Host ""
Write-Host "== Insertando metadata en evidence_files =="

$metadata = @{
    company_id = $company.id
    gps_capture_id = $capture.id
    file_type = "image"
    storage_path = $storagePath
    file_name = $fileName
    mime_type = "image/png"
    size_bytes = $fileBytes.Length
    description = "Smoke test de evidencia Aplomo"
} | ConvertTo-Json -Depth 20

$insertHeaders = @{
    "apikey" = $supabaseAnonKey
    "Authorization" = "Bearer $supabaseAnonKey"
    "Accept" = "application/json"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

try {
    $insertResult = Invoke-RestMethod -Method Post -Uri "$baseUrl/rest/v1/evidence_files" -Headers $insertHeaders -Body $metadata -TimeoutSec 30
    $inserted = @($insertResult)[0]
    Write-Host "[OK] Metadata insertada."
    Write-Host "Evidence ID: $($inserted.id)"
} catch {
    Write-Host "[ERROR] Falló insert en evidence_files."
    Write-Host $_.Exception.Message
    throw "Archivo subido, pero metadata falló. Revisa RLS/schema de evidence_files."
}

Write-Host ""
Write-Host "Evidence smoke test terminó correctamente."
