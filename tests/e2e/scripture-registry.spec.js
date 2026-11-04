const { test, expect } = require('@playwright/test');

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

test('main selector keeps all four legacy IDs and fetches through the public adapter', async ({ page }) => {
  const requests = [];
  await page.route(/bibleProxy\/(esv|nasb)\?/, async route => {
    requests.push(route.request().url());
    await route.fulfill({ json: { ok: true, text: '[1] Fixture passage', canonical: 'John 1:1' } });
  });
  await page.route('**/SBLGNT/**/John.txt', async route => {
    requests.push(route.request().url());
    await route.fulfill({ body: 'Jn 1:1\tFixture Greek' });
  });
  await page.route('**/get-text/WLC/1/1/', async route => {
    requests.push(route.request().url());
    await route.fulfill({ json: [{ verse: 1, text: 'Fixture Hebrew' }] });
  });
  for (const [id, query, text, badge, endpoint] of [
    ['esv', 'John 1:1', 'Fixture passage', '(ESV)', '/esv?q=John%201%3A1'],
    ['nasb', 'John 1:1', 'Fixture passage', '(NASB)', '/nasb?passage=JHN.1.1'],
    ['greek', 'John 1:1', 'Fixture Greek', '(SBLGNT)', '/John.txt'],
    ['hebrew', 'Genesis 1:1', 'Fixture Hebrew', '(WLC)', '/get-text/WLC/1/1/']
  ]) {
    await page.goto('/');
    expect(await page.locator('#versionSelect option').evaluateAll(options => options.map(o => o.value)))
      .toEqual(['esv', 'nasb', 'greek', 'hebrew', 'cuvs', 'cuvt']);
    expect(await page.evaluate(id => window.DA_BIBLE.getTranslationMetadata(id), id))
      .toEqual({ id, provider: 'legacy' });
    await page.locator('#versionSelect').selectOption(id);
    await page.locator('#passageInput').fill(query);
    await page.locator('#fetchBtn').click();
    await expect(page.locator('.proposition-text')).toHaveText([text]);
    await expect(page.locator('#copyrightLabel')).toHaveText(badge);
    expect(requests.at(-1)).toContain(endpoint);
    await expect(page.locator('#propositions')).toHaveClass(id === 'greek' ? /greek-text/ : id === 'hebrew' ? /hebrew-text/ : /propositions/);
    expect(await page.evaluate(() => window.DA_STATE.isRTL)).toBe(id === 'hebrew');
  }
  expect(requests).toHaveLength(4);
});

test('custom paste and saved schema-3 project reopen never call a passage provider', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.passageProviderCalls = 0;
    window.DA_BIBLE.fetchPassageData = async () => {
      window.passageProviderCalls++;
      throw new Error('Paste and project reopen must not fetch Scripture');
    };
  });
  await page.getByText('Or paste text to bracket or import').click();
  await page.locator('#pasteText').fill('[1] Custom first line [2] Custom second line');
  await page.locator('#importPassageRef').fill('Custom document');
  await page.locator('#importBtn').click();
  await expect(page.locator('.proposition-text')).toHaveText(['Custom first line', 'Custom second line']);
  const saved = await page.evaluate(() => {
    window.DA_STATE.parallelLabel = 'CUV'; // Existing saved-project code, not a new registry entry.
    window.DA_STATE.parallelTexts = ['Parallel first', 'Parallel second'];
    return window.DA_EXPORT.buildBracketData();
  });
  expect(saved.version).toBe(3);
  expect(saved).not.toHaveProperty('translationId');
  expect(saved).not.toHaveProperty('provider');
  await page.evaluate(() => window.DA_STATE.resetForNewDocument({}));
  await page.locator('#importFileInput').setInputFiles({
    name: 'existing-project.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(saved))
  });
  await expect(page.locator('.proposition-text')).toHaveText(['Custom first line', 'Custom second line']);
  const reopened = await page.evaluate(() => window.DA_EXPORT.buildBracketData());
  expect(reopened.version).toBe(3);
  expect(reopened.passageRef).toBe(saved.passageRef);
  expect(reopened.verseRefs).toEqual(saved.verseRefs);
  expect(reopened.parallelLabel).toBe('CUV');
  expect(reopened.parallelTexts).toEqual(saved.parallelTexts);
  expect(await page.evaluate(() => window.passageProviderCalls)).toBe(0);
});
