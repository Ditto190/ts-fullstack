# setup-ai-worktree.ps1 - Multi-AI-Agent Git Worktree Manager
# Supports multiple AI agents (Copilot, Claude, Cursor, etc.) + humans working simultaneously

param(
    [Parameter(Mandatory=$true, Position=0)]
    [ValidateSet('agent', 'human', 'feature', 'hotfix', 'list', 'remove', 'status')]
    [string]$Command,
    
    [Parameter(Position=1)]
    [string]$Name,
    
    [Parameter(Position=2)]
    [ValidateSet('copilot', 'claude', 'cursor', 'windsurf', 'aider', 'other')]
    [string]$AgentType
)

$ErrorActionPreference = 'Stop'
$MainDir = Get-Location
$WorktreeBase = Join-Path $MainDir 'worktrees'

# Color scheme for different agent types
$AgentColors = @{
    'copilot' = 'Blue'
    'claude' = 'Magenta'
    'cursor' = 'Cyan'
    'windsurf' = 'Green'
    'aider' = 'Yellow'
    'other' = 'Gray'
    'human' = 'White'
}

function Setup-AgentWorktree {
    param(
        [string]$TaskName,
        [string]$Agent
    )
    
    $BranchName = "agent/${Agent}-${TaskName}"
    $WorktreeName = "${Agent}-${TaskName}"
    $Color = $AgentColors[$Agent]
    
    Write-Host "
🤖 Creating AI Agent Worktree" -ForegroundColor $Color
    Write-Host "   Agent: $Agent" -ForegroundColor $Color
    Write-Host "   Task: $TaskName" -ForegroundColor $Color
    Write-Host "   Branch: $BranchName" -ForegroundColor Gray
    
    # Create branch
    git branch $BranchName 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   Branch exists, reusing..." -ForegroundColor Yellow
    }
    
    # Create worktree
    $WorktreePath = Join-Path $WorktreeBase $WorktreeName
    git worktree add $WorktreePath $BranchName
    
    # Create agent metadata file
    $MetadataPath = Join-Path $WorktreePath '.agent-metadata.json'
    $Metadata = @{
        agent_type = $Agent
        task_name = $TaskName
        branch = $BranchName
        created_at = (Get-Date -Format 'o')
        workspace_path = $WorktreePath
    } | ConvertTo-Json -Depth 3
    
    $Metadata | Out-File -FilePath $MetadataPath -Encoding utf8
    
    Write-Host "
✅ Agent worktree ready!" -ForegroundColor Green
    Write-Host "   Path: $WorktreePath" -ForegroundColor Gray
    Write-Host "   Open in IDE: code $WorktreePath" -ForegroundColor Gray
    Write-Host "
💡 TIP: Each AI agent should work in its own worktree to avoid conflicts" -ForegroundColor DarkGray
}

function Setup-HumanWorktree {
    param([string]$FeatureName)
    
    $BranchName = "feature/$FeatureName"
    $WorktreeName = "human-$FeatureName"
    
    Write-Host "
👤 Creating Human Developer Worktree" -ForegroundColor White
    Write-Host "   Feature: $FeatureName" -ForegroundColor White
    Write-Host "   Branch: $BranchName" -ForegroundColor Gray
    
    git branch $BranchName 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   Branch exists, reusing..." -ForegroundColor Yellow
    }
    
    $WorktreePath = Join-Path $WorktreeBase $WorktreeName
    git worktree add $WorktreePath $BranchName
    
    Write-Host "
✅ Human worktree ready!" -ForegroundColor Green
    Write-Host "   Path: $WorktreePath" -ForegroundColor Gray
}

function Show-WorktreeStatus {
    Write-Host "
📊 Multi-Agent Worktree Status" -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor Gray
    
    $Worktrees = git worktree list --porcelain | Out-String
    $WorktreeBlocks = $Worktrees -split 'worktree ' | Where-Object { $_ -match '\S' }
    
    foreach ($Block in $WorktreeBlocks) {
        $Lines = $Block -split "
"
        $Path = $Lines[0].Trim()
        
        if (Test-Path (Join-Path $Path '.agent-metadata.json')) {
            $Metadata = Get-Content (Join-Path $Path '.agent-metadata.json') | ConvertFrom-Json
            $Color = $AgentColors[$Metadata.agent_type]
            
            Write-Host "
🤖 AI Agent: $($Metadata.agent_type.ToUpper())" -ForegroundColor $Color
            Write-Host "   Task: $($Metadata.task_name)" -ForegroundColor Gray
            Write-Host "   Branch: $($Metadata.branch)" -ForegroundColor Gray
            Write-Host "   Created: $($Metadata.created_at)" -ForegroundColor DarkGray
        } else {
            if ($Path -notlike '*\.git*') {
                Write-Host "
📁 Worktree: $Path" -ForegroundColor White
            }
        }
    }
    
    Write-Host "
" -NoNewline
}

