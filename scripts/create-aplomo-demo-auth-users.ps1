chcp 65001 | Out-Null
[Console]::InputEncoding = [System.Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)

$ErrorActionPreference = "Stop"

$Repo = "C:\Users\Skere\Code\industrial-yard-intelligence"
Set-Location $Repo

function Get-EnvValue {
  param([Parameter(Mandatory = $true)][string[]]$Names)

  foreach ($Name in $Names) {
    $Value = [Environment]::GetEnvironmentVariable($Name, "Process")
    if (-not [string]::IsNullOrWhiteSpace($Value)) { return $Value }

    $Value = [Environment]::GetEnvironmentVariable($Name, "User")
    if (-not [string]::IsNullOrWhiteSpace($Value)) { return $Value }

    $Value = [Environment]::GetEnvironmentVariable($Name, "Machine")
    if (-not [string]::IsNullOrWhiteSpace($Value)) { return $Value }
  }

  $EnvFiles = @(".env.local", ".env", "apps\web\.env.local", "apps\web\.env")

  foreach ($EnvFile in $EnvFiles) {
    if (-not (Test-Path $EnvFile)) { continue }

    $Lines = Get-Content -Encoding UTF8 $EnvFile

    foreach ($Name in $Names) {
      foreach ($Line in $Lines) {
        if ($Line -match "^\s*#") { continue }

        $Pattern = "^\s*" + [regex]::Escape($Name) + "\s*=\s*(.*)\s*$"

        if ($Line -match $Pattern) {
          $Raw = $Matches[1].Trim()

          if (($Raw.StartsWith('"') -and $Raw.EndsWith('"')) -or ($Raw.StartsWith("'") -and $Raw.EndsWith("'"))) {
            $Raw = $Raw.Substring(1, $Raw.Length - 2)
          }

          if (-not [string]::IsNullOrWhiteSpace($Raw)) {
            return $Raw
          }
        }
      }
    }
  }

  return $null
}

function Convert-SecureStringToPlainText {
  param([Parameter(Mandatory = $true)][securestring]$SecureString)

  $Bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureString)

  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($Bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($Bstr)
  }
}

function New-DemoPassword {
  $GuidA = [guid]::NewGuid().ToString("N").Substring(0, 10)
  $GuidB = [guid]::NewGuid().ToString("N").Substring(0, 8)
  return "AplomoDemo-$GuidA-$GuidB!2026"
}

function Read-HttpErrorBody {
  param([Parameter(Mandatory = $true)]$ErrorRecord)

  if ($ErrorRecord.ErrorDetails -and $ErrorRecord.ErrorDetails.Message) {
    return $ErrorRecord.ErrorDetails.Message
  }

  $Response = $ErrorRecord.Exception.Response

  if ($Response -and $Response.GetResponseStream()) {
    $Reader = New-Object System.IO.StreamReader($Response.GetResponseStream())
    return $Reader.ReadToEnd()
  }

  return $ErrorRecord.Exception.Message
}

$SupabaseUrl = Get-EnvValue -Names @(
  "SUPABASE_URL",
  "VITE_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL"
)

$ServiceRoleKey = Get-EnvValue -Names @(
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SECRET_KEY"
)

$DemoPassword = Get-EnvValue -Names @(
  "APLOMO_DEMO_PASSWORD"
)

if ([string]::IsNullOrWhiteSpace($SupabaseUrl)) {
  $SupabaseUrl = Read-Host "Pega tu SUPABASE_URL"
}

if ([string]::IsNullOrWhiteSpace($ServiceRoleKey)) {
  $SecureKey = Read-Host "Pega tu SUPABASE_SERVICE_ROLE_KEY o SUPABASE_SECRET_KEY" -AsSecureString
  $ServiceRoleKey = Convert-SecureStringToPlainText $SecureKey
}

if ([string]::IsNullOrWhiteSpace($DemoPassword)) {
  $DemoPassword = New-DemoPassword
}

$SupabaseUrl = $SupabaseUrl.TrimEnd("/")

