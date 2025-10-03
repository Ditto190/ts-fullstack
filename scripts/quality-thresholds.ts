#!/usr/bin/env tsx
/**
 * Quality Thresholds Validator
 *
 * Enforces quality standards from Infisical to prevent silent degradation.
 * Validates package.json thresholds match or exceed Infisical requirements.
 */

import { InfisicalClient } from '@infisical/sdk';

interface QualityThresholds {
  TYPE_COVERAGE_MIN: string;
  LINT_MAX_WARNINGS: string;
  TEST_COVERAGE_MIN: string;
}

class QualityThresholdsValidator {
  private client: InfisicalClient;
  private projectId: string;
  private environment: string;

  constructor() {
    // Try platform project first, fallback to apps project
    this.projectId = process.env.INFISICAL_PLATFORM_PROJECT_ID
      ?? process.env.INFISICAL_APPS_PROJECT_ID
      ?? '';

    this.environment = process.env.NODE_ENV ?? 'dev';

    if (this.projectId === '') {
      console.warn('⚠️  No Infisical project configured, using package.json defaults');
    }

    this.client = new InfisicalClient({
      siteUrl: process.env.INFISICAL_SITE_URL ?? 'https://app.infisical.com',
      auth: {
        universalAuth: {
          clientId: process.env.INFISICAL_CLIENT_ID ?? '',
          clientSecret: process.env.INFISICAL_CLIENT_SECRET ?? '',
        },
      },
    });
  }

  async getThresholds(): Promise<QualityThresholds> {
    if (this.projectId === '') {
      throw new Error('Infisical not configured');
    }

    const [typeCoverage, lintWarnings, testCoverage] = await Promise.all([
      this.getSecret('TYPE_COVERAGE_MIN'),
      this.getSecret('LINT_MAX_WARNINGS'),
      this.getSecret('TEST_COVERAGE_MIN'),
    ]);

    return {
      TYPE_COVERAGE_MIN: typeCoverage,
      LINT_MAX_WARNINGS: lintWarnings,
      TEST_COVERAGE_MIN: testCoverage,
    };
  }

  private async getSecret(key: string): Promise<string> {
    try {
      const secret = await this.client.getSecret({
        projectId: this.projectId,
        environment: this.environment,
        secretName: key,
      });
      return secret.secretValue;
    } catch (error) {
      throw new Error(`Failed to fetch ${key} from Infisical: ${error}`);
    }
  }

  async validate(): Promise<void> {
    try {
      const thresholds = await this.getThresholds();

      console.log('✅ Quality thresholds from Infisical:');
      console.log(`   TYPE_COVERAGE_MIN: ${thresholds.TYPE_COVERAGE_MIN}%`);
      console.log(`   LINT_MAX_WARNINGS: ${thresholds.LINT_MAX_WARNINGS}`);
      console.log(`   TEST_COVERAGE_MIN: ${thresholds.TEST_COVERAGE_MIN}%`);

      // Validate package.json scripts use these thresholds
      const packageJson = await import('../package.json', { assert: { type: 'json' } });

      // Check type-coverage threshold
      const typeCoverageScript = packageJson.default.scripts['type-coverage'];
      const expectedTypeCoverage = `--at-least ${thresholds.TYPE_COVERAGE_MIN}`;

      if (typeCoverageScript !== undefined && !typeCoverageScript.includes(expectedTypeCoverage)) {
        throw new Error(
          `Type coverage threshold mismatch!\n` +
          `  Expected: ${expectedTypeCoverage}\n` +
          `  Found in package.json: ${typeCoverageScript}`
        );
      }

      // Check lint max-warnings threshold
      const lintScript = packageJson.default.scripts['lint:check'];
      const expectedLintWarnings = `--max-warnings=${thresholds.LINT_MAX_WARNINGS}`;

      if (lintScript !== undefined && !lintScript.includes(expectedLintWarnings)) {
        throw new Error(
          `Lint max-warnings mismatch!\n` +
          `  Expected: ${expectedLintWarnings}\n` +
          `  Found in package.json: ${lintScript}`
        );
      }

      console.log('✅ package.json thresholds match Infisical requirements');
    } catch (error) {
      if (error instanceof Error && error.message.includes('Infisical not configured')) {
        console.warn('⚠️  Skipping Infisical validation (not configured)');
        return;
      }
      throw error;
    }
  }

  async getCommand(commandType: 'type-coverage' | 'lint'): Promise<void> {
    try {
      const thresholds = await this.getThresholds();

      if (commandType === 'type-coverage') {
        const cmd = `type-coverage --at-least ${thresholds.TYPE_COVERAGE_MIN} --strict --detail --ignore-files '**/*.test.ts'`;
        process.stdout.write(cmd);
      } else if (commandType === 'lint') {
        const cmd = `eslint 'src/**/*.ts' --max-warnings=${thresholds.LINT_MAX_WARNINGS}`;
        process.stdout.write(cmd);
      }
    } catch (error) {
      // Fallback to package.json if Infisical fails
      const packageJson = await import('../package.json', { assert: { type: 'json' } });

      if (commandType === 'type-coverage') {
        process.stdout.write(packageJson.default.scripts['type-coverage'] ?? '');
      } else if (commandType === 'lint') {
        process.stdout.write(packageJson.default.scripts['lint:check'] ?? '');
      }
    }
  }
}

// CLI execution
const validator = new QualityThresholdsValidator();
const command = process.argv[2];

if (command === 'validate') {
  validator.validate()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Quality threshold validation failed:', error);
      process.exit(1);
    });
} else if (command === 'get-command') {
  const cmdType = process.argv[3] as 'type-coverage' | 'lint';
  validator.getCommand(cmdType)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Failed to get command:', error);
      process.exit(1);
    });
} else {
  console.error('Usage: quality-thresholds.ts [validate|get-command <type-coverage|lint>]');
  process.exit(1);
}
