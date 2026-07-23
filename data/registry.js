/* POP-WORD data registry — every book registers itself here.
   All data is embedded locally; the app runs fully offline from file://. */
window.POP = { books: [], content: {} };

window.POP_REGISTER_BOOK = function (meta) {
  window.POP.books.push(meta);
};

/* content = { intro: {...}, chapters: [ {...}, ... ], review: {...} } */
window.POP_REGISTER_CONTENT = function (bookId, content) {
  window.POP.content[bookId] = content;
  var b = window.POP.books.find(function (x) { return x.id === bookId; });
  if (b) b.available = true;
};

/* ── The shelf ─────────────────────────────────────────────── */
window.POP_REGISTER_BOOK({
  id: 'zephaniah', name: 'Zephaniah', order: 36, testament: 'OT', chapters: 3,
  tagline: 'The Day of the LORD — and the God who sings over His remnant.',
  available: false
});
window.POP_REGISTER_BOOK({
  id: 'haggai', name: 'Haggai', order: 37, testament: 'OT', chapters: 2,
  tagline: 'Consider your ways — build the house of the LORD.',
  available: false
});
window.POP_REGISTER_BOOK({
  id: 'zechariah', name: 'Zechariah', order: 38, testament: 'OT', chapters: 14,
  tagline: 'Visions in the night — your King is coming to you.',
  available: false
});
window.POP_REGISTER_BOOK({
  id: 'malachi', name: 'Malachi', order: 39, testament: 'OT', chapters: 4,
  tagline: 'The final burden — before four hundred years of silence.',
  available: false
});

/* ── The New Testament ─────────────────────────────────────── */
[
  ['matthew', 'Matthew', 40, 28, 'The promised King steps out of four centuries of silence.'],
  ['mark', 'Mark', 41, 16, 'The Servant who never stops moving — immediately, immediately.'],
  ['luke', 'Luke', 42, 24, 'The Son of Man who seeks and saves the lost.'],
  ['john', 'John', 43, 21, 'The Word made flesh — that you may believe and have life.'],
  ['acts', 'Acts', 44, 28, 'The Spirit falls and the church is born, from Jerusalem to Rome.'],
  ['romans', 'Romans', 45, 16, 'The gospel unfolded — the righteous will live by faith.'],
  ['1corinthians', '1 Corinthians', 46, 16, 'Order, love, and resurrection for a divided church.'],
  ['2corinthians', '2 Corinthians', 47, 13, 'Strength made perfect in weakness — the ministry of a broken vessel.'],
  ['galatians', 'Galatians', 48, 6, 'It is for freedom Christ has set you free — do not go back.'],
  ['ephesians', 'Ephesians', 49, 6, 'Seated with Christ — the riches of your inheritance in Him.'],
  ['philippians', 'Philippians', 50, 4, 'Joy in every circumstance, from a prison cell.'],
  ['colossians', 'Colossians', 51, 4, 'Christ preeminent — in Him all the fullness dwells.'],
  ['1thessalonians', '1 Thessalonians', 52, 5, 'Living ready for the coming of the Lord.'],
  ['2thessalonians', '2 Thessalonians', 53, 3, 'Standing firm until the Day arrives.'],
  ['1timothy', '1 Timothy', 54, 6, 'How to conduct yourself in the household of God.'],
  ['2timothy', '2 Timothy', 55, 4, 'Paul’s last words — I have fought the good fight.'],
  ['titus', 'Titus', 56, 3, 'Sound doctrine that produces good works.'],
  ['philemon', 'Philemon', 57, 1, 'A runaway slave welcomed back as a beloved brother.'],
  ['hebrews', 'Hebrews', 58, 13, 'Jesus is better — the greater priest of a greater covenant.'],
  ['james', 'James', 59, 5, 'Faith that works — the wisdom that comes from above.'],
  ['1peter', '1 Peter', 60, 5, 'Living hope for exiles in the fire of trial.'],
  ['2peter', '2 Peter', 61, 3, 'Guarding the truth until the Day dawns.'],
  ['1john', '1 John', 62, 5, 'That you may know you have eternal life — God is love.'],
  ['2john', '2 John', 63, 1, 'Walking in truth and love, watching for deceivers.'],
  ['3john', '3 John', 64, 1, 'Hospitality to the truth, a warning against pride.'],
  ['jude', 'Jude', 65, 1, 'Contend for the faith — kept by Him who keeps you from falling.'],
  ['revelation', 'Revelation', 66, 22, 'The unveiling of Jesus Christ — and the Lamb wins.']
].forEach(function (b) {
  window.POP_REGISTER_BOOK({
    id: b[0], name: b[1], order: b[2], testament: 'NT', chapters: b[3],
    tagline: b[4], available: false
  });
});
