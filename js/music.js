/* POP-WORD background music — an original, generative instrumental score
   synthesized entirely in WebAudio. No audio files, no streaming, nothing
   copyrighted: it runs fully offline and never repeats exactly.

   Character: reverent and calm — a slow warm pad breathing underneath a
   sparse, bell-like piano that drifts through a gentle chord progression,
   bathed in synthesized reverb. Low volume by design, meant to sit under
   reading, not over it. */
window.POPMusic = (function () {
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var ctx = null, master = null, verb = null, running = false;
  var enabled = lsGet('popword-music', 'off') === 'on';
  var timers = [];
  var step = 0;

  // A slow, hymn-like progression (frequencies, A-based just-ish major).
  // Chords as arrays of frequencies; the pad plays the chord, the piano
  // picks notes from an extended voicing above it.
  var A = 55; // low A
  function n(semi) { return A * Math.pow(2, semi / 12); }
  // Progression in D major feel: D  A/C#  Bm  G   (I  V  vi  IV) — warm, resolved.
  var prog = [
    { pad: [n(5), n(9), n(12), n(17)], color: [n(21), n(24), n(28), n(29)] }, // D
    { pad: [n(4), n(9), n(12), n(16)], color: [n(21), n(24), n(28), n(31)] }, // A/C#
    { pad: [n(2), n(9), n(14), n(17)], color: [n(21), n(26), n(29), n(33)] }, // Bm
    { pad: [n(10), n(14), n(17), n(21)], color: [n(21), n(26), n(29), n(31)] } // G
  ];

  function makeReverb() {
    var len = ctx.sampleRate * 3.2;
    var buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      for (var i = 0; i < len; i++) {
        var t = i / len;
        // exponential decay noise → smooth hall tail
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.6);
      }
    }
    var c = ctx.createConvolver();
    c.buffer = buf;
    return c;
  }

  function ensure() {
    if (ctx) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.0001;
    verb = makeReverb();
    var verbGain = ctx.createGain();
    verbGain.gain.value = 0.85;
    verb.connect(verbGain);
    verbGain.connect(master);
    master.connect(ctx.destination);
    POPMusic._verb = verb;
    return true;
  }

  // A soft pad voice: detuned sines through a slow lowpass swell.
  function pad(freqs, dur) {
    var t0 = ctx.currentTime;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.05, t0 + dur * 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(500, t0);
    lp.frequency.linearRampToValueAtTime(1400, t0 + dur * 0.5);
    lp.frequency.linearRampToValueAtTime(600, t0 + dur);
    lp.connect(g);
    g.connect(master);
    g.connect(verb);
    freqs.forEach(function (f, i) {
      [0, 1].forEach(function (d) {
        var o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = f * (d ? 1.004 : 0.997);
        var og = ctx.createGain();
        og.gain.value = 0.5 / freqs.length;
        o.connect(og); og.connect(lp);
        o.start(t0); o.stop(t0 + dur + 0.1);
      });
    });
  }

  // A bell/piano-like note: two partials with fast attack, long decay.
  function pluck(freq, when, vel) {
    var t0 = ctx.currentTime + when;
    [1, 2.01].forEach(function (mult, idx) {
      var o = ctx.createOscillator();
      o.type = idx === 0 ? 'triangle' : 'sine';
      o.frequency.value = freq * mult;
      var g = ctx.createGain();
      var peak = (idx === 0 ? 0.10 : 0.035) * (vel || 1);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.6);
      o.connect(g); g.connect(master); g.connect(verb);
      o.start(t0); o.stop(t0 + 2.7);
    });
  }

  // One bar: lay the pad, then sprinkle a few piano notes over the chord.
  function bar() {
    if (!running) return;
    var barLen = 7.5; // seconds — slow and unhurried
    var chord = prog[step % prog.length];
    pad(chord.pad, barLen);

    var notes = chord.color;
    // deterministic-but-varying pattern (no Math.random dependency for pitch order)
    var pattern = [0, 2, 1, 3, 2];
    var count = 3 + (step % 2);
    for (var k = 0; k < count; k++) {
      var idx = pattern[(step + k) % pattern.length];
      var when = 0.2 + k * (barLen / (count + 0.5)) + (k % 2 ? 0.35 : 0);
      pluck(notes[idx], when, 0.7 + 0.3 * ((step + k) % 2));
    }
    // occasional low root for warmth
    if (step % 2 === 0) pluck(chord.pad[0] / 2, 0.05, 0.5);

    step++;
    timers.push(setTimeout(bar, barLen * 1000));
  }

  function start() {
    if (running || !ensure()) return;
    if (ctx.state === 'suspended') ctx.resume();
    running = true;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 3.5); // gentle fade-in
    bar();
  }

  function stop() {
    running = false;
    timers.forEach(clearTimeout); timers = [];
    if (master && ctx) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.0);
    }
  }

  return {
    isEnabled: function () { return enabled; },
    // Called once on the first user gesture; starts only if the user left it on.
    resumeIfEnabled: function () { if (enabled) start(); },
    toggle: function () {
      enabled = !enabled;
      lsSet('popword-music', enabled ? 'on' : 'off');
      if (enabled) start(); else stop();
      return enabled;
    }
  };
})();
