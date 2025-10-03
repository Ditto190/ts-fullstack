# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Type: TypeScript Library

**Template**: `template-typescript-lib`
**Purpose**: Reusable TypeScript library/package (no infrastructure)
**Target**: npm/yarn packages, shared utilities, SDKs

## Collaboration Workflow

**IMPORTANT**: Claude and the user follow a structured collaboration workflow:

### The 5-Step Process
1. **Collaborate on Objectives** - Discuss and agree on library features/API
2. **Agree on Implementation** - Decide on architecture, exported modules, public API
3. **Claude Handles Dev/Test** - Claude writes/tests TypeScript code and ensures 100% clean code:
   - **Recommend Tests** - Suggest appropriate tests (unit, integration)
   - **Discuss Test Strategy** - Collaborate with user on what should be tested
   - Write tests and implementation code
   - Run `yarn build` - Fix ALL compilation errors
   - Run `yarn lint:check` - Fix ALL linter errors and warnings
   - Run `yarn test` - Fix ALL failing tests
   - Run `yarn type-coverage` - Ensure 98.5%+ type coverage
   - **Deliver 100% clean code** - No errors, no warnings, all tests passing
4. **User Handles Publishing** - User manages versioning, npm publishing, releases
5. **Review Together** - Both review exported API, documentation, examples

### What Claude Should NOT Do
- **DO NOT** run `npm publish` or `yarn publish` - user handles releases
- **DO NOT** modify version in package.json without approval
- **DO NOT** skip ahead to publishing without completing steps 1-3
- **DO NOT** leave ANY compilation errors, linter warnings, or failing tests

### What Claude SHOULD Do
- Write and test all TypeScript library code
- Recommend and discuss appropriate test strategies
- Run builds, linters, and tests to validate code quality
- Fix ALL errors and warnings - we're agentic, we deliver 100% clean code
- Present commands/options for user to run
- Ask "Should I proceed with X?" before major actions
- Stop after step 3 and wait for user to handle publishing

## Essential Commands

### Build & Validation
```bash
yarn build              # TypeScript compilation
yarn build:watch        # Watch mode for development
yarn type-check         # Type checking without emit
yarn type-coverage      # Verify 98.5%+ type coverage
yarn lint:check         # ESLint validation (must pass in CI)
yarn validate:all       # Run all validation checks
```

### Testing
```bash
yarn test               # Run all Vitest tests
yarn test:watch         # Watch mode for development
yarn test:unit          # Unit tests only
yarn test:integration   # Integration tests only
yarn test:coverage      # Generate coverage report
yarn test:ui            # Interactive test UI
```

### Quality Enforcement
```bash
yarn quality:validate       # Validate package.json thresholds against Infisical
yarn quality:type-coverage  # Run type-coverage with enforced Infisical threshold
yarn quality:lint           # Run lint with enforced Infisical max-warnings
```

**IMPORTANT**: Quality thresholds are enforced via Infisical parameters to prevent silent relaxation:
- `TYPE_COVERAGE_MIN`: 98.5% (minimum type coverage in strict mode)
- `LINT_MAX_WARNINGS`: 0 (zero-warning policy)
- `TEST_COVERAGE_MIN`: 80% (unit test coverage)

Agents and developers cannot lower thresholds in `package.json` without CI failing. To adjust thresholds:
1. Update values in Infisical (requires admin access)
2. Run validation to propagate
3. Update package.json to match new thresholds
4. CI validates package.json matches or exceeds Infisical requirements

## Architecture Overview

### Library Structure
```
src/
  index.ts              # Main entry point (public API)
  core/                 # Core functionality
    *.ts
    *.unit.test.ts      # Co-located unit tests
  utils/                # Utility functions
    *.ts
    *.unit.test.ts
  types/                # Type definitions
    *.ts
tests/
  integration/          # Integration tests
  fixtures/             # Test data
  utils/                # Test utilities
```

