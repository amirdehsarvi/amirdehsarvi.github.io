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

  /* ---------- Hero background: a brain-shaped connectome field ----------
     Nodes are sampled inside a sagittal brain silhouette and stay inside it as
     they drift; links form between near neighbours and brighten under the cursor. */
  var BRAIN_PATH = "M 20 70 C 17 48 33 30 56 22 C 82 12 116 12 141 22 C 166 32 184 51 186 72 " +
    "C 187 88 179 97 167 100 C 178 107 180 121 168 127 C 158 133 146 131 140 124 " +
    "C 139 134 137 144 134 150 C 131 156 121 156 118 150 C 115 143 117 132 118 122 " +
    "C 110 126 100 128 90 128 C 76 128 65 122 59 113 C 55 106 55 99 57 92 " +
    "C 48 97 37 94 30 87 C 23 80 20 76 20 70 Z";
  var BRAIN_W = 206, BRAIN_H = 170;

  var canvas = document.querySelector("[data-hero-canvas]");
  if (canvas && !reduceMotion && canvas.getContext && window.Path2D && window.DOMMatrix) {
    var ctx = canvas.getContext("2d");
    var nodes = [];
    var width = 0, height = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var pointer = { x: -9999, y: -9999 };
    var rafId = null;
    var brainPath = null, mask = null, linkDist = 60, narrow = false;

    function accentColor() {
      var c = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      return c || "#1c6b4a";
    }
    var stroke = accentColor();

    function buildBrain() {
      // fit the silhouette into the hero, biased right so it sits behind the portrait
      // large enough that the silhouette still reads around the text and portrait
      // narrow screens: sit it low and faint so it never fights the copy
      narrow = width < 800;
      var scale = narrow
        ? Math.min((width * 0.78) / BRAIN_W, (height * 0.42) / BRAIN_H)
        : Math.min((width * 0.52) / BRAIN_W, (height * 0.86) / BRAIN_H);
      var w = BRAIN_W * scale, h = BRAIN_H * scale;
      var ox = (narrow ? width * 0.60 : width * 0.72) - w / 2;
      var oy = (narrow ? height * 0.80 : height * 0.50) - h / 2;
      brainPath = new Path2D();
      brainPath.addPath(new Path2D(BRAIN_PATH), new DOMMatrix().translate(ox, oy).scale(scale));
      linkDist = Math.max(38, scale * 17);

      // membership mask, one byte per CSS pixel — cheap to test every frame
      var mc = document.createElement("canvas");
      mc.width = Math.max(1, Math.round(width));
      mc.height = Math.max(1, Math.round(height));
      var mctx = mc.getContext("2d");
      mctx.fillStyle = "#fff";
      mctx.fill(brainPath);
      var data = mctx.getImageData(0, 0, mc.width, mc.height).data;
      var m = new Uint8Array(mc.width * mc.height);
      for (var i = 0, p = 3; i < m.length; i++, p += 4) m[i] = data[p] > 128 ? 1 : 0;
      mask = { w: mc.width, h: mc.height, d: m };
    }

    function inside(x, y) {
      if (!mask || x < 0 || y < 0 || x >= mask.w || y >= mask.h) return false;
      return mask.d[(y | 0) * mask.w + (x | 0)] === 1;
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      if (!width || !height) return;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildBrain();

      var area = 0;
      for (var q = 0; q < mask.d.length; q++) area += mask.d[q];
      var count = Math.round(Math.min(190, Math.max(60, area / 1700)));
      nodes = [];
      var guard = 0;
      while (nodes.length < count && guard++ < count * 400) {
        var x = Math.random() * width, y = Math.random() * height;
        if (!inside(x, y)) continue;
        nodes.push({
          x: x, y: y,
          vx: (Math.random() - 0.5) * 0.14,
          vy: (Math.random() - 0.5) * 0.14,
          r: Math.random() * 1.3 + 0.8
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // the silhouette itself, very faint
      ctx.globalAlpha = narrow ? 0.2 : 0.34;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke(brainPath);

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var nx = n.x + n.vx, ny = n.y + n.vy;
        if (inside(nx, ny)) { n.x = nx; n.y = ny; }
        else { n.vx *= -1; n.vy *= -1; }          // turn back at the boundary

        for (var j = i + 1; j < nodes.length; j++) {
          var m2 = nodes[j];
          var dx = n.x - m2.x, dy = n.y - m2.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            ctx.globalAlpha = (1 - d / linkDist) * (narrow ? 0.14 : 0.26);
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m2.x, m2.y);
            ctx.stroke();
          }
        }

        var pdx = n.x - pointer.x, pdy = n.y - pointer.y;
        var near = Math.sqrt(pdx * pdx + pdy * pdy) < 120;
        ctx.globalAlpha = (near ? 0.85 : 0.5) * (narrow ? 0.55 : 1);
        ctx.fillStyle = stroke;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + (near ? 0.9 : 0), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafId = window.requestAnimationFrame(draw);
    }

    window.addEventListener("resize", function () { resize(); });
    window.addEventListener("pointermove", function (e) {
      var rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    }, { passive: true });

    var themeWatcher = new MutationObserver(function () { stroke = accentColor(); });
    themeWatcher.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    if ("IntersectionObserver" in window) {
      var heroObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && rafId === null) { rafId = window.requestAnimationFrame(draw); }
          else if (!entry.isIntersecting && rafId !== null) { window.cancelAnimationFrame(rafId); rafId = null; }
        });
      }, { threshold: 0 });
      heroObserver.observe(canvas);
    }

    resize();
    if (nodes.length) rafId = window.requestAnimationFrame(draw);
  }

  /* ---------- Current year in footer ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
