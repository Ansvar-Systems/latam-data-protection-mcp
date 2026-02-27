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

describe('about', () => {
  it('returns server name, version, and jurisdictions', () => {
    const result = instance.callTool('about', {}) as any;
    expect(result.name).toBe('latam-data-protection-mcp');
    expect(result.version).toBe('0.1.0');
    expect(result.jurisdictions).toHaveLength(7);
    expect(result.jurisdictions.map((j: any) => j.code)).toEqual(
      expect.arrayContaining(['BR', 'AR', 'CO', 'CL', 'UY', 'MX', 'CR']),
    );
  });

  it('reports accurate statistics', () => {
    const result = instance.callTool('about', {}) as any;
    expect(result.statistics.countries).toBe(7);
    expect(result.statistics.laws).toBeGreaterThan(0);
    expect(result.statistics.provisions).toBeGreaterThan(0);
  });

  it('lists all 10 tools', () => {
    const result = instance.callTool('about', {}) as any;
    expect(result.tools).toHaveLength(10);
    expect(result.tools).toContain('search_provisions');
    expect(result.tools).toContain('get_provision');
    expect(result.tools).toContain('about');
    expect(result.tools).toContain('check_data_freshness');
  });

  it('includes publisher and license', () => {
    const result = instance.callTool('about', {}) as any;
    expect(result.publisher).toBe('Ansvar Systems AB');
    expect(result.license).toBe('Apache-2.0');
  });
});

describe('list_sources', () => {
  it('returns 7 sources with item counts', () => {
    const result = instance.callTool('list_sources', {}) as any;
    expect(result.sources).toHaveLength(7);
    for (const source of result.sources) {
      expect(source).toHaveProperty('id');
      expect(source).toHaveProperty('full_name');
      expect(source).toHaveProperty('item_count');
      expect(source.item_count).toBeGreaterThan(0);
    }
  });

  it('returns accurate totals', () => {
    const result = instance.callTool('list_sources', {}) as any;
    expect(result.totals.countries).toBe(7);
    expect(result.totals.laws).toBeGreaterThan(0);
    expect(result.totals.provisions).toBeGreaterThan(0);
  });
});
