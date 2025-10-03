/**
 * Secret management for local development and CI/CD
 *
 * LOCAL DEVELOPMENT:
 * - Use Infisical CLI: `infisical login` then `infisical export > .env.dev`
 * - Or use env-aliases.sh: `source scripts/env-aliases.sh && env-refresh dev`
 * - Secrets are loaded from .env.{env} files (gitignored)
 *
 * CI/CD:
 * - Uses Infisical SDK with machine identity (INFISICAL_CLIENT_ID, INFISICAL_CLIENT_SECRET)
 * - Secrets fetched directly from Infisical API
 */

export class SecretManager {
  /**
   * Get a secret from environment variables
   * In local dev, these come from .env.{env} files synced via Infisical CLI
   * In CI/CD, extend this to fetch from Infisical SDK with machine identity
   */
  getSecret(key: string): string {
    const value = process.env[key];
    if (value === undefined || value === "") {
      throw new Error(
        `Secret '${key}' not found. ` +
          `Local dev: Run 'source scripts/env-aliases.sh && env-refresh dev'. ` +
          `CI/CD: Set INFISICAL_CLIENT_ID and INFISICAL_CLIENT_SECRET.`
      );
    }
    return value;
  }

  /**
   * Get a secret with a default fallback
   */
  getSecretOrDefault(key: string, defaultValue: string): string {
    const value = process.env[key];
    return value !== undefined && value !== "" ? value : defaultValue;
  }

  /**
   * Check if a secret exists
   */
  hasSecret(key: string): boolean {
    const value = process.env[key];
    return value !== undefined && value !== "";
  }
}

// Singleton instance
export const secretManager = new SecretManager();
