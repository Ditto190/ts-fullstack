# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Type: TypeScript Fullstack Monorepo

**Template**: `ts-fullstack`
**Purpose**: Production-ready PERN stack with Turborepo, Biome, and multi-environment deployment
**Target**: Full-stack web applications, AI-powered services, internal tools, MVPs

## Collaboration Workflow

**IMPORTANT**: Claude and the user follow a structured collaboration workflow:

### The 5-Step Process
1. **Collaborate on Objectives** - Discuss and agree on features to build
2. **Agree on Architecture** - Decide on which packages to use (api, web, agent, shared, ui, db)
3. **Claude Handles Dev/Test** - Claude writes/tests TypeScript code and ensures 100% clean code:
   - **Recommend Tests** - Suggest appropriate tests (unit, integration, e2e)
   - **Discuss Test Strategy** - Collaborate with user on what should be tested
   - Write code across relevant packages
   - Run `yarn build` (Turbo) - Fix ALL compilation errors across all packages
   - Run `yarn lint:check` (Biome) - Fix ALL linter errors and warnings
   - Run `yarn test` (Turbo) - Fix ALL failing tests
   - **Deliver 100% clean code** - No errors, no warnings, all tests passing
4. **User Handles Deployment** - User manages Docker, database migrations, environment promotion
5. **Review Together** - Both review cross-package integration, API contracts, UI components

### What Claude Should NOT Do
- **DO NOT** run Docker commands (user handles infrastructure)
- **DO NOT** run database migrations in production environments
- **DO NOT** skip ahead to deployment without completing steps 1-3
- **DO NOT** leave ANY compilation errors, linter warnings, or failing tests
- **DO NOT** modify version numbers in envs/*/package.json without approval

### What Claude SHOULD Do
- Write and test all TypeScript code across apps and packages
- Recommend and discuss appropriate test strategies
- Run Turborepo builds, Biome linting, and Vitest tests to validate code quality
- Fix ALL errors and warnings - we're agentic, we deliver 100% clean code
- Use shared packages (@adaptiveworx/ui, @adaptiveworx/shared) for code reuse
- Ask "Should I proceed with X?" before major architectural changes
- Stop after step 3 and wait for user to handle deployment

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

## Agent Workflow Example

\`\`\`
User: "Add a new 'projects' feature with API and UI"

Claude:
1. ✅ Discusses schema design with user (projects table, relations)
2. ✅ Agrees to create: DB schema, API routes, UI components, tests
3. ✅ Implements:
   - packages/db/src/schema/projects.ts (Drizzle schema)
   - apps/api/src/routes/projects.ts (CRUD endpoints)
   - apps/web/src/pages/ProjectsPage.tsx (React UI using @adaptiveworx/ui)
   - Tests for all components
4. ✅ Validates:
   - yarn build (all packages compile)
   - yarn lint:check (0 warnings)
   - yarn test (all tests pass)
5. ✅ Delivers 100% clean code

User: Runs database migration and deploys to dev environment
\`\`\`

---

**Remember**: We deliver 100% clean code. No shortcuts, no "TODO" comments in production, no skipped tests. Turborepo + Biome + Vitest = Fast, reliable builds every time.
