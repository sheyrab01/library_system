const Borrowing = require('../models/Borrowing');

exports.mine = async (req, res) => {
  const borrowings = await Borrowing.forStudent(req.session.user.id);
  res.render('my_borrowings', { title: 'My Borrowings', active: 'mine', borrowings });
};

exports.borrow = async (req, res) => {
  try {
    await Borrowing.create(req.params.id, req.session.user.id);
    res.flash('success', `Borrowed! Please return it within ${Borrowing.LOAN_DAYS} days.`);
    res.redirect('/my-borrowings');
  } catch (e) {
    if (!e.userMessage) throw e;
    res.flash('error', e.userMessage);
    res.redirect(`/books/${req.params.id}`);
  }
};

exports.giveBack = async (req, res) => {
  const r = await Borrowing.markReturned(req.params.id, req.session.user);
  res.flash(r ? 'success' : 'error', r ? 'Book marked as returned.' : 'Could not return that record.');
  res.redirect(req.body.back || '/my-borrowings');
};

exports.records = async (req, res) =>
  res.render('librarian/borrowings', { title: 'Borrowing Records', active: 'records', borrowings: await Borrowing.all() });
