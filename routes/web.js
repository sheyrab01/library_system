const router = require('express').Router();
const wrap = require('../utils/wrap');
const { requireLogin, requireLibrarian } = require('../middleware/auth');
const auth = require('../controllers/authController');
const books = require('../controllers/bookController');
const cats = require('../controllers/categoryController');
const loans = require('../controllers/borrowingController');

// Public
router.get('/login', auth.loginForm);
router.post('/login', wrap(auth.login));
router.get('/register', auth.registerForm);
router.post('/register', wrap(auth.register));
router.get('/register/librarian', auth.librarianRegisterForm);
router.post('/register/librarian', wrap(auth.registerLibrarian));
router.post('/logout', auth.logout);

// Authenticated
router.use(requireLogin);
router.get('/', wrap(books.dashboard));
router.get('/books', wrap(books.browse));
router.get('/search', wrap(books.search));
router.get('/books/:id', wrap(books.detail));
router.post('/books/:id/borrow', wrap(loans.borrow));
router.get('/my-borrowings', wrap(loans.mine));
router.post('/borrowings/:id/return', wrap(loans.giveBack));

// Librarian only
router.use('/librarian', requireLibrarian);
router.get('/librarian/books', wrap(books.manage));
router.get('/librarian/books/new', wrap(books.newForm));
router.post('/librarian/books', wrap(books.create));
router.get('/librarian/books/:id/edit', wrap(books.editForm));
router.post('/librarian/books/:id', wrap(books.update));
router.post('/librarian/books/:id/delete', wrap(books.remove));
router.get('/librarian/categories', wrap(cats.manage));
router.post('/librarian/categories', wrap(cats.create));
router.post('/librarian/categories/:id/delete', wrap(cats.remove));
router.get('/librarian/borrowings', wrap(loans.records));

module.exports = router;
