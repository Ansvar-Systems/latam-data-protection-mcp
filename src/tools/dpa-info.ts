import type Database from '@ansvar/mcp-sqlite';
import { COUNTRY_NAMES, type CountryCode } from './common.js';
import { buildMeta } from '../utils/metadata.js';

export interface GetDpaInfoInput {
  country: string;
}

export function getDpaInfo(db: Database, input: GetDpaInfoInput) {
  const countryCode = input.country.toUpperCase();

  const dpa = db.prepare(`
    SELECT country_code, name, full_name, website,
           enforcement_powers, contact_email
    FROM dpa_authorities
    WHERE country_code = ?
  `).get(countryCode);

  if (!dpa) {
    return {
      found: false,
      country: countryCode,
      country_name: COUNTRY_NAMES[countryCode as CountryCode] ?? countryCode,
      message: `No DPA information found for ${COUNTRY_NAMES[countryCode as CountryCode] ?? countryCode}.`,
      _meta: buildMeta(),
    };
  }

  return {
    found: true,
    country: countryCode,
    country_name: COUNTRY_NAMES[countryCode as CountryCode] ?? countryCode,
    authority: dpa,
    _meta: buildMeta(),
  };
}
