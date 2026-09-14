
import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE);
const browser=await chromium.launch({channel:'msedge',headless:true});const rows=[];
try {
for(const [device,width,height]of [['desktop',1440,900],['mobile',390,844],['narrow',320,740]]){
 const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce',hasTouch:width<761,isMobile:width<761});
 for(const locale of ['zh','en'])for(const route of ['studio','collaboration']){
  await page.goto('http://127.0.0.1:4174/'+(locale==='en'?'en/':'')+route+'/');await page.evaluate(()=>document.fonts.ready);
  const data=await page.evaluate(()=>({height:document.documentElement.scrollHeight,nav:[...document.querySelectorAll('.desktop-nav a')].map(a=>a.textContent.trim()),headings:[...document.querySelectorAll('main h1,main h2,main h3')].map(e=>e.textContent),contacts:[...document.querySelectorAll('.contact-grid>div')].map(e=>({top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom})),width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
  assert.equal(data.nav.length,3);assert.ok(data.scrollWidth<=width);if(route==='collaboration')assert.ok(data.contacts.every(c=>c.top>=0&&c.bottom<=height),'Contact placeholders appear on the first screen');
  await page.evaluate(async()=>Promise.all([...document.images].map(i=>i.decode())));
  await page.screenshot({path:'docs/structure-check/'+device+'-'+locale+'-'+route+'.jpg',type:'jpeg',quality:70,fullPage:true});rows.push({device,locale,route,...data});
 }
 await page.close();
}
fs.writeFileSync('docs/structure-check/results.json',JSON.stringify(rows,null,2));console.log('Structure verified: three navigation paths; all contact placeholders visible on the first screen in both locales and all three viewports.');
}finally{await browser.close();}
