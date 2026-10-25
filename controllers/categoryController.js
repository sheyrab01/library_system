const Category = require('../models/Category');

exports.manage = async (req, res) =>
  res.render('librarian/categories', { title: 'Manage Categories', active: 'categories', categories: await Category.all() });

exports.create = async (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) res.flash('error', 'Category name is required.');
  else try { await Category.create(name, req.body.description); res.flash('success', 'Category added.'); }
  catch (e) { if (e.code !== '23505') throw e; res.flash('error', 'That category already exists.'); }
  res.redirect('/librarian/categories');
};

exports.remove = async (req, res) => {
  await Category.remove(req.params.id);
  res.flash('success', 'Category removed (its books are now uncategorised).');
  res.redirect('/librarian/categories');
};
