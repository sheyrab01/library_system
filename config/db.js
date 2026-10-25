// Database connection (pg-promise). Reads DATABASE_URL from .env locally or from Render in production.
require('dotenv').config();
const pgp = require('pg-promise')();

const url = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/library_finder';
const isLocal = /localhost|127\.0\.0\.1/.test(url);

// Hosted databases (Render) need SSL, a local database does not
const ssl = isLocal ? false : { rejectUnauthorized: false };

const db = pgp({ connectionString: url, ssl });
db.connectionInfo = { connectionString: url, ssl };
module.exports = db;
