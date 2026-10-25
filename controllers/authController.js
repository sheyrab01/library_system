const bcrypt = require('bcryptjs');
const Student = require('../models/Student');

exports.loginForm = (req, res) => res.render('login', { title: 'Login' });

exports.login = async (req, res) => {
  const { email = '', password = '', role } = req.body;
  const user = await Student.findByEmail(email.trim());

  // same message for "no such user" and "wrong password" so nobody can guess which emails exist
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.flash('error', 'Invalid email or password.');
    return res.redirect('/login');
  }
  // the "Log in as" choice on the form must match the account type
  if (role && role !== user.role) {
    res.flash('error', `This is a ${user.role} account. Please choose "${user.role}" and try again.`);
    return res.redirect('/login');
  }
  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
  res.redirect('/');
};

exports.registerForm = (req, res) => res.render('register', { title: 'Register' });
exports.librarianRegisterForm = (req, res) => res.render('register_librarian', { title: 'Register librarian' });

exports.register = (req, res) => createAccount(req, res, 'student');
exports.registerLibrarian = (req, res) => createAccount(req, res, 'librarian');

async function createAccount(req, res, role) {
  const { name = '', student_id = '', password = '', confirm_password, librarian_code = '' } = req.body;
  const email = (req.body.email || '').trim().toLowerCase();
  const registerPath = role === 'librarian' ? '/register/librarian' : '/register';

  if (!name.trim() || !student_id.trim() || !email || password.length < 6) {
    res.flash('error', 'All fields are required and the password needs at least 6 characters.');
    return res.redirect(registerPath);
  }
  if (confirm_password !== undefined && confirm_password !== password) {
    res.flash('error', 'The two passwords do not match.');
    return res.redirect(registerPath);
  }

  if (role === 'librarian' && (!process.env.LIBRARIAN_CODE || librarian_code.trim() !== process.env.LIBRARIAN_CODE)) {
    res.flash('error', 'Wrong librarian access code.');
    return res.redirect(registerPath);
  }

  try {
    const user = await Student.create({
      name: name.trim(), student_id: student_id.trim(), email,
      password_hash: bcrypt.hashSync(password, 10), role
    });
    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    res.flash('success', `Welcome, ${user.name}! Your ${role} account has been created.`);
    res.redirect('/');
  } catch (e) {
    if (e.code === '23505') {
      res.flash('error', 'That email or student ID is already registered.');
      return res.redirect(registerPath);
    }
    throw e;
  }
}

exports.logout = (req, res) => req.session.destroy(() => res.redirect('/login'));