function Show-CollaborationGuide {
    Write-Host "
�� Multi-AI-Agent Collaboration Guide" -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor Gray
    
    Write-Host "
🎯 WORKFLOW PATTERN:" -ForegroundColor Yellow
    Write-Host "   1. Each AI agent gets its own isolated worktree"
    Write-Host "   2. Agents work on different tasks simultaneously"
    Write-Host "   3. No branch switching = no conflicts"
    Write-Host "   4. Merge to main when task complete"
    
    Write-Host "
🤖 SUPPORTED AI AGENTS:" -ForegroundColor Yellow
    Write-Host "   • GitHub Copilot" -ForegroundColor Blue
    Write-Host "   • Claude (Anthropic)" -ForegroundColor Magenta
    Write-Host "   • Cursor" -ForegroundColor Cyan
    Write-Host "   • Windsurf" -ForegroundColor Green
    Write-Host "   • Aider" -ForegroundColor Yellow
    
    Write-Host "
💡 EXAMPLE USAGE:" -ForegroundColor Yellow
    Write-Host "   # Copilot works on UI refactor"
    Write-Host "   .\setup-ai-worktree.ps1 agent ui-refactor copilot"
    Write-Host ""
    Write-Host "   # Claude works on backend API"
    Write-Host "   .\setup-ai-worktree.ps1 agent backend-api claude"
    Write-Host ""
    Write-Host "   # Human works on documentation"
    Write-Host "   .\setup-ai-worktree.ps1 human docs-update"
    Write-Host ""
    Write-Host "   # Check status"
    Write-Host "   .\setup-ai-worktree.ps1 status"
    
    Write-Host "
⚠️  BEST PRACTICES:" -ForegroundColor Yellow
    Write-Host "   ✓ One agent = One worktree = One task"
    Write-Host "   ✓ Keep tasks focused and scoped"
    Write-Host "   ✓ Merge frequently to main"
    Write-Host "   ✓ Delete worktree after merge"
    Write-Host "   ✗ Don't share worktrees between agents"
    Write-Host "   ✗ Don't work on same files in parallel
"
}

# Create worktree base directory if needed
if (-not (Test-Path $WorktreeBase)) {
    New-Item -ItemType Directory -Path $WorktreeBase -Force | Out-Null
}

# Command router
switch ($Command) {
    'agent' {
        if (-not $Name -or -not $AgentType) {
            Write-Host "❌ Task name and agent type required" -ForegroundColor Red
            Write-Host "Usage: .\setup-ai-worktree.ps1 agent <task-name> <agent-type>" -ForegroundColor Gray
            Write-Host "Agent types: copilot, claude, cursor, windsurf, aider, other
" -ForegroundColor Gray
            exit 1
        }
        Setup-AgentWorktree $Name $AgentType
    }
    'human' {
        if (-not $Name) {
            Write-Host "❌ Feature name required" -ForegroundColor Red
            Write-Host "Usage: .\setup-ai-worktree.ps1 human <feature-name>
" -ForegroundColor Gray
            exit 1
        }
        Setup-HumanWorktree $Name
    }
    'feature' {
        if (-not $Name) {
            Write-Host "❌ Feature name required" -ForegroundColor Red
            exit 1
        }
        Setup-HumanWorktree $Name
    }
    'hotfix' {
        if (-not $Name) {
            Write-Host "❌ Hotfix name required" -ForegroundColor Red
            exit 1
        }
        $BranchName = "hotfix/$Name"
        git branch $BranchName 2>$null
        $WorktreePath = Join-Path $WorktreeBase "hotfix-$Name"
        git worktree add $WorktreePath $BranchName
        Write-Host "✅ Hotfix worktree created: $WorktreePath" -ForegroundColor Green
    }
    'list' {
        git worktree list
    }
    'status' {
        Show-WorktreeStatus
    }
    'remove' {
        if (-not $Name) {
            Write-Host "❌ Worktree name required" -ForegroundColor Red
            exit 1
        }
        $WorktreePath = Join-Path $WorktreeBase $Name
        if (Test-Path $WorktreePath) {
            git worktree remove $WorktreePath
            Write-Host "✅ Worktree removed: $Name" -ForegroundColor Green
        } else {
            Write-Host "❌ Worktree not found: $Name" -ForegroundColor Red
            exit 1
        }
    }
    default {
        Show-CollaborationGuide
    }
}