$Headers = @{
  "apikey" = $ServiceRoleKey
  "Authorization" = "Bearer $ServiceRoleKey"
  "Content-Type" = "application/json"
}

function Invoke-SupabaseAdmin {
  param(
    [Parameter(Mandatory = $true)][string]$Method,
    [Parameter(Mandatory = $true)][string]$Path,
    [object]$BodyObject = $null
  )

  $Uri = "$SupabaseUrl$Path"

  try {
    if ($null -eq $BodyObject) {
      return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $Headers
    }

    $Json = $BodyObject | ConvertTo-Json -Depth 20
    return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $Headers -Body $Json
  } catch {
    $Body = Read-HttpErrorBody $_
    throw "Supabase Admin API error [$Method $Path]: $Body"
  }
}

function Get-AllAuthUsers {
  $All = @()
  $Page = 1
  $PerPage = 1000

  while ($true) {
    $Response = Invoke-SupabaseAdmin -Method "GET" -Path "/auth/v1/admin/users?page=$Page&per_page=$PerPage"

    if ($Response.users) {
      $Users = @($Response.users)
    } elseif ($Response -is [array]) {
      $Users = @($Response)
    } else {
      $Users = @()
    }

    if ($Users.Count -eq 0) {
      break
    }

    $All += $Users

    if ($Users.Count -lt $PerPage) {
      break
    }

    $Page++
  }

  return $All
}

function Find-AuthUserByEmail {
  param(
    [Parameter(Mandatory = $true)][object[]]$Users,
    [Parameter(Mandatory = $true)][string]$Email
  )

  $Needle = $Email.ToLowerInvariant()

  foreach ($User in $Users) {
    if ($User.email -and ([string]$User.email).ToLowerInvariant() -eq $Needle) {
      return $User
    }
  }

  return $null
}

$Accounts = @(
  @{
    account_key = "platform_aplomo_owner"
    email = "demo+aplomo-owner@aplomodemo.test"
    display_name = "Demo Aplomo Owner"
    account_scope = "platform"
    platform_role = "aplomo_owner"
    tenant_role = "tenant_owner"
    demo_order = 1
  },
  @{
    account_key = "platform_aplomo_admin"
    email = "demo+aplomo-admin@aplomodemo.test"
    display_name = "Demo Aplomo Admin"
    account_scope = "platform"
    platform_role = "aplomo_admin"
    tenant_role = "tenant_admin"
    demo_order = 2
  },
  @{
    account_key = "platform_aplomo_support"
    email = "demo+aplomo-support@aplomodemo.test"
    display_name = "Demo Aplomo Support"
    account_scope = "platform"
    platform_role = "aplomo_support"
    tenant_role = "viewer"
    demo_order = 3
  },
  @{
    account_key = "platform_aplomo_viewer"
    email = "demo+aplomo-viewer@aplomodemo.test"
    display_name = "Demo Aplomo Viewer"
    account_scope = "platform"
    platform_role = "aplomo_viewer"
    tenant_role = "viewer"
    demo_order = 4
  },
  @{
    account_key = "tenant_owner"
    email = "demo+tenant-owner@aplomodemo.test"
    display_name = "Demo Tenant Owner"
    account_scope = "tenant"
    platform_role = "none"
    tenant_role = "tenant_owner"
    demo_order = 5
  },
  @{
    account_key = "tenant_admin"
    email = "demo+tenant-admin@aplomodemo.test"
    display_name = "Demo Tenant Admin"
    account_scope = "tenant"
    platform_role = "none"
    tenant_role = "tenant_admin"
    demo_order = 6
  },
  @{
    account_key = "operations_manager"
    email = "demo+operations-manager@aplomodemo.test"
    display_name = "Demo Operations Manager"
    account_scope = "tenant"
    platform_role = "none"
    tenant_role = "operations_manager"
    demo_order = 7
  },
  @{
    account_key = "site_supervisor"
    email = "demo+site-supervisor@aplomodemo.test"
    display_name = "Demo Site Supervisor"
    account_scope = "tenant"
    platform_role = "none"
    tenant_role = "site_supervisor"
    demo_order = 8
  },
  @{
    account_key = "capture_operator"
    email = "demo+capture-operator@aplomodemo.test"
    display_name = "Demo Capture Operator"
    account_scope = "tenant"
    platform_role = "none"
    tenant_role = "capture_operator"
    demo_order = 9
  },
  @{
    account_key = "machine_operator"
    email = "demo+machine-operator@aplomodemo.test"
    display_name = "Demo Machine Operator"
    account_scope = "tenant"
    platform_role = "none"
    tenant_role = "machine_operator"
    demo_order = 10
  },
  @{
    account_key = "viewer"
    email = "demo+viewer@aplomodemo.test"
    display_name = "Demo Viewer"
    account_scope = "tenant"
    platform_role = "none"
    tenant_role = "viewer"
    demo_order = 11
  }
)

