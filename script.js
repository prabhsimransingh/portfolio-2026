(() => {
  'use strict';

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Nav scroll indicator
  const nav = document.querySelector('[data-nav]');
  if (nav) {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        nav.setAttribute('data-scrolled', window.scrollY > 8 ? 'true' : 'false');
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Scroll reveals
  const revealTargets = document.querySelectorAll('[data-reveal], .article, .project, .entry, .bib li, .g-card, .figure');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
    revealTargets.forEach((el) => {
      if (!el.hasAttribute('data-reveal')) {
        el.setAttribute('data-reveal', '');
      }
      io.observe(el);
    });
  } else {
    revealTargets.forEach((el) => el.classList.add('is-in'));
  }

  // Count-up animations for figure numbers
  const formatNum = (n, suffix) => {
    const intPart = Math.round(n).toLocaleString('en-US');
    return `${intPart}${suffix || ''}`;
  };

  const animateCount = (el, target, suffix) => {
    if (reduceMotion) {
      el.textContent = formatNum(target, suffix);
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const v = Math.round(target * easeOut(t));
      el.textContent = formatNum(v, suffix);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = formatNum(target, suffix);
    };
    requestAnimationFrame(tick);
  };

  const figureNums = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.dataset.count);
          const suffix = el.dataset.suffix || '';
          animateCount(el, target, suffix);
          cio.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    figureNums.forEach((el) => cio.observe(el));
  } else {
    figureNums.forEach((el) => {
      const target = parseFloat(el.dataset.count);
      el.textContent = formatNum(target, el.dataset.suffix || '');
    });
  }

  // Smooth in-page anchor navigation
  const NAV_OFFSET = 72;
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
      window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', `#${id}`);
    });
  });
})();
