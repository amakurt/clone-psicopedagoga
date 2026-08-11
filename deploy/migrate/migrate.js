#!/usr/bin/env node
// EduPsych Pro - migração SQLite (Prisma) -> PostgreSQL
// Uso: node migrate.js <dev.db> <postgresql://url> <schema.prisma>
// Idempotente (ON CONFLICT DO NOTHING) - roda UMA vez no primeiro deploy.

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { Client } = require('pg');

const SQLITE = process.argv[2];
const PG_URL = process.argv[3];
const SCHEMA = process.argv[4];

const DATE_COLS = new Set(['DateTime', 'DateTime?']);
const BOOL_COLS = new Set(['Boolean', 'Boolean?']);
const JSON_COLS = new Set(['Json', 'Json?']);

function parseSchema(file) {
  const models = {};
  let current = null;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^model (\w+) \{/);
    if (m) { current = m[1]; models[current] = []; continue; }
    if (current && /^}/.test(line)) { current = null; continue; }
    if (!current) continue;
    const f = line.match(/^\s{2}(\w+)\s+(\w+)(\?)?(?=\s|$)/);
    if (f) {
      const [, name, type, opt] = f;
      const full = type + (opt || '');
      if (!DATE_COLS.has(full) && !BOOL_COLS.has(full) && !JSON_COLS.has(full) && !['String', 'String?', 'Int', 'Int?', 'Float', 'Float?'].includes(full)) continue;
      models[current].push({ name, kind: DATE_COLS.has(full) ? 'date' : BOOL_COLS.has(full) ? 'bool' : JSON_COLS.has(full) ? 'json' : 'scalar' });
    }
  }
  return models;
}

function parseMs(value) {
  const s = String(value);
  const ms = s.match(/^(\d{10,13})(?:-\d{2}-\d{2})?$/);
  if (ms) return new Date(Number(ms[1]));
  const n = Date.parse(s.replace(' ', 'T'));
  if (!isNaN(n)) return new Date(n);
  return new Date(0);
}

function convert(model, row) {
  const out = {};
  for (const col of model) {
    let v = row[col.name];
    if (v === null || v === undefined) continue;
    if (col.kind === 'date') out[col.name] = parseMs(v);
    else if (col.kind === 'bool') out[col.name] = !!v;
    else if (col.kind === 'json') out[col.name] = typeof v === 'string' ? JSON.parse(v) : v;
    else out[col.name] = v;
  }
  for (const key of Object.keys(row)) {
    if (!(key in out)) out[key] = row[key];
  }
  return out;
}

async function main() {
  if (!SQLITE || !PG_URL || !SCHEMA) {
    console.error('Uso: node migrate.js <dev.db> <pg-url> <schema.prisma>');
    process.exit(1);
  }
  const models = parseSchema(SCHEMA);
  const order = [
    ['Tenant', 'User', 'Plan', 'SocialAccount', 'VerificationCode'],
    ['Membership', 'Subscription', 'School', 'Responsible', 'WhatsAppConfig'],
    ['Paciente', 'Availability'],
  ];
  const rest = Object.keys(models).filter(t => !order.flat().includes(t));

  const src = new Database(SQLITE, { readonly: true });
  const pg = new Client({ connectionString: PG_URL });
  await pg.connect();

  const tableNames = src.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(r => r.name);

  let total = 0;
  const sync = async (table) => {
    if (!tableNames.includes(table) || !models[table]) return 0;
    const rows = src.prepare(`SELECT * FROM "${table}"`).all();
    const cols = models[table].map(c => c.name);
    let n = 0;
    for (const row of rows) {
      const data = convert(models[table], row);
      const insertCols = Object.keys(data);
      const placeholders = insertCols.map((_, i) => `$${i + 1}`).join(',');
      const sql = `INSERT INTO "${table}" (${insertCols.map(c => `"${c}"`).join(',')}) VALUES (${placeholders}) ON CONFLICT ("id") DO NOTHING`;
      await pg.query(sql, insertCols.map(c => data[c])).catch(async (e) => {
        const fk = e.code === '23503';
        console.log(`   ${table}:${row.id} ${fk ? 'FK pendente (retry na próxima passada)' : `ERRO ${e.message.slice(0, 120)}`}`);
        throw fk ? e : e;
      });
      n++;
    }
    total += n;
    console.log(`  ${table}: ${n} linhas`);
    return n;
  };

  const imported = new Set();
  for (const tier of order) {
    for (const t of tier) {
      try { await sync(t); imported.add(t); } catch { /* FK pendente */ }
    }
  }
  for (let pass = 0; pass < 12 && rest.some(t => !imported.has(t)); pass++) {
    for (const t of rest) {
      if (imported.has(t)) continue;
      try { await sync(t); imported.add(t); } catch { /* retry próxima passada */ }
    }
  }
  const failed = rest.filter(t => !imported.has(t));
  if (failed.length) console.error(`FALHARAM: ${failed.join(', ')}`);

  console.log(`\nTotal migrado: ${total} linhas em ${imported.size}/${Object.keys(models).length} tabelas`);
  await pg.end();
  src.close();
  process.exit(failed.length ? 1 : 0);
}

module.exports = { parseSchema, convert, parseMs };

if (require.main === module) {
  main().catch(e => { console.error(e.message); process.exit(1); });
}