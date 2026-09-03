/* Amir Dehsarvi — site interactions
   Progressive enhancement only: everything works without JS. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  var toggle = document.querySelector("[data-theme-toggle]");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      toggle.setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
    });
  }

  /* ---------- Mobile nav ---------- */
  var navToggle = document.querySelector("[data-nav-toggle]");
  var nav = document.getElementById("site-nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Sticky header + scroll progress ---------- */
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".scroll-progress");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-stuck", y > 24);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var revealables = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window) || reduceMotion) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseFloat(el.getAttribute("data-reveal")) || 0;
        el.style.transitionDelay = delay + "ms";
        el.classList.add("is-visible");
        revealObserver.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    Array.prototype.forEach.call(revealables, function (el) { revealObserver.observe(el); });
  }

  /* ---------- Count-up metrics ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (reduceMotion) { el.textContent = String(target); return; }
    var start = null;
    var duration = 1400;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(counters, runCounter);
    } else {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          countObserver.unobserve(entry.target);
        });
      }, { threshold: 0.6 });
      Array.prototype.forEach.call(counters, function (el) { countObserver.observe(el); });
    }
  }

  /* ---------- Timeline draw ---------- */
  var timeline = document.querySelector(".timeline");
  var tlProgress = document.querySelector(".timeline__progress");
  if (timeline && tlProgress && !reduceMotion) {
    var drawTicking = false;
    function drawTimeline() {
      var rect = timeline.getBoundingClientRect();
      var vh = window.innerHeight;
      var travelled = vh * 0.62 - rect.top;
      var pct = Math.max(0, Math.min(travelled / rect.height, 1));
      tlProgress.style.height = (pct * (rect.height - 12)) + "px";
      drawTicking = false;
    }
    window.addEventListener("scroll", function () {
      if (!drawTicking) { window.requestAnimationFrame(drawTimeline); drawTicking = true; }
    }, { passive: true });
    window.addEventListener("resize", drawTimeline);
    drawTimeline();
  }

  var tlItems = document.querySelectorAll(".tl");
  if (tlItems.length && "IntersectionObserver" in window) {
    var tlObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); tlObserver.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -20% 0px", threshold: 0.2 });
    Array.prototype.forEach.call(tlItems, function (el) { tlObserver.observe(el); });
  } else {
    Array.prototype.forEach.call(tlItems, function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Active nav highlighting on the homepage ---------- */
  var sectionLinks = document.querySelectorAll('#site-nav a[href^="/#"], #site-nav a[href^="#"]');
  if (sectionLinks.length && "IntersectionObserver" in window) {
    var map = {};
    Array.prototype.forEach.call(sectionLinks, function (a) {
      var id = a.getAttribute("href").split("#")[1];
      var sec = id && document.getElementById(id);
      if (sec) map[id] = a;
    });
    var ids = Object.keys(map);
    if (ids.length) {
      var secObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          ids.forEach(function (id) { map[id].classList.remove("is-active"); });
          map[entry.target.id].classList.add("is-active");
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      ids.forEach(function (id) { secObserver.observe(document.getElementById(id)); });
    }
  }

  /* ---------- Publication / talk filters ---------- */
  var filterBar = document.querySelector("[data-filter-bar]");
  if (filterBar) {
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      var value = btn.getAttribute("data-filter");
      Array.prototype.forEach.call(filterBar.querySelectorAll("button"), function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      Array.prototype.forEach.call(document.querySelectorAll("[data-filter-item]"), function (item) {
        var match = value === "all" || item.getAttribute("data-filter-item").indexOf(value) > -1;
        item.style.display = match ? "" : "none";
      });
    });
  }

  /* ---------- Hero: interactive brain mesh ----------
     The lateral brain silhouette is sampled into a polygon, filled with a
     jittered grid of vertices and Delaunay-triangulated into a mesh. Moving the
     cursor near a vertex fires it; impulses travel along mesh edges and fire the
     vertices they reach, so cascades ripple across the brain and fade out. */
  var BRAIN_PATH = "M 20 70 C 17 48 33 30 56 22 C 82 12 116 12 141 22 C 166 32 184 51 186 72 " +
    "C 187 88 179 97 167 100 C 178 107 180 121 168 127 C 158 133 146 131 140 124 " +
    "C 139 134 137 144 134 150 C 131 156 121 156 118 150 C 115 143 117 132 118 122 " +
    "C 110 126 100 128 90 128 C 76 128 65 122 59 113 C 55 106 55 99 57 92 " +
    "C 48 97 37 94 30 87 C 23 80 20 76 20 70 Z";
  var BRAIN_W = 206, BRAIN_H = 170;

  var canvas = document.querySelector("[data-hero-canvas]");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var nodes = [], edges = [], tris = [], impulses = [];
    var mouse = { x: -1e9, y: -1e9 };
    var rafId = null, last = 0, ambient = 1400, narrow = false;

    function cssVar(name, fallback) {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    }
    var colEdge, colVert, colHot;
    function readPalette() {
      colEdge = cssVar("--accent", "#1c6b4a");
      colVert = cssVar("--accent", "#1c6b4a");
      colHot  = cssVar("--brain-hot", "#d98d1f");
    }
    readPalette();

    var rand = function (a, b) { return a + Math.random() * (b - a); };

    /* sample the outline path into a polygon */
    function outlinePolygon(ox, oy, scale) {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "0"); svg.setAttribute("height", "0");
      svg.style.position = "absolute"; svg.style.opacity = "0"; svg.style.pointerEvents = "none";
      var pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathEl.setAttribute("d", BRAIN_PATH);
      svg.appendChild(pathEl); document.body.appendChild(svg);
      var poly = [], total = 0;
      try { total = pathEl.getTotalLength(); } catch (e) { total = 0; }
      if (total) {
        var steps = 54;
        for (var i = 0; i < steps; i++) {
          var pt = pathEl.getPointAtLength((i / steps) * total);
          poly.push([ox + pt.x * scale, oy + pt.y * scale]);
        }
      }
      document.body.removeChild(svg);
      return poly;
    }

    function pointInPoly(x, y, poly) {
      var inside = false;
      for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
      }
      return inside;
    }

    /* Bowyer–Watson Delaunay triangulation */
    function triangulate(pts) {
      var n = pts.length;
      if (n < 3) return [];
      var minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
      for (var i = 0; i < n; i++) {
        minx = Math.min(minx, pts[i].x); miny = Math.min(miny, pts[i].y);
        maxx = Math.max(maxx, pts[i].x); maxy = Math.max(maxy, pts[i].y);
      }
      var d = Math.max(maxx - minx, maxy - miny) * 10 || 1;
      var P = pts.slice();
      P.push({ x: minx - d, y: miny - d }, { x: maxx + d, y: miny - d }, { x: (minx + maxx) / 2, y: maxy + d });
      var tri = [[n, n + 1, n + 2]];

      function circum(t) {
        var a = P[t[0]], b = P[t[1]], c = P[t[2]];
        var D = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
        if (Math.abs(D) < 1e-12) return { x: 0, y: 0, r2: -1 };
        var a2 = a.x * a.x + a.y * a.y, b2 = b.x * b.x + b.y * b.y, c2 = c.x * c.x + c.y * c.y;
        var ux = (a2 * (b.y - c.y) + b2 * (c.y - a.y) + c2 * (a.y - b.y)) / D;
        var uy = (a2 * (c.x - b.x) + b2 * (a.x - c.x) + c2 * (b.x - a.x)) / D;
        return { x: ux, y: uy, r2: (a.x - ux) * (a.x - ux) + (a.y - uy) * (a.y - uy) };
      }

      for (var k = 0; k < n; k++) {
        var p = P[k], bad = [], poly = [];
        for (var t = tri.length - 1; t >= 0; t--) {
          var cc = circum(tri[t]);
          if (cc.r2 > 0 && (p.x - cc.x) * (p.x - cc.x) + (p.y - cc.y) * (p.y - cc.y) < cc.r2) {
            bad.push(tri[t]); tri.splice(t, 1);
          }
        }
        for (var bi = 0; bi < bad.length; bi++) {
          for (var e = 0; e < 3; e++) {
            var ea = bad[bi][e], eb = bad[bi][(e + 1) % 3], shared = false;
            for (var bj = 0; bj < bad.length && !shared; bj++) {
              if (bj === bi) continue;
              for (var f = 0; f < 3; f++) {
                var fa = bad[bj][f], fb = bad[bj][(f + 1) % 3];
                if ((ea === fa && eb === fb) || (ea === fb && eb === fa)) { shared = true; break; }
              }
            }
            if (!shared) poly.push([ea, eb]);
          }
        }
        for (var q = 0; q < poly.length; q++) tri.push([poly[q][0], poly[q][1], k]);
      }
      return tri.filter(function (t) { return t[0] < n && t[1] < n && t[2] < n; });
    }

    function build() {
      nodes = []; edges = []; tris = []; impulses = [];
      narrow = W < 800;
      var scale = narrow
        ? Math.min((W * 0.78) / BRAIN_W, (H * 0.42) / BRAIN_H)
        : Math.min((W * 0.51) / BRAIN_W, (H * 0.86) / BRAIN_H);
      var bw = BRAIN_W * scale, bh = BRAIN_H * scale;
      var ox = (narrow ? W * 0.60 : W * 0.745) - bw / 2;
      var oy = (narrow ? H * 0.80 : H * 0.50) - bh / 2;

      var poly = outlinePolygon(ox, oy, scale);
      if (!poly.length) return;

      var spacing = Math.max(24, bw / (narrow ? 10 : 14));
      var i;
      for (i = 0; i < poly.length; i++) {
        nodes.push({ x: poly[i][0], y: poly[i][1], r: rand(1.9, 2.9), light: 0, refr: 0, nbrs: [] });
      }
      for (var gy = oy; gy < oy + bh; gy += spacing * 0.88) {
        for (var gx = ox; gx < ox + bw; gx += spacing) {
          var stagger = (Math.round((gy - oy) / (spacing * 0.88)) % 2) ? spacing / 2 : 0;
          var x = gx + stagger + rand(-spacing * 0.24, spacing * 0.24);
          var y = gy + rand(-spacing * 0.22, spacing * 0.22);
          if (!pointInPoly(x, y, poly)) continue;
          var clear = true;
          for (i = 0; i < poly.length; i++) {
            var ddx = poly[i][0] - x, ddy = poly[i][1] - y;
            if (ddx * ddx + ddy * ddy < (spacing * 0.5) * (spacing * 0.5)) { clear = false; break; }
          }
          if (!clear) continue;
          nodes.push({ x: x, y: y, r: rand(1.9, 3.1), light: 0, refr: 0, nbrs: [] });
        }
      }

      var triangles = triangulate(nodes), seen = {};
      for (var ti = 0; ti < triangles.length; ti++) {
        var t = triangles[ti];
        var cx = (nodes[t[0]].x + nodes[t[1]].x + nodes[t[2]].x) / 3;
        var cy = (nodes[t[0]].y + nodes[t[1]].y + nodes[t[2]].y) / 3;
        if (!pointInPoly(cx, cy, poly)) continue;
        tris.push(t);
        for (var e2 = 0; e2 < 3; e2++) {
          var ia = t[e2], ib = t[(e2 + 1) % 3];
          var key = ia < ib ? ia + "-" + ib : ib + "-" + ia;
          if (seen[key]) continue;
          seen[key] = 1;
          var a = nodes[ia], b = nodes[ib];
          var ed = { a: a, b: b, ia: ia, ib: ib, hot: 0, len: Math.hypot(b.x - a.x, b.y - a.y) || 1 };
          edges.push(ed);
          a.nbrs.push({ e: ed, to: ib });
          b.nbrs.push({ e: ed, to: ia });
        }
      }
    }

    function fire(i, from, gen) {
      var n = nodes[i];
      if (!n || n.refr > 0) return;
      n.light = 1; n.refr = 1100;
      if (reduceMotion || gen > 9) return;
      var cands = [];
      for (var k = 0; k < n.nbrs.length; k++) {
        if (n.nbrs[k].to !== from && nodes[n.nbrs[k].to].refr <= 0) cands.push(n.nbrs[k]);
      }
      for (var s = cands.length - 1; s > 0; s--) {
        var j = Math.floor(Math.random() * (s + 1)), tmp = cands[s]; cands[s] = cands[j]; cands[j] = tmp;
      }
      var sent = 0;
      for (var c = 0; c < cands.length && sent < 3; c++) {
        var p = gen === 0 ? 0.95 : gen < 3 ? 0.6 : gen < 6 ? 0.4 : 0.24;
        if (Math.random() > p) continue;
        impulses.push({ e: cands[c].e, t: 0, speed: rand(0.9, 1.4) * 250 / cands[c].e.len,
                        gen: gen + 1, from: i, to: cands[c].to, fromNode: n });
        sent++;
      }
    }

    function nearest(x, y, maxD) {
      var best = -1, bd = maxD * maxD;
      for (var i = 0; i < nodes.length; i++) {
        var dx = nodes[i].x - x, dy = nodes[i].y - y, d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = i; }
      }
      return best;
    }

    function update(dt) {
      var hi = nearest(mouse.x, mouse.y, 36);
      if (hi >= 0) fire(hi, -1, 0);

      if (!reduceMotion) {
        ambient -= dt;
        if (ambient <= 0 && impulses.length < 20) {
          fire(Math.floor(Math.random() * nodes.length), -1, 4);
          ambient = rand(2000, 4600);
        }
      }
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].refr > 0) nodes[i].refr -= dt;
        if (nodes[i].light > 0) nodes[i].light = Math.max(0, nodes[i].light - dt / 900);
      }
      for (var e = 0; e < edges.length; e++) {
        if (edges[e].hot > 0) edges[e].hot = Math.max(0, edges[e].hot - dt / 700);
      }
      for (var k = impulses.length - 1; k >= 0; k--) {
        var im = impulses[k];
        im.t += im.speed * dt / 1000;
        im.e.hot = Math.max(im.e.hot, 0.9);
        if (im.t >= 1) { impulses.splice(k, 1); fire(im.to, im.from, im.gen); }
      }
    }

    function hexToRgb(h) {
      h = h.replace("#", "");
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      var v = parseInt(h, 16);
      return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var eRGB = hexToRgb(colEdge), hRGB = hexToRgb(colHot);
      var base = narrow ? 0.5 : 1;

      // edges
      for (var i = 0; i < edges.length; i++) {
        var e = edges[i];
        ctx.beginPath();
        ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y);
        if (e.hot > 0.02) {
          ctx.strokeStyle = "rgba(" + hRGB + "," + (0.55 * e.hot * base).toFixed(3) + ")";
          ctx.lineWidth = 1.1;
        } else {
          ctx.strokeStyle = "rgba(" + eRGB + "," + (0.2 * base).toFixed(3) + ")";
          ctx.lineWidth = 0.7;
        }
        ctx.stroke();
      }

      // travelling impulses
      for (var k = 0; k < impulses.length; k++) {
        var im = impulses[k], T = Math.min(1, Math.max(0, im.t));
        var forward = im.e.ia === im.from;
        var ax = forward ? im.e.a.x : im.e.b.x, ay = forward ? im.e.a.y : im.e.b.y;
        var bx = forward ? im.e.b.x : im.e.a.x, by = forward ? im.e.b.y : im.e.a.y;
        var px = ax + (bx - ax) * T, py = ay + (by - ay) * T;
        ctx.beginPath(); ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + hRGB + "," + (0.95 * base).toFixed(3) + ")";
        ctx.fill();
      }

      // vertices
      for (var n = 0; n < nodes.length; n++) {
        var v = nodes[n];
        if (v.light > 0.02) {
          ctx.beginPath(); ctx.arc(v.x, v.y, v.r + 1.6 * v.light, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(" + hRGB + "," + (0.9 * v.light * base).toFixed(3) + ")";
          ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(v.x, v.y, v.r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(" + eRGB + "," + (0.42 * base).toFixed(3) + ")";
          ctx.fill();
        }
      }
    }

    function frame(ts) {
      var dt = Math.min(50, ts - (last || ts));
      last = ts;
      update(dt);
      draw();
      rafId = window.requestAnimationFrame(frame);
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      if (!W || !H) return;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      draw();
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", function (ev) {
      var r = canvas.getBoundingClientRect();
      mouse.x = ev.clientX - r.left;
      mouse.y = ev.clientY - r.top;
    }, { passive: true });

    new MutationObserver(function () { readPalette(); draw(); })
      .observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    resize();

    if (!reduceMotion && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && rafId === null) { last = 0; rafId = window.requestAnimationFrame(frame); }
          else if (!en.isIntersecting && rafId !== null) { window.cancelAnimationFrame(rafId); rafId = null; }
        });
      }, { threshold: 0 }).observe(canvas);
    } else if (!reduceMotion) {
      rafId = window.requestAnimationFrame(frame);
    }
  }

  /* ---------- Current year in footer ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
