# Secrets Management Guide

## Overview

This template uses **Infisical** for centralized secrets management with hierarchical resolution and automatic fallback to environment variables.

## Quick Start

### 1. Setup Infisical Credentials

```bash
# Copy example file
cp .env.example .env.local

# Edit with your credentials
vim .env.local
```

**Required values:**
```bash
INFISICAL_CLIENT_ID=your-client-id
INFISICAL_CLIENT_SECRET=your-client-secret
```

**Infisical project IDs (preloaded):**
```bash
INFISICAL_APPS_PROJECT_ID=10b63b16-515c-4ea4-adfc-1da96d654fe8  # worx-apps (baseline)
INFISICAL_PLATFORM_PROJECT_ID=your-platform-id                   # worx-platform (fallback)
```

### 2. Load Environment

```bash
# Source credentials
source .env.local

# Validate connectivity
yarn infisical:validate
```

### 3. Bootstrap Secrets

```bash
# Load secrets from Infisical to .env.local
yarn infisical:load

# Load for specific environment
yarn infisical:load:dev
yarn infisical:load:stg
yarn infisical:load:prd

# Show secrets without writing (debug)
yarn infisical:show
```

## How It Works

### Hierarchical Resolution

Secrets are resolved with this priority (most specific wins):

1. **App-specific** (`INFISICAL_APP_PROJECT_ID` → `worx-{appname}`)
2. **Shared apps** (`INFISICAL_APPS_PROJECT_ID` → `worx-apps`)
3. **Platform** (`INFISICAL_PLATFORM_PROJECT_ID` → `worx-platform`)
4. **Environment variables** (fallback)

**Example:**
```typescript
// If INFISICAL_APP_PROJECT_ID is set:
// Tries: worx-myapp → worx-apps → worx-platform → process.env

const sm = new SecretManager({ appName: 'myapp' });
const apiKey = await sm.getSecret('API_KEY');
// Searches all projects in order until found
```

### SecretManager API

```typescript
import { SecretManager, getSecretManager } from './config/secrets';

// Create instance
const sm = new SecretManager({
  appName: 'myapp',      // Optional: enables app-specific project
  environment: 'dev'     // Optional: defaults to NODE_ENV or 'dev'
});

// Get secret (throws if not found)
const value = await sm.getSecret('API_KEY');

// Get with default
const port = await sm.getSecretOrDefault('PORT', '3000');

// Get multiple
const secrets = await sm.getSecrets(['DB_URL', 'API_KEY']);

// Health check
const health = await sm.healthCheck();
console.log(health.status); // 'healthy' | 'degraded' | 'unhealthy'

// Singleton pattern
const sm2 = getSecretManager();
```

## Commands

### Infisical Loader

```bash
# Load secrets to .env.local
yarn infisical:load                 # dev environment
yarn infisical:load:dev             # explicit dev
yarn infisical:load:stg             # staging
yarn infisical:load:prd             # production

# Validate connectivity
yarn infisical:validate

# Show secrets (don't write)
yarn infisical:show

# Custom output file
yarn infisical:load --output=.env.custom
```

### Health Check

```bash
# Check Infisical connectivity
yarn config:health

# Output:
# {
#   "status": "healthy",
#   "message": "All Infisical projects accessible",
#   "projects": [
#     { "name": "worx-apps", "accessible": true },
#     { "name": "worx-platform", "accessible": true }
#   ]
# }
```

## Configuration

### Quality Thresholds

These are automatically loaded from Infisical:

**worx-apps project (baseline):**
```bash
TYPE_COVERAGE_MIN=98.5
LINT_MAX_WARNINGS=0
TEST_COVERAGE_MIN=80
```

**Loaded via:**
```bash
yarn infisical:load
source .env.local
yarn quality:validate  # Uses loaded thresholds
```

### App-Specific Secrets

For app-specific secrets (API keys, DB credentials):

1. Create app-specific Infisical project: `worx-myapp`
2. Set `INFISICAL_APP_PROJECT_ID` in `.env.local`
3. Add secrets to `worx-myapp/{env}/` in Infisical

**Precedence:**
```
worx-myapp/dev/API_KEY       # Highest priority
  ↓ (if not found)
worx-apps/dev/API_KEY        # Shared apps
  ↓ (if not found)
worx-platform/dev/API_KEY    # Platform fallback
  ↓ (if not found)
process.env.API_KEY          # Environment variable
```

## Local Development Without Infisical

**Option 1: Environment variables only**
```bash
# .env.local (no Infisical credentials)
TYPE_COVERAGE_MIN=98.5
LINT_MAX_WARNINGS=0
TEST_COVERAGE_MIN=80
API_KEY=local-dev-key

# Load into shell
source .env.local
```

**Option 2: Use package.json defaults**
```bash
# No .env.local needed
# package.json has default thresholds
yarn build
yarn test
```

## CI/CD Setup

**GitHub Actions:** (already configured in .github/workflows/ci.yml)

```yaml
env:
  INFISICAL_PLATFORM_PROJECT_ID: ${{ secrets.INFISICAL_PLATFORM_PROJECT_ID }}
  INFISICAL_APPS_PROJECT_ID: ${{ secrets.INFISICAL_APPS_PROJECT_ID }}
  INFISICAL_CLIENT_ID: ${{ secrets.INFISICAL_CLIENT_ID }}
  INFISICAL_CLIENT_SECRET: ${{ secrets.INFISICAL_CLIENT_SECRET }}
```

**Required GitHub Secrets:**
- `INFISICAL_PLATFORM_PROJECT_ID`
- `INFISICAL_APPS_PROJECT_ID`
- `INFISICAL_CLIENT_ID`
- `INFISICAL_CLIENT_SECRET`

## Troubleshooting

### "No Infisical projects configured"

**Cause:** Environment variables not set

**Fix:**
```bash
source .env.local
yarn infisical:validate
```

### "Secret not found in any project"

**Cause:** Secret doesn't exist in any Infisical project

**Fix:**
1. Add secret to Infisical (worx-apps or worx-platform)
2. Or add to `.env.local` as fallback

### "Infisical connectivity check failed"

**Cause:** Invalid credentials or network issue

**Fix:**
```bash
# Verify credentials
echo $INFISICAL_CLIENT_ID
echo $INFISICAL_CLIENT_SECRET

# Test connection
yarn infisical:validate
```

### Type coverage validation fails

**Cause:** Thresholds not loaded from Infisical

**Fix:**
```bash
# Load thresholds
yarn infisical:load
source .env.local

# Validate
yarn quality:validate
```

## Security Best Practices

1. **Never commit** `.env.local` or `.env.*` files (gitignored)
2. **Rotate credentials** regularly in Infisical
3. **Use app-specific projects** for sensitive secrets
4. **Audit access** via Infisical dashboard
5. **Least privilege** - only grant necessary permissions

## Example Workflow

**New developer onboarding:**

```bash
# 1. Clone repo
git clone https://github.com/adaptiveworx/my-project
cd my-project

# 2. Setup Infisical
cp .env.example .env.local
# Add INFISICAL_CLIENT_ID and INFISICAL_CLIENT_SECRET

# 3. Load secrets
source .env.local
yarn infisical:validate  # Verify connectivity
yarn infisical:load      # Bootstrap .env.local

# 4. Develop
yarn install
yarn dev
```

**Switching environments:**

```bash
# Load staging secrets
yarn infisical:load:stg
source .env.local

# Verify
yarn config:health
# Shows: "environment": "stg"

# Run tests against staging
yarn test
```
