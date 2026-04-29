$ErrorActionPreference = "Stop"

$apiBase = if ($env:IYI_API_BASE_URL) {
    $env:IYI_API_BASE_URL.TrimEnd("/")
} else {
    "http://localhost:8788"
}

function Invoke-Json {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Method,

        [Parameter(Mandatory = $true)]
        [string] $Uri,

        [object] $Body = $null
    )

    if ($null -eq $Body) {
        return Invoke-RestMethod -Method $Method -Uri $Uri -TimeoutSec 12
    }

    return Invoke-RestMethod -Method $Method -Uri $Uri -Body ($Body | ConvertTo-Json -Depth 40) -ContentType "application/json" -TimeoutSec 12
}

Write-Host "==> GPS capture API smoke"
Write-Host "API: $apiBase"

$health = Invoke-Json -Method GET -Uri "$apiBase/gps/health"

if (-not $health.ok) {
    throw "GPS health failed."
}

$samplePayload = @{
    packageId = "NAMIKI-GPS-SMOKE"
    status = "Listo para enviar"
    qualityScore = 91
    currentPoint = @{
        label = "Smoke current point"
        latitude = 22.4003
        longitude = -97.9386
        accuracy = 8
    }
    savedPoints = @(
        @{
            label = "Patio A reference"
            latitude = 22.4003
            longitude = -97.9386
        }
    )
    perimeterPoints = @(
        @{ latitude = 22.4001; longitude = -97.9388 },
        @{ latitude = 22.4006; longitude = -97.9387 },
        @{ latitude = 22.4005; longitude = -97.9382 }
    )
    auditEntries = @(
        @{
            title = "Smoke capture"
            detail = "GPS API smoke test payload."
        }
    )
    geoJson = @{
        type = "FeatureCollection"
        features = @()
    }
}

$created = Invoke-Json -Method POST -Uri "$apiBase/gps/captures" -Body $samplePayload

if (-not $created.item.id) {
    throw "GPS capture create failed."
}

$list = Invoke-Json -Method GET -Uri "$apiBase/gps/captures"

if ($list.count -lt 1) {
    throw "GPS capture list failed."
}

$detail = Invoke-Json -Method GET -Uri "$apiBase/gps/captures/$($created.item.id)"

if (-not $detail.item.id) {
    throw "GPS capture detail failed."
}

$export = Invoke-Json -Method GET -Uri "$apiBase/gps/captures/export"

if (@($export.captures).Count -lt 1) {
    throw "GPS capture export failed."
}

Write-Host ""
Write-Host "GPS capture API smoke OK."
Write-Host "Created capture:"
Write-Host $created.item.id