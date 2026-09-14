import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const root=fileURLToPath(new URL('../',import.meta.url));
const target=path.join(root,'public','media');
await fs.mkdir(target,{recursive:true});
const sources={taosi:'taosi_video.mp4',zhongkui:'zhongkui_xinde.mp4',panda:'panda_video.mp4',bxcz:'bxcz_video.mp4'};
const run=(args)=>new Promise((resolve,reject)=>{const child=spawn(ffmpeg,['-hide_banner','-loglevel','error','-y',...args],{windowsHide:true});child.stderr.on('data',d=>process.stderr.write(d));child.on('exit',code=>code===0?resolve():reject(new Error('FFmpeg exited '+code)));child.on('error',reject);});
for(const [id,file] of Object.entries(sources)){
  const input=path.resolve(root,'../ifnewbee_videos',file);
  const output=path.join(target,id+'.mp4');
  if(process.argv.includes('--preview-only'))continue;
  await run(['-i',input,'-vf','scale=1920:1080:force_original_aspect_ratio=decrease:force_divisible_by=2','-c:v','libx264','-preset','fast','-crf','25','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart',output]);
  console.log(`${id}: ${((await fs.stat(output)).size/1024/1024).toFixed(1)} MB`);
}
const heroInput=path.resolve(root,'../ifnewbee_videos',sources.taosi);
// Blend the last second into the first, then begin at second one. The two
// endpoints now follow the same camera movement instead of a hard loop cut.
const loopFilter='[0:v]trim=duration=12,setpts=PTS-STARTPTS,scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2,fps=24,format=yuv420p,split[main][head];[head]trim=duration=1,setpts=PTS-STARTPTS[first];[main][first]xfade=transition=fade:duration=1:offset=11,trim=start=1,setpts=PTS-STARTPTS[out]';
await run(['-ss','30','-i',heroInput,'-filter_complex',loopFilter,'-map','[out]','-an','-c:v','libx264','-preset','fast','-crf','29','-maxrate','1800k','-bufsize','3600k','-pix_fmt','yuv420p','-movflags','+faststart',path.join(target,'taosi-preview.mp4')]);
for(const width of [480,960,1920])await run(['-ss','31','-i',heroInput,'-frames:v','1','-vf',`scale=${width}:-2`,'-quality','82',path.join(root,'public','images',`hero-poster-${width}.webp`)]);
console.log(`Hero preview: ${((await fs.stat(path.join(target,'taosi-preview.mp4'))).size/1024/1024).toFixed(1)} MB`);
