
import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const{chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base='http://127.0.0.1:4174',out='docs/polish-check';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});const errors=[],records=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>errors.push(e.message));
 for(const lang of ['','/en']){
  await page.goto(base+lang+'/projects/zhongkui/');
  const seen=new Set();
  for(let i=0;i<4;i++){
   seen.add(new URL(page.url()).pathname);
   if(page.url().endsWith('/projects/mecha/')){assert.equal(await page.locator('[data-film]').count(),0);assert.equal(await page.locator('.info-bar').count(),0);assert.ok(await page.locator('.project-preview-note').isVisible())}else{assert.ok((await page.locator('.info-bar').innerText()).includes(lang?'Full-cycle production':'全流程制作'));assert.equal(await page.locator('.focus-grid>div').count(),3)}
   assert.ok(await page.locator('.desktop-nav').isVisible());
   const url=await page.locator('.next-project').getAttribute('href');
   await page.locator('.next-project').click();await page.waitForURL(base+url);
  }
  assert.equal(seen.size,4,'Next project must visit all four projects');
  assert.ok(page.url().endsWith(lang+'/projects/zhongkui/'));
 }
 await page.goto(base+'/projects/zhongkui/');
 await page.evaluate(()=>scrollTo({top:1300,behavior:'instant'}));await page.waitForTimeout(300);
 assert.ok(await page.locator('.site-header').evaluate(e=>e.classList.contains('is-scrolled')));
 await page.screenshot({path:out+'/desktop-project-body.jpg',type:'jpeg',quality:80});
 await page.locator('.dropdown-toggle').hover();await page.locator('.all-projects').click();await page.waitForURL(base+'/projects/');
 await page.evaluate(()=>document.fonts.ready);
 records.push({worksHeight:await page.evaluate(()=>document.documentElement.scrollHeight)});
 await page.screenshot({path:out+'/desktop-work.jpg',type:'jpeg',quality:80});
 await page.goto(base+'/');await page.waitForTimeout(900);
 for(const index of [1,2,3,1,2]){await page.locator('[data-slide="'+index+'"]').click();await page.waitForTimeout(100)}
 await page.waitForFunction(()=>Math.abs(document.querySelector('#world-taosi').getBoundingClientRect().top)<2);
 assert.equal(await page.locator('.home-showcase').getAttribute('data-active-project'),'taosi','Latest project anchor must determine the final position');
 assert.equal(await page.locator('.home-project:not([inert])').count(),4);
 assert.ok(await page.locator('[data-home-video]').evaluateAll(v=>v.filter(x=>!x.paused).length<=1));
 await page.waitForFunction(()=>document.querySelector('.home-project.is-current .home-video')?.classList.contains('is-ready'));
 assert.equal(await page.locator('.home-project.is-current video').getAttribute('src'),'/media/taosi-world-preview.mp4');
 await page.screenshot({path:out+'/desktop-taosi.jpg',type:'jpeg',quality:80});
 await page.goto(base+'/');await page.waitForTimeout(1000);await page.screenshot({path:out+'/desktop-home.jpg',type:'jpeg',quality:80});
 for(const [width,height]of [[390,844],[320,640],[844,390]]){
  await page.setViewportSize({width,height});
  for(const lang of ['','/en']){
   await page.goto(base+lang+'/');await page.evaluate(()=>document.fonts.ready);
   for(const index of [0,1,2,3]){
    await page.locator('[data-slide="'+index+'"]').click();await page.waitForFunction(index=>Math.abs(document.querySelectorAll('.home-project')[index].getBoundingClientRect().top)<2,index);await page.waitForTimeout(150);
    const r=await page.evaluate(()=>{
     const s=document.querySelector('.home-project.is-current'),panel=s.querySelector('.home-project-frame').getBoundingClientRect(),c=s.querySelector('.slide-content').getBoundingClientRect(),b=s.querySelector('.btn-explore').getBoundingClientRect(),h=document.querySelector('.site-header').getBoundingClientRect();
     return {width:innerWidth,height:innerHeight,lang:document.documentElement.lang,slug:s.dataset.project,contentTop:c.top,contentBottom:c.bottom,contentRight:c.right,panelTop:panel.top,panelBottom:panel.bottom,buttonBottom:b.bottom,buttonTop:b.top,buttonLeft:b.left,headerBottom:h.bottom,overflow:document.documentElement.scrollWidth>innerWidth};
    });
    assert.ok(!r.overflow&&r.contentTop>=r.headerBottom,r.slug+' title must clear navigation');
    assert.ok(r.contentBottom<=r.panelBottom&&r.buttonBottom<=r.panelBottom,r.slug+' content must fit its scrollable section');
    assert.ok(r.contentBottom<=r.buttonTop||r.contentRight<=r.buttonLeft,r.slug+' title/CTA must not overlap');
    records.push(r);
    if(width===390&&index===2)await page.screenshot({path:out+'/mobile-taosi'+(lang?'-en':'')+'.jpg',type:'jpeg',quality:80});
   }
  }
 }
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'/projects/zhongkui/');await page.evaluate(()=>scrollTo({top:1250,behavior:'instant'}));await page.waitForTimeout(300);
 await page.screenshot({path:out+'/mobile-project-body.jpg',type:'jpeg',quality:80});
 const failed=await browser.newPage({viewport:{width:390,height:844}});
 await failed.route('**/media/*.mp4',r=>r.abort());await failed.goto(base+'/#world-zhongkui');await failed.waitForTimeout(1000);
 assert.equal(await failed.locator('.home-project.is-current .home-poster').evaluate(e=>getComputedStyle(e).opacity),'1','Failed video keeps poster');
 assert.equal(await failed.locator('[data-background-toggle]').getAttribute('aria-pressed'),'false');
 assert.deepEqual(errors,[]);
 fs.writeFileSync(out+'/results.json',JSON.stringify({records,errors},null,2));
 console.log('PASS: project cycles in both languages, roles, header navigation, rapid transitions, 24 mobile/landscape project states, video failure fallback.');
 console.log(JSON.stringify(records[0]));
}finally{await browser.close()}
