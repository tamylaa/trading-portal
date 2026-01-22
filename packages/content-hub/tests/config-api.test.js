/**
 * Configuration API Tests
 */

import {
  getConfiguration,
  updateConfiguration,
  resetConfiguration,
  getConfigurationSection,
  updateConfigurationSection,
  validateConfiguration,
  exportConfiguration,
  importConfiguration,
  subscribeToConfigurationChanges,
  getConfigurationSchema
} from '../src/config-api';

describe('Configuration API', () => {
  beforeEach(() => {
    // Reset configuration before each test
    resetConfiguration();
  });

  test('getConfiguration returns default configuration', () => {
    const config = getConfiguration();
    expect(config).toBeDefined();
    expect(config.api).toBeDefined();
    expect(config.ui).toBeDefined();
    expect(config.behavior).toBeDefined();
  });

  test('updateConfiguration merges with existing config', () => {
    const updates = {
      api: {
        baseURL: 'https://test.example.com',
        timeout: 10000
      }
    };

    updateConfiguration(updates);
    const config = getConfiguration();

    expect(config.api.baseURL).toBe('https://test.example.com');
    expect(config.api.timeout).toBe(10000);
    // Other defaults should remain
    expect(config.ui.showUpload).toBeDefined();
  });

  test('resetConfiguration restores defaults', () => {
    // Update config
    updateConfiguration({
      api: { baseURL: 'https://modified.example.com' }
    });

    // Reset
    resetConfiguration();
    const config = getConfiguration();

    // Should be back to defaults
    expect(config.api.baseURL).not.toBe('https://modified.example.com');
  });

  test('getConfigurationSection returns specific section', () => {
    const apiConfig = getConfigurationSection('api');
    expect(apiConfig.baseURL).toBeDefined();
    expect(apiConfig.timeout).toBeDefined();
  });

  test('updateConfigurationSection updates specific section', () => {
    updateConfigurationSection('api', { baseURL: 'https://section.example.com' });
    const apiConfig = getConfigurationSection('api');
    expect(apiConfig.baseURL).toBe('https://section.example.com');
  });

  test('validateConfiguration validates API settings', () => {
    // Valid config
    const validResult = validateConfiguration({
      api: { baseURL: 'https://valid.example.com', timeout: 5000 }
    });
    expect(validResult.valid).toBe(true);

    // Invalid config
    const invalidResult = validateConfiguration({
      api: { baseURL: 'invalid-url', timeout: 999999 }
    });
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });

  test('exportConfiguration returns JSON string', () => {
    const json = exportConfiguration();
    expect(typeof json).toBe('string');

    const parsed = JSON.parse(json);
    expect(parsed.api).toBeDefined();
  });

  test('importConfiguration imports valid JSON', () => {
    const testConfig = {
      api: { baseURL: 'https://import.example.com' }
    };
    const json = JSON.stringify(testConfig);

    const result = importConfiguration(json);
    expect(result.success).toBe(true);

    const config = getConfiguration();
    expect(config.api.baseURL).toBe('https://import.example.com');
  });

  test('importConfiguration rejects invalid JSON', () => {
    const result = importConfiguration('invalid json');
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('subscribeToConfigurationChanges notifies subscribers', () => {
    let notifiedConfig = null;
    const callback = (config) => {
      notifiedConfig = config;
    };

    const unsubscribe = subscribeToConfigurationChanges(callback);

    updateConfiguration({
      api: { baseURL: 'https://notify.example.com' }
    });

    expect(notifiedConfig).toBeDefined();
    expect(notifiedConfig.api.baseURL).toBe('https://notify.example.com');

    unsubscribe();
  });

  test('getConfigurationSchema returns schema object', () => {
    const schema = getConfigurationSchema();
    expect(schema.api).toBeDefined();
    expect(schema.ui).toBeDefined();
    expect(schema.api.properties.baseURL).toBeDefined();
  });
});