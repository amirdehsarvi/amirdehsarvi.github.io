/*
 * connectome-hero.js
 * Animated brain connectome for the homepage hero.
 *
 * Nodes are sampled inside a sagittal brain silhouette and wired to their
 * nearest neighbours. Activation periodically seeds at a random node and
 * propagates outward along the edges - a nod to network-based spreading
 * models of tau pathology.
 *
 * No dependencies. Respects prefers-reduced-motion (renders a static
 * network). Pauses when scrolled out of view to save battery.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('connectome');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');

  var ACCENT = [79, 140, 255];
  var NODE_COUNT = 46;
  var LINK_DIST = 0.17;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Sagittal brain outline in normalised 0-1 space, facing left. */
  var OUTLINE = [
    [0.06, 0.44], [0.08, 0.34], [0.14, 0.24], [0.23, 0.16], [0.34, 0.11],
    [0.46, 0.09], [0.58, 0.10], [0.70, 0.14], [0.80, 0.21], [0.88, 0.31],
    [0.92, 0.43], [0.93, 0.55], [0.90, 0.66], [0.84, 0.75], [0.75, 0.81],
    [0.64, 0.85], [0.54, 0.87], [0.46, 0.90], [0.40, 0.93], [0.34, 0.90],
    [0.32, 0.83], [0.27, 0.79], [0.19, 0.75], [0.12, 0.68], [0.07, 0.57]
  ];

  function inOutline(x, y) {
    var inside = false;
    for (var i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
      var xi = OUTLINE[i][0], yi = OUTLINE[i][1];
      var xj = OUTLINE[j][0], yj = OUTLINE[j][1];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  var nodes = [];
  var edges = [];

  function build() {
    nodes = [];
    var guard = 0;
    while (nodes.length < NODE_COUNT && guard++ < 6000) {
      var x = Math.random();
      var y = Math.random();
      if (!inOutline(x, y)) continue;
      var ok = true;
      for (var i = 0; i < nodes.length; i++) {
        var dx = nodes[i].x - x, dy = nodes[i].y - y;
        if (Math.sqrt(dx * dx + dy * dy) < 0.085) { ok = false; break; }
      }
      if (!ok) continue;
      nodes.push({
        x: x, y: y,
        ox: x, oy: y,
        phase: Math.random() * Math.PI * 2,
        drift: 0.0016 + Math.random() * 0.0022,
        r: 1.6 + Math.random() * 1.7,
        act: 0
      });
    }
    edges = [];
    for (var a = 0; a < nodes.length; a++) {
      for (var b = a + 1; b < nodes.length; b++) {
        var ex = nodes[a].x - nodes[b].x, ey = nodes[a].y - nodes[b].y;
        var d = Math.sqrt(ex * ex + ey * ey);
        if (d < LINK_DIST) edges.push({ a: a, b: b, d: d, pulses: [] });
      }
    }
    for (var n = 0; n < nodes.length; n++) {
      nodes[n].edges = [];
      for (var e = 0; e < edges.length; e++) {
        if (edges[e].a === n || edges[e].b === n) nodes[n].edges.push(e);
      }
    }
  }

  var W = 0, H = 0, dpr = 1;
  function resize() {
    var rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* Map normalised coords into the canvas, preserving the brain's aspect. */
  var PAD = 0.06;
  function px(x) { return (PAD + x * (1 - 2 * PAD)) * W; }
  function py(y) { return (PAD + y * (1 - 2 * PAD)) * H; }

  function rgba(alpha) {
    return 'rgba(' + ACCENT[0] + ',' + ACCENT[1] + ',' + ACCENT[2] + ',' + alpha + ')';
  }

  function seed() {
    var n = Math.floor(Math.random() * nodes.length);
    nodes[n].act = 1;
    for (var i = 0; i < nodes[n].edges.length; i++) {
      var e = edges[nodes[n].edges[i]];
      e.pulses.push({ from: n, t: 0, speed: 0.4 + Math.random() * 0.3, gen: 0 });
    }
  }

  var last = 0, sinceSeed = 0, running = true;

  function frame(now) {
    if (!running) return;
    var dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
    last = now;

    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < nodes.length; i++) {
      var nd = nodes[i];
      nd.phase += nd.drift * 12;
      nd.x = nd.ox + Math.cos(nd.phase) * 0.006;
      nd.y = nd.oy + Math.sin(nd.phase * 0.8) * 0.006;
      nd.act = Math.max(0, nd.act - dt * 0.85);
    }

    for (var e2 = 0; e2 < edges.length; e2++) {
      var ed = edges[e2];
      var na = nodes[ed.a], nb = nodes[ed.b];
      var base = 0.10 * (1 - ed.d / LINK_DIST) + 0.03;
      var lift = Math.max(na.act, nb.act) * 0.30;
      ctx.strokeStyle = rgba(base + lift);
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(px(na.x), py(na.y));
      ctx.lineTo(px(nb.x), py(nb.y));
      ctx.stroke();

      for (var p = ed.pulses.length - 1; p >= 0; p--) {
        var pu = ed.pulses[p];
        pu.t += dt * pu.speed / Math.max(ed.d * 6, 0.35);
        var src = pu.from === ed.a ? na : nb;
        var dst = pu.from === ed.a ? nb : na;
        var t = Math.min(pu.t, 1);
        var cx = px(src.x) + (px(dst.x) - px(src.x)) * t;
        var cy = py(src.y) + (py(dst.y) - py(src.y)) * t;
        var fade = 1 - pu.gen * 0.22;
        if (fade > 0) {
          ctx.fillStyle = rgba(0.85 * fade);
          ctx.beginPath();
          ctx.arc(cx, cy, 1.7, 0, Math.PI * 2);
          ctx.fill();
        }
        if (pu.t >= 1) {
          var di = pu.from === ed.a ? ed.b : ed.a;
          nodes[di].act = Math.max(nodes[di].act, fade);
          if (pu.gen < 3 && fade > 0.2) {
            var out = nodes[di].edges;
            for (var k = 0; k < out.length; k++) {
              if (out[k] === e2) continue;
              if (Math.random() > 0.62) continue;
              edges[out[k]].pulses.push({
                from: di, t: 0,
                speed: pu.speed * 0.94,
                gen: pu.gen + 1
              });
            }
          }
          ed.pulses.splice(p, 1);
        }
      }
    }

    for (var m = 0; m < nodes.length; m++) {
      var no = nodes[m];
      var x = px(no.x), y = py(no.y);
      if (no.act > 0.02) {
        ctx.fillStyle = rgba(0.14 * no.act);
        ctx.beginPath();
        ctx.arc(x, y, no.r + 7 * no.act, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = rgba(0.32 + 0.55 * no.act);
      ctx.beginPath();
      ctx.arc(x, y, no.r + no.act * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    sinceSeed += dt;
    if (sinceSeed > 2.4) { seed(); sinceSeed = 0; }

    requestAnimationFrame(frame);
  }

  function drawStatic() {
    ctx.clearRect(0, 0, W, H);
    for (var e = 0; e < edges.length; e++) {
      var na = nodes[edges[e].a], nb = nodes[edges[e].b];
      ctx.strokeStyle = rgba(0.10 * (1 - edges[e].d / LINK_DIST) + 0.04);
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(px(na.x), py(na.y));
      ctx.lineTo(px(nb.x), py(nb.y));
      ctx.stroke();
    }
    for (var n = 0; n < nodes.length; n++) {
      ctx.fillStyle = rgba(0.34);
      ctx.beginPath();
      ctx.arc(px(nodes[n].x), py(nodes[n].y), nodes[n].r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function start() {
    resize();
    build();
    if (reduced) { drawStatic(); return; }
    requestAnimationFrame(frame);
  }

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      resize();
      if (reduced) drawStatic();
    }, 180);
  });

  if ('IntersectionObserver' in window && !reduced) {
    new IntersectionObserver(function (entries) {
      var vis = entries[0].isIntersecting;
      if (vis && !running) { running = true; last = 0; requestAnimationFrame(frame); }
      running = vis;
    }, { threshold: 0 }).observe(canvas);
  }

  start();
})();
