// Integration tests: run against a live server (npm start) with a freshly seeded DB (npm run db:setup).
// Usage: npm test   (BASE_URL defaults to http://localhost:3000)
require('dotenv').config();
const db = require('../config/db');
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const results = [];

class Client {
  constructor() { this.cookie = ''; }
  async req(method, path, body, form) {
    const headers = { cookie: this.cookie };
    let payload;
    if (form) { headers['content-type'] = 'application/x-www-form-urlencoded'; payload = new URLSearchParams(body).toString(); }
    else if (body) { headers['content-type'] = 'application/json'; payload = JSON.stringify(body); }
    const res = await fetch(BASE + path, { method, headers, body: payload, redirect: 'manual' });
    const sc = res.headers.get('set-cookie'); if (sc) this.cookie = sc.split(';')[0];
    const text = await res.text();
    let json = null; try { json = JSON.parse(text); } catch {}
    return { status: res.status, json, text, location: res.headers.get('location') };
  }
  login(email, password) { return this.req('POST', '/login', { email, password }, true); }
}

async function t(category, id, name, expected, fn) {
  try { const actual = await fn(); results.push({ category, id, name, expected, actual: String(actual.value), pass: actual.ok }); }
  catch (e) { results.push({ category, id, name, expected, actual: 'Error: ' + e.message, pass: false }); }
}
const eq = (v, exp) => ({ ok: v === exp, value: v });

