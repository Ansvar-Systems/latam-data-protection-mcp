import type Database from '@ansvar/mcp-sqlite';
import { COUNTRY_NAMES, type CountryCode } from './common.js';
import { buildMeta } from '../utils/metadata.js';
import { buildCitation } from '../utils/citation.js';

export interface GetProvisionInput {
  country: string;
  article: string;
}

export function getProvision(db: Database, input: GetProvisionInput) {
  const countryCode = input.country.toUpperCase();

  const row = db.prepare(`
    SELECT p.id, p.country_code, p.law_id, p.article_ref, p.title,
           p.content, p.topic,
           l.title AS law_title, l.official_name, l.year, l.status, l.source_url
    FROM provisions p
    JOIN laws l ON l.id = p.law_id
    WHERE p.country_code = ? AND p.article_ref = ?
  `).get(countryCode, input.article);

  if (!row) {
    return {
      found: false,
      country: countryCode,
      article: input.article,
      message: `No provision found for article ${input.article} in ${COUNTRY_NAMES[countryCode as CountryCode] ?? countryCode}.`,
      _meta: buildMeta(),
    };
  }

  const r = row as Record<string, unknown>;
  return {
    found: true,
    provision: row,
    _citation: buildCitation(
      `${input.country.toUpperCase()} ${input.article}`,
      String(r.title ?? `${COUNTRY_NAMES[countryCode as CountryCode] ?? countryCode} ${input.article}`),
      'get_provision',
      { country: input.country.toUpperCase(), article: input.article },
    ),
    _meta: buildMeta(),
  };
}
