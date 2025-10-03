# Setup Instructions

## Initial Setup (After copying template)

### 1. Install Dependencies

```bash
# Ensure you have Node 22+
nvm use  # Uses .nvmrc

# Enable Corepack (for Yarn)
corepack enable

# Install dependencies
yarn install

# Setup Git hooks
yarn prepare  # Installs Husky hooks
```

### 2. Customize Project

**Update `package.json`:**
```json
{
  "name": "@adaptiveworx/YOUR-PROJECT-NAME",
  "description": "Your project description",
  ...
}
```

**Update `README.md`:**
- Replace project name
- Update description
- Add specific usage instructions

### 3. Configure Infisical (Optional)

If using Infisical for quality threshold enforcement:

```bash
# Create .env.local (gitignored)
cat > .env.local <<'EOF'
INFISICAL_PLATFORM_PROJECT_ID=<platform-project-id>
INFISICAL_APPS_PROJECT_ID=10b63b16-515c-4ea4-adfc-1da96d654fe8
INFISICAL_CLIENT_ID=<your-client-id>
INFISICAL_CLIENT_SECRET=<your-client-secret>
EOF
```

Without Infisical, package.json thresholds are used as defaults.

### 4. Validate Setup

```bash
# Run all validation checks
yarn validate:all

# Should pass:
# ✅ Type check
# ✅ Lint (0 warnings)
# ✅ Tests (all passing)
```

### 5. Initialize Git

```bash
git init
git add .
git commit -m "Initial commit from template-typescript-lib"
```

## Development Workflow

### Pre-commit Hooks

Husky runs these checks before every commit:
- `yarn type-check` - TypeScript validation
- `yarn lint:check` - ESLint (zero warnings)
- `yarn test` - All tests must pass

**To bypass (use sparingly):**
```bash
git commit --no-verify -m "WIP: temporary commit"
```

### VSCode Integration

Recommended extensions will be suggested on first open:
- ESLint - Auto-fix on save
- Prettier - Format on save
- Vitest Explorer - Test UI
- Error Lens - Inline errors

### Quality Thresholds

Enforced by CI and pre-commit:
- **Type coverage**: 98.5%+ (strictest)
- **Lint warnings**: 0 (zero-warning policy)
- **Test coverage**: 80%+

## Agent Collaboration

See [CLAUDE.md](CLAUDE.md) for detailed agent workflow.

**Quick Start:**
1. Share objectives with agent
2. Agent reads CLAUDE.md
3. Agent delivers 100% clean code (no errors, no warnings)
4. You handle publishing/deployment

## Troubleshooting

### Husky hooks not working
```bash
yarn prepare
chmod +x .husky/pre-commit
```

### Type coverage below threshold
```bash
yarn type-coverage --detail
# Shows which files/lines need type annotations
```

### Tests failing
```bash
yarn test:watch
# Interactive test runner for debugging
```

### Infisical validation failing
```bash
# Skip if not using Infisical
export INFISICAL_CLIENT_ID=""
yarn quality:validate
```
