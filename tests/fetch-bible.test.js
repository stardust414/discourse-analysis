const { test } = require('node:test');
const assert = require('node:assert');
const { createSandbox, load } = require('./helpers/harness');
const fixture = require('./fixtures/scripture/fetch-bible-normalized.json');
const clone = () => JSON.parse(JSON.stringify(fixture));
function setup(data = clone()) {
  const calls = [];
  const sb = createSandbox({ fetch: async url => {
    calls.push(url);
    return { ok: true, json: async () => data };
  } });
  load(sb, 'js/utils/constants.js');
  load(sb, 'js/services/bible-service.js');
  return { sb, calls, fetch: (id, query) => sb.DA_BIBLE.fetchPassageData(id, query) };
}

for (const [id, resource, source, script] of [
  ['cuvs', 'cmn_cus', 'cmn-cu89s', 'Hans'], ['cuvt', 'cmn_cut', 'cmn-cu89t', 'Hant']
]) {
  test(`${id} metadata separates stable ID, verified resource, script and provenance`, () => {
    const { sb } = setup();
    const m = sb.DA_BIBLE.getTranslationMetadata(id);
    assert.equal(m.id, id);
    assert.equal(m.provider, 'fetch-bible');
    assert.equal(m.providerTranslationId, resource);
    assert.equal(m.sourceId, source);
    assert.equal(m.script, script);
    assert.equal(m.language, 'zh');
    assert.equal(m.license, 'Public Domain');
    assert.equal(m.onlineAvailable, true);
    assert.equal(m.displayNameKey, `scripture.${id}`);
    assert.equal(m.attribution, 'eBible.org / fetch(bible)');
    assert.ok(Object.isFrozen(m));
  });
  test(`${id} routes only to its own official CDN JSON, never the legacy backend`, async () => {
    const ctx = setup();
    ctx.sb.fetchFromBolls = () => { throw new Error('No fallback'); };
    const out = await ctx.fetch(id, 'Gen 1:1');
    assert.deepEqual(ctx.calls, [`https://v1.fetch.bible/bibles/${resource}/txt/gen.json`]);
    assert.equal(out.source, 'fetch-bible');
    assert.ok(out.copyright.includes(source));
    assert.ok(out.copyright.includes('Public Domain'));
    assert.equal(out.isGreek, false);
    assert.deepEqual(out.verseRefs, ['1']);
  });
}

test('all 66 book mappings match official lowercase USX IDs without a second runtime table', () => {
  // Canonical USX codes, independently checked against official collection filenames.
  const codes = 'gen exo lev num deu jos jdg rut 1sa 2sa 1ki 2ki 1ch 2ch ezr neh est job psa pro ecc sng isa jer lam ezk dan hos jol amo oba jon mic nam hab zep hag zec mal mat mrk luk jhn act rom 1co 2co gal eph php col 1th 2th 1ti 2ti tit phm heb jas 1pe 2pe 1jn 2jn 3jn jud rev'.split(' ');
  const { sb } = setup();
  assert.equal(codes.length, 66);
  const canonical = Object.values(sb.DA_CONSTANTS.USFM_BY_BOLLS_ID).map(code => code.toLowerCase());
  assert.deepEqual(canonical, codes);
  const aliases = Object.entries(sb.DA_CONSTANTS.BOLLS_BOOKS);
  codes.forEach((code, i) => {
    const alias = aliases.find(([, bookId]) => bookId === i + 1)[0];
    assert.equal(sb.parseFetchBibleReference(`${alias} 1`).bookId, code);
  });
});

test('whole chapter preserves body paragraphs, removes heading/note and skips empty slots', async () => {
  const out = await setup().fetch('cuvs', 'Gen 1');
  assert.deepEqual(out.propositions, ['简体正文一。\n\n段落仍保留。', '正文二。', '　神与简体记录五。']);
  assert.deepEqual(out.verseRefs, ['1', '2', '5']);
  assert.equal(out.passageRef, 'Gen 1');
});

test('single verse and ranges preserve normalized numbers across empty slots', async () => {
  const ctx = setup();
  assert.deepEqual((await ctx.fetch('cuvs', 'Gen 1:2')).propositions, ['正文二。']);
  const out = await ctx.fetch('cuvs', 'Gen 1:2-5');
  assert.deepEqual(out.verseRefs, ['2', '5']);
  assert.deepEqual(out.propositions, ['正文二。', '　神与简体记录五。']);
});

