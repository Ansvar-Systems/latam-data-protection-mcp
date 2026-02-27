/**
 * Ingestion script for LATAM data protection legislative texts.
 *
 * Fetches from official government sources and populates the database.
 * Each country module scrapes/parses the official gazette or legal portal.
 *
 * Usage:
 *   npm run ingest                    # Ingest all countries
 *   npm run ingest -- --country BR    # Ingest Brazil only
 *   npm run ingest -- --limit 5       # Limit articles per law (testing)
 *   npm run ingest -- --resume        # Skip already-ingested provisions
 *   npm run ingest -- --dry-run       # Show what would be fetched
 */

const SOURCES: Record<string, { url: string; name: string }> = {
  BR: {
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm',
    name: 'LGPD (Lei 13.709/2018)',
  },
  AR: {
    url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/64790/texact.htm',
    name: 'LPDP (Law 25.326)',
  },
  CO: {
    url: 'https://www.suin-juriscol.gov.co/',
    name: 'Law 1581/2012',
  },
  CL: {
    url: 'https://www.bcn.cl/leychile/',
    name: 'Law 19.628',
  },
  UY: {
    url: 'https://www.impo.com.uy/',
    name: 'Law 18.331',
  },
  MX: {
    url: 'https://www.diputados.gob.mx/LeyesBiblio/',
    name: 'LFPDPPP',
  },
  CR: {
    url: 'https://www.pgrweb.go.cr/',
    name: 'Law 8968',
  },
};

async function main() {
  const args = process.argv.slice(2);
  const countryFlag = args.indexOf('--country');
  const limitFlag = args.indexOf('--limit');
  const dryRun = args.includes('--dry-run');
  const resume = args.includes('--resume');

  const targetCountry = countryFlag >= 0 ? args[countryFlag + 1]?.toUpperCase() : undefined;
  const limit = limitFlag >= 0 ? Number(args[limitFlag + 1]) : undefined;

  const countries = targetCountry ? [targetCountry] : Object.keys(SOURCES);

  console.log('LATAM Data Protection MCP — Ingestion');
  console.log('=====================================');
  console.log(`Countries: ${countries.join(', ')}`);
  console.log(`Limit:     ${limit ?? 'none'}`);
  console.log(`Resume:    ${resume}`);
  console.log(`Dry run:   ${dryRun}`);
  console.log('');

  for (const code of countries) {
    const source = SOURCES[code];
    if (!source) {
      console.error(`Unknown country code: ${code}`);
      continue;
    }

    console.log(`[${code}] ${source.name}`);
    console.log(`  Source: ${source.url}`);

    if (dryRun) {
      console.log('  (dry run — skipping fetch)\n');
      continue;
    }

    // TODO: Implement per-country ingestion modules
    // Each module should:
    // 1. Fetch HTML from the official source
    // 2. Parse articles from the legislative text
    // 3. Insert into the provisions table with proper article_ref and topic tags
    // 4. Update the sources table with last_fetched and item_count
    console.log('  Ingestion not yet implemented. Add seed data to data/seed/\n');
  }

  console.log('Done. Run "npm run build:db" to rebuild the database after adding seed data.');
}

main().catch((err) => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});
