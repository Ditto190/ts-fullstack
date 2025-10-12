# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Type: TypeScript Fullstack Monorepo

**Template**: `ts-fullstack`
**Purpose**: Production-ready PERN stack with Turborepo, Biome, and multi-environment deployment
**Target**: Full-stack web applications, AI-powered services, internal tools, MVPs

## Collaboration Workflow

**IMPORTANT**: Claude and the user follow a structured collaboration workflow:

### The 6-Step Process
1. **Collaborate on Objectives** - Discuss and agree on features to build
2. **Define Feature IDs** - Create semantic taxonomy IDs (e.g., `TASK.ITEM.CREATE`, `TEAM.MEMBER.INVITE`) - see [docs/FEATURE-TAXONOMY.md](docs/FEATURE-TAXONOMY.md)
3. **Agree on Architecture** - Decide on packages (api, web, agent, shared, ui, db) and dependencies
4. **Claude Handles Dev/Test** - Claude writes/tests TypeScript code and ensures 100% clean code:
   - Add **@feature headers** to every implementation (source of truth)
   - Recommend tests (unit, integration, e2e) - co-locate with code
   - Write code across packages with explicit dependencies
   - Run `yarn feature:validate` - Check taxonomy, dependencies, circular deps
   - Run `yarn feature:sync` - Generate features.json from code
   - Run `yarn build` - Fix ALL compilation errors
   - Run `yarn lint:check` - Fix ALL linter errors/warnings
   - Run `yarn test` - Fix ALL failing tests
   - **Deliver 100% clean code** - No errors, no warnings, all tests pass, features documented
5. **User Handles Deployment** - User manages Docker, database migrations, environment promotion
6. **Review Together** - Review integration, API contracts, UI components, feature registry

### What Claude MUST Do
- Add **@feature header** to every implementation (mandatory)
- Run `yarn feature:validate && yarn feature:sync` before build
- Co-locate tests with code (*.test.ts next to *.ts)
- Declare explicit feature dependencies in @feature headers
- Fix ALL errors/warnings - deliver 100% clean code
- Use shared packages (@adaptiveworx/ui, @adaptiveworx/shared)

