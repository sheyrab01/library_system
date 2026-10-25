-- Full backup of the library_finder database (tables + demo data) made with pg_dump.
-- pgAdmin: create an empty database, right-click it > Query Tool > open this file > run (F5).
-- Or from a terminal: psql -U postgres -d library_finder -f database/library_finder_full.sql

--
-- PostgreSQL database dump
--


-- Dumped from database version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: books; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.books (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    author character varying(160) NOT NULL,
    isbn character varying(20) NOT NULL,
    category_id integer,
    genre character varying(20) DEFAULT 'Non-Fiction'::character varying NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    location character varying(120) DEFAULT ''::character varying,
    published_year integer,
    description text DEFAULT ''::text,
    cover_url text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT books_genre_check CHECK (((genre)::text = ANY ((ARRAY['Fiction'::character varying, 'Non-Fiction'::character varying, 'Classic'::character varying])::text[]))),
    CONSTRAINT books_quantity_check CHECK ((quantity >= 0))
);


--
-- Name: books_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.books_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: books_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.books_id_seq OWNED BY public.books.id;


--
-- Name: borrowings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.borrowings (
    id integer NOT NULL,
    book_id integer NOT NULL,
    student_id integer NOT NULL,
    borrowed_at timestamp with time zone DEFAULT now() NOT NULL,
    due_at timestamp with time zone NOT NULL,
    returned_at timestamp with time zone
);


--
-- Name: borrowings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.borrowings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: borrowings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.borrowings_id_seq OWNED BY public.borrowings.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(80) NOT NULL,
    description text DEFAULT ''::text
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.students (
    id integer NOT NULL,
    name character varying(120) NOT NULL,
    student_id character varying(40) NOT NULL,
    email character varying(160) NOT NULL,
    password_hash text NOT NULL,
    role character varying(20) DEFAULT 'student'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT students_role_check CHECK (((role)::text = ANY ((ARRAY['student'::character varying, 'librarian'::character varying])::text[])))
);


--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.students_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- Name: books id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books ALTER COLUMN id SET DEFAULT nextval('public.books_id_seq'::regclass);


