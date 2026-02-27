import type Database from '@ansvar/mcp-sqlite';
import { COUNTRY_NAMES, type CountryCode } from './common.js';
import { buildMeta } from '../utils/metadata.js';

export interface CompareRequirementsInput {
  countries: string[];
  topic: string;
}

export function compareRequirements(db: Database, input: CompareRequirementsInput) {
  const countryCodes = input.countries.map((c) => c.toUpperCase());

  const placeholders = countryCodes.map(() => '?').join(', ');
  const rows = db.prepare(`
    SELECT p.country_code, p.article_ref, p.title, p.content, p.topic,
           l.title AS law_title, l.year
    FROM provisions p
    JOIN laws l ON l.id = p.law_id
    WHERE p.country_code IN (${placeholders})
      AND p.topic = ?
    ORDER BY p.country_code, p.article_ref
  `).all(...countryCodes, input.topic);

  const grouped: Record<string, unknown[]> = {};
  for (const row of rows as Array<{ country_code: string }>) {
    const code = row.country_code;
    if (!grouped[code]) grouped[code] = [];
    grouped[code].push(row);
  }

  const comparison = countryCodes.map((code) => ({
    country_code: code,
    country_name: COUNTRY_NAMES[code as CountryCode] ?? code,
    provisions: grouped[code] ?? [],
    provision_count: (grouped[code] ?? []).length,
  }));

  return {
    topic: input.topic,
    countries_compared: countryCodes.length,
    comparison,
    _meta: buildMeta(),
  };
}
