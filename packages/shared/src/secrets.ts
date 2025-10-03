/**
 * SecretManager - Hierarchical secret resolution from Infisical
 *
 * Resolution order (most specific to least specific):
 * 1. App-specific project (INFISICAL_APP_PROJECT_ID)
 * 2. Shared apps project (INFISICAL_APPS_PROJECT_ID)
 * 3. Platform project (INFISICAL_PLATFORM_PROJECT_ID)
 *
 * Falls back to environment variables if Infisical is not configured.
 */

import { InfisicalSDK } from '@infisical/sdk';

export interface SecretManagerConfig {
  appName?: string;
  environment?: string;
}

export class SecretManager {
  private readonly client: InfisicalSDK;
  private readonly projectHierarchy: Array<{ id: string; name: string }>;
  private readonly environment: string;
  private readonly cache: Map<string, string> = new Map();

  constructor(config: SecretManagerConfig = {}) {
    this.environment = config.environment ?? process.env["NODE_ENV"] ?? 'dev';

    // Build project hierarchy (most specific to least specific)
    this.projectHierarchy = [
      {
        id: process.env["INFISICAL_APP_PROJECT_ID"] ?? '',
        name: config.appName !== undefined ? `worx-${config.appName}` : 'app-specific',
      },
      {
        id: process.env["INFISICAL_APPS_PROJECT_ID"] ?? '',
        name: 'worx-apps',
      },
      {
        id: process.env["INFISICAL_PLATFORM_PROJECT_ID"] ?? '',
        name: 'worx-platform',
      },
    ].filter((p) => p.id.length > 0);

    // Initialize Infisical client
    this.client = new InfisicalSDK({
      siteUrl: process.env["INFISICAL_SITE_URL"] ?? 'https://app.infisical.com',
      auth: {
        universalAuth: {
          clientId: process.env["INFISICAL_CLIENT_ID"] ?? '',
          clientSecret: process.env["INFISICAL_CLIENT_SECRET"] ?? '',
        },
      },
    });
  }

  /**
   * Get a secret from Infisical with hierarchical fallback
   * Falls back to process.env if Infisical is not configured
   */
  async getSecret(key: string): Promise<string> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    // Try Infisical hierarchy
    if (this.projectHierarchy.length > 0) {
      for (const project of this.projectHierarchy) {
        try {
          const secret = await this.client.getSecret({
            projectId: project.id,
            environment: this.environment,
            secretName: key,
          });

          const value = secret.secretValue;
          this.cache.set(key, value);
          return value;
        } catch {
          continue; // Try next project
        }
      }
    }

    // Fallback to environment variable
    const envValue = process.env[key];
    if (envValue !== undefined) {
      this.cache.set(key, envValue);
      return envValue;
    }

    throw new Error(
      `Secret "${key}" not found in Infisical projects or environment variables`
    );
  }

  /**
   * Get a secret or return a default value
   */
  async getSecretOrDefault(key: string, defaultValue: string): Promise<string> {
    try {
      return await this.getSecret(key);
    } catch {
      return defaultValue;
    }
  }

  /**
   * Get multiple secrets at once
   */
  async getSecrets(keys: string[]): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    await Promise.all(
      keys.map(async (key) => {
        try {
          results[key] = await this.getSecret(key);
        } catch (error) {
          throw new Error(`Failed to get secret "${key}": ${error}`);
        }
      })
    );

    return results;
  }

  /**
   * Health check - verify Infisical connection
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    message: string;
    projects: Array<{ name: string; accessible: boolean }>;
  }> {
    if (this.projectHierarchy.length === 0) {
      return {
        status: 'degraded',
        message: 'No Infisical projects configured, using environment variables only',
        projects: [],
      };
    }

    const projectStatus = await Promise.all(
      this.projectHierarchy.map(async (project) => {
        try {
          // Try to fetch a test secret (or any secret)
          await this.client.listSecrets({
            projectId: project.id,
            environment: this.environment,
          });
          return { name: project.name, accessible: true };
        } catch {
          return { name: project.name, accessible: false };
        }
      })
    );

    const allAccessible = projectStatus.every((p) => p.accessible);
    const someAccessible = projectStatus.some((p) => p.accessible);

    if (allAccessible) {
      return {
        status: 'healthy',
        message: 'All Infisical projects accessible',
        projects: projectStatus,
      };
    } else if (someAccessible) {
      return {
        status: 'degraded',
        message: 'Some Infisical projects not accessible',
        projects: projectStatus,
      };
    } else {
      return {
        status: 'unhealthy',
        message: 'No Infisical projects accessible',
        projects: projectStatus,
      };
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get current environment
   */
  getEnvironment(): string {
    return this.environment;
  }

  /**
   * Get project hierarchy
   */
  getProjectHierarchy(): Array<{ id: string; name: string }> {
    return this.projectHierarchy;
  }
}

/**
 * Singleton instance for convenience
 */
let defaultInstance: SecretManager | null = null;

export function getSecretManager(config?: SecretManagerConfig): SecretManager {
  if (defaultInstance === null || config !== undefined) {
    defaultInstance = new SecretManager(config);
  }
  return defaultInstance;
}
