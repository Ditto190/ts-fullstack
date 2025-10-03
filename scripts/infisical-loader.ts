#!/usr/bin/env tsx
/**
 * Infisical Loader - Bootstrap environment with secrets using Infisical CLI
 *
 * Prerequisites:
 *   brew install infisical
 *   infisical login  # One-time GitHub SSO auth
 *
 * Usage:
 *   yarn infisical:load                    # Load to .env.local
 *   yarn infisical:load --env=dev          # Specific environment
 *   yarn infisical:load --show             # Show secrets (don't write)
 *   yarn infisical:load --project=worx-apps # Specific project slug
 *   yarn infisical:load --validate         # Check CLI and auth status
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

interface LoaderOptions {
  environment: string;
  show: boolean;
  output: string;
  project: string;
  validate: boolean;
}

function parseArgs(): LoaderOptions {
  const args = process.argv.slice(2);

  const options: LoaderOptions = {
    environment: process.env.NODE_ENV ?? 'dev',
    show: false,
    output: '.env.local',
    project: process.env.INFISICAL_PROJECT_SLUG ?? 'worx-apps',
    validate: false,
  };

  for (const arg of args) {
    if (arg.startsWith('--env=')) {
      options.environment = arg.split('=')[1] ?? 'dev';
    } else if (arg === '--show') {
      options.show = true;
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1] ?? '.env.local';
    } else if (arg.startsWith('--project=')) {
      options.project = arg.split('=')[1] ?? 'worx-apps';
    } else if (arg === '--validate') {
      options.validate = true;
    }
  }

  return options;
}

function checkInfisicalCLI(): void {
  try {
    execSync('which infisical', { stdio: 'ignore' });
  } catch {
    console.error('❌ Infisical CLI not found');
    console.error('\nInstall with:');
    console.error('  brew install infisical');
    console.error('\nThen login:');
    console.error('  infisical login');
    process.exit(1);
  }
}

function checkInfisicalAuth(): void {
  try {
    execSync('infisical whoami', { stdio: 'ignore' });
  } catch {
    console.error('❌ Not logged into Infisical');
    console.error('\nLogin with GitHub SSO:');
    console.error('  infisical login');
    console.error('\nYour session will be cached locally.');
    process.exit(1);
  }
}

function loadSecrets(options: LoaderOptions): void {
  console.log(`🔐 Loading secrets from Infisical...`);
  console.log(`   Project: ${options.project}`);
  console.log(`   Environment: ${options.environment}\n`);

  try {
    // Use Infisical CLI to export secrets
    const cmd = `infisical export --env=${options.environment} --projectId=${options.project} --format=dotenv`;
    const output = execSync(cmd, { encoding: 'utf-8' });

    if (options.show) {
      console.log('📋 Secrets (showing values):\n');
      console.log(output);
    } else {
      const envPath = resolve(process.cwd(), options.output);
      writeFileSync(envPath, output, 'utf-8');

      const secretCount = output.split('\n').filter((line) => line.length > 0 && !line.startsWith('#')).length;

      console.log(`✅ ${secretCount} secrets loaded to ${options.output}`);
      console.log(`\nTo load into your shell:`);
      console.log(`  source ${options.output}`);
      console.log(`  # or`);
      console.log(`  export $(cat ${options.output} | xargs)`);
    }
  } catch (error) {
    if (error instanceof Error && 'stderr' in error) {
      const stderr = (error as { stderr: Buffer }).stderr.toString();

      if (stderr.includes('project not found') || stderr.includes('project does not exist')) {
        console.error(`❌ Project "${options.project}" not found`);
        console.error('\nList available projects:');
        console.error('  infisical projects list');
      } else if (stderr.includes('environment not found')) {
        console.error(`❌ Environment "${options.environment}" not found in project "${options.project}"`);
        console.error('\nAvailable environments: dev, stg, prd, sec');
      } else {
        console.error('❌ Error loading secrets:', stderr);
      }
    } else {
      console.error('❌ Error loading secrets:', error);
    }
    process.exit(1);
  }
}

function validateSetup(): void {
  console.log('🔍 Validating Infisical setup...\n');

  checkInfisicalCLI();
  console.log('✅ Infisical CLI installed');

  checkInfisicalAuth();

  try {
    const whoami = execSync('infisical whoami', { encoding: 'utf-8' }).trim();
    console.log(`✅ Authenticated: ${whoami}`);
  } catch {
    console.log('✅ Authenticated (session active)');
  }

  console.log('\n✅ Infisical setup validated');
  console.log('\nTo load secrets:');
  console.log('  yarn infisical:load');
  console.log('  yarn infisical:load --project=worx-apps --env=dev');
}

async function main(): Promise<void> {
  const options = parseArgs();

  if (options.validate) {
    validateSetup();
    return;
  }

  // Check prerequisites
  checkInfisicalCLI();
  checkInfisicalAuth();

  // Load secrets
  loadSecrets(options);
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
