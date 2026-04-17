import type Database from '@ansvar/mcp-sqlite';
import { clampLimit, buildFtsQuery } from './common.js';
import { buildMeta } from '../utils/metadata.js';

export interface SearchProvisionsInput {
  query: string;
  country?: string;
  topic?: string;
  limit?: number;
}

export function searchProvisions(db: Database, input: SearchProvisionsInput) {
  const limit = clampLimit(input.limit);
  const ftsQuery = buildFtsQuery(input.query);

  if (!ftsQuery) {
    return {
      query: input.query,
      count: 0,
      results: [],
      _meta: buildMeta(),
      message: 'Query is empty or contains only special characters.',
    };
  }

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
    _meta: buildMeta(),
  };
}
