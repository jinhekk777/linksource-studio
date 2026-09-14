import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const origin='http://127.0.0.1:4174';
const directory=new URL('../docs/showcase-check/',import.meta.url);
await mkdir(directory,{recursive:true});
const results=[],errors=[];
const capture=async(page,name)=>{
 await page.evaluate(async()=>{
  await Promise.all([...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.width>0;}).map(i=>i.decode()));
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 });
 return page.screenshot({path:new URL(`${name}.png`,directory).pathname.replace(/^\/(.:)/,'$1')});
};
try{
 for(const [name,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}],['narrow',{width:320,height:740}]]){
  const page=await browser.newPage({viewport,reducedMotion:'reduce',isMobile:name!=='desktop',hasTouch:name!=='desktop'});
  page.on('pageerror',error=>errors.push(error.message));
  for(const locale of ['zh','en']){
   await page.goto(origin+(locale==='en'?'/en/':'/'));
   await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('.world-scene').count(),4);
   for(const slug of ['taosi','zhongkui','panda','bxcz']){
    const scene=page.locator(`#world-${slug}`);
    await scene.evaluate(e=>e.scrollIntoView({behavior:'instant',block:'start'}));
    await page.waitForFunction(id=>{const i=document.querySelector(`#world-${id} .scene-picture>img`);return i.complete&&i.naturalWidth>0;},slug);
    const box=await scene.evaluate(e=>{
     const name=e.querySelector('.world-name').getBoundingClientRect(),actions=e.querySelector('.world-actions').getBoundingClientRect(),frame=e.querySelector('.world-scene-media').getBoundingClientRect(),gutter=parseFloat(getComputedStyle(e).getPropertyValue('--gutter'))||parseFloat(getComputedStyle(e.querySelector('.world-scene-media')).left);
     return {frameLeft:frame.left,frameRight:frame.right,gutter,width:e.clientWidth,imageWidth:e.querySelector('img').getBoundingClientRect().width,nameLeft:name.left,nameRight:name.right,actionsRight:actions.right};
    });
    assert.ok(Math.abs(box.frameLeft-box.gutter)<1&&Math.abs(box.frameRight-(viewport.width-box.gutter))<1,'A2 images align to the gallery margins');
    assert.ok(Math.abs(box.imageWidth-(viewport.width-2*box.gutter))<1,'The image fills its gallery frame');
    assert.ok(box.nameLeft>=20&&box.nameRight<=viewport.width-20,'Title fits the scene');
    assert.ok(box.actionsRight<=viewport.width-20,'Film and project actions fit');
    assert.ok(await scene.locator('video').evaluateAll(v=>v.every(e=>!e.getAttribute('src'))),'Reduced motion does not request previews');
    results.push({name,locale,slug,...box});
    await capture(page,`${name}-${locale}-${slug}`);
   }
  }
  await page.goto(origin+'/projects/taosi/');await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>document.querySelector('.case-hero img').complete&&document.querySelector('.case-hero img').naturalWidth>0);
  await capture(page,`${name}-case`);
  await page.locator('#world').evaluate(e=>e.scrollIntoView({behavior:'instant'}));
  await page.waitForFunction(()=>document.querySelector('.chapter-panorama img').complete&&document.querySelector('.chapter-panorama img').naturalWidth>0);
  await capture(page,`${name}-case-chapter`);
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/#world-zhongkui');
 await page.waitForFunction(()=>Math.abs(document.querySelector('#world-zhongkui').getBoundingClientRect().top)<=4);
 await page.waitForFunction(()=>{const v=document.querySelector('#world-zhongkui video');return v.readyState>=2&&!v.paused&&v.currentTime>0;});
 assert.equal(await page.locator('video').evaluateAll(v=>v.filter(e=>!e.paused).length),1);
 await capture(page,'desktop-zhongkui-motion');
 await page.locator('#world-zhongkui [data-scene-toggle]').click();
 await page.waitForFunction(()=>document.querySelector('#world-zhongkui video').paused);
 await page.locator('#world-zhongkui [data-scene-toggle]').click();
 await page.waitForFunction(()=>!document.querySelector('#world-zhongkui video').paused);
 await page.locator('#world-zhongkui [data-film]').click();
 await page.waitForFunction(()=>document.querySelector('#film-video').readyState>=2&&document.querySelector('#world-zhongkui video').paused);
 await page.keyboard.press('Escape');
 await page.waitForFunction(()=>!document.body.classList.contains('has-dialog')&&!document.querySelector('#world-zhongkui video').paused);
 await page.locator('#world-zhongkui .world-enter').click();await page.waitForURL('**/projects/zhongkui/');
 await page.waitForFunction(()=>document.querySelector('.case-opening video').readyState>=2&&!document.querySelector('.case-opening video').paused);
 assert.equal(await page.locator('h1').getAttribute('aria-label'),'钟馗捉鬼图');
 await page.goBack();await page.waitForURL('**/#world-zhongkui');
 await page.waitForFunction(()=>Math.abs(document.querySelector('#world-zhongkui').getBoundingClientRect().top)<4);
 await page.close();
 const touch=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});touch.on('pageerror',e=>errors.push(e.message));
 await touch.goto(origin+'/en/projects/bxcz/');
 assert.equal(await touch.locator('.scene-preview').getAttribute('src'),null);
 await touch.locator('[data-scene-toggle]').click();
 await touch.waitForFunction(()=>document.querySelector('.scene-preview').currentTime>0);
 await touch.getByRole('button',{name:'Open navigation',exact:true}).click();
 await touch.waitForFunction(()=>document.querySelector('.scene-preview').paused);
 await touch.keyboard.press('Escape');await touch.waitForFunction(()=>!document.body.classList.contains('has-dialog'));
 await touch.close();
 assert.deepEqual(errors,[]);
 await writeFile(new URL('results.json',directory),JSON.stringify({results,errors,interactions:['four framed scenes','24 scene layouts','visible scene playback','pause/resume','film pause/resume','project navigation and back position','touch opt-in preview','mobile menu pause']},null,2));
 console.log(`Showcase verified: ${results.length} scene layouts, lazy imagery, motion preferences, previews, dialogs and return navigation.`);
}finally{await browser.close();}