Write-Host ""
Write-Host "Leyendo usuarios existentes en Supabase Auth..." -ForegroundColor Cyan
$ExistingUsers = @(Get-AllAuthUsers)

$Created = 0
$Updated = 0
$Failed = 0

foreach ($Account in $Accounts) {
  $Email = $Account.email
  $Existing = Find-AuthUserByEmail -Users $ExistingUsers -Email $Email

  $UserMetadata = @{
    display_name = $Account.display_name
    account_key = $Account.account_key
    account_scope = $Account.account_scope
    platform_role = $Account.platform_role
    tenant_role = $Account.tenant_role
    aplomo_demo = $true
  }

  $AppMetadata = @{
    aplomo_demo = $true
    account_key = $Account.account_key
    account_scope = $Account.account_scope
    platform_role = $Account.platform_role
    tenant_role = $Account.tenant_role
    demo_order = $Account.demo_order
  }

  try {
    if ($Existing) {
      $UserId = [string]$Existing.id

      $UpdateBody = @{
        password = $DemoPassword
        user_metadata = $UserMetadata
        app_metadata = $AppMetadata
      }

      Invoke-SupabaseAdmin -Method "PUT" -Path "/auth/v1/admin/users/$UserId" -BodyObject $UpdateBody | Out-Null

      Write-Host "UPDATED: $Email" -ForegroundColor Yellow
      $Updated++
    } else {
      $CreateBody = @{
        email = $Email
        password = $DemoPassword
        email_confirm = $true
        user_metadata = $UserMetadata
        app_metadata = $AppMetadata
      }

      Invoke-SupabaseAdmin -Method "POST" -Path "/auth/v1/admin/users" -BodyObject $CreateBody | Out-Null

      Write-Host "CREATED: $Email" -ForegroundColor Green
      $Created++
    }
  } catch {
    Write-Host "FAILED: $Email" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    $Failed++
  }
}

$SyncSqlLines = @(
  "select * from public.aplomo_sync_demo_platform_roles();",
  "",
  "select",
  "  account_key,",
  "  email,",
  "  display_name,",
  "  account_scope,",
  "  platform_role,",
  "  tenant_role,",
  "  auth_user_exists,",
  "  profile_exists,",
  "  actual_platform_role",
  "from public.aplomo_demo_role_account_status",
  "order by (metadata->>'demoOrder')::int;"
)

$SyncSql = $SyncSqlLines -join "`r`n"
$SyncSql | Set-Clipboard

Write-Host ""
Write-Host "Resumen:" -ForegroundColor Cyan
Write-Host "Created: $Created"
Write-Host "Updated: $Updated"
Write-Host "Failed:  $Failed"
Write-Host ""
Write-Host "Password temporal demo para las 11 cuentas:" -ForegroundColor Yellow
Write-Host $DemoPassword -ForegroundColor Yellow
Write-Host ""
Write-Host "SQL de sincronización copiado al portapapeles." -ForegroundColor Green
Write-Host "Ahora ve a Supabase SQL Editor -> New Query -> pega -> Run." -ForegroundColor Green

if ($Failed -gt 0) {
  throw "Hubo $Failed fallos creando/actualizando usuarios demo."
}