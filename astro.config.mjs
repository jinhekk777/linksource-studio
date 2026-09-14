import { defineConfig } from 'astro/config';
import {publishAssets} from './scripts/publish-assets.mjs';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || undefined,
  base: process.env.PUBLIC_BASE_PATH || '/',
  integrations: [publishAssets()],
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
