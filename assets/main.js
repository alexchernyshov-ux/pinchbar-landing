// PinchBar landing — mobile menu, scroll reveal, lazy image fade, chapter index, FAQ accordion, hero panel loop + hands-on mode,
// step key caps, action-key cycle, AI provider switcher, demo.
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // ---------- Mobile menu ----------
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('menu');
  var menuTimer;
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
    clearTimeout(menuTimer);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('is-open'); }); });
    } else {
      menu.classList.remove('is-open');
      if (reduceMotion) menu.hidden = true;
      else menuTimer = setTimeout(function () { menu.hidden = true; }, 320);
    }
  }
  if (toggle && menu) {
    menu.querySelectorAll('.menu__links a, .btn').forEach(function (el, i) { el.style.setProperty('--i', i); });
    toggle.addEventListener('click', function () { setMenu(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (mq) { if (mq.matches) setMenu(false); });
  }

  // ---------- Lazy screenshots fade in once loaded ----------
  document.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
    function done() { img.classList.add('loaded'); }
    if (img.complete && img.naturalWidth) done();
    else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
  });

  // ---------- Reveal on scroll ----------
  // Stagger siblings that reveal together (cards, steps, chapter text + shot)
  document.querySelectorAll('.cards3, .steps, .trial, .get, .chapter').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (el, i) {
      if (el.classList.contains('reveal')) el.style.setProperty('--d', (i * 90) + 'ms');
    });
  });
  var reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); ro.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { ro.observe(el); });
  }

  // ---------- Sticky chapter index ----------
  var indexLinks = document.querySelectorAll('.story__index a');
  if (indexLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    indexLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        indexLinks.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
        var link = byId[en.target.id];
        if (link) { link.classList.add('is-active'); link.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('.chapter').forEach(function (ch) { co.observe(ch); });
  }

  // ---------- FAQ: animated, one open at a time ----------
  var faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq__list details'));
  if (faqItems.length && !reduceMotion && 'animate' in document.body) {
    var EASE = 'cubic-bezier(.16, 1, .3, 1)';
    var closedHeight = function (d) { return d.querySelector('summary').offsetHeight + (d.offsetHeight - d.clientHeight); };
    var finishAnim = function (d) { if (d._anim) { d._anim.cancel(); d._anim = null; } d.style.overflow = ''; };
    var closeItem = function (d) {
      finishAnim(d);
      var from = d.offsetHeight;
      d.classList.add('is-closing');
      d.style.overflow = 'hidden';
      d._anim = d.animate({ height: [from + 'px', closedHeight(d) + 'px'] }, { duration: 380, easing: EASE });
      d._anim.onfinish = function () { d.open = false; d.classList.remove('is-closing'); finishAnim(d); };
    };
    var openItem = function (d) {
      finishAnim(d);
      d.classList.remove('is-closing');
      var from = d.offsetHeight;
      d.open = true;
      var to = d.offsetHeight;
      d.style.overflow = 'hidden';
      d._anim = d.animate({ height: [from + 'px', to + 'px'] }, { duration: 460, easing: EASE });
      d._anim.onfinish = function () { finishAnim(d); };
      var p = d.querySelector('p');
      if (p) p.animate({ opacity: [0, 1], transform: ['translateY(-6px)', 'none'] }, { duration: 420, delay: 60, easing: EASE, fill: 'backwards' });
    };
    faqItems.forEach(function (d) {
      d.removeAttribute('name'); // exclusivity handled here so the closing item can animate
      d.querySelector('summary').addEventListener('click', function (e) {
        e.preventDefault();
        if (d.open && !d.classList.contains('is-closing')) { closeItem(d); return; }
        faqItems.forEach(function (o) { if (o !== d && o.open && !o.classList.contains('is-closing')) closeItem(o); });
        openItem(d);
      });
    });
  }

  // ---------- Hero: looping panel animation (copy arrives, actions run); visitors can take over ----------
  // The final CTA gets a live copy of the same panel (its screenshot stays as the no-JS fallback).
  (function cloneFinalPanel() {
    var src = document.querySelector('.hero__shot .pb');
    var fig = document.querySelector('.final__shot');
    if (!src || !fig) return;
    var pin = document.createElement('div');
    pin.className = 'shot-pin';
    pin.appendChild(src.cloneNode(true));
    var img = fig.querySelector('img');
    if (img) img.remove();
    fig.insertBefore(pin, fig.firstChild);
    ['.pb-hint', '.pb-play'].forEach(function (sel) {
      var el = document.querySelector('.hero__shot ' + sel);
      if (el) fig.insertBefore(el.cloneNode(true), pin.nextSibling);
    });
    var cap = document.createElement('figcaption');
    cap.className = 'sr';
    cap.textContent = 'The same animated PinchBar panel as at the top of the page: pick a card and an action to try it.';
    fig.appendChild(cap);
  })();

  document.querySelectorAll('.pb').forEach(function heroPanel(pb) {
    var fig = pb.closest('figure');
    var pin = pb.parentElement;
    var callouts = pin.querySelectorAll('.co[data-for]');

    // Pin each callout to the middle of the part it labels.
    function placeCallouts() {
      var h = pin.offsetHeight ? pb.offsetHeight : 0;
      if (!h) return;
      var top = pb.getBoundingClientRect().top;
      callouts.forEach(function (co) {
        var t = pb.querySelector(co.getAttribute('data-for'));
        if (!t) return;
        var r = t.getBoundingClientRect();
        co.style.setProperty('--y', ((r.top - top + r.height / 2) / h * 100).toFixed(2) + '%');
      });
    }
    placeCallouts();
    window.addEventListener('resize', placeCallouts);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeCallouts);

    var canLoop = !reduceMotion && 'IntersectionObserver' in window;
    var cardsBox = pb.querySelector('.pb__cards');
    var track = pb.querySelector('.pb__track');
    var cards = Array.prototype.slice.call(pb.querySelectorAll('.pb__card'));
    var newCard = cards[0];
    var acts = pb.querySelector('.pb__acts');
    var row = pb.querySelector('.pb__row');
    var chips = Array.prototype.slice.call(pb.querySelectorAll('.pb__chip'));
    var label = pb.querySelector('.pb__label b');
    var out = pb.querySelector('.pb__out');
    var text = pb.querySelector('.pb__text');
    var bal = pb.querySelector('.pb__bal');
    var meter = pb.querySelector('.pb__meter i');
    var toast = pb.querySelector('.pb__toast');
    var cursor = pb.querySelector('.pb__cursor');
    var tools = pb.querySelectorAll('.pb__tools span');
    var btn = fig.querySelector('.pb-play');
    var hint = fig.querySelector('.pb-hint');

    // Pre-written results for each clipboard card × action (no live AI).
    var RESULTS = [{
      fix: 'Hey team, quick update — the launch has moved to Thursday because Legal still needs to review the pricing page. Can everyone make sure their assets are final by Wed EOD? Thanks.',
      clarify: 'Launch update: we’re moving to Thursday so Legal can finish reviewing the pricing page. What I need from you: final assets by Wednesday EOD.',
      fact: 'Nothing to fact-check — this is a schedule update. The dates come from your team, so confirm them with Legal if in doubt.',
      sum: 'The launch moves to Thursday for Legal’s pricing review; assets are due Wednesday EOD.',
      trans: 'Hola a todos: el lanzamiento se ha movido al jueves porque Legal aún tiene que revisar la página de precios. ¿Pueden dejar sus materiales listos antes del miércoles por la tarde? Gracias.',
      struct: 'Launch update\n• New date: Thursday\n• Why: Legal is reviewing the pricing page\n• Your part: final assets by Wed EOD',
      items: '☐ Finalize your launch assets by Wed EOD\n☐ Legal: finish the pricing page review before Thursday',
      short: 'Launch moves to Thursday while Legal reviews the pricing page. Please finalize your assets by Wed EOD.',
      expand: 'Hi team — the launch is moving to Thursday. Legal still needs to review the pricing page, and we want that done before anything goes live. Please have your assets final by Wednesday EOD. Thanks!',
      reply: 'Thanks for the heads-up! My assets will be final by Wednesday EOD. Let me know if Legal needs anything for the pricing page.'
    }, {
      fix: 'Teams that write shorter messages spend less time in meetings. In a six-month study of 40 product teams, groups that kept their updates under 150 words held 30% fewer status meetings.',
      clarify: 'Shorter updates mean fewer meetings: over six months, product teams that kept updates under 150 words held 30% fewer status meetings.',
      fact: 'Unverified. The text cites a study of 40 teams but names no source, so treat the 30% figure as unconfirmed until you find the original.',
      sum: 'Keeping updates under 150 words cut status meetings by 30% across 40 product teams.',
      trans: 'Los equipos que escriben mensajes más breves pasan menos tiempo en reuniones. En un estudio de seis meses con 40 equipos de producto, los que limitaron sus actualizaciones a 150 palabras tuvieron un 30 % menos de reuniones.',
      struct: 'Finding\n• Short updates → fewer meetings\nEvidence\n• Six-month study, 40 product teams\n• Under 150 words: 30% fewer status meetings',
      items: '☐ Keep team updates under 150 words\n☐ Count status meetings for a month\n☐ Find the original study before quoting it',
      short: 'Updates under 150 words led to 30% fewer status meetings.',
      expand: 'Teams that keep their written updates short tend to spend less time in meetings. A six-month study followed 40 product teams: the groups whose updates stayed under 150 words held 30% fewer status meetings than the rest.',
      reply: 'Interesting — thanks for sharing! Do you have a link to the study? I’d like to try the 150-word rule with our team.'
    }, {
      fix: 'Hi! I ordered the large travel backpack last week, but I received the medium one. Can I swap it?',
      clarify: 'I received the wrong size: I ordered the large travel backpack but got the medium one. Can I swap it for the large?',
      fact: 'Nothing to fact-check — this is a customer request about an order.',
      sum: 'A customer received a medium backpack instead of the large one and wants to swap it.',
      trans: '¡Hola! La semana pasada pedí la mochila de viaje grande, pero recibí la mediana. ¿Puedo cambiarla?',
      struct: 'Order issue\n• Ordered: large travel backpack\n• Received: medium\n• Request: swap for the large',
      items: '☐ Confirm the order for the large backpack\n☐ Ship the large one\n☐ Arrange the return of the medium',
      short: 'Got the medium backpack instead of the large. Can I swap it?',
      expand: 'Hi! Last week I ordered the large travel backpack, but the one that arrived is the medium size. Could I swap it for the large? Please let me know if I should send the medium one back first.',
      reply: 'Hi! Sorry about the mix-up. We’ll send the large backpack right away, with a prepaid label to return the medium one.'
    }];
    var NAMES = {};
    chips.forEach(function (c) { NAMES[c.getAttribute('data-act')] = c.textContent.replace(/⌃\d$/, '').trim(); });
    var START = 31029, TOTAL = 41000, credits = START;

    var userPaused = false, autoPaused = false, gen = 0, cur = 0, rowX = 0;
    var live = false, busy = false, hovering = false, idle = 0, idleLast = 0;
    var IDLE_MS = 7000; // hands-off time before the loop takes over again
    var paused = function () { return userPaused || autoPaused; };
    // A wait that only counts time while the loop is playing.
    function wait(ms, g) {
      return new Promise(function (resolve, reject) {
        var left = ms, last = performance.now();
        (function tick(now) {
          if (g !== gen) { reject(new Error('stop')); return; }
          if (!paused()) left -= now - last;
          last = now;
          if (left <= 0) resolve(); else requestAnimationFrame(tick);
        })(last);
      });
    }
    function setCredits(v) {
      credits = v;
      bal.textContent = String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      meter.style.setProperty('--m', (v / TOTAL * 100).toFixed(1) + '%');
    }
    function setHint() {
      text.textContent = 'Pick an action to transform the selected copy.';
      text.classList.add('is-hint');
    }
    function setRow(x) {
      rowX = Math.round(Math.min(Math.max(0, row.scrollWidth - acts.clientWidth), Math.max(0, x)));
      row.style.transform = 'translateX(' + (-rowX) + 'px)';
    }
    function rowShift(chip) { return chip.offsetLeft - (acts.clientWidth - chip.offsetWidth) / 2; }
    function selectCard(i) {
      cur = i;
      cards.forEach(function (c, j) { c.classList.toggle('is-sel', j === i); });
    }
    function moveCursorTo(el) {
      var pr = pb.getBoundingClientRect(), r = el.getBoundingClientRect();
      cursor.style.setProperty('--cx', (r.left - pr.left + r.width * .55) + 'px');
      cursor.style.setProperty('--cy', (r.top - pr.top + r.height * .45) + 'px');
    }
    function stream(str, g) {
      text.classList.remove('is-hint', 'is-gone');
      text.textContent = '';
      var words = str.split(' ');
      var i = 0;
      return new Promise(function (resolve, reject) {
        (function next() {
          if (g !== gen) { reject(new Error('stop')); return; }
          var span = document.createElement('span');
          span.className = 'w';
          span.textContent = (i ? ' ' : '') + words[i];
          text.appendChild(span);
          i += 1;
          if (i >= words.length) { resolve(); return; }
          wait(reduceMotion ? 0 : 38, g).then(next, reject);
        })();
      });
    }
    // One action run, shared by the loop (with the fake cursor) and by visitors' clicks.
    async function run(key, g, withCursor) {
      var chip = pb.querySelector('.pb__chip[data-act="' + key + '"]');
      setRow(rowShift(chip));
      if (withCursor) {
        await wait(900, g);
        moveCursorTo(chip);
        cursor.classList.add('is-on');
        await wait(900, g);
        cursor.classList.add('is-down');
      }
      chip.classList.add('is-press');
      await wait(170, g);
      cursor.classList.remove('is-down');
      chip.classList.remove('is-press');
      chips.forEach(function (c) { c.classList.toggle('is-on', c === chip); });
      label.textContent = NAMES[key];
      text.classList.add('is-gone');
      await wait(250, g);
      text.textContent = '';
      out.classList.add('is-thinking');
      await wait(withCursor ? 850 : 650, g);
      out.classList.remove('is-thinking');
      setCredits(Math.max(0, credits - (9 + Math.round(Math.random() * 7))));
      await stream(RESULTS[cur][key], g);
      placeCallouts();
    }
    function resetState() {
      chips.forEach(function (c) { c.classList.remove('is-on'); });
      out.classList.remove('is-thinking');
      label.textContent = '—';
      setHint();
      text.classList.remove('is-gone');
    }
    async function loop(g) {
      await wait(2200, g); // show the finished state first
      for (;;) {
        // reset: back to the clipboard before the new copy
        cursor.classList.remove('is-on');
        text.classList.add('is-gone');
        await wait(350, g);
        cursor.style.setProperty('--cx', (pb.offsetWidth * .72) + 'px');
        cursor.style.setProperty('--cy', (pb.offsetHeight * .82) + 'px');
        selectCard(-1);
        cur = 0;
        resetState();
        track.style.transform = '';
        track.classList.add('is-pre');
        setRow(0);
        setCredits(START);
        await wait(1100, g);
        // a new copy arrives
        toast.classList.add('is-in');
        await wait(500, g);
        track.classList.remove('is-pre');
        await wait(700, g);
        selectCard(0);
        await wait(900, g);
        toast.classList.remove('is-in');
        await run('fix', g, true);
        await wait(1900, g);
        await run('trans', g, true);
        await wait(1900, g);
        await run('short', g, true);
        await wait(1900, g);
        await run('reply', g, true);
        await wait(1900, g);
        cursor.classList.remove('is-on');
        await wait(1200, g);
      }
    }
    function start() { gen += 1; loop(gen).catch(function () {}); }

    // ----- hands-on mode -----
    function setBtn() {
      if (!btn) return;
      btn.classList.toggle('is-live', live);
      btn.setAttribute('aria-pressed', String(!live && userPaused));
      btn.setAttribute('aria-label', live ? 'Resume animation' : (userPaused ? 'Play animation' : 'Pause animation'));
    }
    function takeOver() {
      gen += 1; // stops the loop or a run in progress
      busy = false;
      if (live) return gen;
      live = true;
      userPaused = false;
      cursor.classList.remove('is-on', 'is-down');
      toast.classList.remove('is-in');
      track.classList.remove('is-pre');
      if (cur < 0 || !cards[cur].classList.contains('is-sel')) selectCard(0);
      if (hint) hint.hidden = true;
      setBtn();
      return gen;
    }
    function armIdle() { idle = 0; idleLast = performance.now(); }
    function resume() {
      live = false;
      idle = 0;
      if (btn) { btn.classList.remove('is-counting'); btn.style.removeProperty('--p'); }
      track.style.transform = '';
      setBtn();
      start();
    }
    // Countdown back to the loop: only runs while the visitor is not over the panel and nothing is streaming.
    function idleTick(now) {
      if (live && canLoop) {
        var counting = !busy && !hovering && !autoPaused;
        if (counting) idle += now - idleLast;
        idleLast = now;
        if (btn) {
          btn.classList.toggle('is-counting', counting || idle > 0);
          btn.style.setProperty('--p', Math.min(1, idle / IDLE_MS).toFixed(3));
        }
        if (idle >= IDLE_MS) resume();
      }
      requestAnimationFrame(idleTick);
    }
    async function userRun(key) {
      var g = takeOver();
      busy = true;
      try { await run(key, g, false); } catch (e) { return; }
      busy = false;
      armIdle();
    }
    function userCard(i) {
      takeOver();
      selectCard(i);
      var c = cards[i];
      var max = Math.max(0, track.scrollWidth - cardsBox.clientWidth);
      track.style.transform = 'translateX(' + (-Math.min(max, Math.max(0, c.offsetLeft - 4))) + 'px)';
      resetState();
      armIdle();
    }

    var drag = null, dragged = false;
    acts.addEventListener('pointerdown', function (e) {
      drag = { x: e.clientX, from: rowX, id: e.pointerId };
      dragged = false;
    });
    acts.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x;
      if (!dragged && Math.abs(dx) > 6) {
        dragged = true;
        takeOver();
        row.classList.add('is-drag');
        try { acts.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      }
      if (dragged) setRow(drag.from - dx);
    });
    function endDrag() {
      if (!drag) return;
      drag = null;
      row.classList.remove('is-drag');
      if (dragged) armIdle();
    }
    acts.addEventListener('pointerup', endDrag);
    acts.addEventListener('pointercancel', endDrag);
    acts.addEventListener('wheel', function (e) {
      var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
      if (!d) return;
      e.preventDefault();
      takeOver();
      row.classList.add('is-drag');
      setRow(rowX + d);
      row.classList.remove('is-drag');
      armIdle();
    }, { passive: false });
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        if (dragged) { dragged = false; return; }
        userRun(chip.getAttribute('data-act'));
      });
    });
    cards.forEach(function (c, i) { c.addEventListener('click', function () { userCard(i); }); });
    tools.forEach(function (t, i) {
      t.addEventListener('click', function () {
        takeOver();
        if (i === 1) { resetState(); armIdle(); return; } // Reset
        var txt = text.classList.contains('is-hint') ? '' : text.textContent;
        if (txt && navigator.clipboard) navigator.clipboard.writeText(txt).catch(function () {});
        t.textContent = txt ? 'Copied' : 'Copy';
        setTimeout(function () { t.textContent = 'Copy'; }, 1200);
        armIdle();
      });
    });
    pb.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hovering = true; });
    pb.addEventListener('pointerleave', function () { hovering = false; idleLast = performance.now(); });
    // ⌃1–⌃0 work while the pointer is over the panel, like in the app.
    document.addEventListener('keydown', function (e) {
      if (!hovering || !e.ctrlKey || e.metaKey || e.altKey || !/^[0-9]$/.test(e.key)) return;
      var chip = chips.filter(function (c) { return c.querySelector('kbd').textContent === '⌃' + e.key; })[0];
      if (chip) { e.preventDefault(); userRun(chip.getAttribute('data-act')); }
    });

    if (!canLoop) { live = true; return; }

    if (hint) hint.hidden = false;
    if (btn) {
      btn.hidden = false;
      btn.addEventListener('click', function () {
        if (live) { resume(); return; }
        userPaused = !userPaused;
        setBtn();
      });
      setBtn();
    }
    var onScreen = true;
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      autoPaused = !onScreen || document.hidden;
    }, { threshold: 0.15 }).observe(pb);
    document.addEventListener('visibilitychange', function () { autoPaused = !onScreen || document.hidden; });
    requestAnimationFrame(idleTick);
    start();
  });

  // ---------- Steps: PinchBar caps press one at a time (1 → 2 → 3); step 2 flips to the next ⌃N action each loop ----------
  (function keyCaps() {
    var row = document.querySelector('.kc__row--new');
    if (!row || reduceMotion || !('IntersectionObserver' in window)) return;
    var steps = row.querySelectorAll('.kc__step');
    var key = row.querySelector('[data-kc-key]'), name = row.querySelector('[data-kc-name]');
    var faces = [['⌃4', 'Summarize'], ['⌃1', 'Fix & Native'], ['⌃5', 'Translate'], ['⌃8', 'Shorten'], ['⌃0', 'Draft Reply']];
    var face = 0, loop = 0, timer = 0, run = false, gen = 0;
    function setOn(i) { steps.forEach(function (s, j) { s.classList.toggle('is-on', j === i); }); }
    function press(i) {
      setOn(i);
      var cap = steps[i].querySelector('.kc__cap');
      cap.classList.remove('is-press'); void cap.offsetWidth; cap.classList.add('is-press');
    }
    function flip(done) {
      face = (face + 1) % faces.length;
      name.style.opacity = 0;
      if (!key.animate) { key.textContent = faces[face][0]; name.textContent = faces[face][1]; name.style.opacity = ''; done(); return; }
      key.animate([{ transform: 'rotateX(0)' }, { transform: 'rotateX(90deg)' }], { duration: 420, easing: 'cubic-bezier(.45,0,.55,1)' }).onfinish = function () {
        key.textContent = faces[face][0]; name.textContent = faces[face][1]; name.style.opacity = '';
        key.animate([{ transform: 'rotateX(-90deg)' }, { transform: 'rotateX(0)' }], { duration: 640, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = function () { timer = setTimeout(done, 120); };
      };
    }
    function tick(i) {
      if (!run) return;
      if (i === 3) { setOn(-1); loop++; timer = setTimeout(function () { tick(0); }, 1600); return; }
      if (i === 1 && loop > 0) {
        setOn(1);
        var g = gen;
        flip(function () { if (!run || g !== gen) return; press(1); timer = setTimeout(function () { tick(2); }, 900); });
        return;
      }
      press(i); timer = setTimeout(function () { tick(i + 1); }, 900);
    }
    new IntersectionObserver(function (entries) {
      var vis = entries[0].isIntersecting;
      if (vis && !run) { run = true; row.classList.add('is-run'); timer = setTimeout(function () { tick(0); }, 500); }
      else if (!vis && run) { run = false; gen++; clearTimeout(timer); row.classList.remove('is-run'); setOn(-1); }
    }, { threshold: 0.5 }).observe(row);
  })();

  // ---------- 10 built-in actions: each key pair "presses" in turn ----------
  (function actsCycle() {
    var list = document.querySelector('.acts10__list');
    if (!list || reduceMotion || !('IntersectionObserver' in window)) return;
    var items = Array.prototype.slice.call(list.children);
    var DWELL = 2200, i = -1, timer = null, visible = false, hover = false;
    list.style.setProperty('--dwell', DWELL + 'ms');
    function show(n) {
      items.forEach(function (li) { li.classList.remove('is-on', 'is-press'); });
      i = n;
      var li = items[i];
      void li.offsetWidth; // restart the dwell bar
      li.classList.add('is-on', 'is-press');
      setTimeout(function () { li.classList.remove('is-press'); }, 240);
    }
    function tick() {
      timer = null;
      if (!visible || hover) return;
      show((i + 1) % items.length);
      timer = setTimeout(tick, DWELL);
    }
    function kick(delay) { if (!timer && visible && !hover) timer = setTimeout(tick, delay); }
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible) kick(i < 0 ? 400 : DWELL / 2);
      else { clearTimeout(timer); timer = null; }
    }, { threshold: .35 }).observe(list);
    items.forEach(function (li, n) {
      li.addEventListener('pointerenter', function (e) {
        if (e.pointerType !== 'mouse') return;
        hover = true;
        list.classList.add('is-hover');
        clearTimeout(timer); timer = null;
        if (n !== i) show(n);
      });
    });
    list.addEventListener('pointerleave', function () {
      if (!hover) return;
      hover = false;
      list.classList.remove('is-hover');
      kick(DWELL / 2);
    });
  })();

  // ---------- AI provider switcher (credits card) ----------
  (function provider() {
    var prov = document.querySelector('.prov');
    if (!prov) return;
    var box = prov.closest('.credits');
    var radios = Array.prototype.slice.call(prov.querySelectorAll('[role="radio"]'));
    var sw = prov.querySelector('.prov__toggle input');
    var info = document.querySelector('.prov__info');
    var touched = false;
    function infoHTML() {
      if (prov.getAttribute('data-p') === 'apple') {
        return '<strong>Apple Intelligence</strong> <span>Runs on your Mac and uses no credits — your text never leaves the device. Needs a Mac that supports Apple Intelligence.</span>';
      }
      return '<strong>Setapp AI+</strong> <span>Each action uses AI credits from your Setapp account. ' + (sw.checked
        ? 'If Setapp AI can’t be reached, PinchBar runs the action with Apple Intelligence instead.'
        : 'Fallback is off: if Setapp AI can’t be reached, the action stops instead of switching to on-device AI.') + '</span>';
    }
    function render() {
      info.innerHTML = infoHTML();
      info.classList.remove('is-swap');
      void info.offsetWidth;
      info.classList.add('is-swap');
    }
    function pick(r, focus) {
      var p = r.getAttribute('data-p');
      radios.forEach(function (x) {
        var on = x === r;
        x.setAttribute('aria-checked', String(on));
        x.tabIndex = on ? 0 : -1;
      });
      prov.setAttribute('data-p', p);
      if (box) box.setAttribute('data-p', p);
      sw.tabIndex = p === 'apple' ? -1 : 0;
      if (focus) r.focus();
      render();
    }
    radios.forEach(function (r, n) {
      r.addEventListener('click', function () { touched = true; pick(r, false); });
      r.addEventListener('keydown', function (e) {
        var k = e.key, next = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') next = radios[(n + 1) % radios.length];
        if (k === 'ArrowLeft' || k === 'ArrowUp') next = radios[(n - 1 + radios.length) % radios.length];
        if (next) { e.preventDefault(); touched = true; pick(next, true); }
      });
    });
    sw.addEventListener('change', function () { touched = true; render(); });
    if (box) box.setAttribute('data-p', prov.getAttribute('data-p'));
    // One gentle demo when it first scrolls into view: switch to Apple Intelligence and back.
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      setTimeout(function () { if (!touched) pick(radios[0], false); }, 1400);
      setTimeout(function () { if (!touched) pick(radios[1], false); }, 4600);
    }, { threshold: .6 });
    io.observe(prov);
  })();

  // ---------- "Try an action" demo (pre-written example outputs, no live AI) ----------
  var SAMPLES = {
    email: {
      input: 'hey team, quick update — the launch moved to thursday becuase legal still need to review the pricing page. can everyone make sure there assets are final by wed EOD? thx',
      fix: ['Hey team, quick update — the launch has moved to Thursday because Legal still needs to review the pricing page. Can everyone make sure their assets are final by Wed EOD? Thanks.'],
      summarize: ['The launch moves to Thursday while Legal reviews the pricing page; all assets are due by Wednesday EOD.'],
      items: { list: ['Finalize your launch assets by Wednesday EOD', 'Legal: finish reviewing the pricing page before Thursday'] },
      reply: ['Thanks for the heads-up! My assets will be final by Wednesday EOD. Let me know if Legal needs anything from me for the pricing page.']
    },
    notes: {
      input: 'Notes from Monday sync: Maria to finalize the onboarding copy. Ben fixes the export bug before Friday. We still need a decision on pricing for the team plan, Alex will bring two options to Thursday’s call.',
      fix: ['Notes from Monday’s sync: Maria will finalize the onboarding copy, and Ben will fix the export bug before Friday. We still need a decision on team-plan pricing; Alex will bring two options to Thursday’s call.'],
      summarize: ['Onboarding copy and the export bug are assigned for this week; team-plan pricing is still open, with two options coming on Thursday.'],
      items: { list: ['Maria — finalize the onboarding copy', 'Ben — fix the export bug before Friday', 'Alex — bring two team-plan pricing options to Thursday’s call'] },
      reply: ['Thanks for the notes! I’ll keep an eye on the export fix before Friday. Looking forward to the pricing options on Thursday.']
    },
    msg: {
      input: 'Hi! I ordered the large travel backpack last week but received the medium one. Can I swap it, or do I need to return it first? Thanks, Priya',
      fix: ['Hi! I ordered the large travel backpack last week, but I received the medium one. Can I swap it, or do I need to return it first? Thanks, Priya'],
      summarize: ['Priya received a medium backpack instead of the large one she ordered and asks whether she can swap it or must return it first.'],
      items: { list: ['Confirm Priya’s order for the large travel backpack', 'Arrange a swap for the medium one she received', 'Reply to Priya with next steps'] },
      reply: ['Hi Priya,', 'Sorry about the mix-up! You don’t need to return the medium backpack first — we’ll send the large one right away, along with a prepaid label for the swap.', 'Best regards']
    }
  };
  var ACTION_NAMES = { fix: 'Fix & Native', summarize: 'Summarize', items: 'Action Items', reply: 'Draft Reply' };

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.seg [role="tab"]'));
  var actionBtns = Array.prototype.slice.call(document.querySelectorAll('.actions [data-action]'));
  var inputEl = document.getElementById('demo-input-text');
  var outputEl = document.getElementById('demo-output');
  var outCard = document.querySelector('.demo__output');
  var outAction = document.getElementById('demo-out-action');
  var inputPanel = document.getElementById('demo-input');
  var state = { sample: 'email', action: 'fix' };
  var swapTimer;

  function renderOutput(value) {
    outputEl.textContent = '';
    if (value.list) {
      var ul = document.createElement('ul');
      value.list.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
      outputEl.appendChild(ul);
    } else {
      value.forEach(function (t) { var p = document.createElement('p'); p.textContent = t; outputEl.appendChild(p); });
    }
  }
  function render(animate) {
    var s = SAMPLES[state.sample];
    inputEl.textContent = s.input;
    outAction.textContent = ACTION_NAMES[state.action];
    clearTimeout(swapTimer);
    if (!animate || reduceMotion) { renderOutput(s[state.action]); return; }
    outCard.classList.add('is-swapping');
    swapTimer = setTimeout(function () { renderOutput(s[state.action]); outCard.classList.remove('is-swapping'); }, 180);
  }
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    inputPanel.setAttribute('aria-labelledby', tab.id);
    if (focus) tab.focus();
    state.sample = tab.id.replace('s-', '');
    render(true);
  }
  if (inputEl && outputEl) {
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { selectTab(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); selectTab(next, true); }
      });
    });
    actionBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        actionBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        state.action = btn.getAttribute('data-action');
        render(true);
      });
    });
    render(false);
  }
})();
