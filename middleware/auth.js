const isApi = req => req.originalUrl.startsWith('/api');

exports.requireLogin = (req, res, next) => {
  if (req.session.user) return next();
  if (isApi(req)) return res.status(401).json({ error: 'Login required' });
  res.redirect('/login');
};

exports.requireLibrarian = (req, res, next) => {
  const u = req.session.user;
  if (u && u.role === 'librarian') return next();
  if (isApi(req)) return res.status(u ? 403 : 401).json({ error: 'Librarian access required' });
  res.status(403).render('error', { title: 'Forbidden', message: 'Librarian access required.' });
};
