#!/usr/bin/env tsx
/**
 * Feature Validation Script
 *
 * Validates that:
 * 1. All @feature headers are properly formatted
 * 2. Feature dependencies exist
 * 3. No circular dependencies
 * 4. Feature IDs follow taxonomy rules
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

interface ValidationError {
  type: 'format' | 'dependency' | 'circular' | 'taxonomy';
  file: string;
  line: number;
  featureId: string;
  message: string;
}

interface TaxonomyDefinition {
  version: string;
  domains: Record<string, { description: string; examples: string[] }>;
  operations: Record<string, { description: string; examples: string[]; restricted?: string[] }>;
  qualifiers: Record<string, { description: string; examples: string[] }>;
}

const WORKSPACE_ROOT = process.cwd();
const SCAN_DIRS = ['apps', 'packages'];
const IGNORE_DIRS = ['node_modules', 'dist', '.turbo', 'coverage'];
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

/**
 * Load taxonomy definition from feature-taxonomy.json
 */
async function loadTaxonomy(): Promise<TaxonomyDefinition> {
  const taxonomyPath = join(WORKSPACE_ROOT, 'feature-taxonomy.json');
  const content = await readFile(taxonomyPath, 'utf-8');
  return JSON.parse(content) as TaxonomyDefinition;
}

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
 * Extract all @feature IDs and their dependencies from a file
 */
function extractFeatures(
  content: string,
  filePath: string,
): Array<{ id: string; line: number; dependencies: string[] }> {
  const features: Array<{ id: string; line: number; dependencies: string[] }> = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const featureMatch = line.match(/@feature\s+([A-Z]+(?:\.[A-Z]+)+)/);

    if (!featureMatch) continue;

    const featureId = featureMatch[1];
    const dependencies: string[] = [];

    // Look for @dependencies in subsequent lines
    let j = i + 1;
    while (j < lines.length && (lines[j].includes('*') || lines[j].trim().startsWith('//'))) {
      const depsMatch = lines[j].match(/@dependencies\s+\[(.*?)\]/);
      if (depsMatch) {
        dependencies.push(
          ...depsMatch[1]
            .split(',')
            .map(d => d.trim())
            .filter(d => d.length > 0),
        );
        break;
      }
      if (lines[j].includes('*/') || !lines[j].includes('*')) break;
      j++;
    }

    features.push({
      id: featureId,
      line: i + 1,
      dependencies,
    });
  }

  return features;
}

/**
 * Validate feature ID taxonomy
 */
function validateTaxonomy(
  featureId: string,
  filePath: string,
  line: number,
  taxonomy: TaxonomyDefinition,
): ValidationError | null {
  const parts = featureId.split('.');

  // Must have at least DOMAIN.ENTITY.OPERATION
  if (parts.length < 3) {
    return {
      type: 'taxonomy',
      file: filePath,
      line,
      featureId,
      message: `Feature ID must have at least 3 parts: DOMAIN.ENTITY.OPERATION (got ${parts.length})`,
    };
  }

  const [domain, entity, operation, ...qualifiers] = parts;

  // Validate domain
  if (!taxonomy.domains[domain]) {
    const validDomains = Object.keys(taxonomy.domains).join(', ');
    return {
      type: 'taxonomy',
      file: filePath,
      line,
      featureId,
      message: `Invalid domain '${domain}'. Valid domains: ${validDomains}`,
    };
  }

  // Validate entity (must be non-empty, uppercase)
  if (!entity || entity !== entity.toUpperCase()) {
    return {
      type: 'taxonomy',
      file: filePath,
      line,
      featureId,
      message: `Entity must be non-empty and uppercase (got '${entity}')`,
    };
  }

  // Validate operation
  const operationDef = taxonomy.operations[operation];
  if (!operationDef) {
    const validOperations = Object.keys(taxonomy.operations).join(', ');
    return {
      type: 'taxonomy',
      file: filePath,
      line,
      featureId,
      message: `Invalid operation '${operation}'. Valid operations: ${validOperations}`,
    };
  }

  // Check if operation is restricted to certain domains
  if (operationDef.restricted && !operationDef.restricted.includes(domain)) {
    return {
      type: 'taxonomy',
      file: filePath,
      line,
      featureId,
      message: `Operation '${operation}' is restricted to domains: ${operationDef.restricted.join(', ')}`,
    };
  }

  // Validate qualifiers (optional, but must be uppercase if present)
  for (const qualifier of qualifiers) {
    if (qualifier !== qualifier.toUpperCase()) {
      return {
        type: 'taxonomy',
        file: filePath,
        line,
        featureId,
        message: `Qualifier must be uppercase (got '${qualifier}')`,
      };
    }
  }

  return null;
}

