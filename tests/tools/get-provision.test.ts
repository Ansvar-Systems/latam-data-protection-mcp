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

describe('get_provision', () => {
  it('returns a valid provision for Brazil article "1"', () => {
    const result = instance.callTool('get_provision', {
      country: 'BR',
      article: '1',
    }) as any;
    expect(result.found).toBe(true);
    expect(result.provision).toBeDefined();
    expect(result.provision.country_code).toBe('BR');
    expect(result.provision.article_ref).toBe('1');
    expect(result.provision.content).toBeTruthy();
  });

  it('returns not-found for a non-existent provision', () => {
    const result = instance.callTool('get_provision', {
      country: 'BR',
      article: 'Art. 9999',
    }) as any;
    expect(result.found).toBe(false);
    expect(result.message).toContain('No provision found');
  });

  it('returns not-found for an invalid country code', () => {
    const result = instance.callTool('get_provision', {
      country: 'ZZ',
      article: '1',
    }) as any;
    expect(result.found).toBe(false);
    expect(result.message).toContain('No provision found');
  });

  it('includes _metadata in response', () => {
    const result = instance.callTool('get_provision', {
      country: 'BR',
      article: '1',
    }) as any;
    expect(result._metadata).toBeDefined();
    expect(result._metadata.disclaimer).toBeTruthy();
  });
});
