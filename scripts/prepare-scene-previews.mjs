import {spawn} from 'node:child_process';
import {stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import ffmpeg from 'ffmpeg-static';
const media=fileURLToPath(new URL('../public/media/',import.meta.url));
// Selected after reviewing local film frames. Crop only Larva's letterbox bars.
const scenes=[
  {id:'panda',start:0,duration:7,fps:30,output:'panda-preview',crop:''},
  {id:'taosi',start:18,duration:11,fps:30,output:'taosi-world-preview',crop:''},
  {id:'zhongkui',start:1,duration:10,fps:25,output:'zhongkui-preview',crop:''},
  {id:'bxcz',start:16,duration:8,fps:30,output:'bxcz-preview',crop:'crop=iw:ih*0.78:0:ih*0.11,'},
];
const selected=process.argv.slice(2);
for(const scene of scenes.filter(s=>!selected.length||selected.includes(s.id))){
  const {id,start,duration,fps,output,crop}=scene;
  const filter=`[0:v]trim=duration=${duration},setpts=PTS-STARTPTS,${crop}scale=1280:-2,fps=${fps},format=yuv420p,split[main][head];[head]trim=duration=1,setpts=PTS-STARTPTS[first];[main][first]xfade=transition=fade:duration=1:offset=${duration-1},trim=start=1,setpts=PTS-STARTPTS[out]`;
  await new Promise((resolve,reject)=>{
    const process=spawn(ffmpeg,['-hide_banner','-loglevel','error','-ss',String(start),'-i',`${media}${id}.mp4`,'-filter_complex',filter,'-map','[out]','-an','-c:v','libx264','-preset','fast','-crf','28','-maxrate','1800k','-bufsize','3600k','-movflags','+faststart','-y',`${media}${output}.mp4`],{windowsHide:true});
    process.stderr.on('data',data=>globalThis.process.stderr.write(data));
    process.on('error',reject);process.on('exit',code=>code===0?resolve():reject(new Error(`FFmpeg: ${code}`)));
  });
  await new Promise((resolve,reject)=>{
    const process=spawn(ffmpeg,['-hide_banner','-loglevel','error','-i',media+output+'.mp4','-frames:v','1','-c:v','libwebp','-quality','86','-y',fileURLToPath(new URL('../public/images/preview-'+id+'.webp',import.meta.url))],{windowsHide:true});
    process.on('error',reject);process.on('exit',code=>code===0?resolve():reject(new Error('Poster frame: '+code)));
  });
  console.log(`${output}: ${(await stat(`${media}${output}.mp4`)).size} bytes`);
}
