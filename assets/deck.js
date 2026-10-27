/* =====================================================================
   Tech Exchange · Essential Digital Literacy — slide engine
   Expects window.DECK = [{h, c, t, html, n}] defined before this file.
     h = section label (e.g. "Lecture 1")   c = slide type   t = time box
   Keys: → / Space / PgDn next · ← / PgUp back · Home / End
         N notes · M menu · A show answers · F full screen · Esc close menu
   Deep link: #s0, #s1 … (zero-based, matches the existing course links)
   ===================================================================== */
(function () {
  'use strict';
  const DECK = window.DECK || [];
  const $ = (id) => document.getElementById(id);
  const wrap = $('slides');

  /* ---------- per-section numbering (Lecture 1 · 4 of 18) ---------- */
  const groups = {};
  DECK.forEach((s, i) => {
    (groups[s.h] = groups[s.h] || []).push(i);
  });
  const posInGroup = (i) => groups[DECK[i].h].indexOf(i) + 1;

  /* ---------- render ---------- */
  DECK.forEach((s, i) => {
    const d = document.createElement('section');
    d.className = 'slide';
    d.id = 's' + i;
    d.setAttribute('role', 'group');
    d.setAttribute('aria-roledescription', 'slide');
    d.setAttribute('aria-label', 'Slide ' + (i + 1) + ' of ' + DECK.length);
    if (s.n) d.setAttribute('data-notes', s.n);
    d.innerHTML = s.html;
    wrap.appendChild(d);
  });

  let cur = 0, notesOn = false;
  const el = {
    chipL: $('chipL'), chipR: $('chipR'), count: $('count'), bar: $('bar'),
    notes: $('notes'), notesBody: $('notesBody'), menu: $('menu'), prog: $('prog'),
    btnNotes: $('btnNotes'), btnAns: $('btnAns'), live: $('live')
  };

  function show(i) {
    i = Math.max(0, Math.min(DECK.length - 1, i));
    const prev = document.querySelector('.slide.on');
    if (prev) prev.classList.remove('on');
    const node = $('s' + i);
    node.classList.add('on');
    const s = DECK[i], g = groups[s.h];
    el.chipL.textContent = s.h + ' · ' + posInGroup(i) + ' of ' + g.length + ' · ' + s.c;
    el.chipR.textContent = s.t;
    el.count.textContent = (i + 1) + ' / ' + DECK.length;
    if (el.prog) el.prog.textContent = s.h;
    el.bar.style.width = ((i + 1) / DECK.length * 100) + '%';
    el.notesBody.textContent = s.n || '—';
    el.btnAns.setAttribute('aria-pressed', node.classList.contains('reveal') ? 'true' : 'false');
    el.btnAns.disabled = !node.querySelector('.qa .a');
    $('stage').scrollTop = 0;
    cur = i;
    try { history.replaceState(null, '', '#s' + i); } catch (e) { /* file:// or sandbox */ }
    if (el.live) el.live.textContent = 'Slide ' + (i + 1) + ' of ' + DECK.length;
    armDrills(node);
  }
  const go = (n) => show(cur + n);

  function toggleNotes() {
    notesOn = !notesOn;
    el.notes.classList.toggle('on', notesOn);
    el.btnNotes.setAttribute('aria-pressed', notesOn ? 'true' : 'false');
  }
  function toggleMenu(force) {
    const on = typeof force === 'boolean' ? force : !el.menu.classList.contains('on');
    el.menu.classList.toggle('on', on);
    if (on) { const a = el.menu.querySelector('a[data-i="' + cur + '"]'); if (a) a.focus(); }
  }
  function toggleAnswers() {
    const node = $('s' + cur);
    if (!node.querySelector('.qa .a')) return;
    node.classList.toggle('reveal');
    el.btnAns.setAttribute('aria-pressed', node.classList.contains('reveal') ? 'true' : 'false');
  }
  function toggleFull() {
    try {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    } catch (e) { /* not supported */ }
  }

  /* ---------- controls ---------- */
  $('btnNext').onclick = () => go(1);
  $('btnPrev').onclick = () => go(-1);
  el.btnNotes.onclick = toggleNotes;
  $('btnMenu').onclick = () => toggleMenu();
  el.btnAns.onclick = toggleAnswers;
  const fs = $('btnFs'); if (fs) fs.onclick = toggleFull;

  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'Escape') { toggleMenu(false); return; }
    if (el.menu.classList.contains('on')) return;
    const k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ') { e.preventDefault(); go(1); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); go(-1); }
    else if (k === 'Home') { show(0); }
    else if (k === 'End') { show(DECK.length - 1); }
    else if (k === 'n' || k === 'N') { toggleNotes(); }
    else if (k === 'm' || k === 'M') { toggleMenu(); }
    else if (k === 'a' || k === 'A') { toggleAnswers(); }
    else if (k === 'f' || k === 'F') { toggleFull(); }
  });

  /* touch swipe */
  let tx = null, ty = null;
  document.addEventListener('touchstart', (e) => { tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    tx = ty = null;
  }, { passive: true });

  /* ---------- jump menu ---------- */
  (function buildMenu() {
    let html = '<button class="x" type="button" aria-label="Close menu">Close (Esc)</button>', last = '';
    DECK.forEach((s, i) => {
      if (s.h !== last) { html += '<h3>' + s.h + '</h3>'; last = s.h; }
      const m = s.html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || s.html.match(/<h2[^>]*>[\s\S]*?<\/span>([\s\S]*?)<\/h2>/);
      const title = (m ? m[1] : s.c).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      html += '<a href="#s' + i + '" data-i="' + i + '">' + String(i + 1).padStart(2, '0') + ' &nbsp; ' + title + '</a>';
    });
    el.menu.innerHTML = html;
    el.menu.addEventListener('click', (e) => {
      if (e.target.closest('.x')) { toggleMenu(false); return; }
      const a = e.target.closest('a'); if (!a) return;
      e.preventDefault(); show(+a.dataset.i); toggleMenu(false);
    });
  })();

  /* ---------- "spot the scam" drills ---------- */
  function armDrills(scope) {
    scope.querySelectorAll('[data-drill]').forEach((box) => {
      if (box.dataset.armed) return;
      box.dataset.armed = '1';
      const flags = box.querySelectorAll('.flag');
      const out = scope.querySelector('.drill-count');
      const total = flags.length;
      flags.forEach((f) => {
        f.setAttribute('tabindex', '0');
        f.setAttribute('role', 'button');
        const hit = () => {
          f.classList.add('hit');
          const n = box.querySelectorAll('.flag.hit').length;
          if (out) out.textContent = n < total ? n + ' of ' + total + ' found' : (box.dataset.done || 'All found.');
        };
        f.addEventListener('click', hit);
        f.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); hit(); } });
      });
    });
  }

  /* ---------- official logo: fall back to the word mark if the image cannot load ---------- */
  document.querySelectorAll('img[data-logo]').forEach((img) => {
    const fail = () => { img.style.display = 'none'; const wm = img.nextElementSibling; if (wm && wm.classList.contains('wm')) wm.hidden = false; };
    if (img.complete && img.naturalWidth === 0) fail(); else img.addEventListener('error', fail);
  });

  /* ---------- start ---------- */
  const h = (location.hash.match(/^#s(\d+)$/) || [])[1];
  show(h ? +h : 0);
  window.addEventListener('hashchange', () => {
    const m = (location.hash.match(/^#s(\d+)$/) || [])[1];
    if (m && +m !== cur) show(+m);
  });
})();
