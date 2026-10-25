const router = require('express').Router();
const wrap = require('../utils/wrap');
const { requireLogin, requireLibrarian } = require('../middleware/auth');
const book = require('../controllers/api/bookApi');
const category = require('../controllers/api/categoryApi');
const borrowing = require('../controllers/api/borrowingApi');
const stats = require('../controllers/api/statsApi');

router.use(requireLogin);

router.get('/books', wrap(book.list));
router.get('/books/:id', wrap(book.get));
router.post('/books', requireLibrarian, wrap(book.create));
router.put('/books/:id', requireLibrarian, wrap(book.update));
router.delete('/books/:id', requireLibrarian, wrap(book.remove));

router.get('/categories', wrap(category.list));
router.post('/categories', requireLibrarian, wrap(category.create));
router.delete('/categories/:id', requireLibrarian, wrap(category.remove));

router.get('/borrowings', wrap(borrowing.list));
router.post('/borrowings', wrap(borrowing.create));
router.patch('/borrowings/:id/return', wrap(borrowing.giveBack));

router.get('/stats', wrap(stats.get));

module.exports = router;
