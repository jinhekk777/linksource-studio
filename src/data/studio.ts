export const site = {
  name: 'LINK SOURCE STUDIO',
  description: 'LINK SOURCE STUDIO，探索沉浸式内容、数字体验与视觉创作。走进我们的作品，发现文化、角色与空间中的新故事。',
  email: null as string | null,
  phone: null as string | null,
  wechat: null as string | null,
};

export const capabilities = [
  { id: 'narrative', number: '01', english: 'STORY & EXPERIENCE', title: '内容与体验策划', short: '找到故事，进入世界。', description: '从文化线索、角色关系与体验主题出发，把内容转化为空间中的旅程。讨论观众的身份、行动与情绪，让每一个场景都有存在的理由。', deliverables: ['主题与内容梳理', '体验路径与章节', '角色与互动设想'], image: 'taosi-1', project: 'taosi', caption: '陶寺：一脉千秋 · 城阙与祭台' },
  { id: 'visual', number: '02', english: 'ART & WORLD BUILDING', title: '视觉与世界构建', short: '让想象，有形可感。', description: '建筑、角色、材质与光影共同定义一个世界的性格。从文化空间的庄重，到微观冒险的轻盈，为不同内容寻找合适的视觉表达。', deliverables: ['视觉方向与风格', '场景与角色表达', '光影与画面氛围'], image: 'zhongkui-2', project: 'zhongkui', caption: '钟馗捉鬼图 · 奇幻殿宇' },
  { id: 'interaction', number: '03', english: 'INTERACTION & SPACE', title: '交互与空间叙事', short: '让参与，推动故事。', description: '将观看、行走、探索与角色交流放在同一条体验路径里。围绕内容讨论交互节点、场景衔接与反馈，让观众的行动与故事彼此关联。', deliverables: ['空间中的叙事节奏', '参与方式与反馈', '场景转换与衔接'], image: 'bxcz-2', project: 'bxcz', caption: '爆笑虫子：梦幻乐园 · 趣味空间' },
];

export const workflow = [
  { number: '01', title: '理解与梳理', english: 'DISCOVER', text: '从内容、受众和使用场景开始，梳理项目需要传达的核心体验。', output: '形成共同的项目目标', image: 'taosi-1' },
  { number: '02', title: '方向与提案', english: 'DEFINE', text: '讨论叙事路径与视觉方向，将想法转化为可以评审的方案。', output: '明确范围与视觉方向', image: 'zhongkui-2' },
  { number: '03', title: '创作与迭代', english: 'CREATE', text: '围绕确认的内容逐步推进，通过阶段呈现核对画面与体验。', output: '在阶段评审中完善作品', image: 'zhongkui-1' },
  { number: '04', title: '整合与交付', english: 'DELIVER', text: '对齐约定的交付内容与使用场景，整理素材、版本和协作信息。', output: '按项目约定完成交付', image: 'bxcz-2' },
];

export const collaborations = [
  { id: 'co-create', number: '01', title: '内容共创', english: 'CO-CREATION', intro: '让文化与 IP，拥有新的体验方式。', text: '如果你拥有一个故事、一组文化线索或鲜明的 IP，可以从内容主题、目标人群与体验场景开始讨论。', topics: ['文化内容与文旅主题', '品牌与角色 IP', '沉浸式体验概念'], project: 'taosi', image: 'taosi-2', linkLabel: '从陶寺的文明叙事开始了解' },
  { id: 'production', number: '02', title: '制作协作', english: 'PRODUCTION', intro: '围绕同一个作品，连接不同专长。', text: '已有明确项目方向时，可以围绕视觉、场景、角色和交互内容讨论制作分工，逐项对齐范围与交付标准。', topics: ['项目视觉与数字场景', '角色与内容表达', '阶段制作与整合协作'], project: 'zhongkui', image: 'zhongkui-2', linkLabel: '探索钟馗的东方奇境' },
  { id: 'spatial', number: '03', title: '场景落地', english: 'SPATIAL EXPERIENCE', intro: '从数字世界，走向真实的体验空间。', text: '围绕文旅、展陈与体验空间，结合场地条件、观众路径和运营需求，讨论内容呈现与实施协作。', topics: ['文旅与文化展陈', '品牌体验空间', '内容与场景适配'], project: 'bxcz', image: 'bxcz-2', linkLabel: '走进爆笑虫子的趣味世界' },
];

export const faqs = [
  { question: '开始沟通前，需要准备哪些信息？', answer: '可以先准备项目背景、目标受众、使用场景，以及已有的内容或视觉资料。如果已经有预算区间与时间安排，也可以一并说明，便于讨论适合的工作范围。' },
  { question: '只有一个想法，还没有完整方案，可以交流吗？', answer: '可以从主题与体验目标开始讨论。已有故事、IP 或场地也都可以成为起点，再逐步明确需要创作的内容与合作方式。' },
  { question: '已有项目，可以围绕其中一个环节合作吗？', answer: '可以围绕具体制作环节展开沟通。需要先对齐已有方案、素材规范、团队分工与预期交付，再确认适合的协作范围。' },
  { question: '如何确定项目周期与交付内容？', answer: '周期与交付取决于内容体量、制作范围、技术要求及评审节奏。明确需求后，再针对具体项目约定阶段、时间与交付标准。' },
];
