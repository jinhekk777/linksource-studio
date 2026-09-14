import {withBase} from '../data/urls';
const isEnglish=document.documentElement.lang==='en';
const t=(zh:string,en:string)=>isEnglish?en:zh;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const root=document.querySelector<HTMLElement>('.home-showcase');
const menu=document.querySelector<HTMLDialogElement>('#mobile-menu')!;
const menuToggle=document.querySelector<HTMLButtonElement>('.menu-toggle')!;
const filmDialog=document.querySelector<HTMLDialogElement>('#film-dialog')!;
const film=document.querySelector<HTMLVideoElement>('#film-video')!;
const slides=[...document.querySelectorAll<HTMLElement>('.home-project')];
const homeFrames=slides.map(s=>s.querySelector<HTMLElement>('.home-project-frame')!);
const videos=slides.map(s=>s.querySelector<HTMLVideoElement>('[data-home-video]'));
const dots=[...document.querySelectorAll<HTMLAnchorElement>('[data-slide]')];
const progressTracks=dots.map(dot=>dot.querySelector<HTMLElement>('.project-progress-track')!);
const progressValues=slides.map(()=>-1);
const toggle=document.querySelector<HTMLButtonElement>('[data-background-toggle]');
const controls=document.querySelector<HTMLElement>('.home-controls');
const scrollCue=document.querySelector<HTMLAnchorElement>('.home-scroll-cue');
let lastCueProgress=-1;
let activeIndex=-1,playEpoch=0;
let trackLocation=false,scrollFrame=0;
let wantsVideo=!reduced.matches&&!(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData;
const syncLanguage=()=>document.querySelectorAll<HTMLAnchorElement>('.language-switch').forEach(a=>{
 const target=new URL(a.href);target.hash=location.hash;a.href=target.href;
});
syncLanguage();
function updatePlaybackLabel(playing:boolean){
 if(!toggle)return;
 const label=playing?t('暂停动态背景','Pause background video'):t('播放动态背景','Play background video');
 toggle.setAttribute('aria-label',label);toggle.setAttribute('aria-pressed',String(playing));
 toggle.querySelector('[data-background-label]')!.textContent=label;
 toggle.querySelector('[data-background-icon]')!.textContent=playing?'Ⅱ':'▷';
}
function syncBackground(){
 const epoch=++playEpoch;
 if(controls)controls.hidden=activeIndex<0||menu.open||filmDialog.open;
 videos.forEach((v,i)=>{if(v&&i!==activeIndex)v.pause()});
 const video=videos[activeIndex];
 if(toggle)toggle.hidden=!video;
 if(!video){updatePlaybackLabel(false);return}
 const shouldPlay=wantsVideo&&!document.hidden&&!menu.open&&!filmDialog.open;
 if(!shouldPlay){video.pause();updatePlaybackLabel(false);return}
 if(!video.getAttribute('src')){video.src=video.dataset.src!;video.load()}
 video.muted=true;
 video.play().then(()=>{
  if(epoch!==playEpoch||video!==videos[activeIndex]){
   if(video!==videos[activeIndex]||!wantsVideo||document.hidden||menu.open||filmDialog.open)video.pause();
   return;
  }
  updatePlaybackLabel(true);
 }).catch(()=>{if(epoch===playEpoch)updatePlaybackLabel(false)});
}
function setCurrent(index:number){
 if(index===activeIndex)return;
 activeIndex=index;
 slides.forEach((s,i)=>s.classList.toggle('is-current',i===index));
 dots.forEach((d,i)=>i===index?d.setAttribute('aria-current','true'):d.removeAttribute('aria-current'));
 const slug=slides[index]?.dataset.project;
 if(root)root.dataset.activeProject=slug||'';
 if(slug&&trackLocation){
  const hash='#world-'+slug;
  if(location.hash!==hash)history.replaceState(history.state,'',location.pathname+location.search+hash);
  syncLanguage();
 }
 syncBackground();
}
function updateVisible(){
 scrollFrame=0;
 if(scrollCue){
  const progress=Math.max(0,Math.min(1,(scrollY-12)/100));
  if(progress!==lastCueProgress){
   scrollCue.style.setProperty('--cue-progress',String(progress));
   scrollCue.inert=progress===1;
   lastCueProgress=progress;
  }
 }
 // The rail follows document distance, so a held image still gives immediate feedback.
 slides.forEach((slide,i)=>{
  const r=slide.getBoundingClientRect();
  const progress=Math.max(0,Math.min(1,-r.top/Math.max(1,r.height-innerHeight*.5)));
  const value=Math.round(progress*1000)/1000;
  if(value===progressValues[i])return;
  progressValues[i]=value;
  dots[i].style.setProperty('--project-progress',String(value));
  const percent=String(Math.round(progress*100));
  if(progressTracks[i].getAttribute('aria-valuenow')!==percent)progressTracks[i].setAttribute('aria-valuenow',percent);
 });
 const center=innerHeight*.5;
 setCurrent(homeFrames.findIndex(s=>{const r=s.getBoundingClientRect();return r.top<=center&&r.bottom>center}));
}
function scheduleVisible(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateVisible)}
if(root){
 root.classList.add('home-scroll-ready');
 const reveal=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   const panel=entry.target.closest<HTMLElement>('.home-project')!;
   if(!panel.classList.contains('is-seen')){
    panel.classList.add('is-seen');
    if(!reduced.matches)panel.querySelector('.home-scene')?.animate(
     [{transform:'scale(1.025)'},{transform:'scale(1)'}],
     {duration:1300,easing:'cubic-bezier(.16,1,.3,1)'});
   }
   reveal.unobserve(entry.target);
  });
 },{threshold:.18});
 homeFrames.forEach(frame=>reveal.observe(frame));
 window.addEventListener('scroll',scheduleVisible,{passive:true});
 window.addEventListener('resize',scheduleVisible,{passive:true});
 window.addEventListener('pageshow',()=>{
  trackLocation=true;scheduleVisible();syncBackground();
 });
 window.addEventListener('hashchange',()=>{scheduleVisible();syncLanguage()});
 if(document.readyState==='complete'){trackLocation=true;scheduleVisible()}
 toggle?.addEventListener('click',()=>{wantsVideo=!wantsVideo;syncBackground()});
 videos.forEach(v=>{
  if(!v)return;
  v.addEventListener('playing',()=>{
   const revealFrame=()=>{if(v.readyState>=2)v.classList.add('is-ready')};
   if('requestVideoFrameCallback' in v)v.requestVideoFrameCallback(revealFrame);else revealFrame();
  });
  v.addEventListener('error',()=>{v.classList.remove('is-ready');if(v===videos[activeIndex])updatePlaybackLabel(false)});
 });
 reduced.addEventListener('change',()=>{
  if(reduced.matches){
   wantsVideo=false;
   slides.forEach(s=>s.querySelector('.home-scene')?.getAnimations().forEach(a=>a.cancel()));
  }
  syncBackground();
 });
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)film.pause();syncBackground()});
window.addEventListener('pagehide',()=>{++playEpoch;videos.forEach(v=>v?.pause());film.pause()});
window.addEventListener('hashchange',syncLanguage);
function lock(){
 const open=menu.open||filmDialog.open;
 document.body.classList.toggle('has-dialog',open);
 document.documentElement.classList.toggle('has-dialog',open);
 syncBackground();
}
menuToggle.addEventListener('click',()=>{menu.showModal();menuToggle.setAttribute('aria-expanded','true');lock()});
let menuClosing=false;
async function closeMenu(){
 if(!menu.open||menuClosing)return;
 menuClosing=true;
 if(!reduced.matches)await menu.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-12px)'}],{duration:200,easing:'cubic-bezier(.4,0,1,1)'}).finished.catch(()=>{});
 menu.close();menuClosing=false;lock();
}
menu.querySelector('.menu-close')!.addEventListener('click',closeMenu);
menu.addEventListener('cancel',e=>{e.preventDefault();void closeMenu()});
menu.addEventListener('close',()=>{menuToggle.setAttribute('aria-expanded','false');lock();menuToggle.focus()});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.close()));
matchMedia('(min-width:901px)').addEventListener('change',e=>{if(e.matches&&menu.open)menu.close()});
const drop=document.querySelector<HTMLElement>('.nav-dropdown');
if(drop){
 const button=drop.querySelector<HTMLButtonElement>('.dropdown-toggle')!;
 const list=drop.querySelector<HTMLElement>('.dropdown-menu')!;
 const header=drop.closest('.site-header')!;
 let closeTimer=0,clickedOpen=false,keyboardMode=false;
 const open=(value:boolean)=>{
  clearTimeout(closeTimer);list.hidden=!value;
  button.setAttribute('aria-expanded',String(value));
  header.classList.toggle('has-works-menu',value);
  if(!value)clickedOpen=false;
 };
 button.addEventListener('click',event=>{
  if(event.detail===0){keyboardMode=true;open(Boolean(list.hidden));return}
  keyboardMode=false;
  if(!list.hidden&&!clickedOpen){clickedOpen=true;return}
  const value=Boolean(list.hidden);open(value);clickedOpen=value;
 });
 drop.addEventListener('mouseenter',()=>{
  if(!matchMedia('(hover: hover)').matches)return;
  keyboardMode=false;open(true);
 });
 drop.addEventListener('mouseleave',()=>{
  if(keyboardMode&&drop.contains(document.activeElement))return;
  closeTimer=window.setTimeout(()=>open(false),160);
 });
 drop.addEventListener('focusout',()=>setTimeout(()=>{if(!drop.contains(document.activeElement))open(false)},0));
 drop.addEventListener('keydown',event=>{
  keyboardMode=true;
  if(event.key==='Escape'){event.preventDefault();open(false);button.focus()}
  if(event.key==='ArrowDown'&&event.target===button){event.preventDefault();open(true);list.querySelector<HTMLAnchorElement>('a')?.focus()}
 });
 list.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>open(false)));
 document.addEventListener('pointerdown',event=>{if(!drop.contains(event.target as Node))open(false)});
 window.addEventListener('scroll',()=>{if(!list.hidden)open(false)},{passive:true});
 matchMedia('(max-width:900px)').addEventListener('change',event=>{if(event.matches)open(false)});
}
let filmTrigger:HTMLButtonElement|null=null;
document.querySelectorAll<HTMLButtonElement>('[data-film]').forEach(b=>b.addEventListener('click',()=>{
 const slug=b.dataset.film;
 if(!slug||!['taosi','zhongkui','bxcz'].includes(slug))return;
 filmTrigger=b;
 document.querySelector('#film-title')!.textContent=b.dataset.title+' / '+t('项目影片','Project film');
 document.querySelector('#film-status')!.textContent='';
 film.poster=b.dataset.poster!;film.src=withBase('/media/'+slug+'.mp4');
 filmDialog.showModal();lock();
 film.play().catch(()=>{if(filmDialog.open)document.querySelector('#film-status')!.textContent=t('点击播放按钮观看影片。','Press play to watch the film.')});
}));
filmDialog.querySelector('.film-close')!.addEventListener('click',()=>filmDialog.close());
filmDialog.addEventListener('close',()=>{film.pause();film.removeAttribute('src');film.load();lock();filmTrigger?.focus()});
filmDialog.addEventListener('click',e=>{if(e.target===filmDialog){const r=filmDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)filmDialog.close()}});
film.addEventListener('error',()=>{if(film.getAttribute('src'))document.querySelector('#film-status')!.textContent=t('影片暂时无法加载，请关闭后重试。','The film could not be loaded. Please try again.')});
// Keep project imagery behind a readable navigation bar after leaving the hero.
const header=document.querySelector<HTMLElement>('.site-header');
let headerFrame=0;
const syncHeader=()=>{header?.classList.toggle('is-scrolled',window.scrollY>48);header?.style.setProperty('--reading-progress',String(Math.min(1,Math.max(0,window.scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)))));headerFrame=0};
window.addEventListener('scroll',()=>{if(!headerFrame)headerFrame=requestAnimationFrame(syncHeader)},{passive:true});
window.addEventListener('pageshow',syncHeader);
syncHeader();
