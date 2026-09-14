import fs from 'node:fs';import assert from 'node:assert/strict';import{createRequire}from'node:module';
const{chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=(process.env.PREVIEW_URL||'http://127.0.0.1:4174').replace(/\/$/,''),out=process.env.VERIFY_OUTPUT||'docs/newbee-replica';fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({channel:'msedge',headless:true});const errors=[],results=[];
const paths=['/','/projects/','/projects/zhongkui/','/projects/taosi/','/projects/mecha/','/projects/bxcz/','/studio/','/collaboration/'];
try{
for(const width of [1440,390,320])for(const lang of ['zh','en']){
 const ctx=await b.newContext({viewport:{width,height:width===1440?900:844},isMobile:width!==1440,hasTouch:width!==1440});
 await ctx.route('**/ifnewbee.top/**',r=>r.abort());
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
 for(const path of paths){
  const url=base+(lang==='en'?'/en':'')+path;const response=await p.goto(url,{waitUntil:'domcontentloaded'});assert.equal(response.status(),200,url);
  await p.waitForTimeout(path==='/'?1300:180);
  await p.evaluate(async()=>Promise.all([...document.images].filter(i=>i.src.startsWith(location.origin)&&i.loading!=='lazy').map(i=>i.decode().catch(()=>{}))));
  const record=await p.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,title:document.title,broken:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src)}));
  assert.ok(record.scrollWidth<=width+1,url+' horizontal overflow '+record.scrollWidth);
  assert.equal(record.h1,1,url+' one heading');assert.deepEqual(record.broken,[],url+' images');
  if(path==='/'){assert.equal(await p.locator('.home-showcase').getAttribute('data-active-project'),'mecha');assert.equal(await p.locator('.home-project:not([inert])').count(),4);assert.ok(await p.evaluate(()=>document.documentElement.scrollHeight>innerHeight*4),'Home scrolls through four projects and contact');const bounds=await p.locator('.home-project.is-current .slide-content').boundingBox();assert.ok(bounds.y>=72,'home text must clear header');}
  if(width!==320&&['/','/projects/','/projects/zhongkui/','/studio/','/collaboration/'].includes(path))await p.screenshot({path:out+'/'+width+'-'+lang+'-'+(path==='/'?'home':path.split('/').filter(Boolean).join('-'))+'.jpg',type:'jpeg',quality:80});
  results.push({width,lang,path,...record});
 }
 await ctx.close();
}
const p=await b.newPage({viewport:{width:1440,height:900}});p.on('pageerror',e=>errors.push(e.message));
await p.goto(base+'/');await p.waitForTimeout(1200);
assert.equal(await p.locator('[data-home-video][src]').count(),0,'Concept preview does not load a video');
await p.mouse.move(750,400);await p.mouse.wheel(0,500);await p.waitForTimeout(500);assert.equal(await p.locator('.home-showcase').getAttribute('data-active-project'),'mecha','Small wheel gestures linger on the same scene');assert.ok(Math.abs((await p.locator('.home-project-frame').first().boundingBox()).y)<2);await p.mouse.wheel(0,900);await p.waitForTimeout(800);assert.equal(await p.locator('.home-showcase').getAttribute('data-active-project'),'zhongkui');
await p.locator('[data-slide="2"]').click();await p.waitForFunction(()=>Math.abs(document.querySelector('#world-taosi').getBoundingClientRect().top)<2);assert.equal(await p.locator('.home-showcase').getAttribute('data-active-project'),'taosi');
assert.ok(await p.locator('[data-home-video]').evaluateAll(v=>v.filter(x=>!x.paused).length<=1),'At most one playing background');
await p.locator('.language-switch').click();await p.waitForURL('**/en/#world-taosi');await p.waitForTimeout(1200);assert.equal(await p.locator('.home-showcase').getAttribute('data-active-project'),'taosi');
await p.locator('.home-project.is-current .btn-explore').click();await p.waitForURL('**/en/projects/taosi/');
await p.locator('[data-film]').click();assert.ok(await p.locator('#film-dialog').evaluate(d=>d.open));await p.keyboard.press('Escape');await p.waitForTimeout(100);assert.ok(await p.locator('#film-video').evaluate(v=>v.paused&&!v.getAttribute('src')));
await p.locator('.back-link').click();await p.waitForURL('**/en/#world-taosi');await p.waitForTimeout(1200);assert.equal(await p.locator('.home-showcase').getAttribute('data-active-project'),'taosi');
await p.locator('.dropdown-toggle').hover();assert.ok(await p.locator('#project-menu').isVisible());await p.locator('.all-projects').click();await p.waitForURL('**/en/projects/');
await p.close();
const mobile=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const m=await mobile.newPage();m.on('pageerror',e=>errors.push(e.message));
await m.goto(base+'/');await m.waitForTimeout(1200);
await m.locator('.menu-toggle').click();assert.ok(await m.locator('#mobile-menu').evaluate(d=>d.open));assert.ok(await m.locator('[data-home-video]').evaluateAll(v=>v.every(x=>x.paused)));
await m.getByRole('button',{name:'关闭导航',exact:true}).click();await m.locator('#mobile-menu').waitFor({state:'hidden'});assert.ok(!await m.locator('#mobile-menu').evaluate(d=>d.open));
const cdp=await mobile.newCDPSession(m);
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:180,y:500}]});
for(const y of [470,420,350,280]){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:180,y}]});await m.waitForTimeout(50)}
await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await m.waitForTimeout(1200);assert.ok(await m.evaluate(()=>scrollY>100),'Touch moves the native page');assert.ok(await m.evaluate(()=>getComputedStyle(document.documentElement).overflowY!=='hidden'),'Menu releases page scroll');
await mobile.close();
const reduced=await b.newContext({reducedMotion:'reduce'});const rp=await reduced.newPage();await rp.goto(base+'/');await rp.waitForTimeout(300);assert.ok(await rp.locator('[data-home-video]').evaluateAll(v=>v.every(x=>x.paused&&!x.getAttribute('src'))),'Reduced motion does not autoplay');await rp.locator('[data-slide="3"]').click();await rp.waitForFunction(()=>document.querySelector('.home-showcase').dataset.activeProject==='bxcz');assert.equal(await rp.locator('.home-showcase').getAttribute('data-active-project'),'bxcz');await reduced.close();
assert.deepEqual(errors,[],'Browser errors');
fs.writeFileSync(out+'/results.json',JSON.stringify({pages:results,errors,interactions:'wheel, pagination, touch, language, deep link, return, menu, film, reduced motion passed'},null,2));console.log('PASS: '+results.length+' page/viewport checks; wheel, touch, pagination, language, return, menus, film and reduced motion.');
}finally{await b.close()}
