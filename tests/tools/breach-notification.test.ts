import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../../src/index.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', '..', 'data', 'database.db');

let instance: ReturnType<typeof createServer>;

beforeAll(() => {
  instance = createServer(DB_PATH);
});

afterAll(() => {
  instance.close();
});

describe('get_breach_notification_rules', () => {
  it('returns breach notification rules for Brazil with timeline and authority', () => {
    const result = instance.callTool('get_breach_notification_rules', {
      country: 'BR',
    }) as any;
    expect(result.found).toBe(true);
    expect(result.country).toBe('BR');
    expect(result.country_name).toBe('Brazil');
    expect(result.rules).toBeDefined();
    expect(result.rules.authority).toBeTruthy();
    expect(result.rules.timeline).toBeTruthy();
  });

  it('returns rules for all 7 countries', () => {
    const countries = ['BR', 'AR', 'CO', 'CL', 'UY', 'MX', 'CR'];
    for (const country of countries) {
      const result = instance.callTool('get_breach_notification_rules', {
        country,
      }) as any;
      expect(result.found).toBe(true);
      expect(result.country).toBe(country);
      expect(result.rules).toBeDefined();
    }
  });

  it('returns not-found for an invalid country code', () => {
    const result = instance.callTool('get_breach_notification_rules', {
      country: 'ZZ',
    }) as any;
    expect(result.found).toBe(false);
  });
});
