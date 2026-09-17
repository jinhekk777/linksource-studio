import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const base=new URL(process.env.VERIFY_SITE_URL||'https://linksourcegames.com/');
if(!base.pathname.endsWith('/'))base.pathname+='/';
assert.ok(base.protocol==='https:'||['127.0.0.1','localhost'].includes(base.hostname),'Public checks require HTTPS');
const results=[],assets=new Map();
const reportPath=process.env.VERIFY_OUTPUT||'qa/live-check.json';
const absolute=relative=>new URL(relative,base).href;

async function check(label,url,inspect,options={}){
  let failure;
  for(let attempt=0;attempt<3;attempt++){
    let response;
    try{
      response=await fetch(url,{...options,signal:AbortSignal.timeout(20000)});
      const details=await inspect(response);
      results.push({label,url,status:response.status,pass:true,...details});
      return;
    }catch(error){failure=error.message;}
    finally{if(response?.body&&!response.body.locked)await response.body.cancel().catch(()=>{});}
    if(attempt<2)await new Promise(resolve=>setTimeout(resolve,5000));
  }
  results.push({label,url,pass:false,error:failure});
}

await check('robots',absolute('robots.txt'),async response=>{
  assert.equal(response.status,200);
  const text=await response.text();
  assert.ok(text.includes('Sitemap: '+absolute('sitemap.xml')),'Missing sitemap declaration');
  assert.doesNotMatch(text,/Disallow:\s*\//,'Public crawling must be allowed');
});
let pages=[];
await check('sitemap',absolute('sitemap.xml'),async response=>{
  assert.equal(response.status,200);
  const text=await response.text();
  pages=[...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
  assert.ok(pages.length>=8,'Sitemap must include both languages and content pages');
  assert.equal(new Set(pages).size,pages.length,'Duplicate sitemap URL');
  for(const url of pages){
    assert.equal(new URL(url).origin,base.origin,'Unexpected sitemap origin');
    assert.ok(new URL(url).pathname.startsWith(base.pathname),'Unexpected sitemap path');
    assert.doesNotMatch(url,/\/(?:404|expertise)(?:[/.]|$)/,'Error or alias URL in sitemap');
  }
  return {pages:pages.length};
});
for(let i=0;i<pages.length;i+=4)await Promise.all(pages.slice(i,i+4).map(url=>check('content',url,async response=>{
  assert.equal(response.status,200);
  const html=await response.text();
  assert.ok(html.includes('LINK SOURCE STUDIO'),'Unexpected website content');
  assert.ok(html.includes('rel="canonical" href="'+url+'"'),'Incorrect canonical URL');
  assert.ok(html.includes('property="og:url" content="'+url+'"'),'Incorrect share URL');
  assert.doesNotMatch(html,/<meta name="robots" content="[^"]*noindex/,'Content excluded from search');
  assert.doesNotMatch(html,/\b(?:src|poster|data-src)=["']http:\/\//,'Insecure media reference');
  for(const match of html.matchAll(/\b(?:src|poster|data-src|href)="([^"]+\.(?:webp|svg|css|js|mp4))"/g)){
    const asset=new URL(match[1],url);
    if(asset.origin===base.origin)assets.set(asset.href,asset.pathname.endsWith('.mp4')?'video':'asset');
  }
})));
const selected=[...assets].filter(([,kind])=>kind==='video').slice(0,3)
  .concat([...assets].filter(([,kind])=>kind==='asset').slice(0,10));
for(let i=0;i<selected.length;i+=4)await Promise.all(selected.slice(i,i+4).map(([url,kind])=>check(kind,url,async response=>{
  assert.equal(response.status,kind==='video'?206:200);
  if(kind==='video')assert.match(response.headers.get('content-range')||'',/^bytes 0-0\//,'Video byte ranges unavailable');
},{method:kind==='video'?'GET':'HEAD',headers:kind==='video'?{Range:'bytes=0-0'}:{}})));
await check('404',absolute('__health_check_missing__'),async response=>assert.equal(response.status,404));
if(base.origin==='https://linksourcegames.com'){
  for(const url of ['http://linksourcegames.com/','https://www.linksourcegames.com/','http://www.linksourcegames.com/','https://jinhekk777.github.io/linksource-studio/']){
    await check('redirect',url,async response=>{
      assert.ok([301,302,307,308].includes(response.status));
      assert.equal(response.headers.get('location'),base.href,'Incorrect HTTPS or canonical-domain redirect');
    },{redirect:'manual'});
  }
}
const failed=results.filter(result=>!result.pass);
const report={checkedAt:new Date().toISOString(),site:base.href,checks:results.length,passed:results.length-failed.length,results};
await fs.mkdir(path.dirname(reportPath),{recursive:true});
await fs.writeFile(reportPath,JSON.stringify(report,null,2)+'\n');
console.log(`${report.passed}/${report.checks} live checks passed. Report: ${reportPath}`);
for(const result of failed)console.error(`${result.label}: ${result.url}\n${result.error}`);
if(process.env.GITHUB_STEP_SUMMARY){
  await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,`## Website verification\n\n${report.passed}/${report.checks} checks passed for ${base.href}\n\n`+failed.map(result=>`- Failed: ${result.label} — ${result.url}`).join('\n')+'\n');
}
if(failed.length)process.exitCode=1;
