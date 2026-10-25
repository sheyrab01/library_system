const Borrowing = require('../../models/Borrowing');

exports.list = async (req, res) => {
  const u = req.session.user;
  res.json(u.role === 'librarian' ? await Borrowing.all() : await Borrowing.forStudent(u.id));
};

exports.create = async (req, res) => {
  try { res.status(201).json(await Borrowing.create(req.body.book_id, req.session.user.id)); }
  catch (e) { if (e.userMessage) return res.status(400).json({ error: e.userMessage }); throw e; }
};

exports.giveBack = async (req, res) => {
  const r = await Borrowing.markReturned(req.params.id, req.session.user);
  r ? res.json(r) : res.status(404).json({ error: 'No active borrowing found' });
};
