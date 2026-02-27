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

// Seed breach notification rules
const insertBreach = db.prepare(`
  INSERT INTO breach_notification_rules (country_code, authority, timeline, threshold, data_subject_notification, penalties)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const seedBreachRules = [
  ['BR', 'ANPD', 'Reasonable time (ANPD recommends 2 business days for authority, 3 for data subjects)',
   'Risk or relevant harm to data subjects', 1,
   'Fines up to 2% of revenue in Brazil (cap R$50M per infraction); public disclosure of violation; blocking/deletion of data'],
  ['AR', 'AAIP', 'No specific timeline (general obligation to notify)',
   'Security incidents affecting personal data', 0,
   'Fines ARS 1,000-100,000; database suspension; criminal penalties for unauthorized access'],
  ['CO', 'SIC', 'Within 15 business days of detection',
   'Security incidents that may affect personal data processing', 1,
   'Fines up to 2,000 SMMLV (~COP 2.6B); temporary/definitive closure of operations'],
  ['CL', 'CPLT', 'No mandatory notification (pending reform bill would introduce 72-hour requirement)',
   'N/A under current law', 0,
   'Limited: current law has minimal enforcement provisions (reform bill would add significant fines)'],
  ['UY', 'URCDP', 'Without undue delay upon becoming aware of breach',
   'Breaches affecting personal data confidentiality or integrity', 1,
   'Fines; database suspension; data processing ban; public censure'],
  ['MX', 'INAI', 'Immediately upon confirmation of breach (no specific day count)',
   'Security breaches affecting personal data in any significant way', 1,
   'Fines 100-320,000 days of minimum wage (up to ~MXN 25M); data processing suspension'],
  ['CR', 'PRODHAB', 'Within 5 business days of detection',
   'Security incidents compromising personal data', 1,
   'Fines 5-30 base salaries; database suspension; criminal referral for severe cases'],
];

for (const rule of seedBreachRules) {
  insertBreach.run(...rule);
}
console.log(`Seeded ${seedBreachRules.length} breach notification rules.`);

// Seed data subject rights
const insertRight = db.prepare(`
  INSERT INTO data_subject_rights (country_code, right_name, description, legal_basis, exceptions)
  VALUES (?, ?, ?, ?, ?)
`);

const seedRights: string[][] = [
  // Brazil (LGPD)
  ['BR', 'Confirmation of processing', 'Right to confirm whether personal data is being processed', 'LGPD Art. 18(I)', 'None specified'],
  ['BR', 'Access', 'Right to access personal data held by the controller', 'LGPD Art. 18(II)', 'Trade secrets, intellectual property'],
  ['BR', 'Correction', 'Right to correct incomplete, inaccurate, or outdated data', 'LGPD Art. 18(III)', 'None specified'],
  ['BR', 'Anonymization, blocking, or deletion', 'Right to anonymize, block, or delete unnecessary or excessive data', 'LGPD Art. 18(IV)', 'Legal retention obligations'],
  ['BR', 'Portability', 'Right to transfer data to another service or product provider', 'LGPD Art. 18(V)', 'Trade secrets, regulatory rules pending ANPD regulation'],
  ['BR', 'Deletion', 'Right to delete data processed with consent', 'LGPD Art. 18(VI)', 'Legal obligations, legitimate interests, public health'],
  ['BR', 'Information on sharing', 'Right to know with which public and private entities data has been shared', 'LGPD Art. 18(VII)', 'None specified'],
  ['BR', 'Information on consent denial', 'Right to know about the possibility and consequences of denying consent', 'LGPD Art. 18(VIII)', 'None specified'],
  ['BR', 'Revocation of consent', 'Right to revoke consent at any time', 'LGPD Art. 18(IX)', 'Does not affect prior lawful processing'],
  ['BR', 'Opposition', 'Right to oppose processing based on grounds other than consent if non-compliant', 'LGPD Art. 18(§2)', 'None specified'],
  ['BR', 'Review of automated decisions', 'Right to request review of decisions made solely through automated processing', 'LGPD Art. 20', 'Trade secrets'],

  // Argentina (LPDP)
  ['AR', 'Access', 'Right to access personal data in public or private databases', 'Law 25.326 Art. 14', 'National security, public defense'],
  ['AR', 'Rectification', 'Right to correct false or inaccurate personal data', 'Law 25.326 Art. 16', 'None specified'],
  ['AR', 'Suppression', 'Right to request deletion of personal data', 'Law 25.326 Art. 16', 'Legal retention, contractual obligations'],
  ['AR', 'Confidentiality', 'Right to data confidentiality during processing', 'Law 25.326 Art. 10', 'Judicial orders'],
  ['AR', 'Habeas Data', 'Constitutional right to access and correct personal data in databases', 'Constitution Art. 43; Law 25.326 Art. 33-43', 'None specified'],

  // Colombia (Law 1581)
  ['CO', 'Access', 'Right to know, update, and correct personal data', 'Law 1581 Art. 8(a)', 'None specified'],
  ['CO', 'Update and correction', 'Right to update and correct data held by controllers or processors', 'Law 1581 Art. 8(b)', 'None specified'],
  ['CO', 'Proof of consent', 'Right to request proof that consent was obtained', 'Law 1581 Art. 8(c)', 'None specified'],
  ['CO', 'Information on use', 'Right to be informed about the use of personal data', 'Law 1581 Art. 8(d)', 'None specified'],
  ['CO', 'Complaint to SIC', 'Right to file complaints with the SIC for data protection violations', 'Law 1581 Art. 8(e)', 'None specified'],
  ['CO', 'Revocation and deletion', 'Right to revoke consent and request data deletion', 'Law 1581 Art. 8(f)', 'Legal or contractual obligations to retain data'],
  ['CO', 'Free access', 'Right to access personal data free of charge at least once per calendar month', 'Law 1581 Art. 8(g)', 'None specified'],

  // Chile (Law 19.628)
  ['CL', 'Information', 'Right to be informed about stored personal data and its source', 'Law 19.628 Art. 12', 'None specified'],
  ['CL', 'Modification', 'Right to correct data that is erroneous, inexact, equivocal, or incomplete', 'Law 19.628 Art. 12', 'None specified'],
  ['CL', 'Cancellation', 'Right to request deletion of data stored without legal basis or when expired', 'Law 19.628 Art. 12', 'Legal retention obligations'],
  ['CL', 'Blocking', 'Right to block data while rectification or deletion requests are processed', 'Law 19.628 Art. 12', 'None specified'],
  ['CL', 'Opposition', 'Right to oppose processing when there are legitimate grounds', 'Law 19.628 Art. 12', 'Consent already given, legal obligation'],

  // Uruguay (Law 18.331)
  ['UY', 'Access', 'Right to obtain information from the database controller', 'Law 18.331 Art. 14', 'National security, public defense'],
  ['UY', 'Rectification', 'Right to correct personal data that is inaccurate or incomplete', 'Law 18.331 Art. 15', 'None specified'],
  ['UY', 'Inclusion', 'Right to include omitted personal data that should be in the database', 'Law 18.331 Art. 15', 'None specified'],
  ['UY', 'Suppression', 'Right to request deletion of personal data from databases', 'Law 18.331 Art. 15', 'Legal retention obligations'],
  ['UY', 'Opposition', 'Right to oppose processing of personal data for legitimate reasons', 'Law 18.331 Art. 15-bis', 'Contractual, legal obligations'],
  ['UY', 'Habeas Data', 'Judicial action to access, correct, or delete personal data', 'Law 18.331 Art. 37-44', 'None specified'],

  // Mexico (LFPDPPP)
  ['MX', 'Access', 'Right to access personal data held by the data controller', 'LFPDPPP Art. 23', 'National security, public health, judicial proceedings'],
  ['MX', 'Rectification', 'Right to correct inaccurate or incomplete personal data', 'LFPDPPP Art. 24', 'None specified'],
  ['MX', 'Cancellation', 'Right to request deletion of personal data when no longer necessary', 'LFPDPPP Art. 25', 'Legal obligations, contractual needs, blocking period applies first'],
  ['MX', 'Opposition', 'Right to oppose processing of personal data for legitimate reasons', 'LFPDPPP Art. 27', 'Legal obligation, contractual relationship'],
  ['MX', 'Portability', 'Right to transfer personal data to another controller (introduced via reform)', 'LFPDPPP Art. 57', 'Technical feasibility'],
  ['MX', 'Revocation of consent', 'Right to revoke consent previously given for data processing', 'LFPDPPP Art. 8', 'Retroactive effects not applicable'],

  // Costa Rica (Law 8968)
  ['CR', 'Access', 'Right to access personal data held by any public or private entity', 'Law 8968 Art. 7', 'National security, ongoing investigations'],
  ['CR', 'Rectification and update', 'Right to correct or update inaccurate personal data', 'Law 8968 Art. 7', 'None specified'],
  ['CR', 'Deletion', 'Right to request deletion of data processed without lawful basis', 'Law 8968 Art. 7', 'Legal retention obligations'],
  ['CR', 'Opposition', 'Right to oppose processing for legitimate personal reasons', 'Law 8968 Art. 7', 'Public interest, contractual obligations'],
  ['CR', 'Not be subject to automated decisions', 'Right not to be subject to decisions based solely on automated processing', 'Law 8968 Art. 8', 'Authorized by law with safeguards'],
];

for (const right of seedRights) {
  insertRight.run(...right);
}
console.log(`Seeded ${seedRights.length} data subject rights.`);

// Seed cross-border transfer rules
const insertTransfer = db.prepare(`
  INSERT INTO cross_border_rules (country_code, adequacy_mechanism, transfer_mechanisms, restrictions, notes)
  VALUES (?, ?, ?, ?, ?)
`);

const seedTransferRules = [
  ['BR',
   'ANPD adequacy decisions (list pending; no countries approved yet as of 2025)',
   'Adequacy decision; binding corporate rules; standard contractual clauses; global privacy codes; international cooperation agreements; specific consent',
   'Prior ANPD authorization required for transfers not covered by Art. 33 exceptions. Controller must demonstrate adequate protection.',
   'LGPD Art. 33-36. Brazil considers reciprocity: EU recognizes Uruguay and Argentina but not Brazil; ANPD working on adequacy framework.'],
  ['AR',
   'AAIP/predecessor maintained adequacy list; recognized by EU as adequate (Decision 2003/490/EC)',
   'Adequacy decision (receiving country); contractual guarantees; consent; BCRs',
   'Transfer prohibited to countries without adequate protection unless contractual safeguards are in place.',
   'Law 25.326 Art. 12. Argentina is one of few LATAM countries with EU adequacy status.'],
  ['CO',
   'SIC prohibition-based: transfer to countries without adequate protection is restricted',
   'Adequate country (SIC assessment); explicit consent of data subject; contractual model clauses (Decree 1377/2013)',
   'Controller must verify adequate protection in destination country. SIC has not published a formal adequacy list but references APEC/EU members.',
   'Law 1581 Art. 26; Decree 1377/2013 Art. 24. Special rules for transfers to processors (no separate consent needed if contract in place).'],
  ['CL',
   'No formal adequacy mechanism under current Law 19.628 (reform bill would introduce it)',
   'No formal transfer mechanisms required under current law; pending reform would add SCCs and BCRs',
   'Minimal restrictions under current law. Transfers largely unrestricted beyond general data protection obligations.',
   'Law 19.628 Art. 5. Reform bill (in progress) would align with GDPR-style adequacy/SCC framework.'],
  ['UY',
   'URCDP adequacy assessment; EU recognizes Uruguay as adequate (Decision 2012/484/EU)',
   'Adequate country (URCDP assessment, aligned with EU); contractual guarantees; consent; BCRs',
   'Transfers to non-adequate countries require contractual safeguards reviewed by URCDP.',
   'Law 18.331 Art. 23. Uruguay has EU adequacy status (2012). Convention 108+ signatory.'],
  ['MX',
   'No formal adequacy mechanism (consent-based model)',
   'Privacy notice disclosure + consent; contractual clauses; binding corporate rules (LFPDPPP Art. 36)',
   'Controller must inform data subjects via privacy notice about international transfers. Third parties must agree to same obligations.',
   'LFPDPPP Art. 36-37. Mexico follows a notice-and-consent model rather than adequacy decisions. APEC CBPR participant.'],
  ['CR',
   'PRODHAB adequacy assessment (no published list)',
   'Adequate protection in destination country; consent; contractual clauses',
   'Transfers require adequate protection level in receiving country. PRODHAB may restrict transfers to specific countries.',
   'Law 8968 Art. 14. PRODHAB oversees cross-border transfers. No published adequacy list as of 2025.'],
];

for (const rule of seedTransferRules) {
  insertTransfer.run(...rule);
}
console.log(`Seeded ${seedTransferRules.length} cross-border transfer rules.`);

// Load seed files from data/seed/ directory
const { readdirSync, readFileSync } = await import('fs');
const seedDir = join(__dirname, '..', 'data', 'seed');
const seedFiles = readdirSync(seedDir).filter(f => f.endsWith('.json'));

const insertLaw = db.prepare(`
  INSERT OR REPLACE INTO laws (id, country_code, title, official_name, year, status, source_url, last_updated)
  VALUES (?, ?, ?, ?, ?, 'in_force', ?, ?)
`);

const insertProvision = db.prepare(`
  INSERT OR REPLACE INTO provisions (law_id, country_code, article_ref, title, content, topic)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const updateSourceCount = db.prepare(`
  UPDATE sources SET item_count = ?, last_fetched = ? WHERE id = ?
`);

let totalProvisions = 0;
const today = new Date().toISOString().split('T')[0]!;

for (const file of seedFiles) {
  const filePath = join(seedDir, file);
  try {
    const raw = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);

    if (!data.law_id || !data.provisions) {
      console.log(`Skipping ${file}: missing law_id or provisions`);
      continue;
    }

    // Insert law
    insertLaw.run(
      data.law_id, data.country_code, data.title, data.official_name,
      data.year, data.source_url, today
    );

    // Insert provisions
    let count = 0;
    for (const prov of data.provisions) {
      insertProvision.run(
        data.law_id, data.country_code, prov.article_ref,
        prov.title || null, prov.content, prov.topic || null
      );
      count++;
    }

    // Update source item count
    updateSourceCount.run(count, today, data.law_id);

    totalProvisions += count;
    console.log(`  ${file}: ${count} provisions loaded`);
  } catch (err) {
    console.error(`  Error loading ${file}:`, err);
  }
}

