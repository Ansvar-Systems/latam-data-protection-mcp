import type Database from '@ansvar/mcp-sqlite';
import { COUNTRY_NAMES, type CountryCode } from './common.js';
import { buildMeta } from '../utils/metadata.js';
import { buildCitation } from '../utils/citation.js';

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
      _metadata: buildMeta(),
    };
  }

  return {
    found: true,
    country: countryCode,
    country_name: COUNTRY_NAMES[countryCode as CountryCode] ?? countryCode,
    rules,
    _citation: buildCitation(
      `${countryCode} Cross-Border Transfers`,
      `Cross-border transfer rules in ${COUNTRY_NAMES[countryCode as CountryCode] ?? countryCode}`,
      'get_cross_border_transfer_rules',
      { country: countryCode },
    ),
    _metadata: buildMeta(),
  };
}
