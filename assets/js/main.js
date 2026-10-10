/* Портфолио Алекса — общий скрипт */

/* ===== НАСТРОЙКА =====
   Номер счётчика Яндекс Метрики. Создайте счётчик на metrika.yandex.ru
   и впишите сюда его номер вместо 0 (например: 98765432).
   Метрика включается только после того, как посетитель нажал «Согласен». */
var YM_ID = 0;

(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Яндекс Метрика: только с согласия ---------- */
  var CONSENT_KEY = "cookie-consent";
  var consent = null;
  try { consent = localStorage.getItem(CONSENT_KEY); } catch (err) {}
  function loadMetrika() {
    if (!YM_ID || window.ym) return;
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      k = e.createElement(t); a = e.getElementsByTagName(t)[0];
      k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    window.ym(YM_ID, "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true });
  }
  if (consent === "yes") loadMetrika();
  function goal(name) { if (YM_ID && typeof window.ym === "function") window.ym(YM_ID, "reachGoal", name); }

  /* Цели: tg_click, wa_click, mail_click, demo_open, case_open (атрибут data-goal) */
  document.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("[data-goal]") : null;
    if (el && el.type !== "submit") goal(el.getAttribute("data-goal"));
  });

  /* ---------- Плашка cookie ---------- */
  var cookie = document.querySelector(".cookie");
  if (cookie && consent !== "yes" && consent !== "no") {
    cookie.classList.add("is-visible");
    document.body.classList.add("cookie-open");
  }
  if (cookie) cookie.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-consent]");
    if (!btn) return;
    var value = btn.getAttribute("data-consent");
    try { localStorage.setItem(CONSENT_KEY, value); } catch (err) {}
    cookie.classList.remove("is-visible");
    document.body.classList.remove("cookie-open");
    if (value === "yes") loadMetrika();
  });

  /* ---------- Шапка и прогресс чтения кейса ---------- */
  var header = document.querySelector(".site-header");
  var progress = document.getElementById("progress");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? window.scrollY / max * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Плавающие кнопки на телефоне ---------- */
  var bar = document.querySelector(".float-bar");
  var hero = document.querySelector("[data-hero]");
  var contacts = document.getElementById("contact");
  if (bar && "IntersectionObserver" in window) {
    var heroVisible = !!hero, contactsVisible = false;
    var update = function () { bar.classList.toggle("is-visible", !heroVisible && !contactsVisible); };
    if (hero) new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; update(); }).observe(hero);
    if (contacts) new IntersectionObserver(function (en) { contactsVisible = en[0].isIntersecting; update(); }).observe(contacts);
    update();
  } else if (bar) {
    bar.classList.add("is-visible");
  }

  /* ---------- Появление блоков: контент виден всегда, сдвигается только то, что ниже экрана ---------- */
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.remove("is-pending"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add("is-pending"); io.observe(el); }
    });
  }

  /* ---------- Копирование контактов ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var v = b.getAttribute("data-copy");
      var done = function (t) { b.textContent = t; setTimeout(function () { b.textContent = "Скопировать"; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(v).then(function () { done("Скопировано"); }, function () { done("Не вышло"); });
      } else { done("Не вышло"); }
    });
  });

  /* ---------- Форма: поля сразу складываются в готовое сообщение ----------
     Кнопки Telegram, WhatsApp и «Почта» — обычные ссылки: их адрес обновляется
     при каждом изменении, и мессенджер открывается с уже написанным текстом. */
  var form = document.getElementById("brief");
  if (form) {
    var preview = document.getElementById("f-preview");
    var resetBtn = document.getElementById("f-reset");
    var tgBtn = document.getElementById("send-tg"), waBtn = document.getElementById("send-wa"), mailBtn = document.getElementById("send-mail");
    var edited = false;
    var val = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
    var pick = function (name) { var el = form.querySelector("input[name=" + name + "]:checked"); return el ? el.value : ""; };
    var compose = function () {
      var name = val("f-name"), biz = val("f-biz"), type = pick("type"), when = pick("when"), text = val("f-msg");
      var lines = ["Здравствуйте, Алекс!" + (name ? " Меня зовут " + name + "." : "")];
      if (biz) lines.push("Бизнес: " + biz + ".");
      if (type === "consult") lines.push("Пока не знаю, какой сайт нужен, — нужна консультация.");
      else if (type) lines.push("Нужен " + type + ".");
      if (when) lines.push("Когда: " + when + ".");
      if (text) lines.push(text);
      lines.push("Подскажите, пожалуйста, цену и срок.");
      return lines.join("\n");
    };
    var setLinks = function () {
      var msg = preview.value.trim() || compose();
      var enc = encodeURIComponent(msg);
      tgBtn.href = "https://t.me/" + form.getAttribute("data-tg") + "?text=" + enc;
      waBtn.href = "https://wa.me/" + form.getAttribute("data-wa") + "?text=" + enc;
      mailBtn.href = "mailto:" + form.getAttribute("data-mail") + "?subject=" + encodeURIComponent("Сайт для бизнеса") + "&body=" + enc;
    };
    var refresh = function () { if (!edited) preview.value = compose(); setLinks(); };
    form.addEventListener("input", function (e) {
      if (e.target === preview) { edited = true; resetBtn.hidden = false; setLinks(); } else { refresh(); }
    });
    form.addEventListener("change", function (e) { if (e.target !== preview) refresh(); });
    resetBtn.addEventListener("click", function () { edited = false; resetBtn.hidden = true; refresh(); preview.focus(); });
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    [tgBtn, waBtn, mailBtn].forEach(function (a) { a.addEventListener("click", function () { setLinks(); goal("brief_sent"); }); });
    refresh();
  }

  /* ---------- Год в подвале ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Поле на первом экране: точки расходятся от курсора ---------- */
  var box = document.getElementById("field"), cv = document.getElementById("cv");
  if (box && cv && cv.getContext) {
    var ctx = cv.getContext("2d");
    var w = 0, h = 0, t = 0, mx = null, my = null, cx = 0, cy = 0, colors = {}, raf = 0, visible = true;
    var readColors = function () {
      var s = getComputedStyle(root);
      colors = { ink: s.getPropertyValue("--muted").trim(), acc: s.getPropertyValue("--accent").trim() };
    };
    var size = function () {
      var r = box.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!cx) { cx = w * .6; cy = h * .45; }
    };
    var draw = function () {
      t += 0.008;
      var tx = mx !== null ? mx : w * .55 + Math.cos(t) * w * .22, ty = my !== null ? my : h * .45 + Math.sin(t * 1.3) * h * .2;
      cx += (tx - cx) * .08; cy += (ty - cy) * .08;
      ctx.clearRect(0, 0, w, h);
      var gap = 22, R = Math.max(w, h) * .32;
      for (var y = gap / 2; y < h; y += gap) {
        for (var x = gap / 2; x < w; x += gap) {
          var dx = x - cx, dy = y - cy, d = Math.sqrt(dx * dx + dy * dy), k = Math.max(0, 1 - d / R);
          var push = k * k * 26, a = Math.atan2(dy, dx);
          ctx.globalAlpha = 0.28 + k * 0.72;
          ctx.fillStyle = k > .35 ? colors.acc : colors.ink;
          ctx.beginPath(); ctx.arc(x + Math.cos(a) * push, y + Math.sin(a) * push, 1 + k * 3.2, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      if (!reduce && visible) raf = requestAnimationFrame(draw);
    };
    box.addEventListener("pointermove", function (e) { var r = box.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    box.addEventListener("pointerleave", function () { mx = my = null; });
    window.addEventListener("resize", function () { size(); if (reduce) draw(); });
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", function () { readColors(); if (reduce) draw(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible && !reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }
      }).observe(box);
    }
    readColors(); size(); draw();
  }
})();
