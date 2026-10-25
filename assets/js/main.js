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

  /* Цели: tg_click, wa_click, mail_click, demo_open, case_open, quiz_done (атрибут data-goal) */
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

  /* ---------- Тест «Какой сайт нужен»: 4 вопроса → формат, цена, готовая заявка ---------- */
  var quiz = document.querySelector("[data-quiz]");
  if (quiz) {
    var qs = quiz.querySelectorAll(".q"), step = 0, answers = {}, labels = {};
    var qBar = quiz.querySelector(".quiz-progress i"), count = quiz.querySelector("[data-quiz-count]");
    var resBox = quiz.querySelector("[data-quiz-result]"), back = quiz.querySelector("[data-quiz-back]");
    var PACKS = {
      landing: { type: "лендинг", name: "Лендинг, который собирает заявки", price: "от 20 000 ₽", time: "первая версия за 3 дня",
        why: "Одна страница, которая ведёт к одному действию — написать вам. Быстро запускается, и на неё удобно вести рекламу." },
      catalog: { type: "сайт-каталог", name: "Сайт-каталог с ценами", price: "от 30 000 ₽", time: "первая версия за 4 дня",
        why: "Покупатель видит ассортимент и цены до звонка и приходит уже с выбором. Плюс отзывы и маршрут." },
      redesign: { type: "редизайн сайта", name: "Редизайн сайта", price: "от 25 000 ₽", time: "первая версия за 4–5 дней",
        why: "Старый сайт станет готовым брифом: оставим то, что работает, и переделаем то, что мешает продавать." },
      invest: { type: "сайт для инвестора", name: "Сайт для инвестора", price: "от 35 000 ₽", time: "первая версия за 5 дней",
        why: "Одна страница, где инвестор за несколько минут видит продукт, спрос, юнит-экономику и ваше предложение." }
    };
    var decide = function () {
      if (answers.biz === "startup" || answers.goal === "invest") return PACKS.invest;
      var big = answers.items === "many" || answers.goal === "choose";
      if (answers.now === "old") {
        var r = Object.assign({}, PACKS.redesign);
        if (big) { r.name = "Редизайн с каталогом"; r.price = "от 35 000 ₽"; }
        return r;
      }
      if (big || (answers.biz === "shop" && answers.items !== "one")) return PACKS.catalog;
      return PACKS.landing;
    };
    var show = function () {
      qs.forEach(function (q, i) { q.classList.toggle("is-active", i === step); });
      var done = step >= qs.length;
      resBox.hidden = !done;
      back.hidden = step === 0 || done;
      qBar.style.width = (done ? 100 : (step + 1) / qs.length * 100) + "%";
      count.textContent = done ? "Готово" : "Вопрос " + (step + 1) + " из " + qs.length;
      if (done) {
        var p = decide();
        resBox.querySelector('[data-r="name"]').textContent = p.name;
        resBox.querySelector('[data-r="why"]').textContent = p.why;
        resBox.querySelector('[data-r="price"]').textContent = p.price;
        resBox.querySelector('[data-r="time"]').textContent = p.time;
        resBox.setAttribute("data-type", p.type);
      }
    };
    qs.forEach(function (q, i) {
      q.addEventListener("click", function (e) {
        var b = e.target.closest("button[data-v]");
        if (!b) return;
        q.querySelectorAll("button").forEach(function (x) { x.classList.toggle("is-picked", x === b); });
        answers[q.getAttribute("data-q")] = b.getAttribute("data-v");
        labels[q.getAttribute("data-q")] = q.querySelector("legend").textContent + " — " + b.textContent;
        step = i + 1;
        setTimeout(show, 160);
      });
    });
    back.addEventListener("click", function () { if (step > 0) { step--; show(); } });
    quiz.querySelector("[data-quiz-reset]").addEventListener("click", function () {
      step = 0; answers = {}; labels = {};
      quiz.querySelectorAll(".is-picked").forEach(function (x) { x.classList.remove("is-picked"); });
      show();
    });
    quiz.querySelector("[data-quiz-send]").addEventListener("click", function () {
      var type = resBox.getAttribute("data-type");
      var radio = document.querySelector('#brief input[name=type][value="' + type + '"]');
      if (radio) { radio.checked = true; radio.dispatchEvent(new Event("change", { bubbles: true })); }
      var msg = document.getElementById("f-msg");
      if (msg) {
        var lines = ["Ответы теста:"];
        ["biz", "now", "items", "goal"].forEach(function (k) { if (labels[k]) lines.push("• " + labels[k]); });
        lines.push("Подошло: " + resBox.querySelector('[data-r="name"]').textContent + ", " + resBox.querySelector('[data-r="price"]').textContent + ".");
        msg.value = lines.join("\n");
        msg.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    show();
  }

  /* ---------- Год в подвале ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Поле на первом экране: точки расходятся от курсора ---------- */
  var box = document.getElementById("field"), cv = document.getElementById("cv");
  if (box && cv && cv.getContext) {
    var ctx = cv.getContext("2d");
    var w = 0, h = 0, t = 0, mx = null, my = null, cx = 0, cy = 0, colors = {}, raf = 0, visible = true, waves = [];
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
      waves = waves.filter(function (wv) { wv.r += 7; wv.life -= 0.012; return wv.life > 0; });
      var gap = 22, R = Math.max(w, h) * .32;
      for (var y = gap / 2; y < h; y += gap) {
        for (var x = gap / 2; x < w; x += gap) {
          var dx = x - cx, dy = y - cy, d = Math.sqrt(dx * dx + dy * dy), k = Math.max(0, 1 - d / R);
          var push = k * k * 26, a = Math.atan2(dy, dx), glow = 0;
          for (var wi = 0; wi < waves.length; wi++) {
            var wv = waves[wi], wdx = x - wv.x, wdy = y - wv.y, wd = Math.sqrt(wdx * wdx + wdy * wdy), band = Math.abs(wd - wv.r);
            if (band < 36) { var f = (1 - band / 36) * wv.life; push += f * 16; glow = Math.max(glow, f); if (wd > 0) a = Math.atan2(wdy, wdx); }
          }
          k = Math.max(k, glow);
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
    /* клик по полю — волна расходится кругами */
    box.addEventListener("pointerdown", function (e) {
      if (reduce) return;
      var r = box.getBoundingClientRect();
      waves.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 0, life: 1 });
      if (waves.length > 4) waves.shift();
    });
    window.addEventListener("resize", function () { size(); if (reduce) draw(); });
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", function () { readColors(); if (reduce) draw(); });
    document.addEventListener("identitychange", function () { readColors(); if (reduce) draw(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible && !reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }
      }).observe(box);
    }
    readColors(); size(); draw();
  }
})();
