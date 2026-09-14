import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const origin='http://127.0.0.1:4174';
const directory=new URL('../docs/browser-check/',import.meta.url);
await mkdir(directory,{recursive:true});
const routes=['/','/projects/taosi/','/projects/zhongkui/','/projects/panda/','/projects/bxcz/','/studio/','/collaboration/'];
const results=[],errors=[],requests=[];
const watch=page=>{page.on('pageerror',e=>errors.push({url:page.url(),message:e.message}));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/404.html'))requests.push({url:r.url(),status:r.status()});});};
try{
 for(const [name,viewport] of [['desktop',{width:1280,height:800}],['mobile',{width:390,height:844}],['narrow',{width:320,height:740}]]){
  const context=await browser.newContext({viewport,reducedMotion:'reduce',isMobile:name!=='desktop',hasTouch:name!=='desktop'}),page=await context.newPage();watch(page);
  for(const locale of ['zh','en'])for(const route of routes){
   const path=(locale==='en'?'/en':'')+route;
   const response=await page.goto(origin+path,{waitUntil:'load'});assert.equal(response.status(),200,path);
   await page.evaluate(()=>document.fonts.ready);
   const dimensions=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,title:document.querySelector('h1')?.textContent.trim(),h1s:document.querySelectorAll('h1').length,lang:document.documentElement.lang,firstImage:document.querySelector('.project-card-image')?.getBoundingClientRect().top}));
   assert.equal(dimensions.h1s,1,`${name} ${path}: h1`);
   assert.ok(dimensions.scroll<=dimensions.width+1,`${name} ${path}: overflow ${dimensions.scroll}/${dimensions.width}`);
   assert.equal(dimensions.lang,locale==='en'?'en':'zh-CN');
   const language=await page.locator('.site-header .language-switch').evaluate(e=>{const range=document.createRange();range.selectNode(e.firstChild);return {height:range.getBoundingClientRect().height,line:parseFloat(getComputedStyle(e).lineHeight),width:e.clientWidth,scroll:e.scrollWidth};});
   assert.ok(language.height<=language.line*1.2&&language.scroll<=language.width+1,`${name} ${path}: language control wraps or overflows`);
   results.push({name,path,...dimensions});
   if(route==='/'||(route==='/projects/'&&locale==='zh')||(route==='/projects/panda/'&&locale==='en')||(route==='/collaboration/'&&locale==='en'))await page.screenshot({path:new URL(`${name}-${locale}-${route==='/'?'home':route.split('/').filter(Boolean).join('-')}.png`,directory).pathname.replace(/^\/(.:)/,'$1'),fullPage:route==='/collaboration/'});
  }
  // The menu remains usable while language links address the current project.
  await page.goto(origin+'/en/projects/panda/');
  if(name!=='desktop'){
   await page.getByRole('button',{name:'Open navigation',exact:true}).click();
   assert.ok(await page.locator('#mobile-menu').evaluate(e=>e.open));
   await page.keyboard.press('Escape');
   await page.waitForFunction(()=>document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='false');
   assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
  }
  await page.locator('.site-header .language-switch').click();await page.waitForURL('**/projects/panda/');
  assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');
  assert.equal(new URL(page.url()).pathname,'/projects/panda/');
  for(const [from,to] of [['/projects/','/#selected'],['/en/projects/#world-panda','/en/#world-panda'],['/expertise/','/studio/#capabilities'],['/en/expertise/#visual','/en/studio/#visual']]){
   await page.goto(origin+from);await page.waitForURL(origin+to);
  }
  await context.close();
 }
 // Full motion and native dialogs: exercise actual user actions, including anchors.
 const context=await browser.newContext({viewport:{width:1280,height:800}});
 await context.addInitScript(()=>window.addEventListener('pagereveal',event=>{
  const transition=event.viewTransition;
  const state=window.__studioTransition={present:!!transition,ready:false,finished:!transition,error:null};
  if(!transition)return;
  transition.ready.then(()=>state.ready=true,error=>state.error=error.message);
  transition.finished.then(()=>state.finished=true,error=>state.error=error.message);
 }));
 const page=await context.newPage();watch(page);
 const finishTransition=async()=>{
  await page.waitForFunction(()=>window.__studioTransition?.finished||window.__studioTransition?.error);
  const state=await page.evaluate(()=>window.__studioTransition);
  assert.equal(state.error,null,'Native navigation transition');
  assert.ok(state.present&&state.ready,'Native navigation must reach its animated state');
 };
 await page.goto(origin+'/en/');await page.evaluate(()=>document.fonts.ready);
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('.home-opening h1')).opacity==='1');
 const cursor=await page.locator('h1').evaluate(e=>getComputedStyle(e).cursor);assert.match(cursor,/pixel-default/);
 await page.getByRole('button',{name:'Watch the Taosi project film',exact:true}).first().click();
 await page.waitForFunction(()=>document.querySelector('#film-dialog').open);
 assert.match(await page.locator('#film-title').textContent(),/Taosi \/ Project film/);
 await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.body.classList.contains('has-dialog'));
 assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('has-dialog')),false);
 assert.equal(await page.locator('[data-film="taosi"]').first().evaluate(e=>e===document.activeElement),true);
 await page.goto(origin+'/en/projects/zhongkui/');
 await page.locator('.world-enter[href="#overview"]').click();
 await page.waitForFunction(()=>location.hash==='#overview');
 await page.locator('.site-header .language-switch').click();await page.waitForURL('**/projects/zhongkui/#overview');
 assert.equal(new URL(page.url()).pathname,'/projects/zhongkui/');
 await finishTransition();
 await page.goto(origin+'/');await page.locator('.world-enter').first().click();await page.waitForURL('**/projects/taosi/');
 assert.equal(await page.locator('h1').getAttribute('aria-label'),'陶寺：一脉千秋');
 await finishTransition();
 await context.close();
 assert.deepEqual(errors,[],'Uncaught browser errors');assert.deepEqual(requests,[],'Missing browser assets');
 await writeFile(new URL('results.json',directory),JSON.stringify({results,errors,requests,interactions:['menu','locale project','legacy aliases','film close/focus','smooth anchor locale','project navigation']},null,2));
 console.log(`Browser verification passed: ${results.length} page/viewport checks plus menu, locale, aliases, video, anchor and navigation interactions.`);
}finally{await browser.close();}
