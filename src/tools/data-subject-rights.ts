import type Database from '@ansvar/mcp-sqlite';
import { COUNTRY_NAMES, type CountryCode } from './common.js';
import { buildMeta } from '../utils/metadata.js';
import { buildCitation } from '../utils/citation.js';

export interface GetDataSubjectRightsInput {
  country: string;
}

export function getDataSubjectRights(db: Database, input: GetDataSubjectRightsInput) {
  const countryCode = input.country.toUpperCase();

  const rights = db.prepare(`
    SELECT id, country_code, right_name, description, legal_basis, exceptions
    FROM data_subject_rights
    WHERE country_code = ?
    ORDER BY right_name
  `).all(countryCode);

  if (rights.length === 0) {
    return {
      found: false,
      country: countryCode,
      country_name: COUNTRY_NAMES[countryCode as CountryCode] ?? countryCode,
      message: `No data subject rights found for ${COUNTRY_NAMES[countryCode as CountryCode] ?? countryCode}.`,
      _metadata: buildMeta(),
    };
  }

  return {
    found: true,
    country: countryCode,
    country_name: COUNTRY_NAMES[countryCode as CountryCode] ?? countryCode,
    rights_count: rights.length,
    rights,
    _citation: buildCitation(
      `${countryCode} Data Subject Rights`,
      `Data subject rights in ${COUNTRY_NAMES[countryCode as CountryCode] ?? countryCode}`,
      'get_data_subject_rights',
      { country: countryCode },
    ),
    _metadata: buildMeta(),
  };
}
