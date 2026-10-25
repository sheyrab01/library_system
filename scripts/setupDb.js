// Runs the SQL files in /database against the DATABASE_URL in .env
//   npm run db:setup  -> creates missing tables and adds demo data (safe to repeat)
//   npm run db:reset  -> deletes everything first, then recreates it
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const readSql = name => fs.readFileSync(path.join(__dirname, '..', 'database', name), 'utf8');

async function run() {
  if (process.argv.includes('--reset')) {
    await db.none(readSql('reset.sql'));
    console.log('Old tables dropped.');
  }
  await db.none(readSql('schema.sql'));
  await db.none(readSql('seed.sql'));
  const counts = await db.one(`SELECT (SELECT COUNT(*) FROM books)::int AS books,
    (SELECT COUNT(*) FROM students)::int AS users, (SELECT COUNT(*) FROM categories)::int AS categories`);
  console.log(`Database ready: ${counts.books} books, ${counts.categories} categories, ${counts.users} users.`);
  process.exit(0);
}

run().catch(err => { console.error('Database setup failed:', err.message); process.exit(1); });
