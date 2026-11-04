/** T2 packaged Mac smoke; use isolated scratch profile, never normal user settings. */
const { _electron } = require('playwright');
const { expect } = require('@playwright/test');
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const out = path.resolve('scratch/t2/native-artifacts'), profile = path.resolve('scratch/t2/mac-user-data-' + Date.now());
const evidence = path.resolve('docs/zh-Hant/T2-evidence'); fs.mkdirSync(out, { recursive: true });
const exe = path.resolve('scratch/t2/mac-extracted/Discourse Analysis.app/Contents/MacOS/Discourse Analysis');
const result = { sourceCommit: '210b3bb63a02e118e5441b4f26afc345c210c44e', steps: [], pageErrors: [] };
let app, p, expected, custom;
const persist = () => fs.writeFileSync(path.join(evidence, 'mac-smoke.json'), JSON.stringify(result, null, 2) + '\n');
async function step(name, fn) {
  try { const detail = await fn(); result.steps.push({ name, status: 'pass', detail: detail ?? null }); console.log('PASS', name); persist(); }
  catch (e) { result.steps.push({ name, status: 'fail', error: String(e.stack || e) }); persist(); throw e; }
}
async function settle() { await p.evaluate(async () => { await document.fonts.ready; await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); }); }
async function shot(name) { await settle(); await p.screenshot({ path: path.join(evidence, 'mac-' + name + '.png'), animations: 'disabled' }); }
async function launch() {
  app = await _electron.launch({ executablePath: exe, args: ['--user-data-dir=' + profile], acceptDownloads: true, timeout: 30000 });
  const info = await app.evaluate(({ app }) => ({ version: app.getVersion(), packaged: app.isPackaged, arch: process.arch, languages: app.getPreferredSystemLanguages() }));
  assert.equal(info.version, '3.3.1'); assert.equal(info.packaged, true); assert.equal(info.arch, 'arm64');
  p = await app.firstWindow(); p.setDefaultTimeout(20000); p.on('pageerror', e => result.pageErrors.push(e.message));
  await p.waitForLoadState('domcontentloaded'); await p.evaluate(() => DA_I18N.ready); return info;
}
async function lang(value) {
  await p.locator('#projectSettingsBtn').click(); await p.locator('#interfaceLanguage').selectOption(value);
  await p.evaluate(() => DA_I18N.ready); await p.locator('#closeSettingsBtn').click(); await settle();
}
async function choose(id) { await p.locator('#projectSettingsBtn').click(); await p.locator('#profileSelect').selectOption(id); await p.locator('#closeSettingsBtn').click(); }
async function picker() { await p.locator('.bracket-hitbox[tabindex="0"]').first().press('Enter'); await expect(p.locator('#labelPicker')).toBeVisible(); }
async function data() { return p.evaluate(() => { const d = DA_EXPORT.buildBracketData(); delete d.exportedAt; return JSON.parse(JSON.stringify(d)); }); }
async function open(file) {
  await p.evaluate(() => DA_PERSISTENCE.importBracket({ version: 3, passageRef: 'Sentinel', propositions: ['Different content before restore'], verseRefs: ['1'], brackets: [], comments: [], mainPointSummary: '' }));
  await expect(p.locator('.proposition-block')).toHaveCount(1);
  await p.locator('#openMenuBtn').click(); const chooser = p.waitForEvent('filechooser');
  await p.locator('#openPicker > button').first().click(); await (await chooser).setFiles(file);
  await expect(p.locator('.proposition-block')).toHaveCount(expected.propositions.length);
  await expect(p.locator('.status')).not.toHaveText('無法讀取檔案。');
}
async function exp(type) {
  await p.locator('#exportMenuBtn').click(); const waiting = p.waitForEvent('download', { timeout: 60000 });
  await p.locator(`#exportMenu [data-action="${type}"]`).click(); const d = await waiting;
  const file = path.join(out, '繁體 UI 简体内容.' + type); await d.saveAs(file); assert.equal(await d.failure(), null); assert.ok(fs.statSync(file).size > 100); return file;
}
(async () => {
try {
  await step('01 從測試 ZIP 解壓啟動與首次 Welcome', async () => {
    const info = await launch(); await expect(p.locator('#welcomeModal')).toBeVisible();
    assert.equal(await p.evaluate(() => DA_I18N.getPreference()), 'system');
    await p.locator('#welcomeName').fill('T2 QA 用户简体'); await p.locator('#welcomeSaveBtn').click(); return info;
  });
  await step('02 簡體中文與原生選單', async () => { await lang('zh-CN'); await expect(p.locator('#fetchBtn')).toHaveText('载入经文');
    await expect.poll(() => app.evaluate(({ Menu }) => Menu.getApplicationMenu().items.find(i => i.role === 'filemenu').label)).toBe('文件'); });
  await step('03 English 與原生選單', async () => { await lang('en'); await expect(p.locator('#fetchBtn')).toHaveText('Fetch Passage');
    await expect.poll(() => app.evaluate(({ Menu }) => Menu.getApplicationMenu().items.find(i => i.role === 'filemenu').label)).toBe('File'); });
  await step('04 繁體中文與原生選單／accelerator', async () => { await lang('zh-Hant'); await expect(p.locator('#fetchBtn')).toHaveText('載入經文');
    await expect.poll(() => app.evaluate(({ Menu }) => Menu.getApplicationMenu().items.find(i => i.role === 'filemenu').label)).toBe('檔案');
    return app.evaluate(({ Menu }) => Menu.getApplicationMenu().items.map(i => ({ role: i.role, label: i.label, items: i.submenu?.items.map(j => ({ role: j.role, label: j.label, accelerator: j.accelerator })) })));
  });
  await step('05 跟隨目前實際系統語言', async () => { await lang('system'); const d = await p.evaluate(() => ({ actual: DA_I18N.getLocale(), expected: DA_I18N.resolveLocale(DA_I18N.getSystemLanguages()), system: DA_I18N.getSystemLanguages() })); assert.equal(d.actual, d.expected); await lang('zh-Hant'); return d; });
  await step('06 經網路載入 John 1:1-3 ESV', async () => { await p.locator('#passageInput').fill('John 1:1-3'); await p.locator('#fetchBtn').click();
    await expect(p.locator('.proposition-block')).toHaveCount(3, { timeout: 60000 }); assert.match((await data()).propositions[0], /beginning/i);
    return { reference: (await data()).passageRef, attribution: (await data()).copyrightLabel };
  });
  await step('07 原有 Enter 拆分', async () => { await p.evaluate(() => { const el = document.querySelector('.proposition-text'); el.focus(); const n = document.createTreeWalker(el, NodeFilter.SHOW_TEXT).nextNode(); const offset = n.textContent.indexOf('was'); if (offset < 1) throw Error('split point'); const r = document.createRange(); r.setStart(n, offset); r.collapse(true); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }); await p.keyboard.press('Enter'); await expect(p.locator('.proposition-block')).toHaveCount(4); });
  await step('08 圓點建立理由與行動—目的', async () => { await p.locator('.prop-dot').nth(0).click(); await p.locator('.prop-dot').nth(1).click(); await p.locator('#labelPicker button.ground').click(); await p.locator('.prop-dot').nth(2).click(); await p.locator('.prop-dot').nth(3).click(); await p.locator('#labelPicker button.action-purpose').click(); assert.deepEqual((await data()).brackets.map(b => b.type), ['ground', 'action-purpose']); });
  await step('09 Schreiner 出版詞與課件雙重理據', async () => { await choose('schreiner'); await picker(); await expect(p.locator('#labelPicker button.double-ground')).toHaveAccessibleName('雙重理據 Double Ground（DG）'); await p.locator('#labelPicker button.double-ground').focus(); await shot('schreiner-selector'); await p.keyboard.press('Escape'); });
  await step('10 搜尋繁簡、出版詞、English 與原記號', async () => { await picker(); for (const q of ['理據', '理由', 'Ground', 'G']) { await p.locator('.picker-search').fill(q); await expect(p.locator('#labelPicker button.ground')).toBeVisible(); } for (const q of ['雙重理據', '雙側理由', '双侧理由', 'DG']) { await p.locator('.picker-search').fill(q); await expect(p.locator('#labelPicker button.double-ground')).toBeVisible(); } await p.keyboard.press('Escape'); });
  await step('11 五套 profile 與 Guide 正確分組／原記號', async () => { const counts = {}; for (const id of ['josiah', 'biblearc', 'gurtner', 'beale', 'schreiner']) { await choose(id); const raw = await p.evaluate(() => JSON.stringify(DA_PROFILES.getActive())); await p.evaluate(() => DA_UI.openReferenceGuide()); await expect(p.locator('#referenceTableBody')).toContainText(id === 'schreiner' ? '以再陳述輔助' : '以重述支持'); await expect(p.locator('#referenceTableBody')).toContainText(id === 'schreiner' ? '理據 Ground（G）' : '理由 Ground'); counts[id] = await p.evaluate(() => DA_PROFILES.getVisibleTypes().length); await p.locator('#closeReferenceBtn').click(); assert.equal(await p.evaluate(() => JSON.stringify(DA_PROFILES.getActive())), raw); } assert.equal(Object.values(counts).reduce((a, b) => a + b, 0), 92); return counts; });
  await step('12 縮排結構圖與返回括號檢視', async () => { await p.locator('#alternateViewsBtn').click(); await p.locator('#alternateViewsMenu [data-action="block-diagram"]').click(); await expect(p.locator('#blockDiagram')).toContainText('理據 ground'); await shot('block'); await p.locator('#alternateViewsBtn').click(); await p.locator('#alternateViewsMenu [data-action="block-diagram"]').click(); });
  await step('13 新增評論與回覆，不轉換內容', async () => { await p.locator('.bracket-hitbox').first().click({ button: 'right', force: true }); await p.locator('#bracketActions [data-action="comment"]').click(); await p.locator('#commentPopover .new-comment-area textarea').fill('用户简体评论保留'); await p.locator('#commentPopover .save-new-btn').click(); await p.locator('#commentPopover .reply-input').fill('用户简体回复保留'); await p.locator('#commentPopover .send-reply-btn').click(); await expect(p.locator('#commentPopover .replies-list')).toContainText('用户简体回复保留'); await p.locator('#commentPopover .close-btn').first().click(); });
  await step('14 經文主旨摘要跨三語保留', async () => { await p.locator('#addSummaryBtn').click(); await p.locator('#summaryText').fill('用户简体摘要不转换'); await p.locator('#passageInput').click(); const before = await data(); for (const l of ['en', 'zh-CN', 'zh-Hant']) { await lang(l); assert.deepEqual(await data(), before); } });
  await step('15 平行譯本實際載入 ESV', async () => { await p.locator('#alternateViewsBtn').click(); await p.locator('#alternateViewsMenu [data-action="parallel-fetch"]').click(); await p.locator('#parallelTranslationSelect').selectOption('ESV'); await p.locator('#parallelShowBtn').click(); await expect.poll(async () => (await data()).parallelLabel, { timeout: 60000 }).toBe('ESV'); assert.ok((await data()).parallelTexts.some(x => /beginning/i.test(x))); });
  await step('16 自訂方案與自訂關係原樣保留', async () => { custom = await p.evaluate(() => { const d = DA_EXPORT.buildBracketData(); d.customLabels = [{ id: 'cl_t2', name: '用户简体关系', label: 'X/Y*' }]; DA_PERSISTENCE.importBracket(d); const c = JSON.parse(JSON.stringify(DA_PROFILES.getActive())); c.id = 't2-qa-custom'; c.name = '用户简体方案'; c.builtin = false; c.labels.ground = { ...c.labels.ground, name: '用户简体 Ground', abbr: 'X / G*' }; DA_PROFILES.setActive(c); return c; }); assert.equal(await p.evaluate(() => DA_RELATIONSHIPS.getName('ground')), '用户简体 Ground'); expected = await data(); assert.equal(expected.version, 3); assert.equal(custom.schemaVersion, 1); for (const k of ['language', 'locale', 'script', 'traditional']) assert.equal(Object.hasOwn(expected, k), false); });
  await step('17 JSON 匯出→English 開啟→繁體開啟', async () => { const file = await exp('json'); await lang('en'); await open(file); assert.deepEqual(await data(), expected); await lang('zh-Hant'); await open(file); assert.deepEqual(await data(), expected); });
  await step('18 PNG／PDF 匯出與完整內嵌資料還原', async () => { for (const kind of ['png', 'pdf']) { const file = await exp(kind); await open(file); assert.deepEqual(await data(), expected); } });
  await step('19 實際 Mac 小視窗與縮放 Light／Dark', async () => { for (const [w, h, zoom, theme] of [[800, 600, 150, 'dark'], [1400, 900, 100, 'light']]) { await app.evaluate(({ BrowserWindow }, size) => BrowserWindow.getAllWindows()[0].setSize(...size), [w, h]); await p.evaluate(({ zoom, theme }) => { DA_UI.setZoomLevel(zoom); if (document.documentElement.getAttribute('data-theme') !== theme) DA_UI.toggleTheme(); }, { zoom, theme }); await settle(); assert.equal(await p.evaluate(() => document.body.scrollWidth <= innerWidth + 1), true); await shot('window-' + w + '-' + zoom + '-' + theme); } });
  await step('20 重啟後繁體偏好與自訂方案保留', async () => { await app.close(); app = null; await launch(); assert.equal(await p.evaluate(() => DA_I18N.getPreference()), 'zh-Hant'); const dismiss = p.locator('.draft-recovery-banner [data-action="dismiss"]'); if (await dismiss.count()) await dismiss.click(); assert.deepEqual(await p.evaluate(() => JSON.parse(JSON.stringify(DA_PROFILES.getActive()))), custom); await open(path.join(out, '繁體 UI 简体内容.json')); assert.deepEqual(await data(), expected); await shot('reopened'); });
  assert.deepEqual(result.pageErrors, []);
} catch (e) { result.fatal = String(e.stack || e); console.log('FATAL', result.fatal); }
finally { if (app) await app.close().catch(() => {}); result.passed = result.steps.filter(x => x.status === 'pass').length; result.failed = result.steps.filter(x => x.status === 'fail').length; persist(); console.log(JSON.stringify({ passed: result.passed, failed: result.failed, fatal: result.fatal || null })); if (result.fatal || result.failed) process.exitCode = 1; }
})();
