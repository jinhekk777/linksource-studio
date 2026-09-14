import {ui,type Locale} from '../data/i18n';

/** Prepare the next scene early; visible neighbours keep moving during a handoff. */
export function initSceneMedia(locale:Locale) {
  const labels=ui[locale];
  const automatic=matchMedia('(min-width:761px) and (hover:hover) and (prefers-reduced-motion:no-preference)');
  const saveData=(navigator as Navigator & {connection?:{saveData?:boolean}}).connection?.saveData;
  const canAuto=()=>automatic.matches&&!saveData;
  const scenes=[...document.querySelectorAll<HTMLElement>('[data-scene]')];
  if(!scenes.length)return;
  const entries=scenes.flatMap(scene=>{
    const video=scene.querySelector<HTMLVideoElement>('[data-scene-preview]');
    const button=scene.querySelector<HTMLButtonElement>('[data-scene-toggle]');
    return video&&button?[{scene,video,button,visible:0,near:false,requested:canAuto(),manual:false,wanted:false,generation:0,frameId:undefined as number|undefined}]:[];
  });
  type Entry=(typeof entries)[number];
  const update=(entry:Entry,playing:boolean)=>{
    const label=playing?labels.pause:labels.play;
    entry.button.setAttribute('aria-pressed',String(playing));
    entry.button.setAttribute('aria-label',label);
    entry.button.querySelector('[data-scene-toggle-label]')!.textContent=label;
    entry.button.querySelector('[data-scene-toggle-icon]')!.textContent=playing?'Ⅱ':'▷';
  };
  const prepare=(entry:Entry)=>{
    if(entry.video.getAttribute('src'))return;
    entry.video.preload='auto';
    entry.video.src=entry.video.dataset.src!;
  };
  const stop=(entry:Entry)=>{
    entry.wanted=false;entry.generation++;
    if(entry.frameId!==undefined){entry.video.cancelVideoFrameCallback(entry.frameId);entry.frameId=undefined;}
    entry.video.pause();update(entry,false);
  };
  const sync=()=>{
    const allowed=!document.hidden&&!document.body.classList.contains('has-dialog');
    const visible=allowed?entries.filter(e=>e.requested&&e.visible>.02&&!e.scene.hidden).sort((a,b)=>b.visible-a.visible).slice(0,2):[];
    if(document.body.classList.contains('has-scene-preview')!==!!visible.length){
      document.body.classList.toggle('has-scene-preview',!!visible.length);
      window.dispatchEvent(new Event('studio:preview'));
    }
    entries.forEach(entry=>{
      const wanted=visible.includes(entry);
      if(wanted===entry.wanted)return;
      if(!wanted){stop(entry);return;}
      entry.wanted=true;prepare(entry);update(entry,true);
      const generation=++entry.generation;
      const reveal=()=>{
        entry.frameId=undefined;
        if(entry.generation===generation&&entry.wanted)entry.video.classList.add('is-playing');
      };
      // Reveal a decoded video frame, never an empty playback surface.
      if(typeof entry.video.requestVideoFrameCallback==='function')entry.frameId=entry.video.requestVideoFrameCallback(reveal);
      entry.video.play().then(()=>{
        if(typeof entry.video.requestVideoFrameCallback!=='function')reveal();
      }).catch(()=>{
        if(entry.generation!==generation)return;
        entry.requested=false;stop(entry);entry.video.classList.remove('is-playing');sync();
      });
    });
  };
  const preparedImages=new WeakSet<HTMLImageElement>();
  const warm=new IntersectionObserver(changes=>{
    changes.forEach(change=>{
      const scene=change.target as HTMLElement;
      scene.classList.toggle('is-near',change.isIntersecting);
      const entry=entries.find(e=>e.scene===scene);
      if(entry)entry.near=change.isIntersecting;
      if(!change.isIntersecting)return;
      const image=scene.querySelector<HTMLImageElement>('.scene-picture>img');
      if(image&&!preparedImages.has(image)){
        preparedImages.add(image);image.loading='eager';void image.decode().catch(()=>{});
      }
      if(entry&&canAuto())prepare(entry);
    });
  },{rootMargin:'85% 0px'});
  const observer=new IntersectionObserver(changes=>{
    changes.forEach(change=>{const entry=entries.find(e=>e.scene===change.target);if(entry)entry.visible=change.intersectionRatio;});sync();
  },{threshold:[0,.02,.08,.25,.5,.75,1]});
  scenes.forEach(scene=>warm.observe(scene));
  entries.forEach(entry=>{
    observer.observe(entry.scene);
    entry.button.addEventListener('click',()=>{entry.requested=!entry.requested;entry.manual=true;sync();});
  });
  automatic.addEventListener('change',()=>{
    entries.forEach(entry=>{
      if(!automatic.matches||!entry.manual)entry.requested=canAuto();
      if(entry.near&&canAuto())prepare(entry);
    });sync();
  });
  document.addEventListener('visibilitychange',sync);
  window.addEventListener('studio:dialog',sync);
  window.addEventListener('studio:layout',sync);
  window.addEventListener('pagehide',()=>entries.forEach(stop));
  window.addEventListener('pageshow',sync);
}
