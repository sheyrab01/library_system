// Makes the session user, flash messages and view helpers available to every template
module.exports = (req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  res.locals.currentPath = req.path;
  res.locals.q = '';
  res.locals.active = '';
  res.flash = (type, text) => { req.session.flash = { type, text }; };

  res.locals.fmtDate = d => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
  // Deterministic gradient for generated book covers
  res.locals.coverStyle = title => {
    let h = 0;
    for (const ch of title) h = (h * 31 + ch.charCodeAt(0)) % 360;
    return `background:linear-gradient(145deg,hsl(${h},55%,28%),hsl(${(h + 40) % 360},60%,18%))`;
  };
  // Cover photo: the librarian's own link, otherwise the Open Library cover for the ISBN
  res.locals.coverUrl = book => book.cover_url ||
    `https://covers.openlibrary.org/b/isbn/${String(book.isbn).replace(/[^0-9Xx]/g, '')}-L.jpg?default=false`;
  next();
};
