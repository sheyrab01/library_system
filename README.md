# Library Finder & Management System
Sherubtse College · CSP301 Back-End Web Development · Node.js · Express · PostgreSQL · EJS (MVC)

Students search the catalogue, filter by genre and subject, see live availability and borrow books.
Librarians manage books, categories and borrowing records.

## Folder structure
```
library-finder/
├── app.js                 starts the Express server
├── config/db.js           database connection (pg-promise)
├── controllers/           page logic (auth, books, borrowings, categories) + api/ (JSON)
├── middleware/            login / role checks, template helpers
├── models/                SQL queries: Book, Category, Student, Borrowing
├── routes/                web.js (pages) and api.js (REST)
├── views/                 EJS pages, partials/, librarian/
├── public/                css, client js
├── database/              schema.sql, seed.sql, reset.sql, library_finder_full.sql  (pgAdmin files)
├── scripts/setupDb.js     runs the SQL files from the terminal
├── tests/api.test.js      automated tests (npm test)
├── render.yaml            Render deployment blueprint
└── .env.example           copy to .env
```

## 1. Run on your computer
1. Install Node.js 18+ and PostgreSQL (with pgAdmin).
2. In pgAdmin create an empty database named `library_finder`.
3. Copy `.env.example` to `.env` and put your Postgres password in `DATABASE_URL`.
4. Terminal: `npm install`, then `npm run db:setup`, then `npm run dev`.
5. Open http://localhost:3000

Demo accounts: **student** `pema@sherubtse.edu.bt` / `student123` · **librarian** `librarian@sherubtse.edu.bt` / `librarian123`
(choose Student or Librarian on the login form).

New accounts: use **Register**. Everybody becomes a student, unless the librarian access code from `LIBRARIAN_CODE` in `.env` is typed in the register form.

## 2. Separate database files for pgAdmin
No Node needed. In pgAdmin: create database `library_finder` → right-click → **Query Tool** → open a file → run (F5).
* `database/schema.sql` then `database/seed.sql` – tables, then demo data (safe to run again).
* `database/library_finder_full.sql` – the same thing as one single file.
* `database/reset.sql` – deletes all library tables (careful).
Terminal alternatives: `npm run db:setup` (create + demo data), `npm run db:reset` (wipe and recreate).

## 3. Put it on GitHub
```
git init
git add .
git commit -m "Library Finder first version"
git branch -M main
git remote add origin https://github.com/<your-username>/library-finder.git
git push -u origin main
```
`.env` is in `.gitignore`, so your passwords are not uploaded. Create the empty repository on github.com first (no README).

## 4. Deploy on Render.com
**Easy way (Blueprint):** Render dashboard → New → **Blueprint** → choose the GitHub repo → it reads `render.yaml`, creates the database and the web service → enter a value for `LIBRARIAN_CODE` when asked → Apply. The build command runs `npm run db:setup`, so tables and demo data are created automatically.

**Manual way:** New → PostgreSQL (copy the *Internal Database URL*). New → Web Service → connect the repo →
Build command `npm install && npm run db:setup` · Start command `npm start` · environment variables: `NODE_ENV=production`, `DATABASE_URL=<internal url>`, `SESSION_SECRET=<long random text>`, `LIBRARIAN_CODE=<your code>`.

Notes: free web services on Render sleep after a period of no traffic and wake slowly on the next visit, and free databases have time limits (check Render's current pricing page). Change the demo passwords before showing the site publicly.

## 5. Tests
Start the server, then in a second terminal on a fresh database: `npm run db:reset` and `npm test`.

## Book cover photos
Covers are loaded from Open Library using each book's ISBN. If a cover is missing (or you are offline) a generated cover is shown instead. A librarian can paste a custom image link in the book form.
