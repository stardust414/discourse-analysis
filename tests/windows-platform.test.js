const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createSandbox, load } = require('./helpers/harness');
const { createNativeMenuTranslator } = require('../js/i18n/native-menu.cjs');
function setup() { const s = createSandbox(); load(s, 'js/services/state.js'); load(s, 'js/services/persistence.js'); return s; }
test('platform logic: all Windows filename metacharacters and ASCII controls are removed', () => {
  const s = setup(); const value = 'John 1:1<>"/\\|?*' + String.fromCharCode(...Array.from({ length: 32 }, (_, i) => i));
  const out = s.DA_PERSISTENCE.sanitizeFilename(value);
  assert.match(out, /^John 1_1/); assert.equal([...out].some(c => '<>:"/\\|?*'.includes(c) || c.charCodeAt(0) < 32), false);
});
test('platform logic: reserved device stems including extensions and superscript ports are escaped', () => {
  const s = setup();
  assert.equal(s.DA_PERSISTENCE.sanitizeFilename('  CON.txt'), '_CON.txt');
  for (const stem of ['CON', 'prn', 'Aux', 'NUL', 'COM1', 'COM9', 'LPT1', 'LPT9', 'COM¹', 'LPT²', 'COM³'])
    for (const suffix of ['', '.txt', '.daprofile.json']) assert.equal(s.DA_PERSISTENCE.sanitizeFilename(stem + suffix), '_' + stem + suffix);
});
test('platform logic: trailing dots spaces and empty names produce usable basenames', () => {
  const s = setup();
  assert.equal(s.DA_PERSISTENCE.sanitizeFilename('study...  '), 'study');
  for (const value of ['', '.', '..', '  ', null]) assert.equal(s.DA_PERSISTENCE.sanitizeFilename(value), 'discourse');
  assert.equal(s.DA_PERSISTENCE.sanitizeFilename('', 'passage'), 'passage');
});
test('platform logic: normal Unicode filenames and existing valid English names are preserved', () => {
  const s = setup();
  for (const value of ['经文分析 希腊文 Ἐν 中文', 'John-1-1_Final-QA', '老师方案.daprofile.json', '.study', 'CON-text.json', 'COM10.json'])
    assert.equal(s.DA_PERSISTENCE.sanitizeFilename(value), value);
});
test('platform logic: custom and generated suggestions do not rewrite project or user fields', () => {
  const s = setup(); const input = { value: '老师:方案?<>*|"/\\. ' }, author = { value: 'User:原名' };
  s.document.getElementById = id => id === 'exportFilename' ? input : id === 'pageAuthor' ? author : null;
  s.DA_STATE.passageRef = 'John 1:1-5'; const before = JSON.stringify(s.DA_STATE);
  assert.equal(s.DA_PERSISTENCE.getExportFilename(), s.DA_PERSISTENCE.sanitizeFilename(input.value.trim()));
  assert.equal(s.DA_PERSISTENCE.getExportFilename(true), 'john1-1-5_User-原名');
  assert.equal(input.value, '老师:方案?<>*|"/\\. '); assert.equal(author.value, 'User:原名'); assert.equal(JSON.stringify(s.DA_STATE), before);
});
test('platform logic: original CRLF JSON loads with Unicode and no language or filename migration', () => {
  const s = setup(); const value = { version: 3, passageRef: 'John 1:1', propositions: ['User 正文\r\n第二行'], verseRefs: ['1'], brackets: [], comments: [], customLabels: [{ id: 'cl_user', name: 'CON 用户原名', label: 'X/Y*' }] };
  const parsed = JSON.parse(JSON.stringify(value, null, 2).replace(/\n/g, '\r\n'));
  const out = s.DA_PERSISTENCE.normalizeBracketData(parsed);
  assert.equal(out.propositions[0], value.propositions[0]); assert.equal(out.customLabels[0].name, value.customLabels[0].name); assert.equal(out.version, 3); assert.equal(Object.hasOwn(out, 'language'), false);
});
function windowsMenu() {
  const original = { items: [{ role: 'filemenu', label: 'File', submenu: { items: [{ role: 'close', label: 'Close', accelerator: 'Ctrl+W' }, { role: 'quit', label: 'Exit', accelerator: 'Alt+F4' }] } }, { role: 'editmenu', label: 'Edit', submenu: { items: [{ role: 'undo', label: 'Undo', accelerator: 'Ctrl+Z' }, { role: 'selectall', label: 'Select All', accelerator: 'Ctrl+A' }] } }, { role: 'viewmenu', label: 'View' }, { role: 'help', label: 'Help' }] };
  let result; const Menu = { getApplicationMenu: () => original, buildFromTemplate: x => x, setApplicationMenu: x => { result = x; } };
  return { update: createNativeMenuTranslator(Menu, 'Discourse Analysis'), result: () => result };
}
test('platform logic: modeled Windows menus translate labels while retaining Ctrl Alt roles and visibility', () => {
  const m = windowsMenu(); m.update('zh-CN'); const rows = m.result();
  assert.deepEqual(rows.map(r => r.label), ['文件', '编辑', '视图', '帮助']); assert.equal(rows[0].submenu[0].accelerator, 'Ctrl+W'); assert.equal(rows[0].submenu[1].accelerator, 'Alt+F4'); assert.equal(rows[1].submenu[0].accelerator, 'Ctrl+Z'); assert.equal(rows[1].submenu[1].accelerator, 'Ctrl+A'); assert.equal(rows[1].submenu[1].label, '全选');
  assert.equal(rows.some(r => r.role === 'appmenu' || r.role === 'services'), false);
});
test('platform logic: modeled Windows English menu labels restore without injecting Mac items', () => {
  const m = windowsMenu(); m.update('zh-CN'); m.update('en');
  assert.deepEqual(m.result().map(r => r.label), ['File', 'Edit', 'View', 'Help']); assert.equal(m.result()[0].submenu[1].label, 'Exit'); assert.equal(m.result().length, 4);
});