for (const query of ['Gen 1:3', 'Gen 1:4', 'Gen 1:3-4', 'Gen 1:99', 'Gen 99', 'Gen 1-99']) {
  test(`empty reference ${query} rejects clearly without fake text`, async () => {
    await assert.rejects(() => setup().fetch('cuvs', query), /No Scripture text/);
  });
}

test('cross-chapter verse range keeps chapter-qualified refs and filters both edges', async () => {
  const ctx = setup();
  const out = await ctx.fetch('cuvs', 'Gen 1:5–2:1');
  assert.deepEqual(out.propositions, ['　神与简体记录五。', '第二章一。']);
  assert.deepEqual(out.verseRefs, ['1:5', '2:1']);
  assert.equal(out.passageRef, 'Gen 1:5-2:1');
  assert.equal(ctx.calls.length, 1, 'cross-chapter uses one book response');
});

test('chapter range and numbered-book aliases use the same canonical mapping', async () => {
  const ctx = setup();
  const out = await ctx.fetch('cuvs', 'Gen 1-2');
  assert.deepEqual(out.verseRefs, ['1:1', '1:2', '1:5', '2:1', '2:2']);
  assert.equal(ctx.sb.parseFetchBibleReference('1 Corinthians 2:1').bookId, '1co');
});

test('normalized combined span remains in the first slot; the empty continuation is not duplicated', async () => {
  // CDN sample checked at Genesis 24:29-30: slot 29 contains combined text;
  // slot 30 is []. Use synthetic body here instead of committing the full book.
  const data = { book: 'gen', contents: Array.from({ length: 25 }, () => []) };
  data.contents[24] = Array.from({ length: 32 }, () => []);
  data.contents[24][29] = ['合并正文只出现一次。'];
  data.contents[24][31] = ['下一节。'];
  const ctx = setup(data);
  const out = await ctx.fetch('cuvs', 'Gen 24:29-31');
  assert.deepEqual(out.propositions, ['合并正文只出现一次。', '下一节。']);
  assert.deepEqual(out.verseRefs, ['29', '31']);
  await assert.rejects(() => ctx.fetch('cuvs', 'Gen 24:30'), /No Scripture text/);
});

test('both scripts pass through exactly, including reverence space and wording', async () => {
  for (const [id, text] of [['cuvs', '　神与爱。'], ['cuvt', '上帝與愛。']]) {
    const ctx = setup({ book: 'gen', contents: [[], [[], [text]]] });
    for (const locale of ['en', 'zh-CN', 'zh-Hant']) {
      ctx.sb.DA_I18N.setPreference(locale);
      assert.deepEqual((await ctx.fetch(id, 'Gen 1:1')).propositions, [text]);
    }
  }
});

for (const query of ['unknown 1', 'Gen 0', 'Gen 1:0', 'Gen 2-1', 'Gen 1:5-2', 'Gen 1:5-0:1', 'not a reference']) {
  test(`invalid or unknown reference ${query} fails before network`, async () => {
    const ctx = setup();
    await assert.rejects(() => ctx.fetch('cuvs', query));
    assert.equal(ctx.calls.length, 0);
  });
}

for (const data of [null, {}, { book: 'jhn', contents: [] }, { book: 'gen', contents: {} },
  { book: 'gen', contents: [[], null] }, { book: 'gen', contents: [[], [[], [null]]] },
  { book: 'gen', contents: [[], [[], [{ type: 'unknown', contents: 'body?' }]]] },
  { book: 'gen', contents: [[], [[], 'unexpected nonempty string']] }]) {
  test(`malformed response ${JSON.stringify(data)} fails without fallback`, async () => {
    const ctx = setup(data);
    await assert.rejects(() => ctx.fetch('cuvs', 'Gen 1'), /unsupported or malformed/);
    assert.equal(ctx.calls.length, 1);
  });
}

test('missing intermediate chapter never silently imports a partial range', async () => {
  const data = clone();
  data.contents[1] = [];
  await assert.rejects(() => setup(data).fetch('cuvs', 'Gen 1-2'), /No Scripture text/);
});

test('HTTP failure, transport failure and invalid JSON have localized errors and no other-source fallback', async () => {
  for (const [response, expected] of [
    [async () => ({ ok: false, status: 503 }), /503/],
    [async () => { throw new Error('network'); }, /Could not connect/],
    [async () => ({ ok: true, json: async () => { throw new Error('bad json'); } }), /unsupported or malformed/]
  ]) {
    const ctx = setup(); let count = 0;
    ctx.sb.fetch = async () => { count++; return response(); };
    await assert.rejects(() => ctx.fetch('cuvt', 'Gen 1'), expected);
    assert.equal(count, 1);
  }
});