### What Claude Must NOT Do
- Skip @feature headers ("I'll add them later")
- Create features without taxonomy discussion
- Run Docker commands (user handles infrastructure)
- Run database migrations in production
- Leave ANY errors, warnings, or failing tests
- Modify envs/*/package.json versions without approval

## Monorepo Structure

### Apps (Deployable Services)
- **@adaptiveworx/api** - Fastify API server (apps/api)
- **@adaptiveworx/web** - React + Vite frontend (apps/web)
- **@adaptiveworx/agent** - AI agent service with MCP tools (apps/agent)

### Packages (Shared Libraries)
- **@adaptiveworx/db** - Drizzle ORM schemas and database client
- **@adaptiveworx/shared** - Common types, utilities, config, Infisical integration
- **@adaptiveworx/ui** - Shared React components (Button, Input, Card, etc.)

### Environments
- **envs/dev** - Development environment version pinning
- **envs/stg** - Staging environment version pinning
- **envs/prd** - Production environment version pinning

## Essential Commands

### Build & Validation (Turborepo)
\`\`\`bash
yarn build              # Turbo: Build all packages with caching
yarn build --force      # Force rebuild (ignore cache)
yarn type-check         # TypeScript compilation check (all workspaces)
yarn lint:check         # Biome: Lint all files (0 warnings enforced)
yarn lint:fix           # Biome: Auto-fix linting issues
yarn test               # Turbo: Run all Vitest tests
yarn test:coverage      # Generate coverage reports
\`\`\`

### Development
\`\`\`bash
yarn dev                # Turbo: Start all services in parallel (api + web + agent)
yarn dev:api            # API only (port 3000)
yarn dev:web            # Web only (port 5173)
yarn dev:agent          # Agent only (port 3001)
\`\`\`

### Database
\`\`\`bash
yarn db:push            # Push Drizzle schema changes to database
yarn db:reset           # Drop all tables (destructive!)
yarn db:seed            # Seed with test data
\`\`\`

### Docker (User Managed)
\`\`\`bash
yarn docker:up          # Start PostgreSQL + Redis
yarn docker:down        # Stop containers
\`\`\`

## Architecture Overview

### Package Dependencies

\`\`\`
@adaptiveworx/api
  ├── @adaptiveworx/db
  ├── @adaptiveworx/shared
  └── fastify, drizzle-orm, zod

@adaptiveworx/web
  ├── @adaptiveworx/ui
  ├── @adaptiveworx/shared
  └── react, vite, tanstack-query

@adaptiveworx/agent
  ├── @adaptiveworx/db
  ├── @adaptiveworx/shared
  └── fastify, zod

@adaptiveworx/ui
  └── react, tailwindcss, clsx

@adaptiveworx/shared
  ├── @adaptiveworx/db
  └── zod, @infisical/sdk

@adaptiveworx/db
  └── drizzle-orm, postgres
\`\`\`

### File Organization Pattern

\`\`\`
apps/api/
  src/
    routes/           # API endpoints
      users.ts        # GET/POST /api/users
      posts.ts
    index.ts          # Fastify server setup

apps/web/
  src/
    pages/            # React Router pages
      UsersPage.tsx
    lib/              # API client, utilities
    App.tsx

packages/db/
  src/
    schema/           # Drizzle table definitions
      users.ts
      posts.ts
    client.ts         # Database connection
    seed.ts           # Seed data

packages/ui/
  src/
    components/
      button/         # Button component + tests
      input/
      card/
    utils/
      cn.ts           # Tailwind class merger

apps/agent/
  src/
    tools/            # MCP-compatible tools
    workflows/        # Multi-step orchestrations
    index.ts          # Agent server
\`\`\`

## Important Patterns

### Turborepo Caching
Turbo caches task outputs based on inputs. If nothing changed, tasks are skipped:
\`\`\`bash
yarn build          # First run: builds everything
yarn build          # Second run: all cached, instant
\`\`\`

Cache is stored in \`.turbo/\` and shared across CI/CD via GitHub Actions cache.

### Biome Linting & Formatting
Replaces ESLint + Prettier with a single, fast tool:
\`\`\`bash
yarn lint:check     # Check for issues
yarn lint:fix       # Auto-fix issues
\`\`\`

Configuration in \`biome.json\`:
- **0 warnings enforced** - No exceptions
- **Organized imports** - Auto-sorts imports
- **Tailwind-aware** - Handles CSS correctly

### Cross-Package Imports
Use package names, not relative paths:

\`\`\`typescript
// ✅ CORRECT - Use package imports
import { db } from '@adaptiveworx/db';
import { users } from '@adaptiveworx/db';
import { Button } from '@adaptiveworx/ui';
import { validateInput } from '@adaptiveworx/shared/validation';

// ❌ WRONG - Don't use relative paths across packages
import { db } from '../../../packages/db/src/client';
\`\`\`

### ESM + NodeNext Imports
Always use \`.js\` extensions, even for \`.ts\` files:

\`\`\`typescript
// ✅ CORRECT
import { api } from './lib/api.js';
import { Button } from './components/Button.js';

// ❌ WRONG
import { api } from './lib/api';
import { Button } from './components/Button';
\`\`\`

### UI Component Usage

\`\`\`typescript
// apps/web/src/pages/UsersPage.tsx
import { Card, CardHeader, CardTitle, CardContent, Button } from '@adaptiveworx/ui';

export function UsersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default" onClick={handleClick}>
          Add User
        </Button>
      </CardContent>
    </Card>
  );
}
\`\`\`

### Database Type Safety (Drizzle)

\`\`\`typescript
// packages/db/src/schema/users.ts
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users);
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
\`\`\`

### API Route Pattern

\`\`\`typescript
// apps/api/src/routes/users.ts
import { db } from '@adaptiveworx/db';
import { users, insertUserSchema } from '@adaptiveworx/db';

export async function userRoutes(server: FastifyInstance) {
  server.get('/api/users', async () => {
    const allUsers = await db.select().from(users);
    return { users: allUsers };
  });

  server.post('/api/users', async (request) => {
    const data = insertUserSchema.parse(request.body);
    const [user] = await db.insert(users).values(data).returning();
    return { user };
  });
}
\`\`\`

### Testing Pattern
Co-locate tests with source files:

\`\`\`typescript
// packages/ui/src/components/button/Button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button.js';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
\`\`\`

## Environment Management

### Local Development
Uses root \`.env\` file:
\`\`\`bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fullstack_dev
PORT=3000
AGENT_PORT=3001
\`\`\`

### Environment Pinning
Each environment in \`envs/{dev,stg,prd}\` pins package versions:

\`\`\`json
// envs/prd/package.json
{
  "dependencies": {
    "@adaptiveworx/api": "0.2.0",
    "@adaptiveworx/web": "0.2.0",
    "@adaptiveworx/agent": "0.1.5"
  }
}
\`\`\`

**Promotion Flow:**
1. Test in dev with latest versions
2. Update \`envs/stg/package.json\` to promote to staging
3. Validate in staging
4. Update \`envs/prd/package.json\` to promote to production

## Known Issues & Workarounds

1. **Turborepo cache stale**: Run \`rm -rf .turbo && yarn build --force\`
2. **Type errors with Drizzle**: Use type assertion: \`values(data as typeof table.$inferInsert)\`
3. **Biome vs ESLint differences**: Biome is stricter - embrace it for better code quality
4. **Yarn workspace resolution**: Use \`workspace:*\` for local package dependencies

## Quality Standards

### Type Safety
- **Strict TypeScript** - @tsconfig/strictest enabled
- **Explicit return types** - All functions must declare return types
- **No \`any\` types** - Use \`unknown\` and narrow with type guards
- **Strict null checks** - Always handle undefined/null explicitly

### Testing
- **Co-located tests** - \`*.test.ts\` next to source
- **Vitest** - Fast, ESM-native test runner
- **Coverage thresholds** - Enforced per package
- **Test naming** - Descriptive \`it('should ...')\` format

### Code Quality
- **Zero warnings** - Biome must pass with 0 warnings
- **Organized imports** - Auto-sorted by Biome
- **Named exports** - Prefer named exports over default
- **Single responsibility** - Each module has one clear purpose

## Feature Taxonomy Quick Reference

### Structure
\`\`\`
<DOMAIN>.<ENTITY>.<OPERATION>[.<QUALIFIER>]*

Examples: TASK.ITEM.CREATE, TEAM.MEMBER.INVITE, USER.PROFILE.UPDATE
\`\`\`

### Standard Domains
**AUTH** | **USER** | **TEAM** | **PROJECT** | **TASK** | **API** | **DB** | **UI** | **AGENT** | **INFRA**

### Standard Operations
**CREATE** | **READ** | **LIST** | **UPDATE** | **DELETE** | **VALIDATE** | **SEARCH** | **EXPORT** | **IMPORT** | **SYNC**

### Feature Header Template
\`\`\`typescript
/**
 * @feature DOMAIN.ENTITY.OPERATION
 * @domain DOMAIN
 * @entity ENTITY
 * @operation OPERATION
 * @layer API|DB|UI|AGENT
 * @dependencies [FEATURE_ID, FEATURE_ID]
 * @implements
 *   - Implementation detail 1
 *   - Implementation detail 2
 * @tests
 *   - Test description 1
 *   - Test description 2
 */
