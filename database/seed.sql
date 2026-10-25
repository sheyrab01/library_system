-- Library Finder & Management System : demo data
-- Safe to run many times (existing rows are skipped). Run schema.sql first.
-- Demo logins:  pema@sherubtse.edu.bt / student123   |   librarian@sherubtse.edu.bt / librarian123
-- Passwords are stored as bcrypt hashes, never as plain text.

INSERT INTO categories (name) VALUES
  ('Computer Science'), ('Business'), ('Literature'), ('Science'), ('Math'), ('Others')
ON CONFLICT (name) DO NOTHING;

INSERT INTO students (name, student_id, email, password_hash, role) VALUES
  ('Pema Dorji',   '02230001', 'pema@sherubtse.edu.bt',      '$2a$10$TYnkezhvq69CQuiWNVEUMe1fG9vxIlMdOjMNXK4kZi6dRzTNI7OxW', 'student'),
  ('Tashi Wangmo', '02230002', 'tashi@sherubtse.edu.bt',     '$2a$10$TYnkezhvq69CQuiWNVEUMe1fG9vxIlMdOjMNXK4kZi6dRzTNI7OxW', 'student'),
  ('Librarian',    'LIB001',   'librarian@sherubtse.edu.bt', '$2a$10$H2YtHgPDMtdCX8wsJwpb6u0yw4yVMfxV7l0ExVkDKiqi7TJErBiVG', 'librarian')
ON CONFLICT (email) DO NOTHING;

