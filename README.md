# PERN Fullstack Template

Modern fullstack TypeScript template for rapid prototyping and production applications using the PERN stack (Postgres, Express, React, Node) with strict type safety and zero-tolerance quality policies.

## 🚀 Quick Start

```bash
# Prerequisites
brew install infisical      # One-time: Install Infisical CLI
infisical login             # One-time: Login with GitHub SSO
docker-compose up -d        # Start Postgres 17 + Redis locally

# Setup
yarn install
yarn infisical:load         # Load secrets from Infisical
source .env.local

# Database
yarn db:generate            # Generate Prisma client
yarn db:migrate             # Run migrations
yarn db:seed                # Seed test data

# Development
yarn dev                    # Start all services (API + Web)
# Or run separately:
yarn dev:api                # API only (http://localhost:3000)
yarn dev:web                # Web only (http://localhost:5173)

# Quality
yarn validate:all           # Type-check + lint + test (must pass!)
```

## 📦 Stack

**Frontend:**
- React 18 + TypeScript
- Vite (fast dev server + build)
- TanStack Query (data fetching)
- React Router (routing)
- Tailwind CSS (styling)

**Backend:**
- Fastify (fast HTTP server)
- Prisma (type-safe database ORM)
- Postgres 17 (via Docker)
- Redis (caching, sessions)
- Zod (runtime validation)

**Infrastructure:**
- Pulumi (IaC for AWS deployment)
- RDS Postgres (production)
- ECS Fargate (API containers)
- S3 + CloudFront (web hosting)

**DevOps:**
- Yarn 4 workspaces (monorepo)
- Docker Compose (local dev)
- GitHub Actions (CI/CD)
- Infisical (secrets management)

## 📂 Structure

```
template-typescript-fullstack/
├── apps/
│   ├── web/              # React frontend (Vite + Tailwind)
│   └── api/              # Fastify backend
├── packages/
│   ├── db/               # Prisma schemas, client, seed data
│   └── shared/           # Shared types, validation, config
├── infra/                # Pulumi infrastructure (AWS)
├── docker-compose.yml    # Local Postgres 17 + Redis
└── package.json          # Monorepo root (Yarn workspaces)
```

## 🎯 Use Cases

- **Paired Vibe-Coding**: Perfect for prototyping with candidates
- **Hackathons**: Fast setup, full-stack ready in minutes
- **MVPs**: Production-ready patterns from day one
- **Internal Tools**: CRUD apps with type-safe API + UI

## 📖 Documentation

- [SETUP.md](./SETUP.md) - Step-by-step setup guide
- [CLAUDE.md](./CLAUDE.md) - Agent collaboration workflow
- [SECRETS.md](./SECRETS.md) - Secrets management with Infisical
- [packages/db/README.md](./packages/db/README.md) - Database patterns
- [apps/api/README.md](./apps/api/README.md) - API documentation
- [apps/web/README.md](./apps/web/README.md) - Frontend guide

## 🛠️ Commands

### Development
- `yarn dev` - Start all services (API + Web)
- `yarn dev:api` - Start API only
- `yarn dev:web` - Start Web only
- `yarn docker:up` - Start Postgres + Redis
- `yarn docker:down` - Stop containers
- `yarn docker:logs` - View container logs

### Database
- `yarn db:generate` - Generate Prisma client
- `yarn db:migrate` - Run database migrations
- `yarn db:studio` - Open Prisma Studio (GUI)
- `yarn db:seed` - Seed test data

### Quality (Zero-Tolerance Policies)
- `yarn validate:all` - Run all validations (must pass!)
- `yarn type-check` - TypeScript compilation
- `yarn lint:check` - ESLint (max 0 warnings)
- `yarn test` - All tests (95%+ coverage)
- `yarn type-coverage` - Type coverage (95%+)

### Infrastructure
- `yarn infra:preview` - Preview infrastructure changes
- `yarn infra:up` - Deploy to AWS
- `yarn infra:destroy` - Destroy infrastructure

## 🔒 Quality Standards

**Zero-Tolerance Policies:**
- ✅ 0 TypeScript errors
- ✅ 0 ESLint warnings
- ✅ 95%+ type coverage
- ✅ 80%+ test coverage
- ✅ All tests passing

These are enforced via:
- Pre-commit hooks (type-check, lint, test)
- CI/CD validation
- Quality thresholds stored in Infisical (no silent relaxation)

## 🤖 Agent Collaboration

This template follows the **5-Step Agentic Workflow** (see CLAUDE.md):

1. **Collaborate on Objectives** - Discuss features
2. **Agree on Implementation** - Plan architecture
3. **Claude Handles Dev** - Agent writes/tests code, delivers 100% clean
4. **User Handles Deployment** - User manages environments
5. **Review Together** - Both review results

## 📄 License

MIT - Built for 100% agentic development by AdaptiveWorX
