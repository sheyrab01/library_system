const Category = require('../../models/Category');

exports.list = async (req, res) => res.json(await Category.all());
exports.create = async (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ errors: ['Name is required'] });
  try { res.status(201).json(await Category.create(name, req.body.description)); }
  catch (e) { if (e.code === '23505') return res.status(409).json({ errors: ['Category exists'] }); throw e; }
};
exports.remove = async (req, res) => {
  const r = await Category.remove(req.params.id);
  r.rowCount ? res.status(204).end() : res.status(404).json({ error: 'Category not found' });
};
