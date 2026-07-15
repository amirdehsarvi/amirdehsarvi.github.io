/*
 * connectome-hero.js
 * Animated brain connectome for the homepage hero.
 *
 * A lateral (sagittal) brain silhouette is drawn from bezier segments, with
 * the major sulci sketched in. Network nodes are sampled inside the outline
 * and wired to their nearest neighbours; activation periodically seeds at a
 * random node and propagates outward along the edges - a nod to
 * network-based models of pathology spread.
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
  var NODE_COUNT = 42;
  var LINK_DIST = 0.19;
  var BRAIN_AR = 1.25;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Lateral brain outline, facing left, in normalised 0-1 space.
     Each entry is a cubic bezier: [control1, control2, endpoint]. */
  var START = [0.07, 0.42];
  var CURVES = [
    [[0.09, 0.28], [0.20, 0.16], [0.34, 0.13]],   /* frontal, rising */
    [[0.48, 0.09], [0.66, 0.11], [0.78, 0.20]],   /* vertex / parietal */
    [[0.88, 0.28], [0.93, 0.40], [0.90, 0.52]],   /* occipital, descending */
    [[0.88, 0.60], [0.84, 0.64], [0.79, 0.66]],   /* occipital notch */
    [[0.83, 0.70], [0.82, 0.78], [0.74, 0.80]],   /* cerebellum */
    [[0.69, 0.82], [0.65, 0.81], [0.62, 0.79]],
    [[0.615, 0.84], [0.60, 0.90], [0.575, 0.93]], /* brainstem, down */
    [[0.55, 0.90], [0.552, 0.84], [0.54, 0.79]],  /* brainstem, up */
    [[0.48, 0.80], [0.40, 0.80], [0.33, 0.77]],   /* temporal underside */
    [[0.26, 0.74], [0.195, 0.70], [0.19, 0.64]],  /* temporal pole */
    [[0.185, 0.58], [0.13, 0.56], [0.10, 0.52]],  /* sylvian / frontal base */
    [[0.07, 0.49], [0.06, 0.45], [0.07, 0.42]]    /* close at frontal pole */
  ];

  /* Sulci - drawn only, not used for hit testing. */
  var SULCI = [
    { s: [0.20, 0.60], c: [[0.30, 0.665], [0.45, 0.665], [0.56, 0.615]] }, /* sylvian fissure */
    { s: [0.46, 0.125], c: [[0.45, 0.25], [0.42, 0.33], [0.385, 0.42]] },  /* central sulcus */
    { s: [0.62, 0.14], c: [[0.60, 0.26], [0.60, 0.33], [0.63, 0.41]] },    /* postcentral */
    { s: [0.815, 0.29], c: [[0.75, 0.37], [0.73, 0.43], [0.745, 0.50]] }   /* parieto-occipital */
  ];

  function bez(p0, c1, c2, p1, t) {
    var u = 1 - t;
    var a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return [
      a * p0[0] + b * c1[0] + c * c2[0] + d * p1[0],
      a * p0[1] + b * c1[1] + c * c2[1] + d * p1[1]
    ];
  }

  /* Flatten the outline to a polygon once, for point-in-shape tests. */
  var POLY = (function () {
    var pts = [];
    var cur = START;
    for (var i = 0; i < CURVES.length; i++) {
      var seg = CURVES[i];
      for (var s = 1; s <= 14; s++) pts.push(bez(cur, seg[0], seg[1], seg[2], s / 14));
      cur = seg[2];
    }
    return pts;
  })();

  function inBrain(x, y) {
    var inside = false;
    for (var i = 0, j = POLY.length - 1; i < POLY.length; j = i++) {
      var xi = POLY[i][0], yi = POLY[i][1];
      var xj = POLY[j][0], yj = POLY[j][1];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  /* Keep nodes off the brainstem, which is too narrow to read as network. */
  function placeable(x, y) {
    if (!inBrain(x, y)) return false;
    if (y > 0.80 && x > 0.50 && x < 0.68) return false;
    return true;
  }

  var nodes = [], edges = [];

  function build() {
    nodes = [];
    var guard = 0;
    while (nodes.length < NODE_COUNT && guard++ < 8000) {
      var x = Math.random(), y = Math.random();
      if (!placeable(x, y)) continue;
      var ok = true;
      for (var i = 0; i < nodes.length; i++) {
        var dx = (nodes[i].x - x) * BRAIN_AR, dy = nodes[i].y - y;
        if (Math.sqrt(dx * dx + dy * dy) < 0.085) { ok = false; break; }
      }
      if (!ok) continue;
      nodes.push({
        x: x, y: y, ox: x, oy: y,
        phase: Math.random() * Math.PI * 2,
        drift: 0.0016 + Math.random() * 0.0022,
        r: 1.5 + Math.random() * 1.6,
        act: 0
      });
    }
    edges = [];
    for (var a = 0; a < nodes.length; a++) {
      for (var b = a + 1; b < nodes.length; b++) {
        var ex = (nodes[a].x - nodes[b].x) * BRAIN_AR, ey = nodes[a].y - nodes[b].y;
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

  /* Fit the brain into a centred box of fixed aspect, so it never stretches. */
  var W = 0, H = 0, dpr = 1, bx = 0, by = 0, bw = 0, bh = 0;

  function resize() {
    var rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    bh = H * 0.94;
    bw = bh * BRAIN_AR;
    if (bw > W * 0.96) { bw = W * 0.96; bh = bw / BRAIN_AR; }
    bx = (W - bw) / 2;
    by = (H - bh) / 2;
  }

  function px(x) { return bx + x * bw; }
  function py(y) { return by + y * bh; }

  function rgba(a) {
    return 'rgba(' + ACCENT[0] + ',' + ACCENT[1] + ',' + ACCENT[2] + ',' + a + ')';
  }

  function traceOutline() {
    ctx.beginPath();
    ctx.moveTo(px(START[0]), py(START[1]));
    for (var i = 0; i < CURVES.length; i++) {
      var s = CURVES[i];
      ctx.bezierCurveTo(px(s[0][0]), py(s[0][1]), px(s[1][0]), py(s[1][1]), px(s[2][0]), py(s[2][1]));
    }
    ctx.closePath();
  }

  function drawBrain() {
    traceOutline();
    ctx.fillStyle = rgba(0.035);
    ctx.fill();
    ctx.strokeStyle = rgba(0.30);
    ctx.lineWidth = 1.3;
    ctx.stroke();

    ctx.strokeStyle = rgba(0.17);
    ctx.lineWidth = 1;
    for (var i = 0; i < SULCI.length; i++) {
      var su = SULCI[i];
      ctx.beginPath();
      ctx.moveTo(px(su.s[0]), py(su.s[1]));
      ctx.bezierCurveTo(px(su.c[0][0]), py(su.c[0][1]), px(su.c[1][0]), py(su.c[1][1]), px(su.c[2][0]), py(su.c[2][1]));
      ctx.stroke();
    }

    /* Cerebellum striations */
    ctx.strokeStyle = rgba(0.13);
    ctx.lineWidth = 0.8;
    for (var k = 0; k < 4; k++) {
      var t = 0.68 + k * 0.035;
      ctx.beginPath();
      ctx.moveTo(px(0.70), py(t));
      ctx.quadraticCurveTo(px(0.79), py(t + 0.015), px(0.845), py(t - 0.02));
      ctx.stroke();
    }
  }

  function seed() {
    if (!nodes.length) return;
    var n = Math.floor(Math.random() * nodes.length);
    nodes[n].act = 1;
    for (var i = 0; i < nodes[n].edges.length; i++) {
      edges[nodes[n].edges[i]].pulses.push({ from: n, t: 0, speed: 0.4 + Math.random() * 0.3, gen: 0 });
    }
  }

  var last = 0, sinceSeed = 0, running = true;

  function frame(now) {
    if (!running) return;
    var dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
    last = now;

    ctx.clearRect(0, 0, W, H);
    drawBrain();

    for (var i = 0; i < nodes.length; i++) {
      var nd = nodes[i];
      nd.phase += nd.drift * 12;
      nd.x = nd.ox + Math.cos(nd.phase) * 0.005;
      nd.y = nd.oy + Math.sin(nd.phase * 0.8) * 0.005;
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
              edges[out[k]].pulses.push({ from: di, t: 0, speed: pu.speed * 0.94, gen: pu.gen + 1 });
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
    drawBrain();
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

  resize();
  build();
  if (reduced) drawStatic();
  else requestAnimationFrame(frame);
})();
