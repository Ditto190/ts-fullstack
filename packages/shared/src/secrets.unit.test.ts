import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SecretManager } from './secrets';

describe('SecretManager', () => {
  beforeEach(() => {
    // Clear environment variables
    delete process.env.INFISICAL_APP_PROJECT_ID;
    delete process.env.INFISICAL_APPS_PROJECT_ID;
    delete process.env.INFISICAL_PLATFORM_PROJECT_ID;
    delete process.env.INFISICAL_CLIENT_ID;
    delete process.env.INFISICAL_CLIENT_SECRET;
    delete process.env.TEST_SECRET;
  });

  describe('constructor', () => {
    it('should initialize with default environment', () => {
      const sm = new SecretManager();
      expect(sm.getEnvironment()).toBe('dev');
    });

    it('should use provided environment', () => {
      const sm = new SecretManager({ environment: 'prod' });
      expect(sm.getEnvironment()).toBe('prod');
    });

    it('should build project hierarchy from environment variables', () => {
      process.env.INFISICAL_PLATFORM_PROJECT_ID = 'platform-123';
      process.env.INFISICAL_APPS_PROJECT_ID = 'apps-456';

      const sm = new SecretManager();
      const hierarchy = sm.getProjectHierarchy();

      expect(hierarchy).toHaveLength(2);
      expect(hierarchy[0]?.name).toBe('worx-apps');
      expect(hierarchy[1]?.name).toBe('worx-platform');
    });
  });

  describe('getSecret', () => {
    it('should fallback to environment variable when Infisical not configured', async () => {
      process.env.TEST_SECRET = 'test-value';

      const sm = new SecretManager();
      const value = await sm.getSecret('TEST_SECRET');

      expect(value).toBe('test-value');
    });

    it('should throw error when secret not found', async () => {
      const sm = new SecretManager();

      await expect(sm.getSecret('NONEXISTENT_SECRET')).rejects.toThrow(
        'Secret "NONEXISTENT_SECRET" not found'
      );
    });

    it('should cache secret values', async () => {
      process.env.TEST_SECRET = 'test-value';

      const sm = new SecretManager();
      const value1 = await sm.getSecret('TEST_SECRET');

      // Change env var (should still return cached value)
      process.env.TEST_SECRET = 'new-value';
      const value2 = await sm.getSecret('TEST_SECRET');

      expect(value1).toBe('test-value');
      expect(value2).toBe('test-value');
    });

    it('should clear cache', async () => {
      process.env.TEST_SECRET = 'test-value';

      const sm = new SecretManager();
      await sm.getSecret('TEST_SECRET');

      sm.clearCache();
      process.env.TEST_SECRET = 'new-value';

      const value = await sm.getSecret('TEST_SECRET');
      expect(value).toBe('new-value');
    });
  });

  describe('getSecretOrDefault', () => {
    it('should return default when secret not found', async () => {
      const sm = new SecretManager();
      const value = await sm.getSecretOrDefault('NONEXISTENT', 'default-value');

      expect(value).toBe('default-value');
    });

    it('should return secret when found', async () => {
      process.env.TEST_SECRET = 'test-value';

      const sm = new SecretManager();
      const value = await sm.getSecretOrDefault('TEST_SECRET', 'default-value');

      expect(value).toBe('test-value');
    });
  });

  describe('getSecrets', () => {
    it('should get multiple secrets', async () => {
      process.env.SECRET_1 = 'value-1';
      process.env.SECRET_2 = 'value-2';

      const sm = new SecretManager();
      const secrets = await sm.getSecrets(['SECRET_1', 'SECRET_2']);

      expect(secrets).toEqual({
        SECRET_1: 'value-1',
        SECRET_2: 'value-2',
      });
    });

    it('should throw error if any secret fails', async () => {
      process.env.SECRET_1 = 'value-1';

      const sm = new SecretManager();

      await expect(sm.getSecrets(['SECRET_1', 'NONEXISTENT'])).rejects.toThrow();
    });
  });

  describe('healthCheck', () => {
    it('should return degraded status when no projects configured', async () => {
      const sm = new SecretManager();
      const health = await sm.healthCheck();

      expect(health.status).toBe('degraded');
      expect(health.message).toContain('No Infisical projects configured');
    });
  });
});
