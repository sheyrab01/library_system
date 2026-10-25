require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const { Pool } = require('pg');
const PgSession = require('connect-pg-simple')(session);
const db = require('./config/db');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

if (isProd && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set in production');
}
if (isProd) app.set('trust proxy', 1); // Render sits behind a proxy

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sessions are saved in PostgreSQL so users stay logged in after a restart
app.use(session({
  store: new PgSession({ pool: new Pool(db.connectionInfo), createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8, httpOnly: true, sameSite: 'lax', secure: isProd }
}));
app.use(require('./middleware/locals'));

app.get('/health', (req, res) => res.send('ok')); // used by Render health checks

app.use('/api', require('./routes/api'));
app.use('/', require('./routes/web'));

app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.status(404).render('error', { title: 'Not found', message: 'That page does not exist.' });
});
app.use((err, req, res, next) => {
  console.error(err);
  if (req.originalUrl.startsWith('/api')) return res.status(500).json({ error: 'Server error' });
  res.status(500).render('error', { title: 'Error', message: 'Something went wrong.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Library Finder running on port ${PORT}`));
