#!/usr/bin/env node
/**
 * Dependency-free checks for this static site.
 *
 * - HTML tag balance (ignores comments, <script> and <style> bodies)
 * - local href/src targets and in-page anchors exist
 * - JavaScript syntax (through vm.Script, no child processes)
 * - relative markdown links exist
 * - CSS url() targets exist
 *
 * Usage: node scripts/check.mjs
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

const SKIP_DIRECTORIES = new Set(['.git', 'node_modules']);

const errors = [];

function walk(directory) {
  const found = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (SKIP_DIRECTORIES.has(entry.name)) continue;
    const full = join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...walk(full));
    } else {
      found.push(full);
    }
  }
  return found;
}

function rel(fullPath) {
  return relative(ROOT, fullPath).split('\\').join('/');
}

function safeDecode(value) {
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
}

const files = walk(ROOT).map(rel);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const jsFiles = files.filter((file) => file.endsWith('.js'));
const cssFiles = files.filter((file) => file.endsWith('.css'));
const markdownFiles = files.filter((file) => file.endsWith('.md'));

if (existsSync(join(ROOT, 'node_modules'))) {
  errors.push('node_modules/ exists — dependencies must not be committed.');
}

/* HTML structure ---------------------------------------------------------- */

const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/g;

function checkHtml(file) {
  const source = readFileSync(join(ROOT, file), 'utf8');
  const stripped = source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>')
    .replace(/(<style\b[^>]*>)[\s\S]*?<\/style>/gi, '$1</style>');

  const stack = [];
  TAG.lastIndex = 0;
  let match;
  while ((match = TAG.exec(stripped)) !== null) {
    const closing = match[1] === '/';
    const name = match[2].toLowerCase();
    const attributes = match[3] || '';

    if (VOID_ELEMENTS.has(name)) continue;
    if (!closing && /\/\s*$/.test(attributes)) continue;

    if (closing) {
      const expected = stack.pop();
      if (expected !== name) {
        errors.push(`${file}: </${name}> does not match <${expected ?? 'nothing'}>`);
      }
    } else {
      stack.push(name);
    }
  }

  if (stack.length > 0) {
    errors.push(`${file}: unclosed <${stack[stack.length - 1]}>`);
  }
}

/* Local links, assets and anchors ----------------------------------------- */

const HREF_OR_SRC = /\b(?:href|src)\s*=\s*"([^"]+)"/gi;
const ID = /\bid\s*=\s*"([^"]+)"/g;
const ANCHOR = /href\s*=\s*"#([^"]+)"/g;

function checkHtmlLinks(file) {
  const source = readFileSync(join(ROOT, file), 'utf8');
  const base = dirname(join(ROOT, file));
  const ids = new Set([...source.matchAll(ID)].map((match) => match[1]));

  HREF_OR_SRC.lastIndex = 0;
  let match;
  while ((match = HREF_OR_SRC.exec(source)) !== null) {
    const value = match[1].trim();
    if (!value) continue;
    if (value.startsWith('#') || value.startsWith('//')) continue;
    if (/^[a-z][a-z0-9+.-]*:/i.test(value)) continue; // http:, mailto:, data: …
    if (value.startsWith('/')) continue; // resolved by the deployed site

    const path = safeDecode(value.split(/[?#]/)[0]);
    if (!path) continue;

    if (!existsSync(resolve(base, path))) {
      errors.push(`${file}: missing local target "${value}"`);
    }
  }

  for (const anchor of source.matchAll(ANCHOR)) {
    if (!ids.has(anchor[1])) {
      errors.push(`${file}: missing in-page anchor "#${anchor[1]}"`);
    }
  }
}

/* JavaScript syntax -------------------------------------------------------- */

function checkJavaScript(file) {
  try {
    new vm.Script(readFileSync(join(ROOT, file), 'utf8'), { filename: file });
  } catch (error) {
    errors.push(`${file}: JavaScript syntax error — ${error.message}`);
  }
}

/* Markdown links ----------------------------------------------------------- */

const MARKDOWN_LINK = /\]\(([^)]+)\)/g;

function checkMarkdown(file) {
  const source = readFileSync(join(ROOT, file), 'utf8');
  const base = dirname(join(ROOT, file));

  for (const match of source.matchAll(MARKDOWN_LINK)) {
    let target = match[1].trim();
    if (target.startsWith('<') && target.endsWith('>')) {
      target = target.slice(1, -1).trim();
    }
    if (!target || target.startsWith('#')) continue;
    if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue;

    const path = safeDecode(target.split(/[?#]/)[0]);
    if (!path) continue;

    if (!existsSync(resolve(base, path))) {
      errors.push(`${file}: missing markdown target "${match[1]}"`);
    }
  }
}

/* CSS assets --------------------------------------------------------------- */

const CSS_URL = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;

function checkCss(file) {
  const source = readFileSync(join(ROOT, file), 'utf8');
  const base = dirname(join(ROOT, file));

  for (const match of source.matchAll(CSS_URL)) {
    const value = match[2].trim();
    if (!value || value.startsWith('data:') || value.startsWith('//')) continue;
    if (/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(value)) continue;

    const path = safeDecode(value.split(/[?#]/)[0]);
    if (path && !existsSync(resolve(base, path))) {
      errors.push(`${file}: missing CSS asset "${value}"`);
    }
  }
}

htmlFiles.forEach((file) => {
  checkHtml(file);
  checkHtmlLinks(file);
});
jsFiles.forEach(checkJavaScript);
cssFiles.forEach(checkCss);
markdownFiles.forEach(checkMarkdown);

if (htmlFiles.length === 0) {
  errors.push('No HTML files found — is this the right directory?');
}

if (errors.length > 0) {
  console.error(`\n${errors.length} problem${errors.length === 1 ? '' : 's'} found:\n`);
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log(
  `OK — ${htmlFiles.length} HTML, ${jsFiles.length} JS, ${cssFiles.length} CSS and ` +
  `${markdownFiles.length} markdown files checked.`
);
