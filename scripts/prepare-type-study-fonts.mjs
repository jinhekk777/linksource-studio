import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const base=fileURLToPath(new URL('../../linksource-type-study/',import.meta.url));
await mkdir(`${base}fonts`,{recursive:true});
const html=(await Promise.all((await readdir(base)).filter(x=>x.endsWith('.html')).map(x=>readFile(`${base}${x}`,'utf8')))).join('');
const chars=[...new Set(html)].sort().join('');
const families=[{query:'Noto Sans SC',name:'Study Sans',file:'noto-sans-sc',text:chars,license:'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/OFL.txt'},{query:'Space Grotesk',name:'Study Grotesk',file:'space-grotesk',text:[...chars].filter(c=>c.codePointAt(0)<0x0250).join(''),license:'https://raw.githubusercontent.com/floriankarsten/space-grotesk/master/OFL.txt'}];
let output='/* Locally served study subsets. Font licenses are included in ./fonts/. */\n';
for(const f of families){
 const request=new URL('https://fonts.googleapis.com/css2');request.searchParams.set('family',`${f.query}:wght@400..600`);request.searchParams.set('display','swap');request.searchParams.set('text',f.text);
 const response=await fetch(request,{headers:{'User-Agent':'Mozilla/5.0 Chrome/131.0.0.0 Safari/537.36'}});if(!response.ok)throw new Error(`Font CSS: ${response.status}`);
 let css=await response.text();
 const urls=[...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(x=>x[1]))];if(!urls.length)throw new Error('Missing font URLs');
 for(let i=0;i<urls.length;i++){
  const asset=await fetch(urls[i]);if(!asset.ok)throw new Error(`Font download: ${asset.status}`);const bytes=Buffer.from(await asset.arrayBuffer());const signature=bytes.subarray(0,4).toString();const ext=signature==='wOF2'?'woff2':signature==='wOFF'?'woff':'ttf';const name=`${f.file}-${i}.${ext}`;await writeFile(`${base}fonts/${name}`,bytes);css=css.replaceAll(urls[i],`./fonts/${name}`);console.log(name,bytes.length,'bytes');
 }
 css=css.replaceAll(`'${f.query}'`,`'${f.name}'`);output+=css+'\n';
 const license=await fetch(f.license);if(!license.ok)throw new Error('Missing license');await writeFile(`${base}fonts/${f.file}-OFL.txt`,await license.text());
}
await writeFile(`${base}fonts.css`,output);
