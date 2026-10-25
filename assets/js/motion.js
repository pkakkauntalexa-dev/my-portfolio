/* Портфолио Алекса — анимации.
   Всё здесь — украшение: без этого файла сайт работает и виден полностью.
   Если в системе включено «уменьшить движение», анимации не запускаются. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (reduce) return;
  root.classList.add("motion");

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var inView = function (el) { var r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };

  /* ---------- 1. Заголовки выезжают по словам ---------- */
  function split(el) {
    if (!el || el.hasAttribute("data-split")) return;
    el.setAttribute("data-split", "");
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    var i = 0;
    (function walk(node) {
      $$(":scope > *", node).forEach(function (c) { c.setAttribute("aria-hidden", "true"); });
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement("span"); w.className = "w"; w.setAttribute("aria-hidden", "true");
            var s = document.createElement("span"); s.textContent = part; s.style.setProperty("--i", i++);
            w.appendChild(s); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== "BR") { walk(n); }
      });
    })(el);
  }
  var heroTitle = $(".hero h1") || $(".c-hero h1") || $(".doc h1");
  split(heroTitle);
  if (heroTitle) heroTitle.classList.add("is-in");
  $$(".sec-head h2, .about-text h2, .contact h2, .quiz-side h2, .chapter > h2").forEach(split);

  /* Рукописная линия под словом «продают» */
  var em = $(".hero h1 em");
  if (em) {
    em.classList.add("has-scribble");
    em.insertAdjacentHTML("beforeend", '<svg class="scribble" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true"><path d="M4 17 C 60 7, 120 5, 170 11 S 260 19, 296 8" pathLength="1"/></svg>');
  }

  /* ---------- 2. Появление при прокрутке + лесенка ---------- */
  var auto = ".decisions > div, .timeline > div, .shot, .phones, .metrics > div, .ba, .c-cta > *, .tech, .passport > div, .principles > div, .faq details, .terms > div, .vitals > div";
  $$(auto).forEach(function (el) { el.classList.add("reveal"); });
  var groups = new Map();
  $$(".reveal").forEach(function (el) {
    var p = el.parentElement, n = groups.get(p) || 0;
    el.style.setProperty("--d", Math.min(n, 6) * 80 + "ms");
    groups.set(p, n + 1);
  });

  var watch = $$(".reveal, [data-split]:not(.is-in), .process, .portrait, .q-price, .svc .price, .metrics, .vitals, .terms");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.remove("is-pending");
        en.target.classList.add("is-in");
        countIn(en.target);
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    watch.forEach(function (el) {
      if (inView(el)) { el.classList.add("is-in"); countIn(el); }
      else { if (el.classList.contains("reveal")) el.classList.add("is-pending"); io.observe(el); }
    });
  }

  /* ---------- 3. Цифры набегают ---------- */
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function countIn(scope) {
    var list = scope.matches && scope.matches(".svc .price, .q-price") ? [scope.querySelector("b")] : $$("b", scope);
    if (scope.matches && scope.matches(".metrics > div, .vitals > div, .terms > div")) list = [scope.querySelector("b")];
    list.forEach(function (b) {
      if (!b || b.hasAttribute("data-counted")) return;
      b.setAttribute("data-counted", "");
      var txt = b.textContent, m = txt.match(/\d[\d\s ]*/);
      if (!m || /\//.test(txt)) return;
      var target = parseInt(m[0].replace(/\D/g, ""), 10);
      if (!target) return;
      var pre = txt.slice(0, m.index), post = txt.slice(m.index + m[0].length).replace(/^\s?/, m[0].match(/\s$/) ? " " : "");
      var t0 = performance.now(), dur = target > 50 ? 1300 : 700;
      b.style.minWidth = b.offsetWidth + "px";
      (function tick(t) {
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        var v = Math.round(target * e);
        if (target >= 1000) v = Math.round(v / 100) * 100;
        b.textContent = pre + fmt(k === 1 ? target : v) + post;
        if (k < 1) requestAnimationFrame(tick); else { b.textContent = txt; b.style.minWidth = ""; }
      })(t0);
    });
  }
  /* ловим новые цены в тесте */
  var qPrice = $(".q-price");
  if (qPrice && "MutationObserver" in window) {
    new MutationObserver(function () {
      var b = qPrice.querySelector("b");
      if (b && b.textContent && !b.hasAttribute("data-counting")) {
        b.setAttribute("data-counting", ""); b.removeAttribute("data-counted");
        countIn(qPrice);
        setTimeout(function () { b.removeAttribute("data-counting"); }, 1400);
      }
    }).observe(qPrice, { childList: true, subtree: true, characterData: true });
  }

  /* ---------- 4. Бегущая строка проектов ---------- */
  var logos = $(".logos .wrap");
  if (logos) {
    var items = $$(".lg", logos);
    if (items.length) {
      var mq = document.createElement("div"); mq.className = "marquee";
      var track = document.createElement("div"); track.className = "marquee-track";
      var block = function (hidden) {
        var g = document.createElement("div"); g.className = "marquee-group";
        if (hidden) g.setAttribute("aria-hidden", "true");
        items.concat(items).forEach(function (a) {
          var c = a.cloneNode(true); if (hidden) c.tabIndex = -1;
          g.appendChild(c);
          var star = document.createElement("span"); star.className = "mq-star"; star.textContent = "✦"; star.setAttribute("aria-hidden", "true");
          g.appendChild(star);
        });
        return g;
      };
      track.appendChild(block(false)); track.appendChild(block(true));
      mq.appendChild(track);
      items.forEach(function (a) { a.remove(); });
      logos.appendChild(mq);
      logos.classList.add("has-marquee");
    }
  }

  /* ---------- 5. Прогресс прокрутки на любой странице ---------- */
  if (!$("#progress")) {
    var pr = document.createElement("div"); pr.className = "progress"; pr.id = "progress"; pr.setAttribute("aria-hidden", "true");
    document.body.appendChild(pr);
    var upd = function () {
      var max = root.scrollHeight - innerHeight;
      pr.style.width = (max > 0 ? scrollY / max * 100 : 0) + "%";
    };
    addEventListener("scroll", upd, { passive: true }); upd();
  }

  /* ---------- 6. Шапка прячется при прокрутке вниз и возвращается при прокрутке вверх ---------- */
  var head = $(".site-header"), lastY = scrollY;
  if (head) addEventListener("scroll", function () {
    var y = scrollY;
    if (Math.abs(y - lastY) < 6) return;
    head.classList.toggle("is-hidden", y > lastY && y > 320);
    lastY = y;
  }, { passive: true });

  /* ---------- 6б. Параллакс обложек ---------- */
  var para = $$(".cover .mock, .lab-pic img, .field, .portrait img");
  var ticking = false;
  function parallax() {
    ticking = false;
    var vh = innerHeight;
    para.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var k = ((r.top + r.height / 2) - vh / 2) / vh; /* -1…1 */
      var amp = el.classList.contains("field") ? 18 : el.tagName === "IMG" ? 14 : 14;
      el.style.setProperty("--py", (-k * amp).toFixed(1) + "px");
    });
  }
  if (para.length) {
    addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } }, { passive: true });
    addEventListener("resize", parallax); parallax();
  }

  if (!fine) return; /* дальше — только для мыши */

  /* ---------- 7. Наклон карточек за курсором ---------- */
  $$(".case-card .cover, .lab-card").forEach(function (el) {
    var strength = el.classList.contains("lab-card") ? 3 : 5;
    el.classList.add("tilt");
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.setProperty("--rx", (-y * strength).toFixed(2) + "deg");
      el.style.setProperty("--ry", (x * strength).toFixed(2) + "deg");
      el.style.setProperty("--gx", (x + .5) * 100 + "%");
      el.style.setProperty("--gy", (y + .5) * 100 + "%");
    });
    el.addEventListener("pointerleave", function () { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
  });

  /* ---------- 8. Магнитные кнопки ---------- */
  $$(".btn-primary, .send .btn, .float-bar .btn, .c-cta .ask").forEach(function (b) {
    b.classList.add("magnet");
    b.addEventListener("pointermove", function (e) {
      var r = b.getBoundingClientRect();
      var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      var k = b.classList.contains("ask") ? .04 : .22;
      b.style.setProperty("--mx", (x * k).toFixed(1) + "px");
      b.style.setProperty("--my", (y * k).toFixed(1) + "px");
    });
    b.addEventListener("pointerleave", function () { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); });
  });

  /* ---------- 9. Курсор-кольцо ---------- */
  var ring = document.createElement("div"); ring.className = "cursor"; ring.setAttribute("aria-hidden", "true");
  ring.innerHTML = "<span></span>";
  document.body.appendChild(ring);
  var label = ring.firstChild;
  var tx = -100, ty = -100, cx = -100, cy = -100, shown = false, raf = 0;
  function loop() {
    cx += (tx - cx) * .2; cy += (ty - cy) * .2;
    ring.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
    if (Math.abs(tx - cx) > .1 || Math.abs(ty - cy) > .1) raf = requestAnimationFrame(loop); else raf = 0;
  }
  addEventListener("pointermove", function (e) {
    tx = e.clientX; ty = e.clientY;
    if (!shown) { shown = true; cx = tx; cy = ty; ring.classList.add("on"); }
    if (!raf) raf = requestAnimationFrame(loop);
    hoverState(e.target);
  }, { passive: true });
  function hoverState(t) {
    t = t && t.closest ? t : null;
    var card = t && t.closest(".case-card, a.lab-card, .c-cta .nxt");
    var link = t && t.closest("a, button, summary, label, [role=button]");
    var field = t && t.closest(".field");
    ring.classList.toggle("is-card", !!card);
    ring.classList.toggle("is-link", !card && !!link);
    ring.classList.toggle("is-field", !!field);
    label.textContent = card ? (card.classList.contains("lab-card") ? "Играть" : "Открыть") : "";
  }
  /* при прокрутке колесом под курсором оказывается другой блок */
  var scrollT = 0;
  addEventListener("scroll", function () {
    if (!shown || scrollT) return;
    scrollT = setTimeout(function () { scrollT = 0; hoverState(document.elementFromPoint(tx, ty)); }, 60);
  }, { passive: true });
  document.addEventListener("pointerleave", function () { shown = false; ring.classList.remove("on"); });
  addEventListener("pointerdown", function () { ring.classList.add("down"); });
  addEventListener("pointerup", function () { ring.classList.remove("down"); });
})();