(async () => {
  const anon = new Client(), stu = new Client(), lib = new Client(), stu2 = new Client();

  // ---- Authentication & authorisation
  await t('Authentication', 'A1', 'Student login with valid credentials', '302 to /', async () => {
    const r = await stu.login('pema@sherubtse.edu.bt', 'student123'); return eq(r.status + ' ' + r.location, '302 /'); });
  await t('Authentication', 'A2', 'Login with wrong password', '302 to /login', async () => {
    const r = await new Client().login('pema@sherubtse.edu.bt', 'wrong'); return eq(r.status + ' ' + r.location, '302 /login'); });
  await lib.login('librarian@sherubtse.edu.bt', 'librarian123');
  await stu2.login('tashi@sherubtse.edu.bt', 'student123');
  await t('Authentication', 'A3', 'Unauthenticated page request is redirected', '302 to /login', async () => {
    const r = await anon.req('GET', '/books'); return eq(r.status + ' ' + r.location, '302 /login'); });
  await t('Authentication', 'A4', 'Unauthenticated API request rejected', '401', async () => eq((await anon.req('GET', '/api/books')).status, 401));
  await t('Authentication', 'A5', 'Student cannot create a book via API', '403', async () =>
    eq((await stu.req('POST', '/api/books', { title: 'x', author: 'y', isbn: '1' })).status, 403));
  await t('Authentication', 'A6', 'Student cannot open librarian page', '403', async () => eq((await stu.req('GET', '/librarian/books')).status, 403));
  await t('Authentication', 'A7', 'Registration rejects duplicate email', 'redirect to /register', async () => {
    const r = await new Client().req('POST', '/register', { name: 'X', student_id: '999', email: 'pema@sherubtse.edu.bt', password: 'secret1' }, true); return eq(r.location, '/register'); });

  // ---- Registration, roles and passwords (real database)
  const stamp = Date.now(), newEmail = `newstudent${stamp}@sherubtse.edu.bt`;
  await t('Registration & Roles', 'R1', 'Register a brand-new student', '302 to /', async () => {
    const r = await new Client().req('POST', '/register', { name: 'New Student', student_id: 'S' + stamp, email: newEmail, password: 'mypass123', confirm_password: 'mypass123' }, true);
    return eq(r.status + ' ' + r.location, '302 /'); });
  await t('Registration & Roles', 'R2', 'New student can log in with the new password', '302 to /', async () => {
    const r = await new Client().login(newEmail, 'mypass123'); return eq(r.status + ' ' + r.location, '302 /'); });
  await t('Registration & Roles', 'R3', 'New student cannot log in with a wrong password', '302 to /login', async () => {
    const r = await new Client().login(newEmail, 'nottheone'); return eq(r.status + ' ' + r.location, '302 /login'); });
  await t('Registration & Roles', 'R4', 'Password is stored as a bcrypt hash', 'hash starts with $2', async () => {
    const row = await db.one('SELECT password_hash, role FROM students WHERE email=$1', [newEmail]);
    return { ok: row.password_hash.startsWith('$2') && row.password_hash !== 'mypass123' && row.role === 'student', value: row.password_hash.slice(0, 4) + ' role=' + row.role }; });
  await t('Registration & Roles', 'R5', 'Mismatched confirm password rejected', 'redirect to /register', async () => {
    const r = await new Client().req('POST', '/register', { name: 'X', student_id: 'M' + stamp, email: 'm' + newEmail, password: 'abcdef', confirm_password: 'abcxyz' }, true); return eq(r.location, '/register'); });
  await t('Registration & Roles', 'R6', 'Wrong librarian access code rejected', 'redirect to /register/librarian', async () => {
    const r = await new Client().req('POST', '/register/librarian', { name: 'X', student_id: 'W' + stamp, email: 'w' + newEmail, password: 'abcdef', librarian_code: 'WRONG' }, true); return eq(r.location, '/register/librarian'); });
  await t('Registration & Roles', 'R7', 'Correct access code creates a librarian who can open staff pages', '200 on /librarian/books', async () => {
    const c = new Client(); const email = 'lib' + newEmail;
    await c.req('POST', '/register/librarian', { name: 'New Librarian', student_id: 'L' + stamp, email, password: 'libpass1', librarian_code: process.env.LIBRARIAN_CODE }, true);
    const again = new Client(); await again.req('POST', '/login', { email, password: 'libpass1', role: 'librarian' }, true);
    return eq((await again.req('GET', '/librarian/books')).status, 200); });
  await t('Registration & Roles', 'R8', 'Student account chosen as "librarian" at login is refused', 'redirect to /login', async () => {
    const r = await new Client().req('POST', '/login', { email: 'pema@sherubtse.edu.bt', password: 'student123', role: 'librarian' }, true); return eq(r.location, '/login'); });
  await t('Registration & Roles', 'R9', 'Librarian demo account logs in as librarian', '302 to /', async () => {
    const r = await new Client().req('POST', '/login', { email: 'librarian@sherubtse.edu.bt', password: 'librarian123', role: 'librarian' }, true); return eq(r.status + ' ' + r.location, '302 /'); });
  await t('Registration & Roles', 'R10', 'Duplicate email registration rejected', 'redirect to /register', async () => {
    const r = await new Client().req('POST', '/register', { name: 'Dup', student_id: 'D' + stamp, email: newEmail, password: 'abcdef' }, true); return eq(r.location, '/register'); });

  // ---- Book API (read)
  await t('Catalogue API', 'B1', 'GET /api/books returns seeded catalogue', '24 books', async () => eq((await stu.req('GET', '/api/books')).json.length, 24));
  await t('Catalogue API', 'B2', 'Keyword search q=python', '3 books', async () => eq((await stu.req('GET', '/api/books?q=python')).json.length, 3));
  await t('Catalogue API', 'B3', 'Category filter Business', '3 books', async () => eq((await stu.req('GET', '/api/books?category=Business')).json.length, 3));
  await t('Catalogue API', 'B6', 'Genre filter Fiction', '4 books', async () => eq((await stu.req('GET', '/api/books?genre=Fiction')).json.length, 4));
  await t('Catalogue API', 'B7', 'Genre filter Classic', '6 books', async () => eq((await stu.req('GET', '/api/books?genre=Classic')).json.length, 6));
  await t('Catalogue API', 'B8', 'Genre filter Non-Fiction', '14 books', async () => eq((await stu.req('GET', '/api/books?genre=Non-Fiction')).json.length, 14));
  await t('Catalogue API', 'B9', 'Genre and category combined (Classic + Literature)', '6 books', async () => eq((await stu.req('GET', '/api/books?genre=Classic&category=Literature')).json.length, 6));
  await t('Catalogue API', 'B4', 'Unknown book id returns 404', '404', async () => eq((await stu.req('GET', '/api/books/99999')).status, 404));
  await t('Catalogue API', 'B5', 'Availability reflects active loans (Clean Code 4 copies, 1 out)', 'available = 3', async () => {
    const b = (await stu.req('GET', '/api/books?q=Clean Code')).json[0]; return eq(b.available, 3); });

  // ---- Librarian CRUD
  let newId;
  await t('Librarian CRUD', 'C1', 'Create book via API', '201', async () => {
    const r = await lib.req('POST', '/api/books', { title: 'Test Book', author: 'Tester', isbn: 'TEST-001', category_id: 1, quantity: 1 }); newId = r.json && r.json.id; return eq(r.status, 201); });
  await t('Librarian CRUD', 'C2', 'Duplicate ISBN rejected', '409', async () =>
    eq((await lib.req('POST', '/api/books', { title: 'Dup', author: 'T', isbn: 'TEST-001' })).status, 409));
  await t('Librarian CRUD', 'C3', 'Missing title rejected', '400', async () =>
    eq((await lib.req('POST', '/api/books', { author: 'T', isbn: 'Z' })).status, 400));
  await t('Librarian CRUD', 'C4', 'Negative quantity rejected', '400', async () =>
    eq((await lib.req('POST', '/api/books', { title: 'N', author: 'T', isbn: 'NEG', quantity: -2 })).status, 400));
  await t('Librarian CRUD', 'C5', 'Update book via API', '200 and new title', async () => {
    const r = await lib.req('PUT', '/api/books/' + newId, { title: 'Test Book v2', author: 'Tester', isbn: 'TEST-001', quantity: 1 }); return eq(r.status + ' ' + (r.json && r.json.title), '200 Test Book v2'); });

  await t('Librarian CRUD', 'C6', 'Update with another book\'s ISBN rejected', '409', async () =>
    eq((await lib.req('PUT', '/api/books/' + newId, { title: 'Test Book v2', author: 'Tester', isbn: '9780132350884', quantity: 1 })).status, 409));
  await t('Librarian CRUD', 'C8', 'Invalid genre rejected', '400', async () =>
    eq((await lib.req('POST', '/api/books', { title: 'G', author: 'T', isbn: 'GEN-1', genre: 'Poetry' })).status, 400));
  await t('Librarian CRUD', 'C7', 'Update of unknown book id returns 404', '404', async () =>
    eq((await lib.req('PUT', '/api/books/99999', { title: 'a', author: 'b', isbn: 'UNK-1', quantity: 1 })).status, 404));

  // ---- Borrowing workflow
  let loanId;
  await t('Borrowing', 'D1', 'Student borrows available book', '201', async () => {
    const r = await stu.req('POST', '/api/borrowings', { book_id: newId }); loanId = r.json && r.json.id; return eq(r.status, 201); });
  await t('Borrowing', 'D2', 'Same student cannot borrow same book twice', '400', async () => eq((await stu.req('POST', '/api/borrowings', { book_id: newId })).status, 400));
  await t('Borrowing', 'D3', 'Book with 0 free copies cannot be borrowed by another student', '400', async () => eq((await stu2.req('POST', '/api/borrowings', { book_id: newId })).status, 400));
  await t('Borrowing', 'D4', 'Availability drops to 0 after borrowing', 'available = 0', async () => eq((await stu.req('GET', '/api/books/' + newId)).json.available, 0));
  await t('Borrowing', 'D5', 'Deleting a book that has loan records is refused', '409', async () => eq((await lib.req('DELETE', '/api/books/' + newId)).status, 409));
  await t('Borrowing', 'D6', 'Another student cannot return someone else\'s loan', '404', async () => eq((await stu2.req('PATCH', `/api/borrowings/${loanId}/return`)).status, 404));
  await t('Borrowing', 'D7', 'Owner returns the book', '200', async () => eq((await stu.req('PATCH', `/api/borrowings/${loanId}/return`)).status, 200));
  await t('Borrowing', 'D8', 'Returning twice fails', '404', async () => eq((await stu.req('PATCH', `/api/borrowings/${loanId}/return`)).status, 404));
  await t('Borrowing', 'D9', 'Borrowing limit of 3 active loans enforced', '4th loan returns 400', async () => {
    // Pema already has 2 active loans (Clean Code, Python Crash Course); borrow one more then try a fourth
    const s = new Client(); await s.login('tashi@sherubtse.edu.bt', 'student123');
    const codes = []; for (const id of [3, 6, 11, 12]) codes.push((await s.req('POST', '/api/borrowings', { book_id: id })).status);
    return eq(codes.join(','), '201,201,201,400'); });
  await t('Borrowing', 'D10', 'Overdue status computed for seeded overdue loan', 'status Overdue', async () => {
    const l = (await stu.req('GET', '/api/borrowings')).json.find(x => x.title === 'Clean Code'); return eq(l && l.status, 'Overdue'); });
  await t('Borrowing', 'D11', 'Student sees only own loans; librarian sees all', 'student set excludes other users', async () => {
    const mine = (await stu.req('GET', '/api/borrowings')).json, all = (await lib.req('GET', '/api/borrowings')).json;
    return { ok: mine.every(x => x.student_number === '02230001') && all.length > mine.length, value: `${mine.length} own / ${all.length} total` }; });

  // ---- Concurrency: 6 students race for the last copy
  await t('Concurrency', 'E1', '6 simultaneous borrow requests for a 1-copy book', 'exactly 1 succeeds', async () => {
    const book = (await lib.req('POST', '/api/books', { title: 'Race Book', author: 'R', isbn: 'RACE-1', quantity: 1 })).json;
    const clients = [];
    for (let i = 0; i < 6; i++) {
      const c = new Client(); const n = `racer${Date.now()}${i}`;
      await c.req('POST', '/register', { name: n, student_id: n, email: n + '@x.bt', password: 'secret1' }, true); clients.push(c);
    }
    const out = await Promise.all(clients.map(c => c.req('POST', '/api/borrowings', { book_id: book.id })));
    const ok = out.filter(r => r.status === 201).length; return eq(ok, 1); });

  // ---- Category & stats
  await t('Categories & Stats', 'F1', 'Librarian creates and deletes a category', '201 then 204', async () => {
    const c = await lib.req('POST', '/api/categories', { name: 'TempCat' }); const d = await lib.req('DELETE', '/api/categories/' + c.json.id); return eq(c.status + ',' + d.status, '201,204'); });
  await t('Categories & Stats', 'F2', 'Student cannot create category', '403', async () => eq((await stu.req('POST', '/api/categories', { name: 'Nope' })).status, 403));
  await t('Categories & Stats', 'F3', 'GET /api/stats returns totals', 'numeric total and popular list', async () => {
    const r = (await stu.req('GET', '/api/stats')).json; return { ok: typeof r.stats.total === 'number' && r.popular.length === 5, value: JSON.stringify(r.stats) }; });

  // ---- Server-rendered pages
  for (const [id, path, who, marker] of [
    ['G1', '/', stu, 'Popular Books'], ['G2', '/books', stu, 'Books'], ['G3', '/search?q=python', stu, 'Search Results'],
    ['G4', '/books/2', stu, 'Borrow Book'], ['G5', '/my-borrowings', stu, 'My Borrowings'],
    ['G6', '/librarian/books', lib, 'Manage Books'], ['G7', '/librarian/categories', lib, 'Manage Categories'], ['G8', '/librarian/borrowings', lib, 'Borrowing Records']])
    await t('Web pages', id, `GET ${path} renders`, `200 containing "${marker}"`, async () => {
      const r = await who.req('GET', path); return { ok: r.status === 200 && r.text.includes(marker), value: r.status }; });
  await t('Web pages', 'G12', 'Book page uses the Open Library cover photo for the ISBN', 'img src contains covers.openlibrary.org/b/isbn/9780132350884', async () => {
    const r = await stu.req('GET', '/books/1'); return { ok: r.text.includes('covers.openlibrary.org/b/isbn/9780132350884-L.jpg'), value: r.status }; });
  await t('Web pages', 'G13', 'Cover image falls back to the generated cover (onerror handler present)', 'onerror in markup', async () => {
    const r = await stu.req('GET', '/books'); return { ok: r.text.includes('onerror="this.remove()"'), value: r.status }; });
  await t('Web pages', 'G14', 'Browse page shows genre filter (Fiction, Non-Fiction, Classics)', 'all three chips', async () => {
    const r = await stu.req('GET', '/books'); return { ok: ['Fiction', 'Non-Fiction', 'Classics'].every(g => r.text.includes('>' + g + '<')), value: r.status }; });
  await t('Web pages', 'G15', 'Health check endpoint for hosting', '200', async () => eq((await anon.req('GET', '/health')).status, 200));
  await t('Web pages', 'G9', 'XSS payload in search term is HTML-escaped', 'raw <script> not present', async () => {
    const r = await stu.req('GET', '/search?q=' + encodeURIComponent('<script>alert(1)</script>')); return { ok: !r.text.includes('<script>alert(1)</script>'), value: r.status }; });
  await t('Web pages', 'G10', 'SQL-injection style search term handled safely', '200 and no error', async () => {
    const r = await stu.req('GET', '/api/books?q=' + encodeURIComponent("'; DROP TABLE books;--")); return { ok: r.status === 200 && Array.isArray(r.json), value: r.status }; });
  await t('Web pages', 'G11', 'Librarian form: create book via HTML form', '302 to /librarian/books', async () => {
    const r = await lib.req('POST', '/librarian/books', { title: 'Form Book', author: 'F', isbn: 'FORM-1', quantity: 2 }, true); return eq(r.status + ' ' + r.location, '302 /librarian/books'); });

  const pass = results.filter(r => r.pass).length;
  const cats = [...new Set(results.map(r => r.category))];
  console.log(JSON.stringify({ results, summary: cats.map(c => ({ category: c, total: results.filter(r => r.category === c).length, passed: results.filter(r => r.category === c && r.pass).length })) }, null, 1));
  console.error(`\n${pass}/${results.length} passed`);
  process.exit(pass === results.length ? 0 : 1);
})();
