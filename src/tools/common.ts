export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 50;
export const COUNTRIES = ['BR', 'AR', 'CO', 'CL', 'UY', 'MX', 'CR'] as const;
export type CountryCode = typeof COUNTRIES[number];
export const COUNTRY_NAMES: Record<CountryCode, string> = {
  BR: 'Brazil',
  AR: 'Argentina',
  CO: 'Colombia',
  CL: 'Chile',
  UY: 'Uruguay',
  MX: 'Mexico',
  CR: 'Costa Rica',
};

export function clampLimit(limit: number | undefined, fallback = DEFAULT_LIMIT): number {
  const value = Number.isFinite(limit) ? Number(limit) : fallback;
  return Math.min(Math.max(Math.trunc(value), 1), MAX_LIMIT);
}

/**
 * Build a robust FTS5 query from user input.
 * - Strips FTS5 special chars
 * - Adds prefix matching (word*) for cross-language partial matching
 * - Returns null for empty/whitespace-only input
 */
export function buildFtsQuery(raw: string): string | null {
  const cleaned = raw
    .replace(/["\*\(\)\{\}\[\]:^~!@#$%&|\\<>=;,]/g, ' ')
    .replace(/\b(AND|OR|NOT|NEAR)\b/gi, '')
    .trim();

  if (!cleaned) return null;

  const tokens = cleaned.split(/\s+/).filter(t => t.length > 0);
  if (tokens.length === 0) return null;

  return tokens.map(t => `"${t}"*`).join(' ');
}

/** @deprecated Use buildFtsQuery instead */
export function escapeFTS5Query(query: string): string {
  return buildFtsQuery(query) ?? '';
}

export function daysSince(dateValue: string | null | undefined, now = new Date()): number | null {
  if (!dateValue) return null;
  const timestamp = Date.parse(dateValue);
  if (Number.isNaN(timestamp)) return null;
  return Math.max(0, Math.floor((now.getTime() - timestamp) / 86_400_000));
}

export function toIsoDate(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
