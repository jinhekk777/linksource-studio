import {gsap} from 'gsap';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const pointer=matchMedia('(hover: hover) and (pointer: fine)');
let cleanupButtons=()=>{};
function buttons(){
 cleanupButtons();
 if(reduced.matches||!pointer.matches)return;
 const abort=new AbortController(),resets:Array<()=>void>=[];
 document.querySelectorAll<HTMLElement>('.btn-explore,.btn-book').forEach(button=>{
  let content=button.querySelector<HTMLElement>('.button-content');
  if(!content){content=document.createElement('span');content.className='button-content';while(button.firstChild)content.append(button.firstChild);button.append(content)}
  const target=content;
  const x=gsap.quickTo(target,'x',{duration:.45,ease:'power3.out'});
  const y=gsap.quickTo(target,'y',{duration:.45,ease:'power3.out'});
  const reset=()=>{x(0);y(0)};
  button.addEventListener('pointermove',e=>{
   const r=button.getBoundingClientRect();
   x(Math.max(-5,Math.min(5,(e.clientX-r.left-r.width/2)*.08)));
   y(Math.max(-3,Math.min(3,(e.clientY-r.top-r.height/2)*.13)));
  },{signal:abort.signal});
  button.addEventListener('pointerleave',reset,{signal:abort.signal});
  button.addEventListener('blur',reset,{signal:abort.signal});
  resets.push(()=>{x.tween.kill();y.tween.kill();gsap.set(target,{clearProps:'transform'})});
 });
 cleanupButtons=()=>{abort.abort();resets.forEach(fn=>fn())};
}
buttons();reduced.addEventListener('change',buttons);pointer.addEventListener('change',buttons);

// Use native document scrolling; activate image depth only on a precise pointer.
if(!document.body.classList.contains('page-home')){
 void import('gsap/ScrollTrigger').then(({ScrollTrigger})=>{
  gsap.registerPlugin(ScrollTrigger);
  const media=gsap.matchMedia();
  media.add({
   motion:'(prefers-reduced-motion: no-preference)',
   desktop:'(min-width: 901px) and (hover: hover) and (pointer: fine)'
  },context=>{
   if(!context.conditions?.motion)return;
   const reveals=document.querySelectorAll<HTMLElement>('.story-text,.project-scope>div,.work-text,.about-text,.section-heading,.focus-grid>div,.capability-grid article,.quote-box,.booking-section>div');
   reveals.forEach(element=>{
    // Anything already in view stays readable on loading, anchor entry or history restore.
    if(element.getBoundingClientRect().top<innerHeight*.88)return;
    const children=Array.from(element.children) as HTMLElement[];
    gsap.from(children,{y:24,opacity:0,duration:.85,ease:'power3.out',stagger:.07,
     scrollTrigger:{trigger:element,start:'top 89%',once:true}});
   });
   document.querySelectorAll<HTMLElement>('.story-media,.about-image,.work-visual').forEach(element=>{
    if(element.getBoundingClientRect().top<innerHeight*.92)return;
    gsap.from(element,{clipPath:'inset(0% 0% 8% 0%)',duration:1.15,ease:'power3.out',
     scrollTrigger:{trigger:element,start:'top 94%',once:true}});
   });
   if(context.conditions.desktop){
    document.querySelectorAll<HTMLElement>('.story-media,.about-image').forEach(frame=>{
     const img=frame.querySelector('img');if(!img)return;
     gsap.fromTo(img,{yPercent:-2,scale:1.06},{yPercent:2,scale:1.06,ease:'none',
      scrollTrigger:{trigger:frame,start:'top bottom',end:'bottom top',scrub:.65}});
    });
   }
   const refresh=()=>ScrollTrigger.refresh();
   document.fonts.ready.then(refresh);
   window.addEventListener('pageshow',refresh);
   const observer=new ResizeObserver(()=>ScrollTrigger.refresh());
   document.querySelectorAll('.story-media,.about-image').forEach(el=>observer.observe(el));
   return ()=>{window.removeEventListener('pageshow',refresh);observer.disconnect()};
  });
  // A page restored from bfcache keeps its live triggers; refresh geometry at the restored position.
 }).catch(()=>{/* Content and navigation remain available without the optional motion chunk. */});
}
