import { toIsoDate } from '../tools/common.js';

export interface ResponseMeta {
  disclaimer: string;
  data_age: string;
  server: string;
  version: string;
}

const DISCLAIMER =
  'Reference tool only. Not legal advice. Verify against official gazettes and consult qualified legal counsel.';

export function buildMeta(overrides?: Partial<ResponseMeta>): ResponseMeta {
  return {
    disclaimer: DISCLAIMER,
    data_age: toIsoDate(),
    server: 'latam-data-protection-mcp',
    version: '0.1.0',
    ...overrides,
  };
}
