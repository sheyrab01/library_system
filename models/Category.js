const db = require('../config/db');

exports.all = () => db.any(`
  SELECT c.*, COUNT(b.id)::int AS book_count
  FROM categories c LEFT JOIN books b ON b.category_id = c.id
  GROUP BY c.id ORDER BY c.name`);
exports.create = (name, description = '') =>
  db.one('INSERT INTO categories(name, description) VALUES($1,$2) RETURNING *', [name, description]);
exports.remove = id => db.result('DELETE FROM categories WHERE id=$1', [id]);
