/**
 * Check for updates to LATAM data protection legislation.
 *
 * Compares last_fetched dates in the database against current date
 * and flags sources that need re-ingestion.
 *
 * Usage:
 *   npm run check-updates
 */

import Database from '@ansvar/mcp-sqlite';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'data', 'database.db');

const STALE_DAYS = 30;

function main() {
  const db = new Database(DB_PATH, { readonly: true });

  const sources = db.prepare(`
    SELECT id, full_name, jurisdiction, last_fetched, item_count
    FROM sources
    ORDER BY jurisdiction
  `).all() as Array<{
    id: string;
    full_name: string;
    jurisdiction: string;
    last_fetched: string | null;
    item_count: number;
  }>;

  const now = Date.now();

  console.log('LATAM Data Protection MCP — Update Check');
  console.log('=========================================\n');

  let staleCount = 0;

  for (const source of sources) {
    const age = source.last_fetched
      ? Math.floor((now - Date.parse(source.last_fetched)) / 86_400_000)
      : null;

    const status =
      age === null ? 'NEVER FETCHED' :
      age > STALE_DAYS ? `STALE (${age} days)` :
      `OK (${age} days)`;

    if (age === null || age > STALE_DAYS) staleCount++;

    console.log(`[${source.id}] ${source.jurisdiction} — ${source.full_name}`);
    console.log(`  Items: ${source.item_count} | Last fetched: ${source.last_fetched ?? 'never'} | ${status}`);
    console.log('');
  }

  console.log(`\n${staleCount} of ${sources.length} sources need attention.`);

  db.close();
}

main();
