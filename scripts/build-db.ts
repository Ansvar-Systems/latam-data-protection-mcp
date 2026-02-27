import Database from '@ansvar/mcp-sqlite';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'data', 'database.db');

// Ensure data directory exists
const dataDir = dirname(DB_PATH);
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Remove existing database
if (existsSync(DB_PATH)) {
  unlinkSync(DB_PATH);
}

console.log('Building LATAM Data Protection MCP database...\n');

const db = new Database(DB_PATH);

// Create schema
db.exec(`
  CREATE TABLE laws (
    id TEXT PRIMARY KEY,
    country_code TEXT NOT NULL,
    title TEXT NOT NULL,
    official_name TEXT,
    year INTEGER,
    status TEXT DEFAULT 'in_force',
    source_url TEXT,
    last_updated TEXT
  );

  CREATE TABLE provisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    law_id TEXT NOT NULL REFERENCES laws(id),
    country_code TEXT NOT NULL,
    article_ref TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    topic TEXT,
    UNIQUE(law_id, article_ref)
  );

  CREATE VIRTUAL TABLE provisions_fts USING fts5(
    content, title, article_ref,
    content='provisions', content_rowid='id'
  );

  CREATE TABLE dpa_authorities (
    country_code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    full_name TEXT,
    website TEXT,
    enforcement_powers TEXT,
    contact_email TEXT
  );

  CREATE TABLE breach_notification_rules (
    country_code TEXT PRIMARY KEY,
    authority TEXT NOT NULL,
    timeline TEXT,
    threshold TEXT,
    data_subject_notification INTEGER DEFAULT 0,
    penalties TEXT
  );

  CREATE TABLE data_subject_rights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    country_code TEXT NOT NULL,
    right_name TEXT NOT NULL,
    description TEXT,
    legal_basis TEXT,
    exceptions TEXT
  );

  CREATE TABLE cross_border_rules (
    country_code TEXT PRIMARY KEY,
    adequacy_mechanism TEXT,
    transfer_mechanisms TEXT,
    restrictions TEXT,
    notes TEXT
  );

  CREATE TABLE sources (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    authority TEXT,
    jurisdiction TEXT,
    source_url TEXT,
    last_fetched TEXT,
    last_updated TEXT,
    item_count INTEGER DEFAULT 0
  );

  CREATE TABLE db_metadata (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  -- Indexes for common queries
  CREATE INDEX idx_provisions_country ON provisions(country_code);
  CREATE INDEX idx_provisions_law ON provisions(law_id);
  CREATE INDEX idx_provisions_topic ON provisions(topic);
  CREATE INDEX idx_laws_country ON laws(country_code);
  CREATE INDEX idx_data_subject_rights_country ON data_subject_rights(country_code);
`);

console.log('Schema created.');

// Seed sources (metadata only — no provision data yet)
const insertSource = db.prepare(`
  INSERT INTO sources (id, full_name, authority, jurisdiction, source_url, last_fetched, item_count)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const seedSources = [
  ['br-lgpd', 'Lei Geral de Proteção de Dados (LGPD)', 'ANPD', 'Brazil',
   'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm', null, 0],
  ['ar-lpdp', 'Ley de Protección de Datos Personales (Law 25.326)', 'AAIP', 'Argentina',
   'https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/64790/texact.htm', null, 0],
  ['co-law-1581', 'Ley Estatutaria 1581 de 2012', 'SIC', 'Colombia',
   'https://www.suin-juriscol.gov.co/', null, 0],
  ['cl-law-19628', 'Ley 19.628 sobre Protección de la Vida Privada', 'CPLT', 'Chile',
   'https://www.bcn.cl/leychile/', null, 0],
  ['uy-law-18331', 'Ley 18.331 de Protección de Datos Personales', 'URCDP', 'Uruguay',
   'https://www.impo.com.uy/', null, 0],
  ['mx-lfpdppp', 'Ley Federal de Protección de Datos Personales en Posesión de los Particulares', 'INAI', 'Mexico',
   'https://www.diputados.gob.mx/LeyesBiblio/', null, 0],
  ['cr-law-8968', 'Ley de Protección de la Persona frente al Tratamiento de sus Datos Personales (Law 8968)', 'PRODHAB', 'Costa Rica',
   'https://www.pgrweb.go.cr/', null, 0],
];

for (const source of seedSources) {
  insertSource.run(...source);
}
console.log(`Seeded ${seedSources.length} sources.`);

// Seed DPA authorities
const insertDpa = db.prepare(`
  INSERT INTO dpa_authorities (country_code, name, full_name, website, enforcement_powers, contact_email)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const seedDpas = [
  ['BR', 'ANPD', 'Autoridade Nacional de Proteção de Dados', 'https://www.gov.br/anpd/',
   'Investigations, administrative sanctions, fines up to 2% of revenue (R$50M cap per infraction)', null],
  ['AR', 'AAIP', 'Agencia de Acceso a la Información Pública', 'https://www.argentina.gob.ar/aaip',
   'Investigations, sanctions, database registry oversight', null],
  ['CO', 'SIC', 'Superintendencia de Industria y Comercio', 'https://www.sic.gov.co/',
   'Investigations, fines up to 2,000 minimum wages, database blocking, temporary/permanent closure', null],
  ['CL', 'CPLT', 'Consejo para la Transparencia', 'https://www.consejotransparencia.cl/',
   'Limited enforcement (pending reform); transparency oversight', null],
  ['UY', 'URCDP', 'Unidad Reguladora y de Control de Datos Personales', 'https://www.gub.uy/urcdp/',
   'Investigations, sanctions, database suspension, data processing bans', null],
  ['MX', 'INAI', 'Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales',
   'https://home.inai.org.mx/', 'Investigations, fines, data processing suspension', null],
  ['CR', 'PRODHAB', 'Agencia de Protección de Datos de los Habitantes', 'https://www.prodhab.go.cr/',
   'Investigations, sanctions, database registry', null],
];

for (const dpa of seedDpas) {
  insertDpa.run(...dpa);
}
console.log(`Seeded ${seedDpas.length} DPA authorities.`);

// Insert metadata
const insertMeta = db.prepare('INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)');
insertMeta.run('tier', 'free');
insertMeta.run('schema_version', '1.0');
insertMeta.run('domain', 'data-protection');
insertMeta.run('region', 'latam');
insertMeta.run('record_count', '0');
insertMeta.run('build_date', new Date().toISOString().split('T')[0]!);

// Set journal mode to DELETE for WASM compatibility
db.pragma('journal_mode = DELETE');
db.exec('VACUUM');
db.close();

// Report
const { statSync } = await import('fs');
const dbSize = statSync(DB_PATH).size;
const dbSizeKB = (dbSize / 1024).toFixed(1);

console.log('\n=== Build Complete ===');
console.log(`Sources:       ${seedSources.length}`);
console.log(`DPA Auth:      ${seedDpas.length}`);
console.log(`Provisions:    0 (pending ingestion)`);
console.log(`Database Size: ${dbSizeKB} KB`);
console.log(`Strategy:      A (Vercel Bundled)`);
console.log('\nRun "npm run ingest" to populate legislative texts.');
