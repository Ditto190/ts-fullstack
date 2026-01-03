# setup-worktree.ps1 - Initialize git worktree workflow (PowerShell)
# Based on zyahav/modular-dashboard patterns

param(
    [Parameter(Mandatory=$true, Position=0)]
    [ValidateSet('feature', 'hotfix', 'list', 'remove')]
    [string]$Command,
    
    [Parameter(Position=1)]
    [string]$Name
)

$ErrorActionPreference = 'Stop'
$MainDir = Get-Location
$WorktreeBase = Join-Path $MainDir 'worktrees'

function Setup-Feature {
    param([string]$FeatureName)
    
    $BranchName = "feature/$FeatureName"
    
    Write-Host "🌳 Creating feature branch: $BranchName" -ForegroundColor Cyan
    
    git branch $BranchName 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Branch already exists, continuing..." -ForegroundColor Yellow
    }
    
    $WorktreePath = Join-Path $WorktreeBase $FeatureName
    git worktree add $WorktreePath $BranchName
    
    Write-Host "✅ Feature worktree created at: $WorktreePath" -ForegroundColor Green
    Write-Host "   cd $WorktreePath" -ForegroundColor Gray
}

function Setup-Hotfix {
    param([string]$HotfixName)
    
    $BranchName = "hotfix/$HotfixName"
    
    Write-Host "🔥 Creating hotfix branch: $BranchName" -ForegroundColor Cyan
    
    git branch $BranchName 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Branch already exists, continuing..." -ForegroundColor Yellow
    }
    
    $WorktreePath = Join-Path $WorktreeBase $HotfixName
    git worktree add $WorktreePath $BranchName
    
    Write-Host "✅ Hotfix worktree created at: $WorktreePath" -ForegroundColor Green
}

function Show-Worktrees {
    Write-Host "📋 Current worktrees:" -ForegroundColor Cyan
    git worktree list
}

function Remove-WorktreeByName {
    param([string]$WorktreeName)
    
    $WorktreePath = Join-Path $WorktreeBase $WorktreeName
    
    if (Test-Path $WorktreePath) {
        git worktree remove $WorktreePath
        Write-Host "✅ Worktree removed: $WorktreeName" -ForegroundColor Green
    } else {
        Write-Host "❌ Worktree not found: $WorktreeName" -ForegroundColor Red
        exit 1
    }
}

# Create worktree base directory if needed
if (-not (Test-Path $WorktreeBase)) {
    New-Item -ItemType Directory -Path $WorktreeBase -Force | Out-Null
}

# Command router
switch ($Command) {
    'feature' {
        if (-not $Name) {
            Write-Host "❌ Feature name required" -ForegroundColor Red
            Write-Host "Usage: .\setup-worktree.ps1 feature <name>" -ForegroundColor Gray
            exit 1
        }
        Setup-Feature $Name
    }
    'hotfix' {
        if (-not $Name) {
            Write-Host "❌ Hotfix name required" -ForegroundColor Red
            Write-Host "Usage: .\setup-worktree.ps1 hotfix <name>" -ForegroundColor Gray
            exit 1
        }
        Setup-Hotfix $Name
    }
    'list' {
        Show-Worktrees
    }
    'remove' {
        if (-not $Name) {
            Write-Host "❌ Worktree name required" -ForegroundColor Red
            Write-Host "Usage: .\setup-worktree.ps1 remove <name>" -ForegroundColor Gray
            exit 1
        }
        Remove-WorktreeByName $Name
    }
}
