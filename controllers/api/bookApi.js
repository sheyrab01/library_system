const Book = require('../../models/Book');

exports.list = async (req, res) => {
  const { q, category, genre, available, limit } = req.query;
  res.json(await Book.all({ q, category, genre, availableOnly: available === 'true', limit: limit && +limit }));
};

exports.get = async (req, res) => {
  const book = await Book.find(req.params.id);
  book ? res.json(book) : res.status(404).json({ error: 'Book not found' });
};

exports.create = async (req, res) => {
  const { data, errors } = Book.clean(req.body);
  if (errors.length) return res.status(400).json({ errors });
  try { res.status(201).json(await Book.create(data)); }
  catch (e) { if (e.code === '23505') return res.status(409).json({ errors: ['ISBN already exists'] }); throw e; }
};

exports.update = async (req, res) => {
  const { data, errors } = Book.clean(req.body);
  if (errors.length) return res.status(400).json({ errors });
  try {
    const book = await Book.update(req.params.id, data);
    book ? res.json(book) : res.status(404).json({ error: 'Book not found' });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ errors: ['ISBN already exists'] });
    throw e;
  }
};

exports.remove = async (req, res) => {
  try {
    const r = await Book.remove(req.params.id);
    r.rowCount ? res.status(204).end() : res.status(404).json({ error: 'Book not found' });
  } catch (e) {
    if (e.code === '23503') return res.status(409).json({ error: 'Book has borrowing records' });
    throw e;
  }
};
