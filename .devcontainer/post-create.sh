#!/bin/bash

# ===============================================
# post-create.sh
# AUTOMATED DEVCONTAINER SETUP
# ===============================================

set -e

echo "🚀 Starting post-create setup for ModMe GenUI Workspace..."

# Ensure we're in the workspace directory
cd "${WORKSPACE_FOLDER:-/workspaces/modme-monorepo}"

# Check Node.js version
echo "📦 Node.js version:"
node --version

# Check Python version
echo "🐍 Python version:"
python3 --version

# Check uv installation
echo "📦 UV package manager:"
uv --version || echo "⚠️  UV not found, will use pip fallback"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
if [ -f "package.json" ]; then
    if [ -f "yarn.lock" ]; then
        echo "Using Yarn..."
        yarn install
    else
        npm install
    fi
else
    echo "⚠️  No package.json found"
fi

# Set up Python agent environment
echo "🐍 Setting up Python agent environment..."
if [ -f "packages/python-agent/pyproject.toml" ]; then
    cd packages/python-agent
    
    # Use uv if available, otherwise use pip
    if command -v uv &> /dev/null; then
        echo "Using uv for Python package management..."
        uv sync
    else
        echo "Using pip for Python package management..."
        python3 -m venv .venv
        source .venv/bin/activate
        pip install --upgrade pip
        pip install -e .
    fi
    
    cd ../..
elif [ -f "agent/pyproject.toml" ]; then
    # Fallback to older structure if 'agent' dir exists
    cd agent
     if command -v uv &> /dev/null; then
        uv sync
    else
        python3 -m venv .venv
        source .venv/bin/activate
        pip install -e .
    fi
    cd ..
else
    echo "⚠️  No python-agent/pyproject.toml found in packages/ or agent/"
fi

# Create data directory if it doesn't exist (for local client data)
echo "📁 Creating data directory..."
mkdir -p data

# Copy .env.example to .env if .env doesn't exist
if [ -f ".env.example" ] && [ ! -f ".env" ]; then
    echo "📋 Copying .env.example to .env..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration"
fi

# Set up git hooks (if any)
if [ -d ".githooks" ]; then
    echo "🪝 Setting up git hooks..."
    git config core.hooksPath .githooks
fi

echo "✅ Post-create setup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Update .env with your API keys"
echo "  2. Run 'turbo run dev'"
echo ""
