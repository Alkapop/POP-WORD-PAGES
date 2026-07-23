/* POP-WORD sound engine — synthesized in WebAudio, no audio files needed.
   Subtle by design: a paper swish on page turns, a soft bell on completion. */
window.POPSound = (function () {
  var ctx = null;
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* session-only */ } }
  var enabled = lsGet('popword-sound', 'on') === 'on';

  function ac() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* Soft page-turn: a short band-passed noise swish */
  function pageTurn() {
    if (!enabled) return;
    var c = ac(); if (!c) return;
    var dur = 0.28;
    var buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) {
      var t = i / d.length;
      d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * t) * 0.6;
    }
    var src = c.createBufferSource(); src.buffer = buf;
    var bp = c.createBiquadFilter(); bp.type = 'bandpass';
    bp.frequency.setValueAtTime(900, c.currentTime);
    bp.frequency.exponentialRampToValueAtTime(2400, c.currentTime + dur);
    bp.Q.value = 0.8;
    var g = c.createGain();
    g.gain.setValueAtTime(0.05, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    src.connect(bp); bp.connect(g); g.connect(c.destination);
    src.start();
  }

  /* Completion bell: two warm sine partials, long decay */
  function chime() {
    if (!enabled) return;
    var c = ac(); if (!c) return;
    [523.25, 783.99].forEach(function (f, i) {
      var o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      var g = c.createGain();
      var t0 = c.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(i === 0 ? 0.07 : 0.04, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6);
      o.connect(g); g.connect(c.destination);
      o.start(t0); o.stop(t0 + 1.7);
    });
  }

  /* Tiny tick for small interactions (verse open, chip) */
  function tick() {
    if (!enabled) return;
    var c = ac(); if (!c) return;
    var o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = 1320;
    var g = c.createGain();
    g.gain.setValueAtTime(0.025, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.09);
    o.connect(g); g.connect(c.destination);
    o.start(); o.stop(c.currentTime + 0.1);
  }

  return {
    pageTurn: pageTurn,
    chime: chime,
    tick: tick,
    isEnabled: function () { return enabled; },
    toggle: function () {
      enabled = !enabled;
      lsSet('popword-sound', enabled ? 'on' : 'off');
      if (enabled) tick();
      return enabled;
    }
  };
})();
