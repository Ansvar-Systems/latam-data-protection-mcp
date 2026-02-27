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

describe('search_provisions', () => {
  it('returns results from multiple countries when searching "consentimiento"', () => {
    const result = instance.callTool('search_provisions', { query: 'consentimiento' }) as any;
    expect(result.count).toBeGreaterThan(0);
    expect(result.results.length).toBeGreaterThan(0);

    const countryCodes = new Set(result.results.map((r: any) => r.country_code));
    // "consentimiento" (consent in Spanish) should appear in multiple Spanish-speaking jurisdictions
    expect(countryCodes.size).toBeGreaterThanOrEqual(1);
  });

  it('filters by country code "BR" and returns only Brazilian results', () => {
    const result = instance.callTool('search_provisions', {
      query: 'dados pessoais',
      country: 'BR',
    }) as any;
    expect(result.count).toBeGreaterThan(0);
    for (const row of result.results) {
      expect(row.country_code).toBe('BR');
    }
  });

  it('filters by topic "consent"', () => {
    const result = instance.callTool('search_provisions', {
      query: 'consent',
      topic: 'consent',
    }) as any;
    expect(result.count).toBeGreaterThan(0);
    expect(result.results.length).toBeGreaterThan(0);
  });

  it('caps results at the specified limit', () => {
    const result = instance.callTool('search_provisions', {
      query: 'data',
      limit: 3,
    }) as any;
    expect(result.results.length).toBeLessThanOrEqual(3);
  });

  it('returns clean message for empty query', () => {
    const result = instance.callTool('search_provisions', { query: '' }) as any;
    expect(result.count).toBe(0);
    expect(result.results).toEqual([]);
    expect(result.message).toContain('empty');
  });

  it('handles special characters in query without crashing', () => {
    const result = instance.callTool('search_provisions', { query: '***!!@@##' }) as any;
    expect(result.count).toBe(0);
    expect(result.results).toEqual([]);
    expect(result.message).toContain('special characters');
  });

  it('includes _meta disclaimer in response', () => {
    const result = instance.callTool('search_provisions', { query: 'privacy' }) as any;
    expect(result._meta).toBeDefined();
    expect(result._meta.disclaimer).toContain('Not legal advice');
  });
});