### Exports Pattern
```typescript
// src/index.ts - Clean public API
export { functionA, functionB } from './core/module-a';
export { UtilityClass } from './utils/helper';
export type { PublicType, PublicInterface } from './types';

// Internal implementation stays private
```

## Important Patterns

### TypeScript Strict Boolean Expressions

**Rule**: `@typescript-eslint/strict-boolean-expressions` - **ALWAYS** use explicit comparisons

**Why This Matters**: Truthy/falsy checks can hide bugs. Empty strings (`""`), zero (`0`), and `false` are all falsy, but may be valid values.

**Common Patterns:**

```typescript
// ❌ WRONG - Truthy/falsy checks (will cause lint errors)
if (value) { ... }
if (!value) { ... }
const x = value || default;

// ✅ CORRECT - Explicit comparisons
if (value !== undefined) { ... }
if (value !== null) { ... }
if (value.length > 0) { ... }  // Non-empty string/array
const x = value ?? default;    // Nullish coalescing

// Map.get() returns undefined if key doesn't exist
const mapValue = map.get(key);
if (mapValue !== undefined) { ... }  // ✅ Explicit check required

// Optional object properties
if ('propertyName' in object) { ... }  // ✅ Check property exists
if (object.optionalProp !== undefined) { ... }  // ✅ Also valid
```

**First-Time-Right Pattern:**
- **Strings**: Use `!== ""` or `.length > 0`
- **Numbers**: Use `!== 0` or `> 0`
- **Objects/Map results**: Use `!== undefined` or `!== null`
- **Optional fields**: Use `'key' in obj` or `?? default`
- **Nullish coalescing**: Prefer `??` over `||` for default values

### Testing Pattern
All modules use co-located tests:
```typescript
// src/core/calculator.ts
export function add(a: number, b: number): number {
  return a + b;
}

// src/core/calculator.unit.test.ts (co-located)
import { describe, it, expect } from 'vitest';
import { add } from './calculator';

describe('Calculator', () => {
  it('should add two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
});
```

### Validation Pattern
All inputs use Zod for runtime validation:
```typescript
import { z } from 'zod';

const InputSchema = z.object({
  name: z.string().min(1),
  age: z.number().positive(),
});

export function processInput(input: unknown): Result {
  const validated = InputSchema.parse(input); // Throws on invalid
  // ... process validated input
}
```

## Known Issues & Workarounds

1. **Infisical not configured**: Falls back to package.json thresholds
2. **Type coverage below threshold**: Use `yarn type-coverage --detail` to find untyped code

## Testing Specific Components
```bash
# Test a specific file
npx vitest run src/core/module.unit.test.ts

# Test with pattern matching
yarn vitest run --testNamePattern="specific test"

# Debug test failures
yarn vitest --reporter=verbose
```

## Pre-Publish Checklist
Before publishing to npm:
1. Run `yarn validate:all` - Must pass
2. Run `yarn build` - TypeScript must compile
3. Run `yarn test:coverage` - Check coverage thresholds
4. Update version in package.json (user approval)
5. Update CHANGELOG.md
6. User runs `yarn publish`

## Quality Standards

### Type Safety
- **98.5%+ type coverage** - Enforced by CI
- **Explicit return types** - All functions must declare return types
- **No `any` types** - Use `unknown` and narrow with type guards
- **Strict null checks** - Always handle undefined/null explicitly

### Testing
- **Co-located tests** - `*.unit.test.ts` next to source
- **Integration tests** - Cross-module tests in `tests/integration/`
- **80%+ coverage** - Enforced by CI
- **Test naming** - Descriptive `it('should ...')` format

### Code Quality
- **Zero warnings** - Linter must pass with 0 warnings
- **Prettier formatted** - Consistent code style
- **Named exports** - Prefer named exports over default
- **Single responsibility** - Each module has one clear purpose

---

**Remember**: We deliver 100% clean code. No shortcuts, no "TODO" comments in production, no skipped tests.
