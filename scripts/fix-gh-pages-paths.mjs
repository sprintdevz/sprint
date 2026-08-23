/**
 * Fix absolute asset URLs in a static Expo export for GitHub Pages.
 *
 * GitHub Pages serves a project under /<repo>/; Metro emits root-absolute
 * asset URLs (src="/_expo/...") that break on the subpath. This rewrites
 * every generated HTML to use depth-correct RELATIVE paths so the whole app
 * loads from /<repo>/.
 *
 * Usage: node scripts/fix-gh-pages-paths.mjs [distDir]   (default: dist-web)
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.argv[2] ?? 'dist-web';

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith('.html')) rewrite(p);
  }
}

function rewrite(file) {
  const depth = relative(root, file).split(sep).length - 1;
  const ups = '../'.repeat(depth);
  const html = readFileSync(file, 'utf8');
  const next = html.replace(
    /(src|href)="\/([^"]+)"/g,
    (_m, attr, target) => `${attr}="${ups}${target}"`,
  );
  if (next !== html) writeFileSync(file, next);
}

walk(root);
console.log(`Fixed asset paths in dist-web → relative (root-relative URLs rewritten).`);