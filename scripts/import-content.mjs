// One-time migration of the user-provided prototype content; does not modify source files.
import fs from 'node:fs/promises';
import vm from 'node:vm';
const old = new URL('../../linksource-designs/', import.meta.url);
const app = await fs.readFile(new URL('app.js', old), 'utf8');
const projects = vm.runInNewContext(app.slice(app.indexOf('const projects ='), app.indexOf('const requestedPage')) + ';projects');
const stories = vm.runInNewContext(await fs.readFile(new URL('project-stories.js', old), 'utf8') + ';projectStories');
const focus = {
  taosi: [
    { title:'建筑中的文明线索', text:'城阙、祭台与观象空间让抽象的文明主题拥有可以感知的尺度，建筑成为理解故事的入口。' },
    { title:'从日光到星空', text:'日间古城与星空意象呈现不同的空间情绪，将对天地的观察转化为贯穿画面的视觉线索。' },
    { title:'从观看到探索', text:'以场景漫游串联内容，让观众通过观察、移动和互动，逐步建立对世界的认识。' },
  ],
  zhongkui: [
    { title:'传统意象的空间表达', text:'竹林、古道和殿宇承载东方志怪的气质，让熟悉的文化意象形成可以进入的场景。' },
    { title:'光影引导情绪', text:'自然光中的静谧与奇幻空间的浓烈色彩形成变化，随着场景深入，逐步展开鬼境的神秘感。' },
    { title:'角色身份与行动', text:'围绕钟馗的角色身份安排探索与互动，让传说中的人物成为观众理解旅程的视角。' },
  ],
  panda: [
    { title:'角色带来连接', text:'以盼娃儿为旅途中的伙伴，让角色关系成为探索幻想世界的情感起点。' },
    { title:'山水与生活的想象', text:'从开阔山林到充满细节的厨房，不同场景共同构成兼具奇观与生活感的世界。' },
    { title:'把自然主题放进故事', text:'寻找神图与守护家园的主题相互连接，让环保与责任进入一段具体的冒险。' },
  ],
  bxcz: [
    { title:'微观世界的尺度', text:'草木变成巨大的风景，罐头成为水上的小船，以尺度变化重新发现日常事物的趣味。' },
    { title:'鲜明的角色与色彩', text:'小黄与小红的角色形象，在明亮、丰富的自然场景中形成清晰的视觉焦点。' },
    { title:'一起经历的冒险', text:'将观察、探索与协作串联起来，让亲子观众能够共同参与故事中的趣味挑战。' },
  ],
};
await fs.mkdir(new URL('../src/content/projects/', import.meta.url), { recursive:true });
for (const [index,p] of projects.entries()) {
  const s=stories[p.id];
  const record={slug:p.id,order:index+1,title:p.title,name:p.name,subtitle:p.subtitle,english:p.en,category:p.type,group:index<2?'文化叙事':'角色冒险',summary:p.line,headline:s.headline,description:s.summary,image:p.image.replace('.jpg',''),video:p.id,heroLines:s.heroLines,statement:s.statement,accent:['#ddc39a','#eaa57e','#91cbb8','#e8ce83'][index],chapters:s.chapters.map(c=>({...c,image:c.image.replace('.jpg','')})),focus:focus[p.id],credits:[],production:[]};
  await fs.writeFile(new URL(`../src/content/projects/${p.id}.json`, import.meta.url),JSON.stringify(record,null,2)+'\n');
}
console.log('Imported four project records. Missing production facts remain unpublished.');
