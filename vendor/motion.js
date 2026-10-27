/* Моушен первого экрана: интро героя, параллакс, появление блоков, плавный скролл.
   Грузится как defer-скрипт после gsap/ScrollTrigger/lenis — поэтому библиотеки уже на месте.
   Отключается при prefers-reduced-motion и при ?static=1 (для скриншотов). */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var staticMode = /[?&]static=1/.test(location.search);

  function init() {
    if (!window.gsap || !window.ScrollTrigger) {
      console.warn('motion: gsap не загрузился');
      return;
    }
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    // мягкий режим: если в системе выключена анимация — только плавные проявления, без движения
    var soft = reduce || staticMode;

    if (window.Lenis && !reduce && !staticMode) {
      var lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
      window.__lenis = lenis;
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
      lenis.on('scroll', window.ScrollTrigger.update);
    }

    var hero = document.querySelector('.hero');
    if (hero) {
      var parts = ['.hero__title', '.hero__lead', '.hero__actions', '.hero__rating']
        .map(function (sel) { return hero.querySelector(sel); })
        .filter(Boolean);
      var bg = hero.querySelector('.hero__bg');

      if (soft) {
        if (parts.length) gsap.from(parts, { opacity: 0, duration: 0.6, stagger: 0.07, ease: 'power1.out' });
      } else {
        if (bg) gsap.fromTo(bg, { scale: 1.08 }, { scale: 1, duration: 1.8, ease: 'power2.out' });
        if (parts.length) {
          gsap.from(parts, { y: 26, opacity: 0, duration: 1.0, stagger: 0.1, ease: 'expo.out', delay: 0.15 });
        }
        if (bg) {
          gsap.to(bg, {
            yPercent: 7, ease: 'none',
            scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
          });
        }
      }
    }

    // полоса прогресса скролла
    var prog = document.getElementById('prog');
    if (prog) {
      gsap.set(prog, { scaleX: 0, transformOrigin: 'left center' });
      gsap.to(prog, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
      });
    }

    // Секции НЕ прячем: gsap.from с scrollTrigger оставляет блок невидимым до триггера,
    // и при быстром скролле в ленте появляются пустые полосы. Движение — только в герое,
    // бегущей строке, параллаксе и полосе прогресса.

    window.__motionReady = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
