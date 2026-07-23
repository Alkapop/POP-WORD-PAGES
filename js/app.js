/* POP-WORD app — hash router, interactions, progress, lexicon panel. */
(function () {
  var view = document.getElementById('view');
  var veil = document.getElementById('veil');
  var lexPanel = document.getElementById('lexicon-panel');
  var lexScrim = document.getElementById('lexicon-scrim');
  var lexBody = document.getElementById('lex-body');

  /* ── State (storage may be unavailable on some file:// setups) ── */
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* session-only */ } }
  window.POPStore = { get: lsGet, set: lsSet };

  function progress() {
    try { return JSON.parse(lsGet('popword-progress', '{}')); }
    catch (e) { return {}; }
  }
  function setProgress(key, val) {
    var p = progress();
    if (val) p[key] = Date.now(); else delete p[key];
    lsSet('popword-progress', JSON.stringify(p));
  }

  var fontScale = parseFloat(lsGet('popword-font', '1'));
  function applyFont() {
    document.documentElement.style.setProperty('--size-body', (1.075 * fontScale) + 'rem');
    lsSet('popword-font', String(fontScale));
  }
  applyFont();

  var theme = lsGet('popword-theme', 'dark');
  document.body.setAttribute('data-theme', theme);

  /* ── Router ───────────────────────────────────────────────── */
  function route() {
    var hash = location.hash.replace(/^#\/?/, '');
    var parts = hash.split('/').filter(Boolean);
    veil.classList.add('on');
    setTimeout(function () {
      if (parts[0] === 'book' && parts[1]) renderJourney(parts[1]);
      else if (parts[0] === 'read' && parts[1] && parts[2]) renderDoc(parts[1], parts[2]);
      else renderHome();
      veil.classList.remove('on');
      view.focus({ preventScroll: true });
      window.scrollTo(0, 0);
      observeReveals();
    }, 180);
  }

  function go(hash) {
    if (window.POPSound) POPSound.pageTurn();
    if (location.hash === hash) route(); else location.hash = hash;
  }

  /* ── Views ────────────────────────────────────────────────── */
  function renderHome() {
    view.innerHTML = POPRender.home(progress());
  }

  function getBook(id) {
    return window.POP.books.find(function (b) { return b.id === id; });
  }

  function renderJourney(bookId) {
    var b = getBook(bookId);
    if (!b) return renderHome();
    view.innerHTML = POPRender.journey(b, window.POP.content[bookId], progress());
    view.setAttribute('data-book', bookId);
  }

  function docSeq(b, content) {
    var seq = [{ key: 'intro', title: 'Master Introduction' }];
    for (var i = 1; i <= b.chapters; i++) {
      var ch = content && content.chapters ? content.chapters[i - 1] : null;
      seq.push({ key: String(i), title: 'Chapter ' + i + (ch ? ' — ' + ch.chapterTitle : '') });
    }
    seq.push({ key: 'review', title: 'The Final Masterclass Review' });
    return seq;
  }

  function renderDoc(bookId, docKey) {
    var b = getBook(bookId);
    var content = window.POP.content[bookId];
    if (!b || !content) return renderHome();
    var seq = docSeq(b, content);
    var idx = seq.findIndex(function (s) { return s.key === docKey; });
    if (idx < 0) return renderJourney(bookId);
    var opts = {
      backLabel: b.name,
      done: !!progress()[bookId + ':' + docKey],
      prev: idx > 0 ? seq[idx - 1] : null,
      next: idx < seq.length - 1 ? seq[idx + 1] : null
    };
    var data = docKey === 'intro' ? content.intro
      : docKey === 'review' ? content.review
      : content.chapters[parseInt(docKey, 10) - 1];
    if (!data) return renderJourney(bookId);
    var html;
    if (docKey === 'intro') html = POPRender.intro(data, opts);
    else if (docKey === 'review') html = POPRender.review(data, opts);
    else html = POPRender.chapter(data, opts);
    view.innerHTML = html;
    view.setAttribute('data-book', bookId);
    view.setAttribute('data-doc', docKey);
  }

  /* ── Reveal on scroll ─────────────────────────────────────── */
  var observer = null;
  function observeReveals() {
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('seen'); observer.unobserve(en.target); }
      });
    }, { threshold: 0.06 });
    view.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });
  }

  /* ── Lexicon panel ────────────────────────────────────────── */
  function openLexicon(strongsId) {
    lexBody.innerHTML = POPRender.lexEntry(strongsId);
    lexPanel.classList.add('open');
    lexScrim.classList.add('open');
    lexPanel.setAttribute('aria-hidden', 'false');
    if (window.POPSound) POPSound.tick();
  }
  function closeLexicon() {
    lexPanel.classList.remove('open');
    lexScrim.classList.remove('open');
    lexPanel.setAttribute('aria-hidden', 'true');
  }
  document.getElementById('lex-close').addEventListener('click', closeLexicon);
  lexScrim.addEventListener('click', closeLexicon);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLexicon(); });

  /* ── Delegated clicks ─────────────────────────────────────── */
  view.addEventListener('click', function (e) {
    var t;

    if ((t = e.target.closest('[data-strongs]'))) {
      e.stopPropagation();
      openLexicon(t.getAttribute('data-strongs'));
      return;
    }
    if ((t = e.target.closest('.verse'))) {
      var v = t.getAttribute('data-verse');
      var x = view.querySelector('[data-verse-x="' + v + '"]');
      var isOpen = x.classList.contains('open');
      t.classList.toggle('open', !isOpen);
      x.classList.toggle('open', !isOpen);
      if (!isOpen && window.POPSound) POPSound.tick();
      return;
    }
    if ((t = e.target.closest('.book-card')) && t.getAttribute('data-book')) {
      go('#/book/' + t.getAttribute('data-book'));
      return;
    }
    if ((t = e.target.closest('.station'))) {
      go('#/read/' + view.getAttribute('data-book') + '/' + t.getAttribute('data-doc'));
      return;
    }
    if ((t = e.target.closest('[data-goto]'))) {
      go('#/read/' + view.getAttribute('data-book') + '/' + t.getAttribute('data-goto'));
      return;
    }
    if ((t = e.target.closest('[data-nav]'))) {
      if (t.getAttribute('data-nav') === 'home') go('#/');
      else go('#/book/' + view.getAttribute('data-book'));
      return;
    }
    if ((t = e.target.closest('[data-complete]'))) {
      var key = view.getAttribute('data-book') + ':' + view.getAttribute('data-doc');
      var was = !!progress()[key];
      setProgress(key, !was);
      t.classList.toggle('done', !was);
      t.innerHTML = !was ? '<span class="btn-ico">' + icon('check') + '</span> Walked Out' : 'I Have Walked This Out';
      if (!was && window.POPSound) POPSound.chime();
      return;
    }
  });

  /* ── Static icon glyphs (rendered once from the offline icon set) ── */
  function icon(name) { return window.POPIcons ? POPIcons.get(name) : ''; }
  function setGlyph(id, name) { var el = document.getElementById(id); if (el) el.innerHTML = icon(name); }
  setGlyph('brand-mark', 'spark');
  setGlyph('btn-music', 'music');
  setGlyph('btn-sound', 'bell');
  setGlyph('btn-theme', 'contrast');
  setGlyph('lex-close', 'x');
  var lexTitleEl = document.getElementById('lex-title');
  if (lexTitleEl) lexTitleEl.innerHTML = '<span class="lbl-ico">' + icon('glyph') + '</span> Lexicon';

  /* ── Top bar controls ─────────────────────────────────────── */
  document.getElementById('brand').addEventListener('click', function () { go('#/'); });
  document.getElementById('btn-theme').addEventListener('click', function () {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', theme);
    lsSet('popword-theme', theme);
  });
  document.getElementById('btn-font-plus').addEventListener('click', function () {
    fontScale = Math.min(1.35, fontScale + 0.07); applyFont();
  });
  document.getElementById('btn-font-minus').addEventListener('click', function () {
    fontScale = Math.max(0.8, fontScale - 0.07); applyFont();
  });
  var btnSound = document.getElementById('btn-sound');
  function paintSound() { btnSound.classList.toggle('off', !POPSound.isEnabled()); }
  btnSound.addEventListener('click', function () { POPSound.toggle(); paintSound(); });
  paintSound();

  var btnMusic = document.getElementById('btn-music');
  function paintMusic() { btnMusic.classList.toggle('off', !POPMusic.isEnabled()); }
  btnMusic.addEventListener('click', function () { POPMusic.toggle(); paintMusic(); });
  paintMusic();
  /* Browsers block audio until a user gesture — start the score (if the
     user left it enabled) on the first interaction of the session. */
  function primeAudio() {
    if (window.POPMusic) POPMusic.resumeIfEnabled();
    window.removeEventListener('pointerdown', primeAudio);
    window.removeEventListener('keydown', primeAudio);
  }
  window.addEventListener('pointerdown', primeAudio);
  window.addEventListener('keydown', primeAudio);

  window.addEventListener('hashchange', route);
  route();
})();
