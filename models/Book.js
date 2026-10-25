const db = require('../config/db');

// Every book query also computes live availability (copies minus unreturned loans)
const BASE = `
  SELECT b.*, c.name AS category,
         b.quantity - COALESCE(o.out, 0) AS available
  FROM books b
  LEFT JOIN categories c ON c.id = b.category_id
  LEFT JOIN (SELECT book_id, COUNT(*)::int AS out FROM borrowings
             WHERE returned_at IS NULL GROUP BY book_id) o ON o.book_id = b.id`;

const GENRES = ['Fiction', 'Non-Fiction', 'Classic'];
exports.GENRES = GENRES;

exports.all = ({ q, category, genre, availableOnly, limit } = {}) => {
  const where = [], vals = [];
  if (q) {
    vals.push(`%${q}%`);
    where.push(`(b.title ILIKE $${vals.length} OR b.author ILIKE $${vals.length}
                 OR b.isbn ILIKE $${vals.length} OR b.description ILIKE $${vals.length})`);
  }
  if (category && category !== 'all') { vals.push(category); where.push(`c.name = $${vals.length}`); }
  if (genre && genre !== 'all') { vals.push(genre); where.push(`b.genre = $${vals.length}`); }
  if (availableOnly) where.push('b.quantity - COALESCE(o.out,0) > 0');
  let sql = BASE + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY b.title';
  if (limit) { vals.push(limit); sql += ` LIMIT $${vals.length}`; }
  return db.any(sql, vals);
};

exports.find = id => db.oneOrNone(BASE + ' WHERE b.id = $1', [id]);

exports.similar = (book, limit = 4) =>
  db.any(BASE + ' WHERE b.category_id = $1 AND b.id <> $2 ORDER BY b.title LIMIT $3',
    [book.category_id, book.id, limit]);

exports.popular = (limit = 5) => db.any(
  BASE + ` ORDER BY (SELECT COUNT(*) FROM borrowings x WHERE x.book_id = b.id) DESC, b.title LIMIT $1`, [limit]);

exports.create = b => db.one(
  `INSERT INTO books(title,author,isbn,category_id,genre,quantity,location,published_year,description,cover_url)
   VALUES($/title/,$/author/,$/isbn/,$/category_id/,$/genre/,$/quantity/,$/location/,$/published_year/,$/description/,$/cover_url/)
   RETURNING *`, b);

exports.update = (id, b) => db.oneOrNone(
  `UPDATE books SET title=$/title/, author=$/author/, isbn=$/isbn/, category_id=$/category_id/,
     genre=$/genre/, quantity=$/quantity/, location=$/location/, published_year=$/published_year/,
     description=$/description/, cover_url=$/cover_url/
   WHERE id=$/id/ RETURNING *`, { ...b, id });

exports.remove = id => db.result('DELETE FROM books WHERE id=$1', [id]);

exports.stats = async () => {
  const s = await db.one(`SELECT
    (SELECT COALESCE(SUM(quantity),0)::int FROM books) AS total,
    (SELECT COUNT(*)::int FROM borrowings WHERE returned_at IS NULL) AS borrowed,
    (SELECT COUNT(*)::int FROM categories) AS categories,
    (SELECT COUNT(*)::int FROM borrowings WHERE returned_at IS NULL AND due_at < now()) AS overdue`);
  return { ...s, available: s.total - s.borrowed };
};

// Normalises form/JSON input and returns { data, errors }
exports.clean = body => {
  const num = v => (v === '' || v == null ? null : parseInt(v, 10));
  const data = {
    title: (body.title || '').trim(),
    author: (body.author || '').trim(),
    isbn: (body.isbn || '').trim(),
    category_id: num(body.category_id),
    genre: (body.genre || 'Non-Fiction').trim(),
    quantity: num(body.quantity) ?? 1,
    location: (body.location || '').trim(),
    published_year: num(body.published_year),
    description: (body.description || '').trim(),
    cover_url: (body.cover_url || '').trim() || null
  };
  const errors = [];
  if (!data.title) errors.push('Title is required.');
  if (!data.author) errors.push('Author is required.');
  if (!data.isbn) errors.push('ISBN is required.');
  if (!GENRES.includes(data.genre)) errors.push('Genre must be Fiction, Non-Fiction or Classic.');
  if (!(data.quantity >= 0)) errors.push('Quantity must be 0 or more.');
  return { data, errors };
};
