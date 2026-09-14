import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../dist/',import.meta.url));
const base=(process.env.PUBLIC_BASE_PATH||'/').replace(/\/$/,'');
const stripBase=p=>{assert.ok(!base||p.startsWith(base+'/'), 'Missing deployment prefix: '+p);return base?p.slice(base.length):p};
const files=await fs.readdir(root,{recursive:true});
assert.ok(!files.some(f=>/(?:^|[\\/])(?:panda|preview-panda)/.test(f)),'Retired media are excluded from published output');
await fs.access(path.join(root,'.nojekyll'));
const pages=files.filter(f=>f.endsWith('.html'));
assert.equal(pages.length,20,'Eight content pages, one legacy alias and a 404 in each language');
let links=0,assets=0;
const coverage=JSON.parse(await fs.readFile(path.join(root,'fonts/coverage.json'),'utf8'));
const chineseGlyphs=new Set([...coverage.chinese]);
const pageCache=new Map();
for(const file of pages)pageCache.set(file,await fs.readFile(path.join(root,file),'utf8'));
for(const [file,html] of pageCache){
  const redirect=html.match(/data-redirect="([^"]+)"/);
  if(redirect){
    const url=new URL(redirect[1],'http://preview.local'),target=path.join(root,stripBase(url.pathname).slice(1)+'index.html');
    const destination=await fs.readFile(target,"utf8");assert.ok(destination.includes('id="'+url.hash.slice(1)+'"'),file+": valid alias destination");
    assert.match(html,/<meta http-equiv="refresh"/);continue;
  }

  assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,`${file}: one main heading`);
  const english=file.replaceAll(path.sep,'/').startsWith('en/');
  const visibleText=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<[^>]+>/g,'');
  const missing=[...new Set([...visibleText].filter(c=>/[\u3400-\u9fff]/.test(c)&&!chineseGlyphs.has(c)))];
  assert.deepEqual(missing,[],file+': local Chinese font coverage');
  assert.match(html,new RegExp(`<html[^>]+lang="${english?'en':'zh-CN'}"`),`${file}: document language`);
  assert.match(html,/<meta name="description" content="[^"]+"/,`${file}: page description`);
  assert.doesNotMatch(html,/3489825746|2138550689|166-0800-7168|灵刻起元/,`${file}: retired contact information and studio name`);
  assert.doesNotMatch(html,/山神熊猫|Mountain Panda|(?:href|src)="[^"]*panda/,file+': removed project must not be publicly presented');
  const current='/'+file.replaceAll(path.sep,'/').replace(/index\.html$/,'');
  const counterpart=english?(current==='/en/404/'?'/404.html':current.replace(/^\/en/,'')):(current==='/404.html'?'/en/404/':'/en'+current);
  const languageLinks=[...html.matchAll(/<a\b[^>]*class="[^"]*language-switch[^"]*"[^>]*href="([^"]+)"/g)];
  assert.ok(languageLinks.length>=1,`${file}: visible language switches`);
  for(const link of languageLinks)assert.equal(link[1],base+counterpart,`${file}: language switch preserves page/project`);
  if(english){
    const visible=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<[^>]+>/g,'');
    assert.doesNotMatch(visible.replaceAll('中文','').replaceAll('切换为',''),/[\u3400-\u9fff]/,`${file}: English visible content is localized`);
  }
  for(const match of html.matchAll(/\b(href|src|poster|data-src|data-poster|data-fallback)="([^"]+)"/g)){
    const value=match[2].replaceAll('&amp;','&');
    if(/^(?:mailto:|tel:|data:|https?:)/.test(value)||!value)continue;
    const url=new URL(value,'http://preview.local'+base+current);
    const relative=decodeURIComponent(stripBase(url.pathname)).slice(1);
    const target=path.join(root,!relative||relative.endsWith('/')?relative+'index.html':relative);
    await fs.access(target).catch(()=>{throw new Error(`${file}: broken ${match[1]} ${value}`);});
    if(match[1]==='href'){
      links++;
      if(url.hash){const destination=await fs.readFile(target,'utf8');assert.ok(destination.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),`${file}: missing fragment ${value}`);}
    }else assets++;
  }
  assert.doesNotMatch(html,/https?:\/\/ifnewbee\.top/,file+': no legacy HTTP image dependency');
  for(const value of [...html.matchAll(/srcset="([^"]+)"/g)].flatMap(m=>m[1].split(',').map(v=>v.trim().split(/\s+/)[0]))) {
    const url=new URL(value,'http://preview.local'+base+current);
    await fs.access(path.join(root,stripBase(url.pathname).slice(1)));
  }
  for(const match of html.matchAll(/data-film="([^"]+)"/g))await fs.access(path.join(root,'media',match[1]+'.mp4'));
}
console.log('Verified '+pages.length+' pages, '+links+' local links and '+assets+' media/script references.');
console.log('Both locales, reciprocal language links and complete English content verified. Retired contacts are absent.');

for(const file of files.filter(f=>f.endsWith('.css')||f.endsWith('.html'))) {
  const text=await fs.readFile(path.join(root,file),'utf8');
  const current=base+'/'+file.replaceAll(path.sep,'/');
  for(const m of text.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)) {
    if(/^(?:data:|https?:|#)/.test(m[1]))continue;
    const url=new URL(m[1],'http://preview.local'+current);
    await fs.access(path.join(root,stripBase(url.pathname).slice(1)));
  }
}
console.log('Responsive images, CSS fonts/cursors and deployment prefix verified: '+(base||'/'));
