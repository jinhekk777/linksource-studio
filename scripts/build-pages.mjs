import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const env = {
  ...process.env,
  PUBLIC_SITE_URL: process.env.PUBLIC_SITE_URL || 'https://linksourcegames.com',
  PUBLIC_BASE_PATH: process.env.PUBLIC_BASE_PATH || '/',
};
for (const args of [['node_modules/astro/bin/astro.mjs', 'build'], ['scripts/verify-build.mjs']]) {
  const result = spawnSync(process.execPath, args, {cwd: root, env, stdio: 'inherit', windowsHide: true});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