/**
 * Detect circular dependencies using DFS
 */
function detectCircularDependencies(
  featureGraph: Map<string, string[]>,
): Array<{ cycle: string[] }> {
  const cycles: Array<{ cycle: string[] }> = [];
  const visited = new Set<string>();
  const recStack = new Set<string>();

  function dfs(featureId: string, path: string[]): void {
    visited.add(featureId);
    recStack.add(featureId);

    const deps = featureGraph.get(featureId) || [];
    for (const dep of deps) {
      if (!visited.has(dep)) {
        dfs(dep, [...path, dep]);
      } else if (recStack.has(dep)) {
        // Found a cycle
        const cycleStart = path.indexOf(dep);
        const cycle = path.slice(cycleStart);
        cycles.push({ cycle });
      }
    }

    recStack.delete(featureId);
  }

  for (const featureId of featureGraph.keys()) {
    if (!visited.has(featureId)) {
      dfs(featureId, [featureId]);
    }
  }

  return cycles;
}

/**
 * Main validation
 */
async function main(): Promise<void> {
  console.log('🔍 Validating @feature headers...\n');

  // Load taxonomy definition
  const taxonomy = await loadTaxonomy();

  const errors: ValidationError[] = [];
  const allFeatures = new Map<string, { file: string; line: number; dependencies: string[] }>();
  let fileCount = 0;

  // Scan all files
  for (const dir of SCAN_DIRS) {
    const scanPath = join(WORKSPACE_ROOT, dir);

    for await (const filePath of scanFiles(scanPath)) {
      fileCount++;
      const content = await readFile(filePath, 'utf-8');
      const features = extractFeatures(content, filePath);

      for (const feature of features) {
        const relativePath = relative(WORKSPACE_ROOT, filePath);

        // Validate taxonomy
        const taxonomyError = validateTaxonomy(feature.id, relativePath, feature.line, taxonomy);
        if (taxonomyError) {
          errors.push(taxonomyError);
        }

        // Store for dependency validation
        allFeatures.set(feature.id, {
          file: relativePath,
          line: feature.line,
          dependencies: feature.dependencies,
        });
      }
    }
  }

  console.log(`📊 Scanned ${fileCount} files, found ${allFeatures.size} features\n`);

  // Validate dependencies exist
  for (const [featureId, data] of allFeatures.entries()) {
    for (const depId of data.dependencies) {
      if (!allFeatures.has(depId)) {
        errors.push({
          type: 'dependency',
          file: data.file,
          line: data.line,
          featureId,
          message: `Dependency '${depId}' not found`,
        });
      }
    }
  }

  // Check for circular dependencies
  const featureGraph = new Map(
    Array.from(allFeatures.entries()).map(([id, data]) => [id, data.dependencies]),
  );
  const cycles = detectCircularDependencies(featureGraph);

  for (const { cycle } of cycles) {
    const firstFeature = allFeatures.get(cycle[0]);
    if (firstFeature) {
      errors.push({
        type: 'circular',
        file: firstFeature.file,
        line: firstFeature.line,
        featureId: cycle[0],
        message: `Circular dependency detected: ${cycle.join(' -> ')} -> ${cycle[0]}`,
      });
    }
  }

  // Report errors
  if (errors.length === 0) {
    console.log('✅ All feature headers are valid!\n');
    process.exit(0);
  }

  console.log(`❌ Found ${errors.length} validation error${errors.length === 1 ? '' : 's'}:\n`);

  const groupedErrors = new Map<string, ValidationError[]>();
  for (const error of errors) {
    const key = error.file;
    if (!groupedErrors.has(key)) {
      groupedErrors.set(key, []);
    }
    groupedErrors.get(key)?.push(error);
  }

  for (const [file, fileErrors] of groupedErrors.entries()) {
    console.log(`  ${file}`);
    for (const error of fileErrors) {
      console.log(`    Line ${error.line}: [${error.type}] ${error.message}`);
    }
    console.log('');
  }

  process.exit(1);
}

main().catch((error: unknown) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
