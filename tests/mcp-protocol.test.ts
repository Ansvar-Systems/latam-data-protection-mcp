import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../src/index.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'data', 'database.db');

let instance: ReturnType<typeof createServer>;

beforeAll(() => {
  instance = createServer(DB_PATH);
});

afterAll(() => {
  instance.close();
});

describe('MCP protocol', () => {
  it('createServer returns server, db, getTools, callTool, close', () => {
    expect(instance.server).toBeDefined();
    expect(instance.db).toBeDefined();
    expect(instance.getTools).toBeTypeOf('function');
    expect(instance.callTool).toBeTypeOf('function');
    expect(instance.close).toBeTypeOf('function');
  });

  it('getTools returns 10 tool definitions', () => {
    const tools = instance.getTools();
    expect(tools).toHaveLength(10);

    const toolNames = tools.map((t: any) => t.name);
    expect(toolNames).toContain('search_provisions');
    expect(toolNames).toContain('get_provision');
    expect(toolNames).toContain('compare_requirements');
    expect(toolNames).toContain('get_data_subject_rights');
    expect(toolNames).toContain('get_breach_notification_rules');
    expect(toolNames).toContain('get_cross_border_transfer_rules');
    expect(toolNames).toContain('get_dpa_info');
    expect(toolNames).toContain('list_sources');
    expect(toolNames).toContain('about');
    expect(toolNames).toContain('check_data_freshness');
  });

  it('each tool definition has name, description, and inputSchema', () => {
    const tools = instance.getTools();
    for (const tool of tools) {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe('object');
    }
  });

  it('callTool("about", {}) returns valid response', () => {
    const result = instance.callTool('about', {}) as any;
    expect(result.name).toBe('latam-data-protection-mcp');
    expect(result.version).toBeTruthy();
    expect(result._meta).toBeDefined();
  });

  it('callTool throws for unknown tool', () => {
    expect(() => instance.callTool('nonexistent_tool', {})).toThrow('Unknown tool');
  });

  it('check_data_freshness returns source freshness data', () => {
    const result = instance.callTool('check_data_freshness', {}) as any;
    expect(result.stale_threshold_days).toBe(90);
    expect(result.total_sources).toBe(7);
    expect(result.sources).toHaveLength(7);
    expect(result.countries).toBeDefined();
    expect(result.countries.length).toBeGreaterThan(0);
  });

  it('get_cross_border_transfer_rules returns results for BR', () => {
    const result = instance.callTool('get_cross_border_transfer_rules', {
      country: 'BR',
    }) as any;
    expect(result).toBeDefined();
    expect(result._meta).toBeDefined();
  });

  it('get_dpa_info returns DPA information for BR', () => {
    const result = instance.callTool('get_dpa_info', { country: 'BR' }) as any;
    expect(result).toBeDefined();
    expect(result._meta).toBeDefined();
  });
});
