const Book = require('../models/Book');
const Category = require('../models/Category');
const Borrowing = require('../models/Borrowing');

exports.dashboard = async (req, res) => {
  const [stats, popular] = await Promise.all([Book.stats(), Book.popular(5)]);
  res.render('dashboard', { title: 'Home', active: 'home', stats, popular });
};

exports.browse = async (req, res) => {
  const category = req.query.category || 'all';
  const genre = req.query.genre || 'all';
  const [categories, books] = await Promise.all([Category.all(), Book.all({ category, genre })]);
  res.render('books', { title: 'Browse Books', active: 'browse', categories, books, category, genre, genres: Book.GENRES });
};

exports.search = async (req, res) => {
  const q = (req.query.q || '').trim();
  const books = q ? await Book.all({ q }) : [];
  res.render('search', { title: 'Search Results', active: 'browse', books, q });
};

exports.detail = async (req, res) => {
  const book = await Book.find(req.params.id);
  if (!book) return res.status(404).render('error', { title: 'Not found', message: 'Book not found.' });
  const [similar, active] = await Promise.all([
    Book.similar(book), Borrowing.activeFor(req.session.user.id, book.id)]);
  res.render('book_detail', { title: book.title, active: 'browse', book, similar, alreadyBorrowed: !!active, loanDays: Borrowing.LOAN_DAYS });
};

/* ---------- Librarian CRUD ---------- */
exports.manage = async (req, res) => {
  const books = await Book.all();
  res.render('librarian/manage_books', { title: 'Manage Books', active: 'manage', books });
};

const form = async (res, book, errors = []) => res.render('librarian/book_form',
  { title: book.id ? 'Edit Book' : 'Add Book', active: 'manage', book, categories: await Category.all(), genres: Book.GENRES, errors });

exports.newForm = (req, res) => form(res, { quantity: 1 });

exports.editForm = async (req, res) => {
  const book = await Book.find(req.params.id);
  if (!book) return res.redirect('/librarian/books');
  form(res, book);
};

const saveError = (e, res, data) => {
  if (e.code === '23505') return form(res, data, ['A book with that ISBN already exists.']);
  throw e;
};

exports.create = async (req, res) => {
  const { data, errors } = Book.clean(req.body);
  if (errors.length) return form(res, data, errors);
  try { await Book.create(data); } catch (e) { return saveError(e, res, data); }
  res.flash('success', `"${data.title}" added.`);
  res.redirect('/librarian/books');
};

exports.update = async (req, res) => {
  const { data, errors } = Book.clean(req.body);
  data.id = req.params.id;
  if (errors.length) return form(res, data, errors);
  try { await Book.update(req.params.id, data); } catch (e) { return saveError(e, res, data); }
  res.flash('success', 'Book updated.');
  res.redirect('/librarian/books');
};

exports.remove = async (req, res) => {
  try {
    await Book.remove(req.params.id);
    res.flash('success', 'Book deleted.');
  } catch (e) {
    if (e.code !== '23503') throw e;
    res.flash('error', 'This book has borrowing records. Set its quantity to 0 instead.');
  }
  res.redirect('/librarian/books');
};
