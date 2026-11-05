const { test, expect } = require('@playwright/test');
const cases = [
  ['cuvs', '创世记 1:1-5', 'gen', 1, 1, 5, 'en', 'Genesis 1:1-5'],
  ['cuvs', '约 3:16', 'jhn', 3, 16, 16, 'zh-Hant', 'John 3:16'],
  ['cuvs', '林前 10:1-4', '1co', 10, 1, 4, 'zh-CN', '1 Corinthians 10:1-4'],
  ['cuvt', '創世記 1:1-5', 'gen', 1, 1, 5, 'en', 'Genesis 1:1-5'],
  ['cuvt', '約 3：16', 'jhn', 3, 16, 16, 'zh-CN', 'John 3:16'],
  ['cuvt', '林後 5:17', '2co', 5, 17, 17, 'zh-Hant', '2 Corinthians 5:17'],
  ['cuvt', 'Genesis 1:1-5', 'gen', 1, 1, 5, 'zh-Hant', 'Genesis 1:1-5'],
  ['cuvs', '創1：1－2', 'gen', 1, 1, 2, 'en', 'Genesis 1:1-2']
];
async function boot(page, locale) {
  await page.route(/^https?:\/\/(?!localhost)/, r => r.abort());
  await page.addInitScript(locale => {
    localStorage.clear();
    localStorage.setItem('biblebracket_welcome_seen', 'true');
    localStorage.setItem('biblebracket_reviewer_name', 'Reference QA');
    localStorage.setItem('biblebracket_language', locale);
  }, locale);
}
for (const [version, query, book, chapter, first, last, locale, canonical] of cases) test(`${locale} UI: ${version} parses ${query}`, async ({ page }) => {
  await boot(page, locale);
  const resource = version === 'cuvs' ? 'cmn_cus' : 'cmn_cut';
  const text = version === 'cuvs' ? '　神与简体正文。' : '上帝與繁體正文。';
  const urls = [];
  const contents = Array.from({ length: chapter + 1 }, () => []);
  contents[chapter] = Array.from({ length: last + 1 }, (_, i) => i ? [text + i] : []);
  await page.route('https://v1.fetch.bible/**', r => { urls.push(r.request().url()); return r.fulfill({ json: { book, contents } }); });
  await page.goto('/'); await page.evaluate(() => window.DA_I18N.ready);
  await page.locator('#versionSelect').selectOption(version);
  await page.locator('#passageInput').fill(query); await page.locator('#fetchBtn').click();
  await expect(page.locator('.proposition-text')).toHaveText(Array.from({ length: last - first + 1 }, (_, i) => text + (first + i)));
  expect(urls).toEqual([`https://v1.fetch.bible/bibles/${resource}/txt/${book}.json`]);
  const project = await page.evaluate(() => window.DA_EXPORT.buildBracketData());
  expect(project.version).toBe(3); expect(project.passageRef).toBe(canonical);
  expect(project.verseRefs).toEqual(Array.from({ length: last - first + 1 }, (_, i) => String(first + i)));
  await expect(page.locator('#copyrightLabel')).toContainText(version.toUpperCase());
});
test('Chinese cross-chapter reference preserves the existing normalized empty-slot contract', async ({ page }) => {
  await boot(page, 'en');
  const contents = [[], [[], ['第一章一。'], [], ['第一章三。']], [[], ['第二章一。'], ['第二章二。']]];
  await page.route('https://v1.fetch.bible/**', r => r.fulfill({ json: { book: 'jhn', contents } }));
  await page.goto('/'); await page.locator('#versionSelect').selectOption('cuvs');
  await page.locator('#passageInput').fill('約翰福音1:2-2:1'); await page.locator('#fetchBtn').click();
  await expect(page.locator('.proposition-text')).toHaveText(['第一章三。', '第二章一。']);
  expect(await page.evaluate(() => window.DA_STATE.verseRefs)).toEqual(['1:3', '2:1']);
});
test('unknown Chinese reference uses the existing error UX without requesting a provider', async ({ page }) => {
  await boot(page, 'en'); let calls = 0;
  await page.route('https://v1.fetch.bible/**', r => { calls++; return r.abort(); });
  await page.goto('/'); await page.locator('#versionSelect').selectOption('cuvs');
  await page.locator('#passageInput').fill('不存在的书1'); await page.locator('#fetchBtn').click();
  await expect(page.locator('.status.error')).toBeVisible();
  await expect(page.locator('.proposition-text')).toHaveCount(0);
  await expect(page.locator('#fetchBtn')).toBeEnabled(); expect(calls).toBe(0);
});
