/* Shared behaviour for GurukulAI sub-pages: icons, nav, smooth scroll, hero entrance.
   Exposes window.Site = { motion, lenis, scrollTo(target) } for page scripts that load after it. */
(function () {
  if (window.lucide) lucide.createIcons();
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const motion = !reduce && hasGsap;

  // Nav: glass background once scrolled, mobile menu
  const nav = $('#nav'), menuBtn = $('#menuBtn'), menu = $('#mobileMenu');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', scrollY > 20);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => menuBtn.setAttribute('aria-expanded', menu.classList.toggle('open')));
    $$('a', menu).forEach(a => a.addEventListener('click', () => { menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); }));
  }

  const Site = window.Site = { motion, lenis: null, scrollTo: null };

  // Smooth scroll
  if (motion) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.Lenis) {
      Site.lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      Site.lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => Site.lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }
  const navOffset = () => -(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72) - 70;
  Site.scrollTo = (target, extra = 0) => {
    if (Site.lenis) Site.lenis.scrollTo(target, { offset: navOffset() + extra, duration: 1.2 });
    else {
      const y = target.getBoundingClientRect().top + scrollY + navOffset() + extra;
      scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    }
  };
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = a.getAttribute('href').length > 1 && $(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault(); Site.scrollTo(t);
  }));

  document.documentElement.classList.add('ready');
  if (!motion) return;

  // Hero entrance
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  if ($('[data-ln]')) tl.from('[data-ln]', { yPercent: 110, duration: 1.3, stagger: .1 });
  if ($('[data-in]')) tl.from('[data-in]', { opacity: 0, y: 20, duration: 1, stagger: .08 }, '-=1');

  // Lamp drifts toward the pointer
  const lamp = $('.sub-hero .lamp');
  if (lamp) {
    const lx = gsap.quickTo(lamp, 'x', { duration: 1.6, ease: 'power3' });
    const ly = gsap.quickTo(lamp, 'y', { duration: 1.6, ease: 'power3' });
    addEventListener('pointermove', e => { lx((e.clientX / innerWidth - .5) * 120); ly((e.clientY / innerHeight - .5) * 80); });
  }

  // Footer wordmark rises in
  if ($('.wordmark')) gsap.fromTo('.wordmark', { yPercent: 40 }, { yPercent: 0, ease: 'none',
    scrollTrigger: { trigger: 'footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
