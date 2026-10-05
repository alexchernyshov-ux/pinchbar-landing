// PinchBar landing — mobile menu, scroll reveal, lazy image fade, chapter index, demo.
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // ---------- Mobile menu ----------
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  }
  if (toggle && menu) {
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
