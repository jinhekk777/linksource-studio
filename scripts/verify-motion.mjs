
import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const{chromium}=createRequire(import.meta.url)('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
await context.addInitScript(()=>{
 window.addEventListener('pagereveal',e=>{
  window.__transition={supported:'viewTransition' in e,present:!!e.viewTransition,status:'none'};
  if(e.viewTransition)e.viewTransition.ready.then(()=>{
   window.__transition.status='ready';
   window.__transition.names=document.getAnimations().map(a=>a.animationName).filter(Boolean);
  }).catch(err=>{window.__transition.status='skipped';window.__transition.reason=err.message});
 });
});
await context.route('**/ifnewbee.top/**',r=>r.abort());
const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
const out='docs/motion-check';fs.mkdirSync(out,{recursive:true});
try{
 await p.goto('http://127.0.0.1:4174/projects/');await p.waitForTimeout(1200);
 await p.locator('.work-visual[href="/projects/taosi/"]').click();await p.waitForURL('**/projects/taosi/');
 await p.waitForFunction(()=>['ready','skipped'].includes(window.__transition?.status));
 const transition=await p.evaluate(()=>window.__transition);console.log('TRANSITION',JSON.stringify(transition));
 if(transition.status==='ready')await p.screenshot({path:out+'/cover-transition.jpg',type:'jpeg',quality:78});
 await p.waitForTimeout(1000);
 await p.evaluate(()=>scrollTo({top:1450,behavior:'instant'}));await p.waitForTimeout(1500);
 const story=await p.locator('.story-text').first().evaluate(el=>({opacity:getComputedStyle(el.querySelector('h2')).opacity,imageTransform:getComputedStyle(el.closest('.story-block').querySelector('img')).transform}));
 console.log('SCROLL',JSON.stringify(story));
 await p.screenshot({path:out+'/project-scroll.jpg',type:'jpeg',quality:78});
 await p.goto('http://127.0.0.1:4174/');await p.waitForTimeout(1500);
 await p.mouse.move(760,400);await p.mouse.wheel(0,360);await p.waitForTimeout(150);assert.ok(await p.evaluate(()=>scrollY>250&&scrollY<450),'Wheel moves the page without snapping');await p.locator('[data-slide="1"]').click();await p.waitForTimeout(1100);
 console.log('SCENE',await p.locator('.home-project.is-current .home-scene').evaluate(el=>({clip:getComputedStyle(el).clipPath,transform:getComputedStyle(el).transform,animations:el.getAnimations().length})));
 await p.screenshot({path:out+'/scene-transition.jpg',type:'jpeg',quality:78});
 await p.waitForTimeout(1500);
 const button=p.locator('.home-project.is-current .btn-explore'),bounds=await button.boundingBox();
 await p.mouse.move(bounds.x+bounds.width-12,bounds.y+bounds.height/2);await p.waitForTimeout(600);
 const contentTransform=await button.locator('.button-content').evaluate(el=>getComputedStyle(el).transform);
 console.log('BUTTON',contentTransform);
 await p.mouse.move(20,200);await p.waitForTimeout(600);
 assert.ok((await p.locator('.home-project.is-current .home-scene').evaluate(el=>el.getAnimations().length))===0);
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(150);
 await p.locator('[data-slide="2"]').click();await p.waitForFunction(()=>document.querySelector('.home-showcase').dataset.activeProject==='taosi');
 assert.equal(await p.locator('.home-project.is-current .home-scene').evaluate(el=>el.getAnimations().length),0);
 await p.goto('http://127.0.0.1:4174/projects/zhongkui/');
 await p.evaluate(()=>scrollTo({top:2200,behavior:'instant'}));await p.waitForTimeout(800);
 console.log('REDUCED',await p.locator('.story-text h2').evaluateAll(els=>els.map(el=>({opacity:getComputedStyle(el).opacity,transform:getComputedStyle(el).transform}))));
 assert.deepEqual(errors,[]);
 fs.writeFileSync(out+'/results.json',JSON.stringify({transition,story,contentTransform,errors},null,2));
 assert.equal(transition.status,'ready','Cover navigation must have a real native transition');
 assert.ok(transition.names.some(n=>n.includes('scene-taosi')),'Cover shares its scene with the project hero');
 assert.equal(transition.names.filter(n=>n.startsWith('-ua-view-transition-group-anim-scene-')).length,1,'Only the selected scene moves across pages');
 console.log('PASS: native shared scene, scroll depth, pointer response, reduced motion.');
}finally{await browser.close()}