export function featureName() { ... }
\`\`\`

### Commands
\`\`\`bash
yarn feature:validate           # Check taxonomy, dependencies, circular deps
yarn feature:sync               # Generate features.json from @feature headers
yarn feature:search TASK.*      # Find features by pattern
\`\`\`

**Full documentation**: [docs/FEATURE-TAXONOMY.md](docs/FEATURE-TAXONOMY.md)

## Agent Workflow Example

\`\`\`
User: "Add a new 'projects' feature with API and UI"

Claude:
1. ✅ Discusses schema design and proposes feature IDs:
   - DB.SCHEMA.PROJECTS, PROJECT.ITEM.CREATE, PROJECT.ITEM.LIST
   - UI.PROJECT.ITEM.CREATE.FORM, UI.PROJECT.ITEM.LIST.TABLE
2. ✅ Agrees on architecture and dependencies
3. ✅ Implements with @feature headers:
   - packages/db/src/schema/projects.ts (DB.SCHEMA.PROJECTS)
   - apps/api/src/routes/projects.ts (PROJECT.ITEM.CREATE, PROJECT.ITEM.LIST)
   - apps/web/src/pages/ProjectsPage.tsx (UI components)
   - Co-located tests for all layers
4. ✅ Validates:
   - yarn feature:validate (taxonomy check)
   - yarn feature:sync (generate registry)
   - yarn build (all packages compile)
   - yarn lint:check (0 warnings)
   - yarn test (all tests pass)
5. ✅ Delivers 100% clean code with feature documentation

User: Reviews features.json, runs database migration, deploys to dev
\`\`\`

---

**Remember**: We deliver 100% clean code with full feature documentation. Every implementation gets an @feature header. No shortcuts, no "TODO" comments, no skipped tests. Turborepo + Biome + Vitest + Feature Taxonomy = Fast, reliable, maintainable builds every time.
