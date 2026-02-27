import type Database from '@ansvar/mcp-sqlite';
import { COUNTRY_NAMES, type CountryCode } from './common.js';
import { buildMeta } from '../utils/metadata.js';

export interface GetCrossBorderTransferRulesInput {
  country: string;
}

export function getCrossBorderTransferRules(db: Database, input: GetCrossBorderTransferRulesInput) {
  const countryCode = input.country.toUpperCase();

  const rules = db.prepare(`
    SELECT country_code, adequacy_mechanism, transfer_mechanisms,
           restrictions, notes
    FROM cross_border_rules
    WHERE country_code = ?
  `).get(countryCode);

  if (!rules) {
    return {
      found: false,
      country: countryCode,
      country_name: COUNTRY_NAMES[countryCode as CountryCode] ?? countryCode,
      message: `No cross-border transfer rules found for ${COUNTRY_NAMES[countryCode as CountryCode] ?? countryCode}.`,
      _meta: buildMeta(),
    };
  }

  return {
    found: true,
    country: countryCode,
    country_name: COUNTRY_NAMES[countryCode as CountryCode] ?? countryCode,
    rules,
    _meta: buildMeta(),
  };
}
