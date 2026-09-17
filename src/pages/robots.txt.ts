import type { APIRoute } from 'astro';
import { withBase } from '../data/urls';

export const GET: APIRoute = ({ site }) => new Response(
  site
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL(withBase('/sitemap.xml'), site)}\n`
    : 'User-agent: *\nDisallow: /\n',
  { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
);
