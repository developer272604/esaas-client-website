import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const output = 'out';
const assets = join(output, 'inline-scripts');
await mkdir(assets, { recursive: true });

for (const entry of await readdir(output, { withFileTypes: true, recursive: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
  const path = join(entry.parentPath, entry.name);
  const html = await readFile(path, 'utf8');
  const scripts = new Map();
  const updated = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (tag, attrs, code) => {
    if (/\bsrc\s*=|\btype\s*=\s*["']application\/ld\+json["']/i.test(attrs) || !code.trim()) return tag;
    const name = createHash('sha256').update(code).digest('hex') + '.js';
    scripts.set(name, code);
    return `<script${attrs} src="/inline-scripts/${name}"></script>`;
  });
  await Promise.all([...scripts].map(([name, code]) => writeFile(join(assets, name), code)));
  if (updated !== html) await writeFile(path, updated);
}
