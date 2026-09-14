import {withBase} from './urls';
export type Locale = 'zh' | 'en';
export const choose = (locale: Locale) => <T>(zh: T, en: T): T => locale === 'zh' ? zh : en;
export function localePath(path: string, locale: Locale) {
  if (!path.startsWith('/')) throw new Error(`Expected a site path: ${path}`);
  return withBase(locale === 'en' ? '/en'+path : path);
}
export const ui = {
  zh: { film:'项目影片', watch:'观看项目影片', pause:'暂停动态背景', play:'播放动态背景', playHint:'点击播放器的播放按钮观看影片。', filmError:'影片暂时无法加载，请关闭后重试。', projects:'个项目', previous:'上一个协作阶段', next:'下一个协作阶段', slide:'第 {{index}} 个，共 {{slidesLength}} 个阶段' },
  en: { film:'Project film', watch:'Watch project film', pause:'Pause background', play:'Play background', playHint:'Press play in the video player to watch the film.', filmError:'The film could not be loaded. Please close it and try again.', projects:'projects', previous:'Previous collaboration stage', next:'Next collaboration stage', slide:'Stage {{index}} of {{slidesLength}}' },
} satisfies Record<Locale, Record<string, string>>;
