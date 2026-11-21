/* POP-WORD renderers — build every view from registered content. */
window.POPRender = (function () {

  function esc(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* escape + preserve embedded line breaks (WEB verse text can contain them) */
  function nl(s) { return esc(s).replace(/\n/g, '<br>'); }

  function paras(arr, leadCap) {
    return (arr || []).map(function (p, i) {
      return '<p class="' + (leadCap && i === 0 ? 'lead-cap' : '') + '">' + nl(p) + '</p>';
    }).join('');
  }

  function rev(cls, i) { return '<div class="reveal" style="transition-delay:' + Math.min(i * 60, 300) + 'ms">'; }

  function ico(name) { return window.POPIcons ? POPIcons.get(name) : ''; }
  /* "Hebrew" for OT documents, "Greek" for NT — detected from the Strong's prefix */
  function lexTitle(d) {
    var first = (d.lexicon && d.lexicon[0] && d.lexicon[0].strongs) || '';
    return first.charAt(0).toUpperCase() === 'G' ? 'Greek' : 'Hebrew';
  }
  /* a section header with a leading icon badge */
  /* Theme titles are written with or without their own quotation marks; the app adds them, so strip any. */
  function unq(s) { return String(s == null ? '' : s).trim().replace(/^[“"']+|[”"']+$/g, ''); }
  function hd(name, text) { return '<span class="sec-ico">' + ico(name) + '</span>' + text; }
  /* a document title with a leading icon */
  function tt(name, text) { return '<span class="doc-ico">' + ico(name) + '</span>' + text; }

  /* ── Home ─────────────────────────────────────────────────── */
  function home(progress) {
    var h = '';
    h += '<div class="hero rise">';
    h += '<div class="hero-kicker">An Experiential Walk Through the Word</div>';
    h += '<h1>POP·WORD</h1>';
    h += '<div class="hero-sub">The truth of the truth — studied book by book, chapter by chapter, walked out in real life.</div>';
    h += '<div class="hero-rule">' + ico('spark') + '</div>';
    h += '<div class="verse-of-fire"><p>“The LORD your God is in your midst, a mighty one who will save. He will rejoice over you with joy. He will calm you in his love. He will rejoice over you with singing.”</p><cite>Zephaniah 3:17 · WEB</cite></div>';
    h += '</div>';

    var groups = [
      { t: 'OT', title: 'The Old Testament' },
      { t: 'NT', title: 'The New Testament' }
    ];
    groups.forEach(function (g) {
      var list = window.POP.books.filter(function (b) { return (b.testament || 'OT') === g.t; });
      if (!list.length) return;
      var live = list.filter(function (b) { return b.available; }).length;
      h += '<div class="shelf-title rise">' + esc(g.title) +
        '<span class="shelf-count">' + live + ' / ' + list.length + ' ready</span></div>';
      h += '<div class="shelf">';
      list.forEach(function (b, i) {
        var docs = bookDocKeys(b);
        var done = docs.filter(function (k) { return progress[b.id + ':' + k]; }).length;
        h += '<button class="book-card reveal ' + (b.available ? '' : 'locked') + '" style="transition-delay:' + Math.min(i * 45, 400) + 'ms" data-book="' + b.id + '" ' + (b.available ? '' : 'disabled') + '>';
        h += '<div class="book-num">Book ' + b.order + ' · ' + b.chapters + ' chapter' + (b.chapters === 1 ? '' : 's') + '</div>';
        h += '<h3>' + esc(b.name) + '</h3>';
        h += '<div class="book-tag">' + esc(b.tagline) + '</div>';
        h += '<div class="book-meta"><span>' + (b.available ? (done === docs.length ? '<span class="meta-ico">' + ico('check') + '</span> Mastered' : done + ' / ' + docs.length + ' walked') : 'Coming soon') + '</span>';
        if (b.available) {
          h += '<span class="progress-ring">' + docs.map(function (k) {
            return '<span class="ring ' + (progress[b.id + ':' + k] ? 'done' : '') + '"></span>';
          }).join('') + '</span>';
        }
        h += '</div></button>';
      });
      h += '</div>';
    });
    return h;
  }

  function bookDocKeys(b) {
    var keys = ['intro'];
    for (var i = 1; i <= b.chapters; i++) keys.push(String(i));
    keys.push('review');
    return keys;
  }

  /* ── Book journey ─────────────────────────────────────────── */
  function journey(book, content, progress) {
    var h = '';
    h += '<div class="journey-head rise">';
    h += '<div class="book-num">Book ' + book.order + ' · The Path Through</div>';
    h += '<h1>' + esc(book.name) + '</h1>';
    h += '<p>' + esc(book.tagline) + '</p>';
    h += '</div>';
    h += '<div class="path">';

    var stations = [{
      key: 'intro', kind: 'Before you enter', title: 'Master Introduction',
      sub: 'Why this book exists, and why you are here.'
    }];
    for (var i = 1; i <= book.chapters; i++) {
      var ch = content && content.chapters ? content.chapters[i - 1] : null;
      stations.push({
        key: String(i), kind: 'Chapter ' + i,
        title: ch ? ch.chapterTitle : 'Chapter ' + i,
        sub: ch ? '“' + unq(ch.themeTitle) + '”' : ''
      });
    }
    stations.push({
      key: 'review', kind: 'When you finish', title: 'The Final Masterclass Review',
      sub: 'Why you were here — and the road to the next two books.'
    });

    stations.forEach(function (s, i) {
      var done = progress[book.id + ':' + s.key];
      var node = s.key === 'intro' ? ico('spark') : (s.key === 'review' ? ico('crown') : s.key);
      h += '<button class="station reveal ' + (done ? 'done' : '') + '" style="transition-delay:' + (i * 70) + 'ms" data-doc="' + s.key + '">';
      h += '<span class="station-node">' + node + '</span>';
      h += '<span class="station-body"><span class="station-kind">' + esc(s.kind) + (done ? ' · walked' : '') + '</span>';
      h += '<h3>' + esc(s.title) + '</h3>';
      if (s.sub) h += '<p>' + esc(s.sub) + '</p>';
      h += '</span></button>';
    });

    h += '</div>';
    return h;
  }

  /* ── Shared doc chrome ────────────────────────────────────── */
  function docShell(inner, opts) {
    var h = '<div class="doc">';
    h += '<div class="doc-nav rise">';
    h += '<button data-nav="back"><span class="nav-ico">' + ico('arrowLeft') + '</span> ' + esc(opts.backLabel) + '</button>';
    h += '<button data-nav="home"><span class="nav-ico">' + ico('home') + '</span> Home</button>';
    h += '</div>';
    h += inner;
    h += '<div class="diamond-rule">' + ico('spark') + ico('spark') + ico('spark') + '</div>';
    h += '<div class="complete-bar"><button class="btn-gold ' + (opts.done ? 'done' : '') + '" data-complete="1">' + (opts.done ? '<span class="btn-ico">' + ico('check') + '</span> Walked Out' : 'I Have Walked This Out') + '</button></div>';
    h += '<div class="next-steps">';
    if (opts.prev) h += '<button class="next-card" data-goto="' + opts.prev.key + '"><span class="dir"><span class="nav-ico">' + ico('arrowLeft') + '</span> Previous</span><span class="nm">' + esc(opts.prev.title) + '</span></button>';
    if (opts.next) h += '<button class="next-card" style="text-align:right" data-goto="' + opts.next.key + '"><span class="dir">Continue <span class="nav-ico">' + ico('arrowRight') + '</span></span><span class="nm">' + esc(opts.next.title) + '</span></button>';
    h += '</div></div>';
    return h;
  }

  function section(i, head, body) {
    return rev('', i) + '<section><h2 class="sec-head">' + head + '</h2>' + body + '</section></div>';
  }

  function titledBlocks(items, numbered, cls) {
    return (items || []).map(function (t, i) {
      var n = numbered ? '<span class="titled-num">' + (i + 1) + '.</span>' : '';
      return '<div class="' + (cls || 'titled-block') + '"><h4>' + n + esc(t.title) + '</h4><p>' + nl(t.body) + '</p></div>';
    }).join('');
  }

  /* ── Master Introduction ──────────────────────────────────── */
  function intro(d, opts) {
    var h = '';
    h += '<div class="rise"><h1 class="doc-title">' + tt('bookOpen', 'Book of ' + esc(d.book) + ': Master Introduction') + '</h1>';
    h += '<div class="doc-kind">Before you enter · read this first</div></div>';
    var i = 0;
    h += section(++i, hd('compass', 'The Big Picture: ' + esc(d.bigPicture.subtitle)), paras(d.bigPicture.paragraphs, true));
    h += section(++i, hd('bridge', 'The Bridge: How ' + esc(d.book) + ' Follows ' + esc(d.bridge.fromBook)),
      '<p>' + esc(d.bridge.intro) + '</p>' + titledBlocks(d.bridge.points));
    h += section(++i, hd('target', 'Core Theme: “' + esc(d.coreTheme.title) + '”'),
      paras(d.coreTheme.paragraphs));
    h += section(++i, hd('book', 'What the Bible Wants Us to Understand Through ' + esc(d.book)),
      '<p class="app-intro">' + esc(d.truths.intro) + '</p>' + titledBlocks(d.truths.items, true));
    h += section(++i, hd('sprout', 'Experiential Preparation'),
      '<p class="app-intro">' + esc(d.preparation.intro) + '</p>' + titledBlocks(d.preparation.items, false, 'leaf-block'));
    h += section(++i, hd('hands', 'Prayer of Activation'), '<div class="prayer">“' + nl(unq(d.prayerOfActivation)) + '”</div>');
    return docShell(h, opts);
  }

  /* ── Chapter Study ────────────────────────────────────────── */
  function chapter(d, opts) {
    var h = '';
    h += '<div class="rise"><h1 class="doc-title">' + tt('bookOpen', esc(d.book) + ' Chapter ' + d.chapter + ' — ' + esc(d.chapterTitle)) + '</h1>';
    h += '<div class="doc-kind">Chapter Study</div></div>';
    var i = 0;

    h += section(++i, hd('target', 'Theme Title'), '<p class="lead-cap" style="font-size:1.25em;font-style:italic">“' + esc(unq(d.themeTitle)) + '”</p>');

    var sv = '<div class="scripture-frame">';
    (d.scripture || []).forEach(function (v) {
      sv += '<button class="verse" data-verse="' + v.v + '"><span class="vnum">' + v.v + '</span>' + nl(v.text) + '</button>';
      sv += '<div class="verse-x" data-verse-x="' + v.v + '"><div class="verse-x-inner">';
      sv += '<span class="u-label">Understanding · v. ' + v.v + '</span>' + nl(v.understanding);
      if (v.words && v.words.length) {
        sv += '<div class="word-chips">' + v.words.map(function (w) {
          return '<button class="chip" data-strongs="' + esc(w.strongs) + '" data-en="' + esc(w.english || '') + '"><span class="heb">' + esc(w.hebrew) + '</span><span>' + esc(w.translit) + '</span><span class="strong-id">' + esc(w.strongs) + '</span></button>';
        }).join('') + '</div>';
      }
      sv += '</div></div>';
    });
    sv += '</div><p class="lex-note" style="text-align:center;margin-top:0.7rem;font-style:italic;color:var(--ink-faint);font-size:0.82rem">Tap any verse to open its understanding. Tap a Greek or Hebrew word to see its meaning, its word family, and everywhere it is used.</p>';
    h += section(++i, hd('scroll', 'Full Scripture — ' + esc(d.book) + ' ' + d.chapter + ' (Focus Study Translation)'), sv);

    h += section(++i, hd('eye', 'Visual Meditations (Clarifying the Imagery)'),
      (d.visualMeditations || []).map(function (m) {
        return '<div class="meditation"><h4>' + esc(m.title) + '<span class="vref">' + esc(m.verseRef) + '</span></h4>' +
          '<span class="med-label">The Image</span><p>' + esc(m.image) + '</p>' +
          '<span class="med-label">The Meaning</span><p>' + esc(m.meaning) + '</p></div>';
      }).join(''));

    var cm = '<ul class="outline">' + (d.commentary.structure || []).map(function (s) {
      return '<li><b>' + esc(s.label) + '</b> — ' + esc(s.body) + '</li>';
    }).join('') + '</ul>';
    cm += (d.commentary.sections || []).map(function (s) {
      return '<div class="titled-block"><h4>' + esc(s.heading) + '</h4>' + paras(s.paragraphs) + '</div>';
    }).join('');
    if (d.commentary.ntConnection) {
      cm += '<div class="nt-connection"><span class="med-label"><span class="lbl-ico">' + ico('cross') + '</span> ' + esc(d.commentary.ntConnection.heading) + '</span>' + paras(d.commentary.ntConnection.paragraphs) + '</div>';
    }
    h += section(++i, hd('layers', 'Scholarly &amp; Theological Commentary'), cm);

    h += section(++i, hd('glyph', lexTitle(d) + ' Lexicon Insights'),
      (d.lexicon || []).map(function (w) {
        return '<button class="lex-row" data-strongs="' + esc(w.strongs) + '">' +
          '<span class="lex-line"><span class="heb">' + esc(w.hebrew) + '</span><span class="eng">' + esc(w.english) + '</span><span class="tr">' + esc(w.translit) + '</span><span class="strong-id">' + esc(w.strongs) + '</span><span class="vv">' + esc(w.verses) + '</span></span>' +
          '<span class="insight">' + esc(w.insight) + '</span></button>';
      }).join('') +
      '<p class="lex-note">Tap a word to open its full Strong&#39;s entry — fully offline.</p>');

    h += section(++i, hd('flame', 'Holy Spirit Revelation (Experiential Walk)'),
      '<p class="app-intro">' + esc(d.holySpiritRevelation.intro) + '</p>' + titledBlocks(d.holySpiritRevelation.items, false, 'fire-block'));

    var la = '<p class="app-intro">' + esc(d.lifeApplication.auditIntro) + '</p>' + titledBlocks(d.lifeApplication.audit, false, 'leaf-block');
    la += '<p class="app-intro" style="margin-top:1.6rem">' + esc(d.lifeApplication.practicesIntro) + '</p>' + titledBlocks(d.lifeApplication.practices, false, 'leaf-block');
    h += section(++i, hd('sprout', 'Life Application'), la);

    h += section(++i, hd('hands', 'Prayer Reflection'), '<div class="prayer">“' + nl(unq(d.prayerReflection)) + '”</div>');

    if (d.storyConnections && d.storyConnections.length) {
      h += section(++i, hd('bookOpen', 'Story Connections'),
        d.storyConnections.map(function (s) {
          return '<div class="story-card"><h4>' + esc(s.title) + '</h4><div class="refs">' + esc(s.ref) + ' · relates to ' + esc(s.relatedVerses) + '</div><p>' + esc(s.summary) + '</p></div>';
        }).join(''));
    }
    return docShell(h, opts);
  }

  /* ── Final Masterclass Review ─────────────────────────────── */
  function review(d, opts) {
    var h = '';
    h += '<div class="rise"><h1 class="doc-title">' + tt('award', 'Book of ' + esc(d.book) + ': The Final Masterclass Review') + '</h1>';
    h += '<div class="doc-kind">Why you were here · and the road ahead</div></div>';
    var i = 0;

    h += section(++i, hd('compass', 'The Big Picture: ' + esc(d.bigPicture.subtitle)),
      '<p class="lead-cap"><b>' + esc(d.bigPicture.thesis) + '</b></p>' + paras(d.bigPicture.paragraphs));

    var mp = '<p>' + esc(d.map.intro) + '</p>' + titledBlocks(d.map.sections);
    mp += '<div class="nt-connection"><span class="med-label"><span class="lbl-ico">' + ico('route') + '</span> The Road Ahead</span><p>' + esc(d.map.roadAhead.intro) + '</p>';
    mp += (d.map.roadAhead.books || []).map(function (b) {
      return '<div class="titled-block"><h4><span class="nav-ico">' + ico('arrowRight') + '</span> ' + esc(b.book) + '</h4><p>' + esc(b.connection) + '</p></div>';
    }).join('');
    mp += '</div>';
    h += section(++i, hd('map', 'The Map: Where Are We in the Bible?'), mp);

    h += section(++i, hd('award', 'Core Themes Mastered'),
      (d.themesMastered || []).map(function (t) {
        return '<div class="titled-block"><h4>' + esc(t.title) + ' <span class="vref" style="font-family:var(--font-ui);font-size:0.68rem;letter-spacing:0.2em;color:var(--gold)">' + esc(t.anchorRef) + '</span></h4><p>' + esc(t.body) + '</p></div>';
      }).join(''));

    h += section(++i, hd('flame', 'Experiential Lesson: Making His Fruits Your Portion'),
      '<p class="app-intro">' + esc(d.experientialLesson.intro) + '</p>' +
      (d.experientialLesson.steps || []).map(function (s) {
        return '<div class="fire-block"><h4>Step ' + s.step + ': ' + esc(s.title) + '</h4>' +
          '<span class="med-label">The Lesson</span><p>' + esc(s.lesson) + '</p>' +
          '<span class="med-label">The Practice</span><p>' + esc(s.practice) + '</p></div>';
      }).join(''));

    h += section(++i, hd('hands', 'Final Declaration Over Your Life'), '<div class="prayer">“' + nl(unq(d.finalDeclaration)) + '”</div>');
    return docShell(h, opts);
  }

  /* ── Word study: the verse, the word family, the site concordance ── */
  /* One English word ("power", "time", "love") often stands for several original words.
     The panel shows which one is in this verse, its siblings (sources/word-families.json),
     and every place the same Strong's word is tagged across the published studies. */
  var famIndex = null, concIndex = null;
  function dictEntry(key) {
    var dict = key.charAt(0) === 'H' ? window.strongsHebrewDictionary : window.strongsGreekDictionary;
    return dict ? dict[key] : null;
  }
  function idsOf(s) { return String(s || '').toUpperCase().match(/[HG]\d+/g) || []; }
  function families(key) {
    if (!famIndex) {
      famIndex = {};
      (window.POP_FAMILIES || []).forEach(function (f) {
        (f.members || []).forEach(function (m) { (famIndex[m.strongs] = famIndex[m.strongs] || []).push(f); });
      });
    }
    return famIndex[key] || [];
  }
  function concordance() {
    if (concIndex) return concIndex;
    concIndex = {};
    (window.POP.books || []).slice().sort(function (a, b) { return a.order - b.order; }).forEach(function (b) {
      var c = window.POP.content[b.id];
      if (!c || !c.chapters) return;
      c.chapters.forEach(function (ch, ci) {
        (ch.scripture || []).forEach(function (v) {
          (v.words || []).forEach(function (w) {
            idsOf(w.strongs).forEach(function (id) {
              (concIndex[id] = concIndex[id] || []).push({ book: b.id, name: b.name, ch: ci + 1, v: v.v, en: w.english || '' });
            });
          });
        });
      });
    });
    return concIndex;
  }
  function findVerse(book, ch, v) {
    var c = window.POP.content[book];
    var d = c && c.chapters ? c.chapters[parseInt(ch, 10) - 1] : null;
    var list = (d && d.scripture) || [];
    for (var i = 0; i < list.length; i++) if (String(list[i].v) === String(v)) return list[i];
    return null;
  }
  function bookName(id) {
    var b = (window.POP.books || []).find(function (x) { return x.id === id; });
    return b ? b.name : id;
  }
  function reEsc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  /* Escape a verse and highlight the English rendering of the word (first match). */
  function markText(text, en) {
    var out = esc(text);
    var phrases = String(en || '').replace(/\([^)]*\)/g, ' ').split(/[\/,;]/)
      .map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 1; });
    var tries = phrases.slice().sort(function (a, b) { return b.length - a.length; });
    phrases.forEach(function (p) { p.split(/\s+/).forEach(function (w) { if (w.length > 3) tries.push(w); }); });
    for (var i = 0; i < tries.length; i++) {
      var re = new RegExp('(^|[^A-Za-z])(' + reEsc(esc(tries[i])) + ')(?![A-Za-z])', 'i');
      if (re.test(out)) return out.replace(re, '$1<mark>$2</mark>');
    }
    return out;
  }

  function verseBlock(key, ctx) {
    var v = findVerse(ctx.book, ctx.ch, ctx.v);
    if (!v) return '';
    var h = '<div class="ws-block ws-verse"><span class="ws-label">In this verse · ' + esc(bookName(ctx.book)) + ' ' + esc(ctx.ch) + ':' + esc(ctx.v) + '</span>';
    if (ctx.en) h += '<div class="ws-rendered">Translated here as <b>‘' + esc(ctx.en) + '’</b></div>';
    h += '<p class="ws-text">' + markText(v.text, ctx.en) + '</p>';
    families(key).forEach(function (f) {
      var ids = f.members.map(function (m) { return m.strongs; });
      var sibs = (v.words || []).filter(function (w) {
        return idsOf(w.strongs).some(function (x) { return x !== key && ids.indexOf(x) >= 0; });
      });
      if (!sibs.length) return;
      h += '<div class="ws-sibs"><span class="ws-sub">This verse uses ' + (sibs.length + 1) + ' words from the ' + esc(f.name) + ' family — tap one to compare</span>';
      h += sibs.map(function (w) {
        return '<button class="ws-sib" data-strongs="' + esc(w.strongs) + '" data-ctx="' + esc([ctx.book, ctx.ch, ctx.v, w.english || ''].join('|')) + '">' +
          '<span class="heb">' + esc(w.hebrew) + '</span> <span class="ws-m-tr">' + esc(w.translit) + '</span> → ‘' + esc(w.english) + '’</button>';
      }).join('');
      h += '</div>';
    });
    return h + '</div>';
  }

  function familyBlock(key) {
    return families(key).map(function (f) {
      var h = '<div class="ws-block ws-family"><span class="ws-label">Word family · ' + esc(f.name) + '</span>';
      h += '<p class="ws-intro">' + esc(f.intro) + '</p>';
      h += f.members.map(function (m) {
        var e = dictEntry(m.strongs), me = m.strongs === key;
        return '<button class="ws-member' + (me ? ' me' : '') + '" data-strongs="' + esc(m.strongs) + '">' +
          '<span class="ws-m-head"><span class="heb">' + esc(e ? e.lemma : '') + '</span>' +
          '<span class="ws-m-tr">' + esc(e ? (e.xlit || e.translit || '') : '') + '</span>' +
          '<span class="strong-id">' + esc(m.strongs) + '</span>' + (me ? '<span class="ws-here">this word</span>' : '') + '</span>' +
          '<span class="ws-m-sense">' + esc(m.sense) + '</span>' +
          '<span class="ws-m-anchor"><b>' + esc(m.anchor) + '</b>' + (m.text ? ' — ' + markText(m.text, m.en) : '') + '</span></button>';
      }).join('');
      return h + '</div>';
    }).join('');
  }

  function concordanceBlock(key, ctx) {
    var all = concordance()[key] || [];
    var h = '<div class="ws-block ws-conc">';
    if (!all.length) {
      return h + '<span class="ws-label">Across POP·WORD</span><p class="ws-intro">Not tagged yet in a published study. As more books are written, every place this word is tagged will appear here.</p></div>';
    }
    var isHere = function (o) { return ctx && o.book === ctx.book && String(o.ch) === String(ctx.ch) && String(o.v) === String(ctx.v); };
    var list = all.filter(isHere).concat(all.filter(function (o) { return !isHere(o); }));
    var books = {}, counts = {};
    all.forEach(function (o) {
      books[o.book] = 1;
      var k = String(o.en || '—').toLowerCase().trim();
      counts[k] = (counts[k] || 0) + 1;
    });
    var nb = Object.keys(books).length;
    h += '<span class="ws-label">Across POP·WORD · tagged ' + all.length + '× in ' + nb + ' book' + (nb > 1 ? 's' : '') + '</span>';
    h += '<div class="ws-sub">Translated as</div><div class="ws-renders">' + Object.keys(counts)
      .sort(function (a, b) { return counts[b] - counts[a]; })
      .map(function (r) { return '<span class="ws-render">‘' + esc(r) + '’ <i>' + counts[r] + '</i></span>'; }).join('') + '</div>';
    h += '<div class="ws-occ">' + list.map(function (o, i) {
      return '<button class="ws-ref' + (isHere(o) ? ' here' : '') + (i >= 12 ? ' extra' : '') + '" data-jump="#/read/' + esc(o.book) + '/' + o.ch + '/' + esc(o.v) + '">' +
        '<span>' + esc(o.name) + ' ' + o.ch + ':' + esc(o.v) + '</span><span class="ws-ref-en">‘' + esc(o.en) + '’</span></button>';
    }).join('') + '</div>';
    if (list.length > 12) h += '<button class="ws-more" data-more="1">Show all ' + list.length + '</button>';
    h += '<p class="lex-note">Counts the places this word is tagged in these studies, not every occurrence in the Bible. Tap a reference to open that verse.</p>';
    return h + '</div>';
  }

  /* ── Lexicon panel body ───────────────────────────────────── */
  /* Accepts a single ID ("H2555") or a compound citation ("H7760 / H3824") —
     compound idioms show every cited entry, stacked. ctx (optional) is the verse the
     word was tapped in: { book, ch, v, en }. */
  function lexEntry(id, ctx) {
    var ids = idsOf(id);
    var h = '';
    if (!ids.length) {
      h += '<p style="text-align:center;color:var(--ink-soft)">No Strong&#39;s number found in “' + esc(id) + '”.</p>';
    }
    ids.forEach(function (key, i) {
      var isHeb = key.charAt(0) === 'H';
      var e = dictEntry(key);
      if (i > 0) h += '<div class="diamond-rule" style="margin:1.6rem 0">' + ico('spark') + '</div>';
      if (!e) {
        h += '<p style="text-align:center;color:var(--ink-soft)">Entry ' + esc(key) + ' was not found in the offline lexicon.</p>';
      } else {
        h += '<div class="lex-lemma">' + esc(e.lemma) + '</div>';
        h += '<div class="lex-translit">' + esc(e.xlit || e.translit || '') + (e.pron ? ' · ' + esc(e.pron) : '') + '</div>';
        h += '<div class="lex-strongno">Strong&#39;s ' + esc(key) + ' · ' + (isHeb ? 'Hebrew' : 'Greek') + '</div>';
        if (ctx && i === 0) h += verseBlock(key, ctx);
        if (e.strongs_def) h += '<div class="lex-field"><span class="fl">Strong&#39;s Definition</span><span class="fv">' + esc(e.strongs_def) + '</span></div>';
        if (e.derivation) h += '<div class="lex-field"><span class="fl">Derivation</span><span class="fv">' + esc(e.derivation) + '</span></div>';
        if (e.kjv_def) h += '<div class="lex-field"><span class="fl">Usage in the KJV</span><span class="fv">' + esc(e.kjv_def) + '</span></div>';
      }
      h += familyBlock(key);
      h += concordanceBlock(key, ctx);
      h += '<a class="lex-online" href="https://www.blueletterbible.org/lexicon/' + esc(key.toLowerCase()) + '" target="_blank" rel="noopener">Open ' + esc(key) + ' in Blue Letter Bible <span class="nav-ico">' + ico('external') + '</span></a>';
    });
    h += '<p class="lex-note">Entries above are fully offline. The links need internet.</p>';
    return h;
  }

  return { home: home, journey: journey, intro: intro, chapter: chapter, review: review, lexEntry: lexEntry, bookDocKeys: bookDocKeys };
})();
