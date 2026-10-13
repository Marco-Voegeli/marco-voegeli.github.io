(function () {
  var root = document.documentElement;

  /* theme */
  var themeBtn = document.getElementById('theme');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var current = root.dataset.theme ||
        (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = current === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* Zürich clock */
  var clock = document.getElementById('clock');
  if (clock) {
    var fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Zurich', hour: '2-digit', minute: '2-digit', hour12: false
    });
    var tick = function () { clock.textContent = fmt.format(new Date()) + ' local'; };
    tick();
    setInterval(tick, 15000);
  }

  /* header border once scrolled */
  var top = document.querySelector('.top');
  var onScroll = function () { top.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* graduate programme progress */
  var program = document.getElementById('program');
  if (program) {
    var start = new Date(program.dataset.start).getTime();
    var end = new Date(program.dataset.end).getTime();
    var pct = Math.min(1, Math.max(0, (Date.now() - start) / (end - start)));
    document.getElementById('program-pct').textContent =
      pct >= 1 ? 'done' : Math.round(pct * 100) + '% through';

    // segments are weighted by months; mark past and current rotation
    var segs = program.querySelectorAll('.seg');
    var total = 0, acc = 0;
    segs.forEach(function (s) { total += +s.style.getPropertyValue('--m'); });
    segs.forEach(function (s) {
      var m = +s.style.getPropertyValue('--m');
      var pos = pct * total;
      if (pos >= acc + m) s.classList.add('is-done');
      else if (pos >= acc) s.classList.add('is-current');
      acc += m;
    });

    var marker = document.getElementById('program-marker');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { marker.style.left = 'calc(' + (pct * 100) + '% - 1px)'; });
    });
  }

  /* filters, scoped to their own section */
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-filter]');
    if (!b) return;
    var section = b.closest('section');
    var f = b.dataset.filter;
    var hits = 0;
    section.querySelectorAll('.chip[data-filter]').forEach(function (c) {
      c.classList.toggle('is-on', c.dataset.filter === f);
    });
    section.querySelectorAll('.entry[data-tags]').forEach(function (e) {
      var hit = f === 'all' || e.dataset.tags.split(' ').indexOf(f) !== -1;
      e.classList.toggle('is-dim', !hit);
      if (hit) hits++;
      if (hit && f !== 'all') e.querySelector('details').open = true;
    });
    var empty = section.querySelector('.empty');
    if (empty) empty.hidden = hits > 0;
  });

  /* copy email */
  var copy = document.getElementById('copy');
  if (copy && navigator.clipboard) {
    copy.addEventListener('click', function () {
      navigator.clipboard.writeText(copy.dataset.copy).then(function () {
        copy.textContent = 'copied';
        copy.classList.add('is-done');
        setTimeout(function () { copy.textContent = 'copy'; copy.classList.remove('is-done'); }, 1500);
      }, function () {});
    });
  }

  /* scroll spy */
  var links = document.querySelectorAll('.nav a');
  if ('IntersectionObserver' in window && links.length) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-active'); });
        if (map[e.target.id]) map[e.target.id].classList.add('is-active');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('section[id]').forEach(function (s) { spy.observe(s); });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
