const db = require('../config/db');

const LOAN_DAYS = 14;
const MAX_ACTIVE = 3;

const SELECT = `
  SELECT br.*, b.title, b.author, s.name AS student_name, s.student_id AS student_number,
    CASE WHEN br.returned_at IS NOT NULL THEN 'Returned'
         WHEN br.due_at < now() THEN 'Overdue' ELSE 'Borrowed' END AS status
  FROM borrowings br
  JOIN books b ON b.id = br.book_id
  JOIN students s ON s.id = br.student_id`;

exports.forStudent = id => db.any(SELECT + ' WHERE br.student_id=$1 ORDER BY br.borrowed_at DESC', [id]);
exports.all = () => db.any(SELECT + ' ORDER BY (br.returned_at IS NULL) DESC, br.due_at ASC');
exports.activeFor = (studentId, bookId) =>
  db.oneOrNone('SELECT id FROM borrowings WHERE student_id=$1 AND book_id=$2 AND returned_at IS NULL', [studentId, bookId]);

const fail = msg => Object.assign(new Error(msg), { userMessage: msg });

// Transactional borrow: locks the book row so two students can't take the last copy
exports.create = (bookId, studentId) => db.tx(async t => {
  const book = await t.oneOrNone('SELECT id, quantity FROM books WHERE id=$1 FOR UPDATE', [bookId]);
  if (!book) throw fail('Book not found.');
  const { n } = await t.one('SELECT COUNT(*)::int AS n FROM borrowings WHERE book_id=$1 AND returned_at IS NULL', [bookId]);
  if (book.quantity - n <= 0) throw fail('No copies are currently available.');
  if (await t.oneOrNone('SELECT 1 FROM borrowings WHERE student_id=$1 AND book_id=$2 AND returned_at IS NULL', [studentId, bookId]))
    throw fail('You have already borrowed this book.');
  const active = await t.one('SELECT COUNT(*)::int AS n FROM borrowings WHERE student_id=$1 AND returned_at IS NULL', [studentId]);
  if (active.n >= MAX_ACTIVE) throw fail(`Borrowing limit reached (${MAX_ACTIVE} books at a time).`);
  return t.one(`INSERT INTO borrowings(book_id, student_id, due_at)
                VALUES($1,$2, now() + ($3 || ' days')::interval) RETURNING *`, [bookId, studentId, LOAN_DAYS]);
});

// Students may return their own loans; librarians may return any
exports.markReturned = (id, user) => db.oneOrNone(
  `UPDATE borrowings SET returned_at = now()
   WHERE id=$1 AND returned_at IS NULL AND ($2 OR student_id=$3) RETURNING *`,
  [id, user.role === 'librarian', user.id]);

exports.LOAN_DAYS = LOAN_DAYS;
