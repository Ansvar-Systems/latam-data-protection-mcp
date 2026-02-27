import type Database from '@ansvar/mcp-sqlite';
import { COUNTRY_NAMES, type CountryCode, daysSince, toIsoDate } from './common.js';
import { buildMeta } from '../utils/metadata.js';

export function checkDataFreshness(db: Database) {
  const sources = db.prepare(`
    SELECT id, jurisdiction, last_fetched, last_updated, item_count
    FROM sources
    ORDER BY jurisdiction
  `).all() as Array<{
    id: string;
    jurisdiction: string;
    last_fetched: string | null;
    last_updated: string | null;
    item_count: number;
  }>;

  const now = new Date();
  const STALE_THRESHOLD_DAYS = 90;

  const freshness = sources.map((source) => {
    const age = daysSince(source.last_fetched, now);
    return {
      source_id: source.id,
      jurisdiction: source.jurisdiction,
      last_fetched: source.last_fetched,
      last_updated: source.last_updated,
      item_count: source.item_count,
      age_days: age,
      is_stale: age !== null && age > STALE_THRESHOLD_DAYS,
    };
  });

  const staleSources = freshness.filter((s) => s.is_stale);

  const laws = db.prepare(`
    SELECT country_code, COUNT(*) AS law_count,
           MAX(last_updated) AS newest_update
    FROM laws
    GROUP BY country_code
    ORDER BY country_code
  `).all() as Array<{
    country_code: string;
    law_count: number;
    newest_update: string | null;
  }>;

  const countryFreshness = laws.map((row) => ({
    country_code: row.country_code,
    country_name: COUNTRY_NAMES[row.country_code as CountryCode] ?? row.country_code,
    law_count: row.law_count,
    newest_update: row.newest_update,
    age_days: daysSince(row.newest_update, now),
  }));

  return {
    checked_at: toIsoDate(now),
    stale_threshold_days: STALE_THRESHOLD_DAYS,
    stale_count: staleSources.length,
    total_sources: sources.length,
    sources: freshness,
    countries: countryFreshness,
    _metadata: buildMeta(),
  };
}
