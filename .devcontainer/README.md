# ModMe GenUI DevContainer

This directory contains the configuration for the development container.

## 🚀 Getting Started

### 1. Requirements
- **Docker Desktop** (running)
- **VS Code** with **Remote - Containers** extension

### 2. Open in Container
1. Open this folder in VS Code
2. Click the green "><" icon in the bottom left
3. Select **"Reopen in Container"**
4. Wait for the build to complete (first time takes ~5-10 mins)

## 🛠 Features

- **Node.js 22**: With automatic dependencies installation
- **Python 3.12**: With `uv` package manager and venv setup
- **Tools**: `gh` CLI, `docker-in-docker`
- **Extensions**: Pre-installed useful extensions

## 🐛 Troubleshooting

### Build Fails?
- Check Docker disk space (needs >10GB)
- "Dev Containers: Rebuild Container without Cache"

### Permissions?
- If scripts fail, run: `chmod +x .devcontainer/*.sh`

### Ports?
- Port 3000: Next.js UI
- Port 8000: Python Agent
