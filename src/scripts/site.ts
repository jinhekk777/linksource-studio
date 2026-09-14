import {withBase} from '../data/urls';
import {initCursor} from './cursor';
import {initSceneMedia} from './scene-media';
import {ui, type Locale} from '../data/i18n';
const locale:Locale=document.documentElement.lang.startsWith('en')?'en':'zh';
const labels=ui[locale];
initCursor();
initSceneMedia(locale);

// Language links are real page links and retain an active section when possible.
document.querySelectorAll<HTMLAnchorElement>('.language-switch').forEach(link=>{
 const base=link.href;
 const sync=()=>{link.href=base+location.hash;};
 sync();window.addEventListener('hashchange',sync);link.addEventListener('click',sync);
});

const filmDialog=document.querySelector<HTMLDialogElement>('#film-dialog')!;
const film=document.querySelector<HTMLVideoElement>('#film-video')!;
const menu=document.querySelector<HTMLDialogElement>('#mobile-menu')!;
const menuToggle=document.querySelector<HTMLButtonElement>('.menu-toggle')!;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let filmTrigger:HTMLElement|null=null;
const lockBody=()=>{document.body.classList.toggle('has-dialog',filmDialog.open||menu.open);window.dispatchEvent(new Event('studio:dialog'));};
function closeDialog(dialog:HTMLDialogElement){
  if(!dialog.open||dialog.classList.contains('is-closing'))return;
  if(reduced.matches){dialog.close();return;}
  dialog.classList.add('is-closing');
  window.setTimeout(()=>{dialog.close();dialog.classList.remove('is-closing');},250);
}
[menu,filmDialog].forEach(dialog=>dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(dialog);}));

menuToggle.addEventListener('click',()=>{menu.showModal();menuToggle.setAttribute('aria-expanded','true');lockBody();});
menu.querySelector('.menu-close')!.addEventListener('click',()=>closeDialog(menu));
menu.addEventListener('close',()=>{menuToggle.setAttribute('aria-expanded','false');lockBody();menuToggle.focus();});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.close()));
matchMedia('(min-width:761px)').addEventListener('change',e=>{if(e.matches&&menu.open)menu.close();});

document.querySelectorAll<HTMLButtonElement>('[data-film]').forEach(button=>button.addEventListener('click',()=>{
  const id=button.dataset.film!;
  if(!['taosi','zhongkui','panda','bxcz'].includes(id))return;
  filmTrigger=button;
  document.querySelector('#film-title')!.textContent=button.dataset.title+' / '+labels.film;
  document.querySelector('#film-status')!.textContent='';
  film.poster=button.dataset.poster!;film.src=withBase('/media/'+id+'.mp4');
  filmDialog.showModal();lockBody();
  film.play().catch(()=>{if(filmDialog.open)document.querySelector('#film-status')!.textContent=labels.playHint;});
}));
filmDialog.querySelector('.film-close')!.addEventListener('click',()=>closeDialog(filmDialog));
filmDialog.addEventListener('click',event=>{if(event.target!==filmDialog)return;const r=filmDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog(filmDialog);});
filmDialog.addEventListener('close',()=>{film.pause();film.removeAttribute('src');film.load();lockBody();filmTrigger?.focus();});
film.addEventListener('error',()=>{if(film.getAttribute('src'))document.querySelector('#film-status')!.textContent=labels.filmError;});
document.addEventListener('visibilitychange',()=>{if(document.hidden)film.pause();});

import('./motion').then(({initMotion})=>initMotion()).catch(()=>{/* The complete static layout remains available without motion. */});
