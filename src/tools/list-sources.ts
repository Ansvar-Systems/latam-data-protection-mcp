import type Database from '@ansvar/mcp-sqlite';
import { buildMeta } from '../utils/metadata.js';

export function listSources(db: Database) {
  const sources = db.prepare(`
    SELECT id, full_name, authority, jurisdiction, source_url,
           last_fetched, last_updated, item_count
    FROM sources
    ORDER BY jurisdiction
  `).all();

  const lawCount = (db.prepare('SELECT COUNT(*) AS c FROM laws').get() as { c: number }).c;
  const provisionCount = (db.prepare('SELECT COUNT(*) AS c FROM provisions').get() as { c: number }).c;
  const countryCount = (db.prepare('SELECT COUNT(DISTINCT country_code) AS c FROM laws').get() as { c: number }).c;

  return {
    sources,
    totals: {
      countries: countryCount,
      laws: lawCount,
      provisions: provisionCount,
    },
    _meta: buildMeta(),
  };
}
