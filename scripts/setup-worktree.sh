#!/bin/bash
# setup-worktree.sh - Initialize git worktree workflow
# Based on zyahav/modular-dashboard patterns

set -e

MAIN_DIR=$(pwd)
WORKTREE_BASE="$MAIN_DIR/worktrees"

echo "🌳 Setting up git worktree workflow..."

# Create worktree base directory
mkdir -p "$WORKTREE_BASE"

# Setup feature branch worktree
setup_feature() {
    local FEATURE_NAME="$1"
    local BRANCH_NAME="feature/$FEATURE_NAME"
    
    echo "Creating feature branch: $BRANCH_NAME"
    git branch "$BRANCH_NAME" 2>/dev/null || echo "Branch already exists"
    git worktree add "$WORKTREE_BASE/$FEATURE_NAME" "$BRANCH_NAME"
    
    echo "✅ Feature worktree created at: $WORKTREE_BASE/$FEATURE_NAME"
    echo "   cd $WORKTREE_BASE/$FEATURE_NAME"
}

# Setup hotfix branch worktree
setup_hotfix() {
    local HOTFIX_NAME="$1"
    local BRANCH_NAME="hotfix/$HOTFIX_NAME"
    
    echo "Creating hotfix branch: $BRANCH_NAME"
    git branch "$BRANCH_NAME" 2>/dev/null || echo "Branch already exists"
    git worktree add "$WORKTREE_BASE/$HOTFIX_NAME" "$BRANCH_NAME"
    
    echo "✅ Hotfix worktree created at: $WORKTREE_BASE/$HOTFIX_NAME"
}

# Show usage
show_usage() {
    cat << EOF
Usage: ./setup-worktree.sh <command> [name]

Commands:
  feature <name>  - Create feature branch worktree
  hotfix <name>   - Create hotfix branch worktree
  list            - List all worktrees
  remove <name>   - Remove worktree

Examples:
  ./setup-worktree.sh feature genui-refactor
  ./setup-worktree.sh hotfix critical-bug-fix
  ./setup-worktree.sh list
  ./setup-worktree.sh remove genui-refactor
EOF
}

# Main command router
case "${1:-}" in
    feature)
        if [ -z "$2" ]; then
            echo "❌ Feature name required"
            show_usage
            exit 1
        fi
        setup_feature "$2"
        ;;
    hotfix)
        if [ -z "$2" ]; then
            echo "❌ Hotfix name required"
            show_usage
            exit 1
        fi
        setup_hotfix "$2"
        ;;
    list)
        git worktree list
        ;;
    remove)
        if [ -z "$2" ]; then
            echo "❌ Worktree name required"
            exit 1
        fi
        git worktree remove "$WORKTREE_BASE/$2"
        echo "✅ Worktree removed: $2"
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
