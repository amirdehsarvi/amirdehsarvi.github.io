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

  /* ---------- Hero background: soft connectome field ---------- */
  var canvas = document.querySelector("[data-hero-canvas]");
  if (canvas && !reduceMotion && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var nodes = [];
    var width = 0, height = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var pointer = { x: -9999, y: -9999 };
    var rafId = null;

    function accentColor() {
      var c = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      return c || "#0b6e7f";
    }
    var stroke = accentColor();

    function resize() {
      var rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(72, Math.max(26, (width * height) / 16000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          r: Math.random() * 1.5 + 0.7
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      var linkDist = Math.min(150, width * 0.16);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        for (var j = i + 1; j < nodes.length; j++) {
          var m = nodes[j];
          var dx = n.x - m.x, dy = n.y - m.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            ctx.globalAlpha = (1 - d / linkDist) * 0.16;
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }

        var pdx = n.x - pointer.x, pdy = n.y - pointer.y;
        var pd = Math.sqrt(pdx * pdx + pdy * pdy);
        var near = pd < 130;
        ctx.globalAlpha = near ? 0.55 : 0.3;
        ctx.fillStyle = stroke;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + (near ? 0.8 : 0), 0, Math.PI * 2);
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

    // Pause when the hero scrolls out of view.
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
    rafId = window.requestAnimationFrame(draw);
  }

  /* ---------- Current year in footer ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
