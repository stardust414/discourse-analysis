const { test, expect } = require('@playwright/test');
const fs = require('fs');
const fixture = { version: 3, passageRef: 'John 1:1?*<>|"/\\', propositions: ['User original English', '用户原文保持不变'], verseRefs: ['1', '2'], brackets: [{ id: 'w1-ground', type: 'ground', from: 'p0', to: 'p1' }], pageAuthor: 'Windows QA 用户', mainPointSummary: 'User summary 摘要', parallelLabel: 'CUV', parallelTexts: ['平行文字一', 'Parallel two'], comments: [{ id: 'w1-comment', type: 'text', target: { propIndex: 0, start: 0, end: 4 }, text: 'User comment 原样', author: 'User 原名', replies: [] }], customLabels: [{ id: 'cl_w1', name: 'CON 用户关系', label: 'X/Y*' }] };
async function data(page) { return page.evaluate(() => { const d = window.DA_EXPORT.buildBracketData(); delete d.exportedAt; return JSON.parse(JSON.stringify(d)); }); }
for (const language of ['en', 'zh-CN']) test(`platform logic: portable-safe file suggestions preserve data across all exports in ${language}`, async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  // Exercise the desktop download fallback without a browser-native Save picker.
  await page.addInitScript(language => { delete window.showSaveFilePicker; localStorage.setItem('biblebracket_language', language); localStorage.setItem('biblebracket_welcome_seen', 'true'); }, language);
  await page.goto('/'); await page.evaluate(() => window.DA_I18N.ready);
  await page.evaluate(fixture => window.DA_PERSISTENCE.importBracket(fixture), fixture);
  const expected = await data(page);
  await page.locator('#projectSettingsBtn').click(); await page.locator('#exportFilename').fill('CON'); await page.locator('#closeSettingsBtn').click();
  async function download(click, filename) { const waiting = page.waitForEvent('download'); await click(); const d = await waiting; expect(d.suggestedFilename()).toBe(filename); const file = test.info().outputPath(filename); await d.saveAs(file); return file; }
  const saved = await download(() => page.locator('#saveBtn').click(), '_CON.json');
  const payload = JSON.parse(fs.readFileSync(saved, 'utf8')); delete payload.exportedAt; expect(payload).toEqual(expected);
  async function exportFromMenu(action, filename) { await page.locator('#exportMenuBtn').click(); return download(() => page.locator(`#exportMenu [data-action="${action}"]`).click(), filename); }
  const rawName = fixture.passageRef;
  const safe = value => value.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_');
  await exportFromMenu('json', safe('bracket-' + rawName + '.json'));
  const date = new Date().toISOString().slice(0, 10);
  for (const [type, name] of [['png', safe(rawName.replace(/\s+/g, '_') + '_' + date + '.png')], ['pdf', safe(rawName.replace(/\s+/g, '_') + '.pdf')]]) {
    const file = await exportFromMenu(type, name);
    await page.locator('#openMenuBtn').click(); const waiting = page.waitForEvent('filechooser'); await page.locator('#openPicker > button').first().click(); await (await waiting).setFiles(file);
    await expect(page.locator('.proposition-block')).toHaveCount(2); expect(await data(page)).toEqual(expected);
  }
  await page.evaluate(() => { const p = JSON.parse(JSON.stringify(window.DA_PROFILES.getActive())); p.id = 'w1-custom'; p.builtin = false; p.name = 'CON'; window.DA_PROFILES.setActive(p); });
  await page.locator('#projectSettingsBtn').click(); await page.locator('.advanced-notation > summary').click();
  const profileFile = await download(() => page.locator('#exportProfileBtn').click(), '_CON.daprofile.json');
  const profile = JSON.parse(fs.readFileSync(profileFile, 'utf8')); expect(profile.name).toBe('CON'); expect(profile.id).toBe('w1-custom'); expect(await data(page)).toEqual(expected); expect(errors).toEqual([]);
});
