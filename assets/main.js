// PinchBar landing — mobile menu, scroll reveal, lazy image fade, chapter index, FAQ accordion, hero panel loop, demo.
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

  // ---------- Hero: looping panel animation (copy arrives, actions run) ----------
  (function heroPanel() {
    var pb = document.querySelector('.pb');
    if (!pb) return;
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

    if (reduceMotion || !('IntersectionObserver' in window)) return;

    var track = pb.querySelector('.pb__track');
    var newCard = pb.querySelector('.pb__card--new');
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
    var btn = document.querySelector('.pb-play');

    var RESULTS = {
      fix: 'Hey team, quick update — the launch has moved to Thursday because Legal still needs to review the pricing page. Can everyone make sure their assets are final by Wed EOD? Thanks.',
      trans: 'Hola a todos: el lanzamiento se ha movido al jueves porque Legal aún tiene que revisar la página de precios. ¿Pueden dejar sus materiales listos antes del miércoles por la tarde? Gracias.',
      short: 'Launch moves to Thursday while Legal reviews the pricing page. Please finalize your assets by Wed EOD.',
      reply: 'Thanks for the heads-up! My assets will be final by Wednesday EOD. Let me know if Legal needs anything for the pricing page.'
    };
    var NAMES = { fix: 'Fix & Native', trans: 'Translate', short: 'Shorten', reply: 'Draft Reply' };
    var START = 31029, TOTAL = 41000, credits = START;

    var userPaused = false, autoPaused = false, gen = 0;
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
    function rowShift(chip) {
      var max = Math.max(0, row.scrollWidth - acts.clientWidth);
      var x = chip.offsetLeft - (acts.clientWidth - chip.offsetWidth) / 2;
      return Math.round(Math.min(max, Math.max(0, x)));
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
          wait(38, g).then(next, reject);
        })();
      });
    }
    async function runAction(key, g) {
      var chip = pb.querySelector('.pb__chip[data-act="' + key + '"]');
      row.style.transform = 'translateX(' + (-rowShift(chip)) + 'px)';
      await wait(900, g);
      moveCursorTo(chip);
      cursor.classList.add('is-on');
      await wait(900, g);
      cursor.classList.add('is-down');
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
      await wait(850, g);
      out.classList.remove('is-thinking');
      setCredits(credits - (9 + Math.round(Math.random() * 7)));
      await stream(RESULTS[key], g);
      await wait(1900, g);
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
        chips.forEach(function (c) { c.classList.remove('is-on'); });
        newCard.classList.remove('is-sel');
        label.textContent = '—';
        setHint();
        text.classList.remove('is-gone');
        track.classList.add('is-pre');
        row.style.transform = 'translateX(0)';
        setCredits(START);
        await wait(1100, g);
        // a new copy arrives
        toast.classList.add('is-in');
        await wait(500, g);
        track.classList.remove('is-pre');
        await wait(700, g);
        newCard.classList.add('is-sel');
        await wait(900, g);
        toast.classList.remove('is-in');
        await runAction('fix', g);
        await runAction('trans', g);
        await runAction('short', g);
        await runAction('reply', g);
        cursor.classList.remove('is-on');
        await wait(1200, g);
      }
    }
    function start() { gen += 1; loop(gen).catch(function () {}); }

    if (btn) {
      btn.hidden = false;
      btn.addEventListener('click', function () {
        userPaused = !userPaused;
        btn.setAttribute('aria-pressed', String(userPaused));
        btn.setAttribute('aria-label', userPaused ? 'Play animation' : 'Pause animation');
      });
      btn.setAttribute('aria-pressed', 'false');
    }
    var onScreen = true;
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      autoPaused = !onScreen || document.hidden;
    }, { threshold: 0.15 }).observe(pb);
    document.addEventListener('visibilitychange', function () { autoPaused = !onScreen || document.hidden; });
    start();
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
