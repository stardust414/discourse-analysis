const { test, expect } = require('@playwright/test');
const fs = require('node:fs');

test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!localhost)/, route => route.abort());
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('biblebracket_reviewer_name', 'E2E Tester');
    localStorage.setItem('biblebracket_welcome_seen', 'true');
    localStorage.setItem('biblebracket_theme', 'light');
    localStorage.setItem('biblebracket_language', 'en');
  });
});

for (const [id, resource, text, locale] of [
  ['cuvs', 'cmn_cus', '简体经文　神与爱。', 'zh-Hant'],
  ['cuvt', 'cmn_cut', '繁體經文上帝與愛。', 'zh-CN']
]) {
  test(`${id} main loads, keeps script across UI languages, splits and saves/reopens offline`, async ({ page }) => {
    const urls = [];
    await page.route('https://v1.fetch.bible/**', async route => {
      urls.push(route.request().url());
      await route.fulfill({ json: { book: 'gen', name: { normal: 'Genesis' }, contents: [[], [[],
        [{ type: 'heading', contents: 'Excluded heading', level: 2 }, text],
        ['', { type: 'note', contents: 'Excluded note' }], ['下一节。']]] } });
    });
    await page.goto('/');
    await expect(page.locator(`#versionSelect option[value="${id}"]`)).toHaveText(
      id === 'cuvs' ? 'Chinese Union Version (Simplified)' : 'Chinese Union Version (Traditional)');
    await page.locator('#versionSelect').selectOption(id);
    await page.locator('#passageInput').fill('Genesis 1:1-3');
    await page.locator('#fetchBtn').click();
    await expect(page.locator('.proposition-text')).toHaveText([text, '下一节。']);
    expect(urls).toEqual([`https://v1.fetch.bible/bibles/${resource}/txt/gen.json`]);
    await expect(page.locator('#copyrightLabel')).toContainText(id.toUpperCase());
    expect(await page.evaluate(() => window.DA_STATE.verseRefs)).toEqual(['1', '3']);
    for (const language of [locale, 'en']) {
      await page.evaluate(language => window.DA_I18N.setPreference(language), language);
      await expect(page.locator('.proposition-text').first()).toHaveText(text);
      await expect(page.locator(`#versionSelect option[value="${id}"]`)).toHaveText(language === 'en'
        ? (id === 'cuvs' ? 'Chinese Union Version (Simplified)' : 'Chinese Union Version (Traditional)')
        : (id === 'cuvs' ? '新標點和合本（簡體）' : '新标点和合本（繁体）'));
    }
    await page.evaluate(() => {
      const el = document.querySelector('.proposition-text');
      el.focus();
      const range = document.createRange();
      range.setStart(el.firstChild, 2);
      range.collapse(true);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    });
    await page.keyboard.press('Enter');
    await expect(page.locator('.proposition-block')).toHaveCount(3);
    const parts = await page.locator('.proposition-text').allTextContents();
    expect(parts[0] + parts[1]).toBe(text);
    await page.locator('#exportMenuBtn').click();
    const downloaded = page.waitForEvent('download');
    await page.locator('#exportMenu [data-action="json"]').click();
    const saved = JSON.parse(fs.readFileSync(await (await downloaded).path(), 'utf8'));
    expect(saved.version).toBe(3);
    expect(saved).not.toHaveProperty('translationId');
    expect(saved.propositions).toEqual(parts);
    await page.route('https://v1.fetch.bible/**', route => { urls.push('unexpected reconnect'); return route.abort(); });
    await page.reload();
    await page.locator('#importFileInput').setInputFiles({
      name: 'cuv-project.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(saved))
    });
    await expect(page.locator('.proposition-text')).toHaveText(parts);
    expect(urls).toHaveLength(1);
    await expect(page.locator('#copyrightLabel')).toContainText(saved.copyrightLabel);
    // Existing parallel codes remain untouched; new main IDs never appear there.
    const menus = await page.evaluate(() => window.DA_STATE.parallelLabel);
    expect(menus).toBe('');
  });
}

test('empty-only reference and CDN error leave the existing document intact with an error', async ({ page }) => {
  let fail = false;
  await page.route('https://v1.fetch.bible/**', route => fail
    ? route.fulfill({ status: 503, body: 'unavailable' })
    : route.fulfill({ json: { book: 'gen', contents: [[], [[], []]] } }));
  await page.goto('/');
  await page.evaluate(() => {
    window.DA_PERSISTENCE.importBracket({ version: 3, passageRef: 'Existing', propositions: ['Keep this text'], verseRefs: ['1'] });
  });
  await page.locator('#versionSelect').selectOption('cuvs');
  // Directly invoke the same UI handler after the replace/add choice; this
  // isolates error handling from the already-covered confirmation dialog.
  await page.locator('#passageInput').fill('Genesis 1:1');
  await page.evaluate(() => window.fetchPassage('replace'));
  await expect(page.locator('.proposition-text')).toHaveText(['Keep this text']);
  await expect(page.locator('.status.error')).toContainText('No Scripture text');
  fail = true;
  await page.evaluate(() => window.fetchPassage('replace'));
  await expect(page.locator('.proposition-text')).toHaveText(['Keep this text']);
  await expect(page.locator('.status.error')).toContainText('503');
  await expect(page.locator('#fetchBtn')).toBeEnabled();
});
