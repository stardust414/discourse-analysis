/** Offline coverage guard: message keys + reviewed source-literal snapshot. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const ts = require('typescript');
const ROOT = path.resolve(__dirname, '..');
const SNAPSHOT = 'docs/zh-CN/阶段4源码文本审计.json';
const intentionalFallback = ['group.coordinate', 'group.subordinate', 'group.restatement', 'group.distinct', 'group.contrary'];
function filesUnder(dir) {
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? filesUnder(dir + '/' + e.name) : [dir + '/' + e.name]);
}
function sourceFiles() {
  return ['app.js', 'main.js', 'preload.js', 'index.html', 'styles.css', ...filesUnder('js'), ...filesUnder('functions')]
    .filter(f => !f.includes('/vendor/') && !/i18n\/(en|zh-CN)\.js$/.test(f) && /\.(?:js|cjs|html|css)$/.test(f));
}
function catalogs() {
  const s = { window: {} };
  vm.createContext(s);
  for (const lang of ['en', 'zh-CN']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/i18n/' + lang + '.js'), 'utf8'), s);
  return s.window.DA_I18N_CATALOGS;
}
function literals(file, source) {
  const out = [];
  function add(kind, text, start) {
    if (!/[A-Za-z]/.test(text)) return;
    const id = crypto.createHash('sha256').update(file + '\0' + kind + '\0' + text).digest('hex').slice(0, 20);
    out.push({ id, file, line: source.slice(0, start).split('\n').length, kind, text });
  }
  if (/\.(js|cjs)$/.test(file)) {
    const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    function visit(n) {
      if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) add('literal', n.text, n.getStart(tree));
      else if (ts.isTemplateExpression(n)) {
        add('template', n.head.text + n.templateSpans.map(x => '{' + x.expression.getText(tree) + '}' + x.literal.text).join(''), n.getStart(tree));
        n.templateSpans.forEach(x => visit(x.expression));
        return;
      }
      ts.forEachChild(n, visit);
    }
    visit(tree);
  } else if (file.endsWith('.css')) {
    for (const m of source.matchAll(/\bcontent\s*:\s*(['"])(.*?)\1/g)) add('css-content', m[2], m.index);
  } else {
    const html = source.replace(/<!--[^]*?-->/g, m => ' '.repeat(m.length));
    for (const m of html.matchAll(/>\s*([^<>]+?)\s*</g)) add('html-text', m[1], m.index);
    for (const m of html.matchAll(/\b(title|placeholder|aria-label|data-placeholder|data-drop-label)="([^"]*)"/g)) add('html-' + m[1], m[2], m.index);
  }
  return out;
}
function collect() {
  const rows = new Map();
  for (const f of sourceFiles()) for (const r of literals(f, fs.readFileSync(path.join(ROOT, f), 'utf8'))) {
    if (rows.has(r.id)) rows.get(r.id).occurrences++;
    else rows.set(r.id, { ...r, occurrences: 1 });
  }
  return [...rows.values()];
}
function compareSnapshot(actual, expected) {
  const known = new Map(expected.map(x => [x.id, x]));
  return actual.filter(x => !known.has(x.id) || x.occurrences > known.get(x.id).occurrences);
}
function check() {
  const dict = catalogs(), issues = [];
  for (const [key, en] of Object.entries(dict.en)) {
    if (!en || typeof en !== 'string' && !en.other) issues.push('Empty English: ' + key);
    if (!intentionalFallback.includes(key) && !dict['zh-CN'][key]) issues.push('Missing approved Chinese: ' + key);
  }
  const used = new Set();
  for (const f of sourceFiles()) {
    const source = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const m of source.matchAll(/data-i18n(?:-[a-z-]+)?=["']([^"']+)["']/g)) {
      if (!m[1].includes('${') && !m[1].includes(' ') && !['live', 'args'].includes(m[1])) used.add(m[1]);
    }
    for (const m of source.matchAll(/DA_I18N\.(?:t|bindText)\(\s*['"]([^'"]+)['"]/g)) if (!m[1].endsWith('.')) used.add(m[1]);
    // Keys passed through status/binding helpers are still covered.
    for (const r of literals(f, source)) if (r.kind === 'literal' && /^(?:s\.S\d{4}|action\..+)$/.test(r.text)) used.add(r.text);
  }
  for (const k of used) if (!Object.hasOwn(dict.en, k)) issues.push('Unknown key: ' + k);
  const rows = collect();
  if (!fs.existsSync(path.join(ROOT, SNAPSHOT))) issues.push('Source audit snapshot missing');
  else {
    for (const r of compareSnapshot(rows, JSON.parse(fs.readFileSync(path.join(ROOT, SNAPSHOT), 'utf8')).records))
      issues.push('Review new source text: ' + r.file + ':' + r.line + ' ' + r.text.slice(0, 90));
  }
  return { issues, englishKeys: Object.keys(dict.en).length, chineseKeys: Object.keys(dict['zh-CN']).length,
    explicitKeysChecked: used.size, sourceFiles: sourceFiles().length, sourceRecords: rows.length, intentionalFallback };
}
if (require.main === module) {
  if (process.argv.includes('--write-snapshot')) {
    const records = collect().map(r => ({ ...r,
      auditClass: /data-i18n/.test(r.text) || r.kind.startsWith('html-') ? 'A-bound-or-reviewed-html' :
        /constants\.js|profiles\.js/.test(r.file) && !r.text.includes('s.S') ? 'B-D-stable-relationship-profile-data' : 'C-reviewed-code-diagnostic-or-stable-value'
    }));
    fs.writeFileSync(path.join(ROOT, SNAPSHOT), JSON.stringify({ purpose: 'Reviewed literal inventory. New or increased literals require review; see residual-English report for A-F decisions.', records }, null, 2) + '\n');
  }
  const result = check();
  console.log(JSON.stringify(result, null, 2));
  if (result.issues.length) process.exitCode = 1;
}
module.exports = { check, collect, catalogs, compareSnapshot, literals, intentionalFallback };
