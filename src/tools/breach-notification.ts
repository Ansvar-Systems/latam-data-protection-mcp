import type Database from '@ansvar/mcp-sqlite';
import { COUNTRY_NAMES, type CountryCode } from './common.js';
import { buildMeta } from '../utils/metadata.js';
import { buildCitation } from '../utils/citation.js';

export interface GetBreachNotificationRulesInput {
  country: string;
}

export function getBreachNotificationRules(db: Database, input: GetBreachNotificationRulesInput) {
  const countryCode = input.country.toUpperCase();

  const rules = db.prepare(`
    SELECT country_code, authority, timeline, threshold,
           data_subject_notification, penalties
    FROM breach_notification_rules
    WHERE country_code = ?
  `).get(countryCode);

  if (!rules) {
    return {
      found: false,
      country: countryCode,
      country_name: COUNTRY_NAMES[countryCode as CountryCode] ?? countryCode,
      message: `No breach notification rules found for ${COUNTRY_NAMES[countryCode as CountryCode] ?? countryCode}.`,
      _meta: buildMeta(),
    };
  }

  return {
    found: true,
    country: countryCode,
    country_name: COUNTRY_NAMES[countryCode as CountryCode] ?? countryCode,
    rules,
    _citation: buildCitation(
      `${countryCode} Breach Notification`,
      `Breach notification rules in ${COUNTRY_NAMES[countryCode as CountryCode] ?? countryCode}`,
      'get_breach_notification_rules',
      { country: countryCode },
    ),
    _meta: buildMeta(),
  };
}