INSERT INTO books (title, author, isbn, category_id, genre, quantity, location, published_year, description)
SELECT v.title, v.author, v.isbn, c.id, v.genre, v.quantity, v.location, v.year, v.description
FROM (VALUES
  ('Clean Code', 'Robert C. Martin', '9780132350884', 'Computer Science', 'Non-Fiction', 4, 'Main Library - Shelf A3', 2008, 'A handbook of agile software craftsmanship with practical advice on writing clean, maintainable code.'),
  ('Atomic Habits', 'James Clear', '9780735211292', 'Business', 'Non-Fiction', 3, 'Main Library - Shelf B1', 2018, 'An easy and proven way to build good habits and break bad ones.'),
  ('Deep Work', 'Cal Newport', '9781455586691', 'Business', 'Non-Fiction', 5, 'Main Library - Shelf B2', 2016, 'Rules for focused success in a distracted world.'),
  ('Python for Data Analysis', 'Wes McKinney', '9781491957660', 'Computer Science', 'Non-Fiction', 2, 'Main Library - Shelf A4', 2017, 'Data wrangling with pandas, NumPy and IPython.'),
  ('Machine Learning', 'Tom Mitchell', '9780070428072', 'Computer Science', 'Non-Fiction', 3, 'Main Library - Shelf A5', 1997, 'A classic introduction to machine learning algorithms.'),
  ('Database System Concepts', 'Abraham Silberschatz', '9780078022159', 'Computer Science', 'Non-Fiction', 4, 'Main Library - Shelf A2', 2019, 'Foundations of relational databases, SQL and transactions.'),
  ('Automate the Boring Stuff with Python', 'Al Sweigart', '9781593279929', 'Computer Science', 'Non-Fiction', 3, 'Main Library - Shelf A4', 2019, 'Practical programming for total beginners.'),
  ('Python Crash Course', 'Eric Matthes', '9781593279288', 'Computer Science', 'Non-Fiction', 1, 'Main Library - Shelf A4', 2019, 'A hands-on, project-based introduction to programming.'),
  ('Thinking, Fast and Slow', 'Daniel Kahneman', '9780374533557', 'Others', 'Non-Fiction', 2, 'Main Library - Shelf C1', 2011, 'How two systems of thought shape our judgments.'),
  ('The Psychology of Money', 'Morgan Housel', '9780857197689', 'Business', 'Non-Fiction', 3, 'Main Library - Shelf B3', 2020, 'Timeless lessons on wealth, greed and happiness.'),
  ('A Brief History of Time', 'Stephen Hawking', '9780553380163', 'Science', 'Non-Fiction', 2, 'Main Library - Shelf D1', 1988, 'From the Big Bang to black holes.'),
  ('Calculus', 'James Stewart', '9781285740621', 'Math', 'Non-Fiction', 3, 'Main Library - Shelf E2', 2015, 'Early transcendentals for science and engineering.'),
  ('Pride and Prejudice', 'Jane Austen', '9780141439518', 'Literature', 'Classic', 2, 'Main Library - Shelf F1', 1813, 'A classic novel of manners and marriage.'),
  ('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Literature', 'Classic', 3, 'Main Library - Shelf F1', 1925, 'A story of wealth, love and illusion in 1920s America.'),
  ('1984', 'George Orwell', '9780451524935', 'Literature', 'Classic', 4, 'Main Library - Shelf F2', 1949, 'A dystopian novel about surveillance and control.'),
  ('To Kill a Mockingbird', 'Harper Lee', '9780061120084', 'Literature', 'Classic', 3, 'Main Library - Shelf F2', 1960, 'A young girl watches her father defend an innocent man in the American South.'),
  ('Jane Eyre', 'Charlotte Bronte', '9780141441146', 'Literature', 'Classic', 2, 'Main Library - Shelf F1', 1847, 'The life and independence of an orphan who becomes a governess.'),
  ('Wuthering Heights', 'Emily Bronte', '9780141439556', 'Literature', 'Classic', 2, 'Main Library - Shelf F1', 1847, 'A dark story of love and revenge on the Yorkshire moors.'),
  ('The Alchemist', 'Paulo Coelho', '9780062315007', 'Literature', 'Fiction', 4, 'Main Library - Shelf G1', 1988, 'A shepherd boy travels in search of treasure and discovers his purpose.'),
  ('The Kite Runner', 'Khaled Hosseini', '9781594631931', 'Literature', 'Fiction', 2, 'Main Library - Shelf G1', 2003, 'A story of friendship, guilt and redemption in Afghanistan.'),
  ('Life of Pi', 'Yann Martel', '9780156027328', 'Literature', 'Fiction', 2, 'Main Library - Shelf G2', 2001, 'A boy survives at sea with a Bengal tiger.'),
  ('Harry Potter and the Sorcerers Stone', 'J. K. Rowling', '9780590353427', 'Literature', 'Fiction', 5, 'Main Library - Shelf G2', 1997, 'A young wizard begins his first year at Hogwarts.'),
  ('Sapiens', 'Yuval Noah Harari', '9780062316110', 'Others', 'Non-Fiction', 3, 'Main Library - Shelf C2', 2011, 'A brief history of humankind.'),
  ('The Diary of a Young Girl', 'Anne Frank', '9780553296983', 'Others', 'Non-Fiction', 2, 'Main Library - Shelf C2', 1947, 'The wartime diary of a teenager in hiding.')
) AS v(title, author, isbn, category, genre, quantity, location, year, description)
JOIN categories c ON c.name = v.category
ON CONFLICT (isbn) DO NOTHING;

-- Three sample loans (one of them overdue). Only inserted while the borrowings table is empty.
INSERT INTO borrowings (book_id, student_id, borrowed_at, due_at, returned_at)
SELECT * FROM (
  SELECT b.id AS book_id, s.id AS student_id, now() - interval '20 days' AS borrowed_at, now() - interval '6 days' AS due_at, NULL::timestamptz AS returned_at
    FROM books b, students s WHERE b.title = 'Clean Code' AND s.email = 'pema@sherubtse.edu.bt'
  UNION ALL
  SELECT b.id, s.id, now() - interval '30 days', now() - interval '16 days', now() - interval '18 days'
    FROM books b, students s WHERE b.title = 'Atomic Habits' AND s.email = 'pema@sherubtse.edu.bt'
  UNION ALL
  SELECT b.id, s.id, now() - interval '2 days', now() + interval '12 days', NULL
    FROM books b, students s WHERE b.title = 'Python Crash Course' AND s.email = 'pema@sherubtse.edu.bt'
) sample
WHERE NOT EXISTS (SELECT 1 FROM borrowings);
