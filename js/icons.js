/* POP-WORD icon set — modern monoline SVG, fully offline (no icon font, no CDN).
   24x24 grid, 1.6 stroke, round caps. Colored by CSS `currentColor`.
   A few ornamental marks (spark, contrast, diamond) use fill. */
window.POPIcons = (function () {
  var I = {
    spark: '<path d="M12 2.5c.7 5 2.5 6.8 7.5 7.5-5 .7-6.8 2.5-7.5 7.5-.7-5-2.5-6.8-7.5-7.5 5-.7 6.8-2.5 7.5-7.5z" fill="currentColor" stroke="none"/>',
    bookOpen: '<path d="M12 6.5C10.3 5.2 8 4.5 5 4.5H3v13h2c3 0 5.3.7 7 2 1.7-1.3 4-2 7-2h2v-13h-2c-3 0-5.3.7-7 2z"/><path d="M12 6.5v12"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1z"/>',
    bridge: '<path d="M2.5 11a11 6.5 0 0 1 19 0"/><path d="M4 11.5V18M20 11.5V18M9 12v5M15 12v5M2.5 18h19"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
    book: '<path d="M6 4h10a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2z"/><path d="M6 18a2 2 0 0 1 2-2h10"/>',
    sprout: '<path d="M12 20v-9"/><path d="M12 12c0-3-2.2-5.2-6.2-5.2C5.8 10.8 8 13 12 12z"/><path d="M12 11c0-3 2.2-5 6-5-.1 4-2.3 6-6 5z"/><path d="M7 20h10"/>',
    hands: '<path d="M11.2 20.5c-1.7 0-3.4-.9-4.3-2.6-.9-1.8-.8-4.4 1-10 .4-1.2 2.3-.9 2.3.4v12.2z"/><path d="M12.8 20.5c1.7 0 3.4-.9 4.3-2.6.9-1.8.8-4.4-1-10-.4-1.2-2.3-.9-2.3.4v12.2z"/>',
    scroll: '<path d="M7 4h10a2 2 0 0 1 2 2v11a3 3 0 0 0 3 3H9a2 2 0 0 1-2-2z"/><path d="M7 4a2 2 0 0 0-2 2v2h2"/><path d="M10 9h6M10 12.5h6"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    layers: '<path d="M12 3.5l9 4.8-9 4.8-9-4.8z"/><path d="M3 13l9 4.8 9-4.8"/>',
    glyph: '<path d="M4 5.5h7M7.5 5.5c0 6-1.6 10.2-4 12.5M6 9.5c0 4 3 6.2 6.2 7.2"/><path d="M13 19.5l3.8-9.5 3.8 9.5M14.5 16.5h4.6"/>',
    flame: '<path d="M12 2.5C9.2 6.4 6.5 8.6 6.5 13a5.5 5.5 0 0 0 11 0c0-2-1-3.8-2.2-5-.6 2-1.6 2.6-2.6 2.1C14 8 13.4 5.2 12 2.5z"/>',
    map: '<path d="M9 4.5L3.5 6.3v13.2L9 17.7l6 1.8 5.5-1.8V4.5L15 6.3z"/><path d="M9 4.5v13.2M15 6.3v13.2"/>',
    award: '<circle cx="12" cy="9" r="5.5"/><path d="M8.8 13.8L7 21l5-3 5 3-1.8-7.2"/>',
    route: '<path d="M12 3v3.5M12 6.5H6.5l-2 2 2 2H12M12 10.5h6l2 2-2 2h-6M12 14.5V21M8.5 21h7"/>',
    cross: '<path d="M12 3.5v17M7.5 9h9"/>',
    bell: '<path d="M6 9.5a6 6 0 0 1 12 0c0 5.5 2 6.8 2 6.8H4s2-1.3 2-6.8z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/>',
    music: '<path d="M9 17.5V5.8l11-2v11.7"/><circle cx="6" cy="17.5" r="3"/><circle cx="17" cy="15.5" r="3"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M4.5 12.5l4.5 4.5L19.5 6.5"/>',
    crown: '<path d="M3 8l3.6 4.2L12 5l5.4 7.2L21 8v10H3z"/><path d="M3 18h18"/>',
    arrowLeft: '<path d="M15 5l-7 7 7 7"/>',
    arrowRight: '<path d="M9 5l7 7-7 7"/>',
    external: '<path d="M8 16L17 7M9.5 7H17v7.5"/>',
    home: '<path d="M4 11.5L12 4l8 7.5"/><path d="M6 10.5V20h12v-9.5"/>'
  };

  function get(name, cls) {
    var inner = I[name] || I.spark;
    return '<svg class="pw-ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      inner + '</svg>';
  }

  return { get: get, has: function (n) { return !!I[n]; } };
})();
