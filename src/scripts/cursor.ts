/** Contextual project labels supplement a CSS cursor; the pointer itself never lags. */
export function initCursor() {
  const enabled = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  let teardown: (() => void) | undefined;

  const sync = () => {
    teardown?.();
    teardown = undefined;
    if (!enabled.matches) return;

    const hint = document.createElement('div');
    hint.className = 'cursor-hint';
    hint.setAttribute('aria-hidden', 'true');
    const inner = document.createElement('span');
    inner.className = 'cursor-hint-inner';
    hint.append(inner);
    document.body.append(hint);
    const controller = new AbortController();
    const {signal} = controller;
    let frame = 0, lastTime = 0, x = 0, y = 0, targetX = 0, targetY = 0;
    let active: HTMLElement | null = null;
    let width = 0, height = 0;

    const hide = () => {
      hint.classList.remove('is-visible');
      active = null;
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    };
    const place = () => {hint.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;};
    const tick = (time: number) => {
      // Time-based damping stays consistent across refresh rates and stops at rest.
      const blend = 1 - Math.exp(-Math.min(lastTime ? time - lastTime : 16, 64) / 65);
      lastTime = time;
      x += (targetX - x) * blend;
      y += (targetY - y) * blend;
      place();
      if (Math.abs(targetX - x) + Math.abs(targetY - y) > .1) frame = requestAnimationFrame(tick);
      else {x = targetX; y = targetY; place(); frame = 0; lastTime = 0;}
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.buttons || document.body.classList.contains('has-dialog') || !(event.target instanceof Element)) {hide(); return;}
      const target = event.target.closest<HTMLElement>('[data-cursor-label]');
      if (!target || target.closest('[inert], [hidden], [aria-disabled="true"], :disabled')) {hide(); return;}
      const changed = active !== target;
      if (changed) {
        active = target;
        inner.textContent = target.dataset.cursorLabel || '';
        width = hint.offsetWidth; height = hint.offsetHeight;
      }
      targetX = event.clientX + 22;
      targetY = event.clientY + 24;
      if (targetX + width > document.documentElement.clientWidth - 12) targetX = event.clientX - width - 14;
      if (targetY + height > window.innerHeight - 12) targetY = event.clientY - height - 14;
      targetX = Math.max(8, targetX); targetY = Math.max(8, targetY);
      if (changed) {x = targetX; y = targetY; place();}
      hint.classList.add('is-visible');
      if (!frame) frame = requestAnimationFrame(tick);
    };

    document.addEventListener('pointermove', move, {passive: true, signal});
    document.addEventListener('pointerdown', hide, {passive: true, signal});
    document.documentElement.addEventListener('pointerleave', hide, {signal});
    document.addEventListener('keydown', hide, {signal});
    document.addEventListener('visibilitychange', hide, {signal});
    // A scrolling scene can change the target underneath a stationary pointer.
    window.addEventListener('scroll', hide, {passive: true, signal});
    window.addEventListener('resize', hide, {signal});
    window.addEventListener('blur', hide, {signal});
    window.addEventListener('pagehide', hide, {signal});
    window.addEventListener('studio:dialog', hide, {signal});
    teardown = () => {hide(); controller.abort(); hint.remove();};
  };
  enabled.addEventListener('change', sync);
  sync();
}
