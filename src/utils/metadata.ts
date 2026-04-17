/**
 * Response envelope metadata (`_meta`) — conforms to Golden Standard §4.9b.
 *
 * Watchdog (scripts/mcp-watchdog.sh:~410) asserts:
 *   - `_meta.disclaimer` is non-empty
 *   - `_meta.data_age` matches ISO 8601 (YYYY-MM-DD...)
 *
 * Historical note: this MCP previously emitted `_metadata: buildMeta()` with
 * a different shape (data_freshness object, ai_disclosure, server, version).
 * Renamed to `_meta` and simplified to match the canonical contract used
 * across the law + agriculture fleets.
 */

export interface MetaEnvelope {
  disclaimer: string;
  data_age: string;
  source_url?: string;
  source_authority?: string;
  jurisdiction?: string;
}

const DATA_AGE = '2026-02-27';

const DISCLAIMER =
  'Reference tool only. Not legal advice. Verify against official gazettes and consult qualified legal counsel.';

const SOURCE_AUTHORITY =
  'Official government legal portals: planalto.gov.br, infoleg.gob.ar, funcionpublica.gov.co, bcn.cl, impo.com.uy, diputados.gob.mx, pgrweb.go.cr';

export function buildMeta(): MetaEnvelope {
  return {
    disclaimer: DISCLAIMER,
    data_age: DATA_AGE,
    source_authority: SOURCE_AUTHORITY,
    jurisdiction: 'LATAM',
  };
}
