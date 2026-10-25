-- Library Finder & Management System : database schema (PostgreSQL)
-- Safe to run many times: tables are only created if they do not exist yet.
-- pgAdmin: create a database called library_finder, open Query Tool, paste this file and press F5.

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) UNIQUE NOT NULL,
  description TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  student_id VARCHAR(40) UNIQUE NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'librarian')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(160) NOT NULL,
  isbn VARCHAR(20) UNIQUE NOT NULL,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  genre VARCHAR(20) NOT NULL DEFAULT 'Non-Fiction' CHECK (genre IN ('Fiction', 'Non-Fiction', 'Classic')),
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  location VARCHAR(120) DEFAULT '',
  published_year INT,
  description TEXT DEFAULT '',
  cover_url TEXT,            -- optional; if empty the app uses the Open Library cover for the ISBN
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS borrowings (
  id SERIAL PRIMARY KEY,
  book_id INT NOT NULL REFERENCES books(id),
  student_id INT NOT NULL REFERENCES students(id),
  borrowed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_at TIMESTAMPTZ NOT NULL,
  returned_at TIMESTAMPTZ     -- NULL means the book is still out
);

CREATE INDEX IF NOT EXISTS idx_books_title ON books (lower(title));
CREATE INDEX IF NOT EXISTS idx_books_genre ON books (genre);
CREATE INDEX IF NOT EXISTS idx_borrowings_active ON borrowings (book_id) WHERE returned_at IS NULL;
