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
      var words = hero.querySelectorAll('.h1-word, .hero h1 em');
      if (words.length) {
        if (soft) {
          gsap.from(words, { opacity: 0, duration: 0.6, stagger: 0.06, ease: 'power1.out' });
        } else {
          gsap.set(words, { yPercent: 115, opacity: 0 });
          gsap.set('.hero__media img', { scale: 1.12 });
          gsap.set('.chip-float', { y: 18, opacity: 0 });
          gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.15 })
            .to(words, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.12 })
            .to('.hero__media img', { scale: 1, duration: 1.6 }, 0)
            .to('.chip-float', { y: 0, opacity: 1, duration: 0.8 }, 0.5);

          gsap.to('.hero__media img', {
            yPercent: 8, ease: 'none',
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
