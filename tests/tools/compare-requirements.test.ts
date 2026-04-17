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

describe('compare_requirements', () => {
  it('compares BR and AR on "consent" and returns results for both', () => {
    const result = instance.callTool('compare_requirements', {
      countries: ['BR', 'AR'],
      topic: 'consent',
    }) as any;
    expect(result.topic).toBe('consent');
    expect(result.countries_compared).toBe(2);
    expect(result.comparison).toHaveLength(2);

    const brEntry = result.comparison.find((c: any) => c.country_code === 'BR');
    const arEntry = result.comparison.find((c: any) => c.country_code === 'AR');
    expect(brEntry).toBeDefined();
    expect(arEntry).toBeDefined();
    expect(brEntry.country_name).toBe('Brazil');
    expect(arEntry.country_name).toBe('Argentina');
  });

  it('compares all 7 countries on "consent"', () => {
    const result = instance.callTool('compare_requirements', {
      countries: ['BR', 'AR', 'CO', 'CL', 'UY', 'MX', 'CR'],
      topic: 'consent',
    }) as any;
    expect(result.countries_compared).toBe(7);
    expect(result.comparison).toHaveLength(7);
  });

  it('returns empty provisions for a non-matching topic', () => {
    const result = instance.callTool('compare_requirements', {
      countries: ['BR', 'AR'],
      topic: 'nonexistent_topic_xyz',
    }) as any;
    expect(result.countries_compared).toBe(2);
    for (const entry of result.comparison) {
      expect(entry.provision_count).toBe(0);
    }
  });

  it('includes _meta in response', () => {
    const result = instance.callTool('compare_requirements', {
      countries: ['BR', 'AR'],
      topic: 'consent',
    }) as any;
    expect(result._meta).toBeDefined();
  });
});
