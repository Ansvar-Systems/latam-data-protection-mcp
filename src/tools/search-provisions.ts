import type Database from '@ansvar/mcp-sqlite';
import { clampLimit, escapeFTS5Query, toIsoDate } from './common.js';

export interface SearchProvisionsInput {
  query: string;
  country?: string;
  topic?: string;
  limit?: number;
}

export function searchProvisions(db: Database, input: SearchProvisionsInput) {
  const limit = clampLimit(input.limit);
  const ftsQuery = escapeFTS5Query(input.query);

  let sql = `
    SELECT p.id, p.country_code, p.law_id, p.article_ref, p.title,
           snippet(provisions_fts, 0, '>>>', '<<<', '...', 48) AS snippet,
           rank
    FROM provisions_fts
    JOIN provisions p ON p.id = provisions_fts.rowid
    WHERE provisions_fts MATCH ?
  `;
  const params: unknown[] = [ftsQuery];

  if (input.country) {
    sql += ' AND p.country_code = ?';
    params.push(input.country.toUpperCase());
  }
  if (input.topic) {
    sql += ' AND p.topic = ?';
    params.push(input.topic);
  }

  sql += ' ORDER BY rank LIMIT ?';
  params.push(limit);

  const rows = db.prepare(sql).all(...params);
  return {
    query: input.query,
    count: rows.length,
    results: rows,
    _meta: {
      disclaimer: 'Reference tool only. Not legal advice. Verify against official gazettes.',
      data_age: toIsoDate(),
    },
  };
}
