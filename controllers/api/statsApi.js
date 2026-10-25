const Book = require('../../models/Book');
exports.get = async (req, res) => res.json({ stats: await Book.stats(), popular: await Book.popular(5) });
