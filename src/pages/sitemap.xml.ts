import type { APIRoute } from 'astro';
import { getVisibleProjects } from '../data/project-catalog';
import { localePath } from '../data/i18n';

const xml = (value: string) => value.replace(/[<>&"']/g, char => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
})[char]!);

export const GET: APIRoute = async ({ site }) => {
  const paths = ['/', '/projects/', '/studio/', '/collaboration/',
    ...(await getVisibleProjects()).map(project => `/projects/${project.data.slug}/`)];
  // A local preview must not advertise localhost URLs to search engines.
  const entries = site ? paths.flatMap(path => {
    const zh = xml(new URL(localePath(path, 'zh'), site).href);
    const en = xml(new URL(localePath(path, 'en'), site).href);
    return [zh, en].map(url => `  <url>\n    <loc>${url}</loc>\n    <xhtml:link rel="alternate" hreflang="zh-CN" href="${zh}"/>\n    <xhtml:link rel="alternate" hreflang="en" href="${en}"/>\n    <xhtml:link rel="alternate" hreflang="x-default" href="${zh}"/>\n  </url>`);
  }).join('\n') : '';
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
