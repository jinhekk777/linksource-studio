import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Archived project media remain local and are excluded from build output.
export function publishAssets() {
  return {name: 'publish-current-projects', hooks: {'astro:build:done': async ({dir}) => {
    const root = fileURLToPath(dir);
    const files = await fs.readdir(root, {recursive: true});
    const excluded = files.filter(file => {
      const normalized = file.replaceAll(path.sep, '/');
      return /^images\/(?:panda-|preview-panda\.)/.test(normalized)
        || /^media\/(?:panda(?:-preview)?|taosi-preview)\.mp4$/.test(normalized);
    });
    for (const file of excluded) {
      const target = path.resolve(root, file);
      if (!target.startsWith(path.resolve(root) + path.sep)) throw new Error('Invalid output path');
      await fs.unlink(target);
    }
    await fs.writeFile(path.join(root, '.nojekyll'), '');
  }}};
}
