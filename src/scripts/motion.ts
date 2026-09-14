import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {initInteractions} from './interactions';

export function initMotion() {
  gsap.registerPlugin(ScrollTrigger);
  initInteractions();
  const media = gsap.matchMedia();
  let smooth: Lenis | undefined;
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const savedPosition = navigation?.type === 'back_forward' ? history.state?.studioScroll : undefined;
  // Store the outgoing position so returning from a project preserves its scene.
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element) || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest<HTMLAnchorElement>('a[href]');
    if (link && !link.download && (!link.target || link.target === '_self') && link.origin === location.origin) {
      history.replaceState({...history.state, studioScroll: window.scrollY}, '');
    }
  }, true);

  // Touch devices keep native scrolling. One ticker drives both desktop systems.
  media.add('(min-width: 761px) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    smooth = new Lenis({lerp: .12, smoothWheel: true, syncTouch: false, anchors: false, stopInertiaOnNavigate: true, prevent: node => node.tagName === 'DIALOG'});
    const instance = smooth;
    const tick = (seconds: number) => instance.raf(seconds * 1000);
    instance.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const syncLock = () => document.body.classList.contains('has-dialog') ? instance.stop() : instance.start();
    window.addEventListener('studio:dialog', syncLock);
    const anchorClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest<HTMLAnchorElement>('a[href]');
      if (!link || link.download || (link.target && link.target !== '_self') || link.origin !== location.origin || link.pathname !== location.pathname || link.search !== location.search || !link.hash) return;
      const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      if (location.hash !== link.hash) history.pushState(null, '', link.hash);
      // Sync a recent native/keyboard scroll before measuring the next anchor.
      instance.resize();
      // Lenis already reads CSS scroll-padding and scroll-margin.
      const distance=Math.abs(target.getBoundingClientRect().top);
      instance.scrollTo(target, {duration: Math.min(1.1,.55+distance/window.innerHeight*.16), easing:t=>1-Math.pow(1-t,3), onComplete: () => {
        const hadTabIndex = target.hasAttribute('tabindex');
        if (!hadTabIndex) {target.setAttribute('tabindex', '-1'); target.addEventListener('blur', () => target.removeAttribute('tabindex'), {once: true});}
        target.focus({preventScroll: true});
      }});
    };
    document.addEventListener('click', anchorClick);
    syncLock();
    return () => {window.removeEventListener('studio:dialog', syncLock); document.removeEventListener('click', anchorClick); gsap.ticker.remove(tick); instance.destroy(); smooth = undefined;};
  });

  media.add('(prefers-reduced-motion: no-preference)', () => {
    const intro = gsap.timeline({defaults: {ease: 'power3.out'}});
    const hero = document.querySelector('.home-hero');
    // A shared scene already provides the entrance; don't snapshot a hidden title.
    const sharedEntry = document.querySelector('.case-hero[data-world-transition]')
      && document.referrer.startsWith(`${location.origin}/`)
      && matchMedia('(min-width: 761px)').matches
      && CSS.supports('view-transition-name', 'world');
    if (hero && window.scrollY < 100) {
      intro.from('.hero-media', {opacity: 0, duration: 1.3}, 0)
        .from('.hero-copy>.eyebrow', {y: 15, opacity: 0, duration: .8}, .1)
        .from('.title-line>span', {yPercent: 110, duration: 1.3, stagger: .13}, .12)
        .from('.hero-copy-bottom', {y: 25, opacity: 0, duration: 1}, .65)
        .from('.hero-foot', {opacity: 0, duration: 1}, .85);
    } else if (!hero && !sharedEntry && window.scrollY < 100 && document.querySelector('.page-intro h1, .case-masthead h1')) {
      intro.from('.page-intro h1, .case-masthead h1', {y: 35, opacity: 0, duration: 1.1}, .05)
        .from('.page-intro .eyebrow, .intro-bottom, .case-masthead>.eyebrow, .case-heading-bottom', {y: 18, opacity: 0, duration: .85, stagger: .07}, .2);
    }

    const reveals = document.querySelectorAll('.home-note h2, .home-note>div, .capabilities-summary article, .section-heading h2, .studio-intro-copy h2, .studio-intro-copy>div, .capability-links>a, .case-introduction>* , .story-copy, .chapter-narrative, .expertise-heading, .expertise-copy, .studio-manifesto h2, .manifesto-body, .focus-grid>article, .collab-copy, .workflow-steps article, .contact-heading, .cta-heading, .cta-bottom');
    reveals.forEach(element => {
      // Already visible or restored content is never hidden for an entrance animation.
      if (element.getBoundingClientRect().top < window.innerHeight * .92) return;
      gsap.from(element, {y: 40, opacity: 0, duration: 1.15, ease: 'power3.out', scrollTrigger: {trigger: element, start: 'top 92%', once: true}});
    });
    if (document.querySelector('.pixel-cross')) gsap.from('.pixel-cross rect', {scale: .5, opacity: .2, transformOrigin: 'center', stagger: .04, ease: 'power2.out', scrollTrigger: {trigger: '.brand-line', start: 'top 95%', end: 'top 60%', scrub: .7}});
  });

  media.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)', () => {
    const hero = document.querySelector('.home-hero');
    if (hero) {
      // Entrance and scrolling animate separate nested layers to avoid competing tweens.
      gsap.to('.hero-media .hero-image, .hero-media .ambient-video', {yPercent: 4, scale: 1.1, ease: 'none', scrollTrigger: {trigger: hero, start: 'top top', end: 'bottom top', scrub: true}});
      gsap.to('.hero-copy', {y: 20, opacity: .15, ease: 'none', scrollTrigger: {trigger: hero, start: 'top top', end: '90% top', scrub: true}});
    }
    document.querySelectorAll('.case-statement, .studio-panorama').forEach(section => {
      gsap.fromTo(section.querySelector('img'), {scale: 1.13, yPercent: -5}, {scale: 1.05, yPercent: 5, ease: 'none', scrollTrigger: {trigger: section, start: 'top bottom', end: 'bottom top', scrub: true}});
    });
  });

  media.add('(min-width:761px) and (prefers-reduced-motion:no-preference)', () => {
    document.querySelectorAll('.world-scene, .case-opening').forEach(scene => {
      const pixels=scene.querySelectorAll('.scene-picture>img, .scene-picture>video');
      gsap.fromTo(pixels,{scale:1.1,yPercent:-3},{scale:1.1,yPercent:3,ease:'none',scrollTrigger:{trigger:scene,start:'top bottom',end:'bottom top',scrub:true}});
      if(scene.matches('.world-scene')){
        gsap.fromTo(scene.querySelector('.world-heading h1, .world-heading h2'),{y:12,opacity:.55},{y:0,opacity:1,ease:'none',scrollTrigger:{trigger:scene,start:'top 85%',end:'top 15%',scrub:true}});
      }
    });
    document.querySelectorAll('.chapter-panorama').forEach(scene => {
      gsap.fromTo(scene.querySelector('img'),{yPercent:-4},{yPercent:4,ease:'none',scrollTrigger:{trigger:scene,start:'top bottom',end:'bottom top',scrub:true}});
    });
  });

  const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise<void>(resolve => window.addEventListener('load', () => resolve(), {once: true}));
  Promise.all([loaded, document.fonts.ready]).then(() => {
    ScrollTrigger.refresh();
    if (typeof savedPosition === 'number') {
      if (smooth) smooth.scrollTo(savedPosition, {immediate: true, force: true});
      else window.scrollTo({top: savedPosition, behavior: 'instant'});
      ScrollTrigger.update();
    }
  });
  // Refresh the preserved page after browser back/forward restoration.
  window.addEventListener('pageshow', event => {if (event.persisted) ScrollTrigger.refresh();});
  window.addEventListener('studio:layout', () => ScrollTrigger.refresh());
}
