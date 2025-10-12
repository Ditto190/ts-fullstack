#!/usr/bin/env tsx
/**
 * Feature Search Script
 *
 * Search for features by pattern (domain, entity, or glob)
 * Examples:
 *   yarn feature:search TASK.*
 *   yarn feature:search *.CREATE
 *   yarn feature:search TEAM.MEMBER.*
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

interface Feature {
  id: string;
  domain: string;
  entity: string;
  operation: string;
  qualifiers: string[];
  layers: string[];
  dependencies: string[];
  implements: string[];
  files: string[];
  tests: string[];
}

interface FeatureRegistry {
  version: string;
  generated: string;
  features: Record<string, Feature>;
}

const WORKSPACE_ROOT = process.cwd();

/**
 * Convert glob pattern to regex
 * Supports * as wildcard
 */
function globToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape special chars
    .replace(/\*/g, '.*'); // Convert * to .*

  return new RegExp(`^${escaped}$`);
}

/**
 * Match feature ID against pattern
 */
function matchesPattern(featureId: string, pattern: string): boolean {
  const regex = globToRegex(pattern);
  return regex.test(featureId);
}

/**
 * Format feature for display
 */
function formatFeature(feature: Feature, verbose: boolean): string {
  let output = `\n📦 ${feature.id}`;

  if (verbose) {
    output += `\n   Domain: ${feature.domain}`;
    output += `\n   Entity: ${feature.entity}`;
    output += `\n   Operation: ${feature.operation}`;

    if (feature.qualifiers.length > 0) {
      output += `\n   Qualifiers: ${feature.qualifiers.join(', ')}`;
    }

    if (feature.layers.length > 0) {
      output += `\n   Layers: ${feature.layers.join(', ')}`;
    }

    if (feature.dependencies.length > 0) {
      output += `\n   Dependencies:`;
      for (const dep of feature.dependencies) {
        output += `\n     - ${dep}`;
      }
    }

    if (feature.implements.length > 0) {
      output += `\n   Implements:`;
      for (const impl of feature.implements) {
        output += `\n     - ${impl}`;
      }
    }

    if (feature.files.length > 0) {
      output += `\n   Files:`;
      for (const file of feature.files) {
        output += `\n     - ${file}`;
      }
    }

    if (feature.tests.length > 0) {
      output += `\n   Tests:`;
      for (const test of feature.tests) {
        output += `\n     - ${test}`;
      }
    }
  }

  return output;
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: yarn feature:search <pattern> [--verbose]');
    console.log('');
    console.log('Examples:');
    console.log('  yarn feature:search TASK.*           # All TASK domain features');
    console.log('  yarn feature:search *.CREATE         # All CREATE operations');
    console.log('  yarn feature:search TEAM.MEMBER.*    # All TEAM.MEMBER features');
    console.log('  yarn feature:search AUTH.* --verbose # Verbose output');
    console.log('');
    process.exit(0);
  }

  const pattern = args[0];
  const verbose = args.includes('--verbose') || args.includes('-v');

  // Load features.json
  const registryPath = join(WORKSPACE_ROOT, 'features.json');
  let registry: FeatureRegistry;

  try {
    const content = await readFile(registryPath, 'utf-8');
    registry = JSON.parse(content) as FeatureRegistry;
  } catch (error) {
    console.error('❌ Could not load features.json. Run `yarn feature:sync` first.');
    process.exit(1);
  }

  // Search features
  const matches: Feature[] = [];

  for (const feature of Object.values(registry.features)) {
    if (matchesPattern(feature.id, pattern)) {
      matches.push(feature);
    }
  }

  // Display results
  console.log(`🔍 Searching for: ${pattern}`);
  console.log(`📊 Found ${matches.length} matching feature${matches.length === 1 ? '' : 's'}`);

  if (matches.length === 0) {
    console.log('');
    console.log('Try broader patterns:');
    console.log('  - Use * as wildcard (e.g., TASK.*)');
    console.log('  - Search by operation (e.g., *.CREATE)');
    console.log('  - List all features: yarn feature:search *');
    console.log('');
    process.exit(0);
  }

  // Sort by ID
  matches.sort((a, b) => a.id.localeCompare(b.id));

  for (const feature of matches) {
    console.log(formatFeature(feature, verbose));
  }

  console.log('');
}

main().catch((error: unknown) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
