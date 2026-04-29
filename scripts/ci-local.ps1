param(
    [switch] $SkipInstall,
    [switch] $SkipGitStatus
)

$ErrorActionPreference = "Stop"

function Invoke-Step {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Name,

        [Parameter(Mandatory = $true)]
        [scriptblock] $Action
    )

    Write-Host ""
    Write-Host "== $Name =="
    & $Action
    Write-Host "OK $Name"
}

function Assert-CommandExists {
    param(
        [Parameter(Mandatory = $true)]
        [string] $CommandName
    )

    $command = Get-Command $CommandName -ErrorAction SilentlyContinue

    if ($null -eq $command) {
        throw "Required command not found: $CommandName"
    }
}

function Test-Utf8Bom {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path
    )

    $bytes = [System.IO.File]::ReadAllBytes($Path)

    return $bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF
}

function Assert-NoUtf8BomFiles {
    $extensions = @(
        ".ts",
        ".tsx",
        ".js",
        ".json",
        ".md",
        ".yml",
        ".yaml",
        ".ps1",
        ".css",
        ".html",
        ".sql"
    )

    $excludedParts = @(
        "\node_modules\",
        "\dist\",
        "\.git\",
        "\.edge-data\",
        "\artifacts\"
    )

    $files = Get-ChildItem -Recurse -File | Where-Object {
        $file = $_
        $includedExtension = $extensions -contains $file.Extension.ToLowerInvariant()
        $isExcluded = $false

        foreach ($part in $excludedParts) {
            if ($file.FullName.Contains($part)) {
                $isExcluded = $true
            }
        }

        return $includedExtension -and -not $isExcluded
    }

    $bomFiles = @()

    foreach ($file in $files) {
        if (Test-Utf8Bom -Path $file.FullName) {
            $bomFiles += $file.FullName
        }
    }

    if ($bomFiles.Count -gt 0) {
        Write-Host "Files with UTF-8 BOM:"
        foreach ($file in $bomFiles) {
            Write-Host $file
        }

        throw "UTF-8 BOM detected. Files must be UTF-8 without BOM."
    }
}

function Assert-NoRuntimeArtifactsTracked {
    $badFiles = git ls-files | Where-Object {
        $_ -like "*/dist/*" -or
        $_ -like "*/.edge-data/*" -or
        $_ -like "artifacts/*"
    }

    if ($badFiles.Count -gt 0) {
        Write-Host "Tracked runtime/build artifacts detected:"
        foreach ($file in $badFiles) {
            Write-Host $file
        }

        throw "Runtime/build artifacts must not be tracked."
    }
}

function Assert-GitClean {
    $status = git status --porcelain

    if (-not [string]::IsNullOrWhiteSpace($status)) {
        Write-Host $status
        throw "Working tree is not clean."
    }
}

Write-Host ""
Write-Host "== Industrial Yard Intelligence local CI =="

Invoke-Step "Check required commands" {
    Assert-CommandExists "git"
    Assert-CommandExists "pnpm"
}

Invoke-Step "Check repository root" {
    if (-not (Test-Path ".git")) {
        throw "Not inside repository root."
    }

    if (-not (Test-Path "pnpm-lock.yaml")) {
        throw "pnpm-lock.yaml not found."
    }

    if (-not (Test-Path "pnpm-workspace.yaml")) {
        throw "pnpm-workspace.yaml not found."
    }
}

if (-not $SkipInstall) {
    Invoke-Step "Install dependencies" {
        pnpm install --frozen-lockfile
    }
}

Invoke-Step "Check UTF-8 without BOM" {
    Assert-NoUtf8BomFiles
}

Invoke-Step "Check no runtime artifacts tracked" {
    Assert-NoRuntimeArtifactsTracked
}

Invoke-Step "Build api contracts" {
    pnpm --filter @iyi/api-contracts build
}

Invoke-Step "Test api contracts" {
    pnpm --filter @iyi/api-contracts test
}

Invoke-Step "Build edge" {
    pnpm --filter @iyi/edge build
}

Invoke-Step "Test edge" {
    pnpm --filter @iyi/edge test
}

Invoke-Step "Build web" {
    pnpm --filter @iyi/web build
}

Invoke-Step "Full typecheck" {
    pnpm typecheck
}

Invoke-Step "Full test" {
    pnpm test
}

if (-not $SkipGitStatus) {
    Invoke-Step "Git clean check" {
        Assert-GitClean
    }
}

Write-Host ""
Write-Host "LOCAL CI PASSED"