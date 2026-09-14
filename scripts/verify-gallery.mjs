import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const directory=new URL('../docs/gallery-check/',import.meta.url);await mkdir(directory,{recursive:true});
const origin='http://127.0.0.1:4174',results=[],errors=[],fonts=[];
try{
 for(const [device,width,height]of [['desktop',1440,900],['compact',1280,800],['tablet',1024,768],['mobile',390,844],['narrow',320,740]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce',isMobile:width<761,hasTouch:width<761});page.on('pageerror',e=>errors.push(e.message));
  for(const locale of ['zh','en'])for(const scene of ['home','world','reading']){
   const base=locale==='en'?'/en':'';await page.goto(origin+base+(scene==='reading'?'/projects/zhongkui/':'/'));await page.evaluate(()=>document.fonts.ready);
   const selector=scene==='home'?'.home-opening':scene==='world'?'#world-zhongkui':'#overview';
   await page.locator(selector).evaluate(e=>e.scrollIntoView({behavior:'instant'}));
   await page.evaluate(async()=>{await Promise.all([...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight}).map(i=>i.decode()));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
   const item=await page.evaluate(scene=>{
    const heading=document.querySelector(scene==='home'?'.home-opening .world-name':scene==='world'?'#world-zhongkui .world-name':'.case-introduction h2');
    const range=document.createRange();range.selectNodeContents(heading);const t=range.getBoundingClientRect();
    const body=document.querySelector(scene==='home'?'.home-opening .world-bottom':scene==='world'?'#world-zhongkui .world-bottom':'.case-introduction>p').getBoundingClientRect();
    const footer=null;
    return {overflow:document.documentElement.scrollWidth>innerWidth,size:parseFloat(getComputedStyle(heading).fontSize),font:getComputedStyle(heading).fontFamily,title:{left:t.left,right:t.right,top:t.top,bottom:t.bottom},body:{left:body.left,right:body.right,top:body.top,bottom:body.bottom},footerTop:footer?.top};
   },scene);
   const id=device+'/'+locale+'/'+scene,t=item.title,b=item.body;
   assert.equal(item.overflow,false,id+' overflow');assert.ok(t.left>=18&&t.right<=width-18,id+' title width');assert.ok(b.left>=18&&b.right<=width-18,id+' body width');
   assert.ok(t.right<=b.left||b.right<=t.left||t.bottom<=b.top||b.bottom<=t.top,id+' title/body overlap');
   if(item.footerTop!==undefined)assert.ok(b.bottom<=item.footerTop-5,id+' description collides with footer');
   if(device==='desktop'&&locale==='zh'&&scene==='reading')assert.ok(Math.abs(item.size-54)<.1,'Approved A2 chapter title size');
   if(device==='desktop'&&locale==='en'&&scene==='home'){
    const c=await page.context().newCDPSession(page);await c.send('DOM.enable');await c.send('CSS.enable');const {root}=await c.send('DOM.getDocument');const {nodeId}=await c.send('DOM.querySelector',{nodeId:root.nodeId,selector:'.home-opening .world-name'});const actual=await c.send('CSS.getPlatformFontsForNode',{nodeId});assert.ok(actual.fonts.every(f=>f.isCustomFont&&f.familyName.includes('Manrope')));fonts.push(actual);await c.detach();
   }
   if(['desktop','mobile','narrow'].includes(device))await page.screenshot({path:new URL(device+'-'+locale+'-'+scene+'.jpg',directory).pathname.replace(/^\/(.:)/,'$1'),type:'jpeg',quality:65});
   results.push({id,...item});
  }
  await page.close();
 }
 const motion=await browser.newPage({viewport:{width:1440,height:900}});motion.on('pageerror',e=>errors.push(e.message));
 await motion.goto(origin+'/#world-zhongkui');
 await motion.waitForFunction(()=>Math.abs(document.querySelector('#world-zhongkui').getBoundingClientRect().top)<=4);
 await motion.waitForFunction(()=>document.querySelector('#world-zhongkui video').currentTime>0);
 const coverage=await motion.evaluate(async()=>{
  const samples=[];for(let n=0;n<35;n++){await new Promise(r=>requestAnimationFrame(r));const scene=document.querySelector('#world-zhongkui'),f=scene.querySelector('.scene-picture').getBoundingClientRect();for(const media of scene.querySelectorAll('.scene-picture>img,.scene-picture>video')){const m=media.getBoundingClientRect();samples.push({left:f.left-m.left,top:f.top-m.top,right:m.right-f.right,bottom:m.bottom-f.bottom});}}return samples;
 });
 assert.ok(coverage.every(s=>Object.values(s).every(n=>n>=-.1)),'Both image and video cover all four frame edges');
 const sampling=motion.evaluate(async()=>{const rows=[];for(let n=0;n<60;n++){await new Promise(r=>requestAnimationFrame(r));const scene=document.querySelector('#world-zhongkui'),f=scene.querySelector('.scene-picture').getBoundingClientRect(),m=scene.querySelector('img').getBoundingClientRect();rows.push({left:f.left-m.left,top:f.top-m.top,right:m.right-f.right,bottom:m.bottom-f.bottom});}return rows;});
 await motion.mouse.wheel(0,400);const scrollingCoverage=await sampling;assert.ok(scrollingCoverage.every(s=>Object.values(s).every(n=>n>=-.1)),'Scrolling keeps media inside the fixed frame without empty edges');
 await motion.close();assert.deepEqual(errors,[]);await writeFile(new URL('results.json',directory),JSON.stringify({results,fonts,errors,mediaCoverageSamples:coverage.length+scrollingCoverage.length},null,2));
 console.log('Gallery verified: '+results.length+' composition checks, real Manrope rendering and frame coverage during scrolling.');
}finally{await browser.close();}
