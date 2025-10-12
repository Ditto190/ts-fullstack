#!/usr/bin/env tsx
/**
 * Feature Sync Script
 *
 * Scans the codebase for @feature headers and generates features.json registry.
 * Ensures single source of truth: code annotations drive the registry.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

interface FeatureHeader {
  id: string;
  domain: string;
  entity: string;
  operation: string;
  qualifiers: string[];
  layer?: string;
  dependencies: string[];
  implements: string[];
  tests: string[];
  filePath: string;
  lineNumber: number;
}

interface FeatureRegistry {
  version: string;
  generated: string;
  features: Record<string, {
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
  }>;
}

const WORKSPACE_ROOT = process.cwd();
const SCAN_DIRS = ['apps', 'packages'];
const IGNORE_DIRS = ['node_modules', 'dist', '.turbo', 'coverage'];
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

/**
 * Recursively scan directory for TypeScript/JavaScript files
 */
async function* scanFiles(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.includes(entry.name)) {
        yield* scanFiles(fullPath);
      }
    } else if (entry.isFile()) {
      const ext = entry.name.substring(entry.name.lastIndexOf('.'));
      if (FILE_EXTENSIONS.includes(ext)) {
        yield fullPath;
      }
    }
  }
}

/**
 * Parse @feature header from file content
 *
 * Expected format:
 * /**
 *  * @feature DOMAIN.ENTITY.OPERATION[.QUALIFIER]*
 *  * @domain DOMAIN
 *  * @entity ENTITY
 *  * @operation OPERATION
 *  * @layer API|DB|UI|AGENT
 *  * @dependencies [FEATURE_ID, FEATURE_ID]
 *  * @implements
 *  *   - Implementation detail 1
 *  *   - Implementation detail 2
 *  * @tests
 *  *   - Test description 1
 *  *   - Test description 2
 *  *\/
 */
function parseFeatureHeaders(content: string, filePath: string): FeatureHeader[] {
  const headers: FeatureHeader[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Look for @feature annotation
    const featureMatch = line.match(/@feature\s+([A-Z]+(?:\.[A-Z]+)+)/);
    if (!featureMatch) continue;

    const featureId = featureMatch[1];
    const parts = featureId.split('.');

    const header: FeatureHeader = {
      id: featureId,
      domain: parts[0] || '',
      entity: parts[1] || '',
      operation: parts[2] || '',
      qualifiers: parts.slice(3),
      dependencies: [],
      implements: [],
      tests: [],
      filePath,
      lineNumber: i + 1,
    };

    // Parse subsequent lines for additional metadata
    let j = i + 1;
    let currentSection: 'implements' | 'tests' | null = null;

    while (j < lines.length && (lines[j].includes('*') || lines[j].trim().startsWith('//'))) {
      const metaLine = lines[j];

      // Check for @layer
      const layerMatch = metaLine.match(/@layer\s+(\w+)/);
      if (layerMatch) {
        header.layer = layerMatch[1];
      }

      // Check for @dependencies
      const depsMatch = metaLine.match(/@dependencies\s+\[(.*?)\]/);
      if (depsMatch) {
        header.dependencies = depsMatch[1]
          .split(',')
          .map(d => d.trim())
          .filter(d => d.length > 0);
      }

      // Check for section headers
      if (metaLine.includes('@implements')) {
        currentSection = 'implements';
        j++;
        continue;
      }

      if (metaLine.includes('@tests')) {
        currentSection = 'tests';
        j++;
        continue;
      }

      // Parse list items (- Item text)
      const listItemMatch = metaLine.match(/[*\/]\s*-\s+(.+)/);
      if (listItemMatch && currentSection) {
        header[currentSection].push(listItemMatch[1].trim());
      }

      // Stop at end of comment block
      if (metaLine.includes('*/') || (!metaLine.includes('*') && !metaLine.trim().startsWith('//'))) {
        break;
      }

      j++;
    }

    headers.push(header);
  }

  return headers;
}

/**
 * Build feature registry from parsed headers
 */
function buildRegistry(headers: FeatureHeader[]): FeatureRegistry {
  const features: FeatureRegistry['features'] = {};

  for (const header of headers) {
    if (!features[header.id]) {
      features[header.id] = {
        id: header.id,
        domain: header.domain,
        entity: header.entity,
        operation: header.operation,
        qualifiers: header.qualifiers,
        layers: [],
        dependencies: header.dependencies,
        implements: [...header.implements],
        files: [],
        tests: [],
      };
    }

    const feature = features[header.id];

    // Add layer if specified
    if (header.layer && !feature.layers.includes(header.layer)) {
      feature.layers.push(header.layer);
    }

    // Add file path
    const relativePath = relative(WORKSPACE_ROOT, header.filePath);
    if (!feature.files.includes(relativePath)) {
      feature.files.push(relativePath);
    }

    // Merge dependencies (deduplicate)
    for (const dep of header.dependencies) {
      if (!feature.dependencies.includes(dep)) {
        feature.dependencies.push(dep);
      }
    }

    // Merge implements list
    for (const impl of header.implements) {
      if (!feature.implements.includes(impl)) {
        feature.implements.push(impl);
      }
    }

    // Merge tests list
    for (const test of header.tests) {
      if (!feature.tests.includes(test)) {
        feature.tests.push(test);
      }
    }
  }

  return {
    version: '1.0.0',
    generated: new Date().toISOString(),
    features,
  };
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('🔍 Scanning codebase for @feature headers...\n');

  const allHeaders: FeatureHeader[] = [];
  let fileCount = 0;

  for (const dir of SCAN_DIRS) {
    const scanPath = join(WORKSPACE_ROOT, dir);

    for await (const filePath of scanFiles(scanPath)) {
      fileCount++;
      const content = await readFile(filePath, 'utf-8');
      const headers = parseFeatureHeaders(content, filePath);

      if (headers.length > 0) {
        const relativePath = relative(WORKSPACE_ROOT, filePath);
        console.log(`  ✓ ${relativePath} (${headers.length} feature${headers.length === 1 ? '' : 's'})`);
        allHeaders.push(...headers);
      }
    }
  }

  console.log(`\n📊 Scanned ${fileCount} files, found ${allHeaders.length} feature headers\n`);

  if (allHeaders.length === 0) {
    console.log('⚠️  No @feature headers found. Add @feature comments to your code.');
    console.log('   Example:');
    console.log('   /**');
    console.log('    * @feature USER.PROFILE.UPDATE');
    console.log('    * @domain USER');
    console.log('    * @entity PROFILE');
    console.log('    * @operation UPDATE');
    console.log('    * @layer API');
    console.log('    */');
    process.exit(0);
  }

  // Build registry
  const registry = buildRegistry(allHeaders);

  // Write features.json
  const registryPath = join(WORKSPACE_ROOT, 'features.json');
  await writeFile(registryPath, JSON.stringify(registry, null, 2) + '\n');

  console.log('✅ Generated features.json\n');
  console.log(`   Features: ${Object.keys(registry.features).length}`);
  console.log(`   Domains: ${new Set(Object.values(registry.features).map(f => f.domain)).size}`);
  console.log(`   Layers: ${new Set(Object.values(registry.features).flatMap(f => f.layers)).size}`);
  console.log('');
}

main().catch((error: unknown) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