console.log(`\nLoaded ${totalProvisions} provisions from ${seedFiles.length} seed files.`);

// Rebuild FTS index
db.exec(`
  INSERT INTO provisions_fts(provisions_fts) VALUES('rebuild');
`);
console.log('FTS5 index rebuilt.');

// Insert metadata
const insertMeta = db.prepare('INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)');
insertMeta.run('tier', 'free');
insertMeta.run('schema_version', '1.0');
insertMeta.run('domain', 'data-protection');
insertMeta.run('region', 'latam');
insertMeta.run('record_count', String(totalProvisions));
insertMeta.run('build_date', today);

// Set journal mode to DELETE for WASM compatibility
db.pragma('journal_mode = DELETE');
db.exec('VACUUM');
db.close();

// Report
const { statSync } = await import('fs');
const dbSize = statSync(DB_PATH).size;
const dbSizeMB = (dbSize / 1024 / 1024).toFixed(2);

console.log('\n=== Build Complete ===');
console.log(`Sources:       ${seedSources.length}`);
console.log(`DPA Auth:      ${seedDpas.length}`);
console.log(`Breach Rules:  ${seedBreachRules.length}`);
console.log(`Rights:        ${seedRights.length}`);
console.log(`Transfer Rules:${seedTransferRules.length}`);
console.log(`Provisions:    ${totalProvisions}`);
console.log(`Database Size: ${dbSizeMB} MB`);
console.log(`Strategy:      A (Vercel Bundled)`);
