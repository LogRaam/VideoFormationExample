// Inventory of the animation sources (video/src), read from TypeScript syntax
// trees with the compiler API (no build needed). Prints Markdown on stdout.
// Blind spots: members of exported objects (e.g. the cue table Q) are not listed
// one by one; default exports and re-exports are not handled (none are used).
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const require = createRequire(path.join(root, 'video', 'package.json'));
const ts = require('typescript');

const srcDir = path.join(root, 'video', 'src');

const walk = (d) =>
  fs
    .readdirSync(d, {withFileTypes: true})
    .flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : /\.(ts|tsx)$/.test(e.name) ? [path.join(d, e.name)] : []))
    .sort();

const firstLine = (s) => (s || '').split(/\r?\n/).map((l) => l.trim()).find((l) => l.length > 0) || '';
const cell = (s) => s.replace(/\|/g, '\\|');
const BLANK_LINE = new RegExp('\\n[ \\t]*\\r?\\n');

// A doc comment belongs to a declaration only if it touches it (no blank line
// between). The compiler API attaches a JSDoc across blank lines, so a file's
// header comment would otherwise be reported as the doc of its first declaration.
const docOf = (node, sf) => {
  const docs = ts.getJSDocCommentsAndTags(node).filter((d) => d.kind === ts.SyntaxKind.JSDoc);
  if (!docs.length) return '';
  const last = docs[docs.length - 1];
  const between = sf.text.slice(last.end, node.getStart(sf));
  if (BLANK_LINE.test(between)) return '';
  const c = last.comment;
  return firstLine(typeof c === 'string' ? c : (c || []).map((x) => x.text).join(''));
};

const isExported = (node) => (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;

const kindOf = (node, init) => {
  if (ts.isFunctionDeclaration(node)) return 'function';
  if (ts.isTypeAliasDeclaration(node)) return 'type';
  if (ts.isInterfaceDeclaration(node)) return 'interface';
  if (ts.isClassDeclaration(node)) return 'class';
  if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) return 'function';
  if (init && ts.isObjectLiteralExpression(init)) return 'object';
  if (init && ts.isArrayLiteralExpression(init)) return 'array';
  return 'const';
};

const out = ['## Animation sources (`video/src`)', ''];
for (const file of walk(srcDir)) {
  const rel = path.relative(root, file).split(path.sep).join('/');
  const text = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const rows = [];
  for (const st of sf.statements) {
    if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        if (!ts.isIdentifier(d.name)) continue;
        rows.push({name: d.name.text, kind: kindOf(st, d.initializer), exp: isExported(st), doc: docOf(st, sf)});
      }
    } else if ((ts.isFunctionDeclaration(st) || ts.isTypeAliasDeclaration(st) || ts.isInterfaceDeclaration(st) || ts.isClassDeclaration(st)) && st.name) {
      rows.push({name: st.name.text, kind: kindOf(st), exp: isExported(st), doc: docOf(st, sf)});
    }
  }
  out.push(`### ${rel}`, '');
  if (!rows.length) {
    out.push('_(no top-level declarations)_', '');
    continue;
  }
  out.push('| name | kind | exported | doc |', '|---|---|---|---|');
  for (const r of rows) out.push(`| \`${r.name}\` | ${r.kind} | ${r.exp ? 'yes' : ''} | ${cell(r.doc)} |`);
  out.push('');
}
process.stdout.write(out.join('\n'));