--
-- Name: borrowings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.borrowings ALTER COLUMN id SET DEFAULT nextval('public.borrowings_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: students id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.books VALUES (1, 'Python Crash Course', 'Eric Matthes', '9781593279288', 1, 'Non-Fiction', 1, 'Main Library - Shelf A4', 2019, 'A hands-on, project-based introduction to programming.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (2, 'Automate the Boring Stuff with Python', 'Al Sweigart', '9781593279929', 1, 'Non-Fiction', 3, 'Main Library - Shelf A4', 2019, 'Practical programming for total beginners.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (3, 'Database System Concepts', 'Abraham Silberschatz', '9780078022159', 1, 'Non-Fiction', 4, 'Main Library - Shelf A2', 2019, 'Foundations of relational databases, SQL and transactions.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (4, 'Machine Learning', 'Tom Mitchell', '9780070428072', 1, 'Non-Fiction', 3, 'Main Library - Shelf A5', 1997, 'A classic introduction to machine learning algorithms.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (5, 'Python for Data Analysis', 'Wes McKinney', '9781491957660', 1, 'Non-Fiction', 2, 'Main Library - Shelf A4', 2017, 'Data wrangling with pandas, NumPy and IPython.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (6, 'Clean Code', 'Robert C. Martin', '9780132350884', 1, 'Non-Fiction', 4, 'Main Library - Shelf A3', 2008, 'A handbook of agile software craftsmanship with practical advice on writing clean, maintainable code.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (7, 'The Psychology of Money', 'Morgan Housel', '9780857197689', 2, 'Non-Fiction', 3, 'Main Library - Shelf B3', 2020, 'Timeless lessons on wealth, greed and happiness.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (8, 'Deep Work', 'Cal Newport', '9781455586691', 2, 'Non-Fiction', 5, 'Main Library - Shelf B2', 2016, 'Rules for focused success in a distracted world.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (9, 'Atomic Habits', 'James Clear', '9780735211292', 2, 'Non-Fiction', 3, 'Main Library - Shelf B1', 2018, 'An easy and proven way to build good habits and break bad ones.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (10, 'Harry Potter and the Sorcerers Stone', 'J. K. Rowling', '9780590353427', 3, 'Fiction', 5, 'Main Library - Shelf G2', 1997, 'A young wizard begins his first year at Hogwarts.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (11, 'Life of Pi', 'Yann Martel', '9780156027328', 3, 'Fiction', 2, 'Main Library - Shelf G2', 2001, 'A boy survives at sea with a Bengal tiger.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (12, 'The Kite Runner', 'Khaled Hosseini', '9781594631931', 3, 'Fiction', 2, 'Main Library - Shelf G1', 2003, 'A story of friendship, guilt and redemption in Afghanistan.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (13, 'The Alchemist', 'Paulo Coelho', '9780062315007', 3, 'Fiction', 4, 'Main Library - Shelf G1', 1988, 'A shepherd boy travels in search of treasure and discovers his purpose.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (14, 'Wuthering Heights', 'Emily Bronte', '9780141439556', 3, 'Classic', 2, 'Main Library - Shelf F1', 1847, 'A dark story of love and revenge on the Yorkshire moors.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (15, 'Jane Eyre', 'Charlotte Bronte', '9780141441146', 3, 'Classic', 2, 'Main Library - Shelf F1', 1847, 'The life and independence of an orphan who becomes a governess.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (16, 'To Kill a Mockingbird', 'Harper Lee', '9780061120084', 3, 'Classic', 3, 'Main Library - Shelf F2', 1960, 'A young girl watches her father defend an innocent man in the American South.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (17, '1984', 'George Orwell', '9780451524935', 3, 'Classic', 4, 'Main Library - Shelf F2', 1949, 'A dystopian novel about surveillance and control.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (18, 'The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 3, 'Classic', 3, 'Main Library - Shelf F1', 1925, 'A story of wealth, love and illusion in 1920s America.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (19, 'Pride and Prejudice', 'Jane Austen', '9780141439518', 3, 'Classic', 2, 'Main Library - Shelf F1', 1813, 'A classic novel of manners and marriage.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (20, 'A Brief History of Time', 'Stephen Hawking', '9780553380163', 4, 'Non-Fiction', 2, 'Main Library - Shelf D1', 1988, 'From the Big Bang to black holes.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (21, 'Calculus', 'James Stewart', '9781285740621', 5, 'Non-Fiction', 3, 'Main Library - Shelf E2', 2015, 'Early transcendentals for science and engineering.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (22, 'The Diary of a Young Girl', 'Anne Frank', '9780553296983', 6, 'Non-Fiction', 2, 'Main Library - Shelf C2', 1947, 'The wartime diary of a teenager in hiding.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (23, 'Sapiens', 'Yuval Noah Harari', '9780062316110', 6, 'Non-Fiction', 3, 'Main Library - Shelf C2', 2011, 'A brief history of humankind.', NULL, '2026-10-24 14:32:05.013128+00');
INSERT INTO public.books VALUES (24, 'Thinking, Fast and Slow', 'Daniel Kahneman', '9780374533557', 6, 'Non-Fiction', 2, 'Main Library - Shelf C1', 2011, 'How two systems of thought shape our judgments.', NULL, '2026-10-24 14:32:05.013128+00');


--
-- Data for Name: borrowings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.borrowings VALUES (1, 6, 1, '2026-10-04 14:32:05.013128+00', '2026-10-18 14:32:05.013128+00', NULL);
INSERT INTO public.borrowings VALUES (2, 9, 1, '2026-09-24 14:32:05.013128+00', '2026-10-08 14:32:05.013128+00', '2026-10-06 14:32:05.013128+00');
INSERT INTO public.borrowings VALUES (3, 1, 1, '2026-10-22 14:32:05.013128+00', '2026-11-05 14:32:05.013128+00', NULL);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.categories VALUES (1, 'Computer Science', '');
INSERT INTO public.categories VALUES (2, 'Business', '');
INSERT INTO public.categories VALUES (3, 'Literature', '');
INSERT INTO public.categories VALUES (4, 'Science', '');
INSERT INTO public.categories VALUES (5, 'Math', '');
INSERT INTO public.categories VALUES (6, 'Others', '');


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.students VALUES (1, 'Pema Dorji', '02230001', 'pema@sherubtse.edu.bt', '$2a$10$TYnkezhvq69CQuiWNVEUMe1fG9vxIlMdOjMNXK4kZi6dRzTNI7OxW', 'student', '2026-10-24 14:32:05.013128+00');
INSERT INTO public.students VALUES (2, 'Tashi Wangmo', '02230002', 'tashi@sherubtse.edu.bt', '$2a$10$TYnkezhvq69CQuiWNVEUMe1fG9vxIlMdOjMNXK4kZi6dRzTNI7OxW', 'student', '2026-10-24 14:32:05.013128+00');
INSERT INTO public.students VALUES (3, 'Librarian', 'LIB001', 'librarian@sherubtse.edu.bt', '$2a$10$H2YtHgPDMtdCX8wsJwpb6u0yw4yVMfxV7l0ExVkDKiqi7TJErBiVG', 'librarian', '2026-10-24 14:32:05.013128+00');


--
-- Name: books_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.books_id_seq', 24, true);


--
-- Name: borrowings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.borrowings_id_seq', 3, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 6, true);


--
-- Name: students_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.students_id_seq', 3, true);


--
-- Name: books books_isbn_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_isbn_key UNIQUE (isbn);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- Name: borrowings borrowings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.borrowings
    ADD CONSTRAINT borrowings_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: students students_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_email_key UNIQUE (email);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: students students_student_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_student_id_key UNIQUE (student_id);


--
-- Name: idx_books_genre; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_genre ON public.books USING btree (genre);


--
-- Name: idx_books_title; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_books_title ON public.books USING btree (lower((title)::text));


--
-- Name: idx_borrowings_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_borrowings_active ON public.borrowings USING btree (book_id) WHERE (returned_at IS NULL);


--
-- Name: books books_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: borrowings borrowings_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.borrowings
    ADD CONSTRAINT borrowings_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id);


--
-- Name: borrowings borrowings_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.borrowings
    ADD CONSTRAINT borrowings_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- PostgreSQL database dump complete
--


