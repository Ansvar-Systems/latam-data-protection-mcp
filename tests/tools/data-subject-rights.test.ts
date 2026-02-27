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

describe('get_data_subject_rights', () => {
  it('returns 11 rights for Brazil', () => {
    const result = instance.callTool('get_data_subject_rights', {
      country: 'BR',
    }) as any;
    expect(result.found).toBe(true);
    expect(result.country).toBe('BR');
    expect(result.country_name).toBe('Brazil');
    expect(result.rights_count).toBe(11);
    expect(result.rights).toHaveLength(11);
  });

  it('returns rights for Argentina', () => {
    const result = instance.callTool('get_data_subject_rights', {
      country: 'AR',
    }) as any;
    expect(result.found).toBe(true);
    expect(result.country).toBe('AR');
    expect(result.country_name).toBe('Argentina');
    expect(result.rights_count).toBeGreaterThan(0);
    expect(result.rights.length).toBe(result.rights_count);
  });

  it('returns not-found for an invalid country code', () => {
    const result = instance.callTool('get_data_subject_rights', {
      country: 'ZZ',
    }) as any;
    expect(result.found).toBe(false);
    expect(result.message).toContain('No data subject rights found');
  });

  it('each right has the expected fields', () => {
    const result = instance.callTool('get_data_subject_rights', {
      country: 'BR',
    }) as any;
    for (const right of result.rights) {
      expect(right).toHaveProperty('right_name');
      expect(right).toHaveProperty('description');
      expect(right).toHaveProperty('country_code');
      expect(right.country_code).toBe('BR');
    }
  });
});
