import type Database from '@ansvar/mcp-sqlite';
import { COUNTRIES, COUNTRY_NAMES } from './common.js';
import { buildMeta } from '../utils/metadata.js';

export function about(db: Database) {
  const lawCount = (db.prepare('SELECT COUNT(*) AS c FROM laws').get() as { c: number }).c;
  const provisionCount = (db.prepare('SELECT COUNT(*) AS c FROM provisions').get() as { c: number }).c;
  const countryCount = (db.prepare('SELECT COUNT(DISTINCT country_code) AS c FROM laws').get() as { c: number }).c;

  return {
    name: 'latam-data-protection-mcp',
    version: '0.1.0',
    description:
      'LATAM data protection laws MCP — LGPD, LPDP, Law 1581, and privacy frameworks across 7 Latin American jurisdictions.',
    jurisdictions: COUNTRIES.map((code) => ({
      code,
      name: COUNTRY_NAMES[code],
    })),
    statistics: {
      countries: countryCount,
      laws: lawCount,
      provisions: provisionCount,
    },
    tools: [
      'search_provisions',
      'get_provision',
      'compare_requirements',
      'get_data_subject_rights',
      'get_breach_notification_rules',
      'get_cross_border_transfer_rules',
      'get_dpa_info',
      'list_sources',
      'about',
      'check_data_freshness',
    ],
    publisher: 'Ansvar Systems AB',
    license: 'Apache-2.0',
    repository: 'https://github.com/Ansvar-Systems/latam-data-protection-mcp',
    _metadata: buildMeta(),
  };
}
