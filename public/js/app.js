// Confirm dialogs for destructive forms
document.querySelectorAll('form[data-confirm]').forEach(f =>
  f.addEventListener('submit', e => { if (!confirm(f.dataset.confirm)) e.preventDefault(); }));

// Auto-dismiss flash messages
setTimeout(() => document.querySelectorAll('.flash').forEach(f => (f.style.display = 'none')), 5000);

// Live catalogue: category chips + search-as-you-type, backed by GET /api/books
(function () {
  const grid = document.getElementById('bookGrid');
  if (!grid) return;
  const input = document.getElementById('liveSearch');
  const empty = document.getElementById('emptyMsg');
  let category = (document.querySelector('#chips .chip.on') || {}).dataset?.cat || 'all';
  let genre = (document.querySelector('#genreChips .chip.on') || {}).dataset?.genre || 'all';
  let timer;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cover = t => { let h = 0; for (const c of t) h = (h * 31 + c.charCodeAt(0)) % 360;
    return `background:linear-gradient(145deg,hsl(${h},55%,28%),hsl(${(h + 40) % 360},60%,18%))`; };

  const coverSrc = b => b.cover_url || `https://covers.openlibrary.org/b/isbn/${String(b.isbn).replace(/[^0-9Xx]/g, '')}-L.jpg?default=false`;

  const card = b => `
    <article class="card book-card">
      <a href="/books/${b.id}"><div class="cover" style="${cover(b.title)}"><span>${esc(b.title)}</span><img src="${esc(coverSrc(b))}" alt="Cover of ${esc(b.title)}" loading="lazy" onerror="this.remove()"></div></a>
      <h3>${esc(b.title)}</h3><p class="muted">${esc(b.author)}</p><small class="genre-tag">${esc(b.genre)}</small>
      <span class="badge ${b.available > 0 ? 'ok' : 'err'}">${b.available > 0 ? 'Available: ' + b.available : 'Unavailable'}</span>
      <a class="btn block" href="/books/${b.id}">View Details</a>
    </article>`;

  async function load() {
    const params = new URLSearchParams({ q: input.value.trim(), category, genre });
    const res = await fetch('/api/books?' + params);
    if (!res.ok) return;
    const books = await res.json();
    grid.innerHTML = books.map(card).join('');
    empty.hidden = books.length > 0;
  }

  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(load, 200); });
  // subject chips and genre chips are two separate filter rows
  document.getElementById('chips').addEventListener('click', e => {
    const chip = e.target.closest('.chip'); if (!chip) return;
    document.querySelectorAll('#chips .chip').forEach(c => c.classList.toggle('on', c === chip));
    category = chip.dataset.cat; load();
  });
  document.getElementById('genreChips').addEventListener('click', e => {
    const chip = e.target.closest('.chip'); if (!chip) return;
    document.querySelectorAll('#genreChips .chip').forEach(c => c.classList.toggle('on', c === chip));
    genre = chip.dataset.genre; load();
  });
})();

// Keep dashboard numbers fresh via GET /api/stats
(function () {
  if (!document.querySelector('[data-stat]')) return;
  const refresh = async () => {
    const res = await fetch('/api/stats'); if (!res.ok) return;
    const { stats } = await res.json();
    Object.entries(stats).forEach(([k, v]) => { const el = document.querySelector(`[data-stat="${k}"]`); if (el) el.textContent = v; });
  };
  setInterval(refresh, 15000);
})();
