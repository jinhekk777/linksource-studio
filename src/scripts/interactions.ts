import {gsap} from 'gsap';

/** Small magnetic responses move the face, keeping the actual link in place. */
export function initInteractions() {
  const media = gsap.matchMedia();
  media.add('(min-width: 761px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    const controller = new AbortController();
    const {signal} = controller;
    const cleanups: (() => void)[] = [];
    const resets: (() => void)[] = [];

    document.querySelectorAll<HTMLElement>('[data-magnet]').forEach(trigger => {
      const face = trigger.querySelector<HTMLElement>('[data-magnet-face]');
      if (!face) return;
      const position = {x: 0, y: 0};
      const draw = () => {face.style.translate = `${position.x.toFixed(2)}px ${position.y.toFixed(2)}px`;};
      // Reuse two tweens rather than allocating one on every pointer event.
      const xTo = gsap.quickTo(position, 'x', {duration: .28, ease: 'power3.out', onUpdate: draw});
      const yTo = gsap.quickTo(position, 'y', {duration: .28, ease: 'power3.out', onUpdate: draw});
      let tracking = false;
      const reset = () => {
        if (!tracking) return;
        tracking = false;
        xTo(0); yTo(0);
      };
      const move = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse' || event.buttons || document.body.classList.contains('has-dialog')) {reset(); return;}
        const rect = face.getBoundingClientRect();
        // Subtract the animated offset so the target doesn't chase its own position.
        const dx = event.clientX - (rect.left + rect.width / 2 - position.x);
        const dy = event.clientY - (rect.top + rect.height / 2 - position.y);
        if (Math.abs(dx) > rect.width / 2 + 28 || Math.abs(dy) > rect.height / 2 + 28) {reset(); return;}
        tracking = true;
        xTo(gsap.utils.clamp(-8, 8, dx * .18));
        yTo(gsap.utils.clamp(-8, 8, dy * .18));
      };
      trigger.addEventListener('pointermove', move, {passive: true, signal});
      trigger.addEventListener('pointerleave', reset, {signal});
      trigger.addEventListener('pointerdown', reset, {signal});
      resets.push(reset);
      cleanups.push(() => {xTo.tween.kill(); yTo.tween.kill(); face.style.removeProperty('translate');});
    });

    const resetAll = () => resets.forEach(reset => reset());
    window.addEventListener('scroll', resetAll, {passive: true, signal});
    window.addEventListener('resize', resetAll, {signal});
    window.addEventListener('blur', resetAll, {signal});
    window.addEventListener('pagehide', resetAll, {signal});
    window.addEventListener('studio:dialog', resetAll, {signal});
    document.addEventListener('keydown', resetAll, {signal});
    return () => {controller.abort(); cleanups.forEach(cleanup => cleanup());};
  });
}
