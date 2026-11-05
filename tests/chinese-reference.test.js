const { test } = require('node:test');
const assert = require('node:assert');
const { createSandbox, load } = require('./helpers/harness');
const books = require('./fixtures/scripture/chinese-book-names.json');
function setup(extra = {}) {
  const sb = createSandbox(extra);
  load(sb, 'js/utils/constants.js');
  load(sb, 'js/services/bible-service.js');
  return sb;
}
for (const [i, book] of books.entries()) {
  for (const script of ['simplified', 'traditional']) test(`${script} full book ${book[script]} -> ${book.usfm}`, () => {
    const sb = setup();
    const ref = sb.parsePassageReference(book[script] + ' 1');
    assert.equal(ref.bollsId, i + 1);
    assert.equal(ref.usfm, book.usfm);
    assert.equal(sb.parseFetchBibleReference(book[script] + '1').bookId, book.usfm.toLowerCase());
    if (i >= 39) assert.ok(ref.file, 'existing Greek NT identity also resolves');
  });
  for (const alias of book.shorts) test(`short ${alias} -> ${book.usfm}`, () => {
    const sb = setup();
    assert.equal(sb.parsePassageReference(alias + '1:2-3').usfm, book.usfm);
    assert.equal(sb.parseFetchBibleReference(alias + ' 1:2-3').bookId, book.usfm.toLowerCase());
  });
}
for (const [query, tail, startChapter, endChapter, startVerse, endVerse] of [
  ['创1', '1', 1, 1, 1, null], ['创 1', '1', 1, 1, 1, null],
  ['创世记1', '1', 1, 1, 1, null], ['創世記 1', '1', 1, 1, 1, null],
  ['约3:16', '3:16', 3, 3, 16, 16], ['約 3：16', '3:16', 3, 3, 16, 16],
  ['林前10:1－4', '10:1-4', 10, 10, 1, 4], ['詩篇23', '23', 23, 23, 1, null],
  ['创1-2', '1-2', 1, 2, 1, null], ['約翰福音1:50–2:3', '1:50-2:3', 1, 2, 50, 3],
  ['约1:50-2:3', '1:50-2:3', 1, 2, 50, 3], ['約1:50-2:3', '1:50-2:3', 1, 2, 50, 3],
  ['創\u00a01：1－2', '1:1-2', 1, 1, 1, 2]
]) test('Chinese existing range grammar: ' + query, () => {
  const r = setup().parseFetchBibleReference(query);
  assert.deepEqual([r.startChapter, r.endChapter, r.startVerse, r.endVerse], [startChapter, endChapter, startVerse, endVerse]);
  assert.ok(r.passageRef.endsWith(' ' + tail));
});
for (const alias of ['约', '約', '约一', '約一', '约二', '約二', '约三', '約三']) test('exact John alias conflict: ' + alias, () => {
  const expected = alias.endsWith('一') ? '1JN' : alias.endsWith('二') ? '2JN' : alias.endsWith('三') ? '3JN' : 'JHN';
  const sb = setup();
  assert.equal(sb.parsePassageReference(alias + '1').usfm, expected);
  assert.throws(() => sb.parseFetchBibleReference(alias + '不存在1'));
});
for (const query of ['不存在的书1', '约翰福音第三章十六节', '约三章十六节', '約翰四書1', '创世紀1', '约一foo1']) test('unknown Chinese is not guessed: ' + query, async () => {
  let calls = 0;
  const sb = setup({ fetch: async () => { calls++; throw Error('unexpected network'); } });
  assert.equal(sb.parsePassageReference(query), null);
  await assert.rejects(() => sb.DA_BIBLE.fetchPassageData('cuvs', query));
  assert.equal(calls, 0);
});
test('all existing English aliases retain their baseline normalization and book mapping', () => {
  const sb = setup();
  for (const [alias, id] of Object.entries(sb.DA_CONSTANTS.BOLLS_BOOKS)) {
    const query = alias + ' 1:2-3';
    assert.equal(sb.normalizeRefQuery(query), query);
    assert.equal(sb.parsePassageReference(query).bollsId, id);
  }
  for (const query of ['Genesis 1', 'Gen 1', 'John 3:16', 'Jn 3:16', '1 Corinthians 10:1-4', '1 Cor 10:1-4'])
    assert.ok(sb.parseFetchBibleReference(query).bookId);
});
test('Chinese alias resolution is independent of UI locale and does not affect Scripture script', async () => {
  for (const locale of ['en', 'zh-CN', 'zh-Hant']) for (const [version, resource, text] of [
    ['cuvs', 'cmn_cus', '　神与简体正文。'], ['cuvt', 'cmn_cut', '上帝與繁體正文。']
  ]) {
    const calls = [];
    const sb = setup({ fetch: async url => { calls.push(url); return { ok: true, json: async () => ({ book: 'gen', contents: [[], [[], [text]]] }) }; } });
    sb.DA_I18N.setPreference(locale);
    for (const ref of ['创1:1', '創世記1：1', 'Genesis 1:1']) {
      const result = await sb.DA_BIBLE.fetchPassageData(version, ref);
      assert.deepEqual(result.propositions, [text]);
    }
    assert.deepEqual(calls, Array(3).fill(`https://v1.fetch.bible/bibles/${resource}/txt/gen.json`));
  }
});
test('Chinese ESV input is normalized while existing free English queries pass through untouched', async () => {
  const queries = [];
  const sb = setup({ electronAPI: { fetchESV: async query => { queries.push(query); return { ok: true, text: '[1] Body' }; } } });
  for (const query of ['約3：16', 'John 3:16', 'John 1:50-2:3', 'love', ' Romans 3:21–26 ']) await sb.DA_BIBLE.fetchPassageData('esv', query);
  assert.deepEqual(queries, ['john 3:16', 'John 3:16', 'John 1:50-2:3', 'love', ' Romans 3:21–26 ']);
});
test('Chinese input reuses existing NASB, Greek and Hebrew identities', async () => {
  const requests = [];
  const sb = setup({ electronAPI: { fetchNASB: async id => { requests.push(id); return { ok: true, text: '[16] Text' }; } }, fetch: async url => {
    requests.push(url);
    return { ok: true, json: async () => [{ verse: 1, text: 'Hebrew' }], text: async () => '43 1:1\tGreek' };
  } });
  await sb.DA_BIBLE.fetchPassageData('nasb', '約3：16');
  await sb.DA_BIBLE.fetchPassageData('greek', '約1:1');
  await sb.DA_BIBLE.fetchPassageData('hebrew', '創1:1');
  assert.deepEqual(requests, ['JHN.3.16', sb.DA_CONSTANTS.SBLGNT_BASE + 'John.txt', 'https://bolls.life/get-text/WLC/1/1/']);
});
