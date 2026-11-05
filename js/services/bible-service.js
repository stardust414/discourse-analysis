// Reference-input aliases only. Values are existing English book keys, not
// new book identities. Keep BOLLS_BOOKS unchanged (also used by pasted text).
const CHINESE_BOOK_ALIASES = Object.freeze(Object.fromEntries([
  ['Genesis', '创世记 創世記 创 創'],
  ['Exodus', '出埃及记 出埃及記 出'],
  ['Leviticus', '利未记 利未記 利'],
  ['Numbers', '民数记 民數記 民'],
  ['Deuteronomy', '申命记 申命記 申'],
  ['Joshua', '约书亚记 約書亞記 书 書'],
  ['Judges', '士师记 士師記 士'],
  ['Ruth', '路得记 路得記 得'],
  ['1sam', '撒母耳记上 撒母耳記上 撒上'],
  ['2sam', '撒母耳记下 撒母耳記下 撒下'],
  ['1kings', '列王纪上 列王紀上 王上'],
  ['2kings', '列王纪下 列王紀下 王下'],
  ['1chron', '历代志上 歷代志上 代上'],
  ['2chron', '历代志下 歷代志下 代下'],
  ['Ezra', '以斯拉记 以斯拉記 拉'],
  ['Nehemiah', '尼希米记 尼希米記 尼'],
  ['Esther', '以斯帖记 以斯帖記 斯'],
  ['Job', '约伯记 約伯記 伯'],
  ['Psalms', '诗篇 詩篇 诗 詩'],
  ['Proverbs', '箴言 箴'],
  ['Ecclesiastes', '传道书 傳道書 传 傳'],
  ['song', '雅歌 歌'],
  ['Isaiah', '以赛亚书 以賽亞書 赛 賽'],
  ['Jeremiah', '耶利米书 耶利米書 耶'],
  ['Lamentations', '耶利米哀歌 哀'],
  ['Ezekiel', '以西结书 以西結書 结 結'],
  ['Daniel', '但以理书 但以理書 但'],
  ['Hosea', '何西阿书 何西阿書 何'],
  ['Joel', '约珥书 約珥書 珥'],
  ['Amos', '阿摩司书 阿摩司書 摩'],
  ['Obadiah', '俄巴底亚书 俄巴底亞書 俄'],
  ['Jonah', '约拿书 約拿書 拿'],
  ['Micah', '弥迦书 彌迦書 弥 彌'],
  ['Nahum', '那鸿书 那鴻書 鸿 鴻'],
  ['Habakkuk', '哈巴谷书 哈巴谷書 哈'],
  ['Zephaniah', '西番雅书 西番雅書 番'],
  ['Haggai', '哈该书 哈該書 该 該'],
  ['Zechariah', '撒迦利亚书 撒迦利亞書 亚 亞'],
  ['Malachi', '玛拉基书 瑪拉基書 玛 瑪'],
  ['matt', '马太福音 馬太福音 太'],
  ['mark', '马可福音 馬可福音 可'],
  ['luke', '路加福音 路'],
  ['john', '约翰福音 約翰福音 约 約'],
  ['acts', '使徒行传 使徒行傳 徒'],
  ['rom', '罗马书 羅馬書 罗 羅'],
  ['1cor', '哥林多前书 哥林多前書 林前'],
  ['2cor', '哥林多后书 哥林多後書 林后 林後'],
  ['gal', '加拉太书 加拉太書 加'],
  ['eph', '以弗所书 以弗所書 弗'],
  ['phil', '腓立比书 腓立比書 腓'],
  ['col', '歌罗西书 歌羅西書 西'],
  ['1thess', '帖撒罗尼迦前书 帖撒羅尼迦前書 帖前'],
  ['2thess', '帖撒罗尼迦后书 帖撒羅尼迦後書 帖后 帖後'],
  ['1tim', '提摩太前书 提摩太前書 提前'],
  ['2tim', '提摩太后书 提摩太後書 提后 提後'],
  ['titus', '提多书 提多書 多'],
  ['phlm', '腓利门书 腓利門書 门 門'],
  ['heb', '希伯来书 希伯來書 来 來'],
  ['jas', '雅各书 雅各書 雅'],
  ['1pet', '彼得前书 彼得前書 彼前'],
  ['2pet', '彼得后书 彼得後書 彼后 彼後'],
  ['1jn', '约翰一书 約翰一書 约一 約一'],
  ['2jn', '约翰二书 約翰二書 约二 約二'],
  ['3jn', '约翰三书 約翰三書 约三 約三'],
  ['jude', '犹大书 猶大書 犹 猶'],
  ['rev', '启示录 啟示錄 启 啟'],
].flatMap(([book, aliases]) => aliases.split(' ').map(alias => [alias, book]))));

const PASSAGE_REF_REGEX = /^(\d?\s*[a-zA-Z\s]+?)\s*(\d+)(?::(\d+)(?:-(\d+))?)?$/;

/**
 * References can arrive with typographic characters the regex above doesn't
 * know: the ESV API's canonical form uses an en dash ("Romans 3:21–26"),
 * and pasted refs may carry non-breaking spaces. Normalize to plain ASCII
 * before every parse.
 */
function normalizeRefQuery(query) {
  const normalized = String(query || '')
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFF0D]/g, '-') // dash variants
    .replace(/\uFF1A/g, ':') // full-width colon; no broad Unicode conversion
    .replace(/\u00A0/g, ' ') // non-breaking space
    .trim();
  // Capture the entire Chinese book token before the Arabic chapter number.
  // Exact lookup prevents 約 from consuming 約一, and rejects unknown names.
  const book = normalized.match(/^([\u3400-\u9FFF]+)\s*(?=\d)/);
  const alias = book && CHINESE_BOOK_ALIASES[book[1]];
  return alias ? `${alias} ${normalized.slice(book[0].length)}` : normalized;
}

// Any codepoint that can be immediately adjacent to a CUV/CUNPS-style spurious
// space: CJK punctuation/symbols + the ideographic space itself, plus the
// full-width forms block. Deliberately does NOT include Hangul (U+AC00-D7AF,
// U+1100-U+11FF) - Korean (KRV) is genuinely word-spaced and must be left alone.
const CJK_ADJACENT = '\\u3000-\\u303F\\u3400-\\u4DBF\\u4E00-\\u9FFF\\uF900-\\uFAFF\\uFE30-\\uFE4F\\uFF00-\\uFFEF';

/**
 * bolls.life serves the traditional-Chinese CUV with a plain space wedged
 * between every character (verified against the live endpoint), and serves
 * CUNPS with literal <br/> markup that render-propositions.js writes via
 * textContent - so it shows up on screen as visible "<br/>" instead of a
 * line break. Both are source-data bugs, not layout bugs, so they're fixed
 * once here rather than downstream in every renderer.
 *
 * The space removal fires when CJK sits on EITHER side, not both: the CUV
 * writes "耶 和 華 ─ 你" with a U+2500 box-drawing dash, which is outside the
 * CJK block, so a "both sides" rule would leave that pair of spaces stranded
 * around the dash.
 *
 * U+3000 (IDEOGRAPHIC SPACE) must survive untouched: the CUV uses it as a
 * reverence marker before the divine name — Exodus 20:2 reads "你的　神", and
 * collapsing that to an ordinary space loses the distinction. Hence the plain
 * [ \t] class rather than \s (which matches U+3000), and a hand-rolled trim
 * rather than String.trim() (which also eats it).
 */
function normalizeVerseText(raw) {
  return String(raw || '')
    .replace(/<[^>]*>/g, '')                     // inline markup (CUNPS <br/>, etc.)
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')   // zero-widths / BOM
    .replace(new RegExp('[ \\t]+(?=[' + CJK_ADJACENT + '])', 'g'), '')
    .replace(new RegExp('(?<=[' + CJK_ADJACENT + '])[ \\t]+', 'g'), '')
    .replace(/^[ \t\n]+|[ \t\n]+$/g, '');         // trim WITHOUT eating a leading/trailing U+3000
}

// ── SBLGNT Source (NT Greek) ──────────────────────────────────────────────────

/**
 * Download a book file and collect ONE chapter as a { verseNum: greekText }
 * map, joining repeated verse lines (paragraph breaks in the source file).
 * The single SBLGNT scan pipeline — shared by the passage import
 * (fetchSBLGNTPassage) and the parallel column (fetchSBLGNTChapterMap), so a
 * fix to the fetch/parse/join rules can never miss one of the two paths.
 */
async function fetchSBLGNTChapterVerses(ref) {
  const res = await fetch(`${DA_CONSTANTS.SBLGNT_BASE}${ref.file}`);
  if (!res.ok) throw new Error(DA_I18N.t('s.S0054', { status: res.status }));

  const map = {};
  for (const line of (await res.text()).split('\n')) {
    const parts = line.split('\t');
    if (parts.length < 2) continue;
    const m = parts[0].trim().match(/(\d+):(\d+)$/);
    if (!m || parseInt(m[1]) !== ref.chapter) continue;
    const v = String(parseInt(m[2]));
    const greek = parts[1].trim();
    map[v] = map[v] ? `${map[v]} ${greek}` : greek;
  }
  return map;
}

async function fetchSBLGNTPassage(query, ref) {
  if (!ref) ref = parsePassageReference(query);
  if (!ref || !ref.file) throw new Error(DA_I18N.t('s.S0056'));

  const map = await fetchSBLGNTChapterVerses(ref);
  const verseNums = Object.keys(map)
    .map(Number)
    .sort((a, b) => a - b)
    .filter((v) => !ref.hasVerses || (v >= ref.startVerse && v <= ref.endVerse));

  if (verseNums.length === 0) throw new Error(DA_I18N.t('s.S0057'));

  return {
    propositions: verseNums.map((v) => map[String(v)]),
    verseRefs: verseNums.map((v) => String(v)),
    passageRef: `${ref.bookName} ${ref.chapter}${ref.hasVerses ? ':' + ref.startVerse + (ref.endVerse !== ref.startVerse ? '-' + ref.endVerse : '') : ''}`,
    copyright: '(SBLGNT)'
  };
}

/**
 * SBLGNT counterpart of fetchParallelVerses: the whole chapter as a
 * { verseNum: greekText } map for the parallel column.
 */
async function fetchSBLGNTChapterMap(query) {
  const ref = parsePassageReference(query);
  if (!ref || !ref.file) throw new Error(DA_I18N.t('s.S0059'));

  const map = await fetchSBLGNTChapterVerses(ref);
  if (!Object.keys(map).length) throw new Error(DA_I18N.t('s.S0060'));
  return map;
}

// ── Bolls Source ──────────────────────────────────────────────────────────────

/**
 * Parse a reference, resolve the Bolls book id, and fetch the WHOLE chapter.
 * The single Bolls request pipeline — shared by the passage import
 * (fetchFromBolls) and the parallel column (fetchParallelVerses), so a fix to
 * the reference parsing, book lookup, or error handling can never miss one of
 * the two paths. Returns { match, verses, bookName }: `match` is the
 * PASSAGE_REF_REGEX result (book / chapter / optional verse range), `verses`
 * the raw Bolls rows.
 */
async function fetchBollsChapter(translation, query, parseErrorMsg) {
  const match = normalizeRefQuery(query).match(PASSAGE_REF_REGEX);
  if (!match) throw new Error(parseErrorMsg);

  const bookName = match[1].trim().toLowerCase().replace(/\s+/g, '');
  const bollsId = DA_CONSTANTS.BOLLS_BOOKS[bookName];
  if (!bollsId) throw new Error(DA_I18N.t('s.S0061', { book: match[1] }));

  const res = await fetch(`https://bolls.life/get-text/${translation}/${bollsId}/${match[2]}/`);
  if (!res.ok) throw new Error(DA_I18N.t('s.S0062', { status: res.status }));

  const verses = await res.json();
  if (!Array.isArray(verses) || verses.length === 0) throw new Error(DA_I18N.t('s.S0063'));

  // Normalize per verse, before fetchFromBolls joins them with "[N] " markers -
  // the CJK-adjacent space rule in normalizeVerseText would otherwise eat the
  // space right after the verse-number marker too. Doing it here, in the one
  // shared pipeline, also fixes an existing asymmetry: fetchFromBolls (the
  // primary passage-import path) previously had no markup/space cleanup at
  // all - only the parallel-column path did.
  return {
    match,
    verses: verses.map(v => ({ ...v, text: normalizeVerseText(v.text) })),
    bookName
  };
}

async function fetchFromBolls(translation, query) {
  const { match, verses, bookName } = await fetchBollsChapter(
    translation, query, DA_I18N.t('s.S0064'));

  const chapter = match[2];
  const startVerse = match[3] ? parseInt(match[3]) : null;
  const endVerse = match[4] ? parseInt(match[4]) : startVerse;

  const filtered = startVerse !== null
    ? verses.filter(v => v.verse >= startVerse && v.verse <= endVerse)
    : verses;

  if (filtered.length === 0) throw new Error(DA_I18N.t('s.S0065'));

  const text = filtered.map(v => `[${v.verse}] ${v.text}`).join(' ');
  const bookNameNormalized = DA_CONSTANTS.FULL_BOOK_NAMES[bookName] || match[1].trim();
  const ref = `${bookNameNormalized} ${chapter}${startVerse ? ':' + startVerse + (endVerse !== startVerse ? '-' + endVerse : '') : ''}`;

  return { text, passageRef: ref, copyright: `(${translation})` };
}

/**
 * Fetch a chapter as a per-verse map for the parallel column (Alternate
 * Views): { "97": "我何等愛慕你的律法…", … }. Unlike fetchFromBolls (which
 * joins verses into one text for the primary import path), the parallel
 * column is keyed by verse so proposition splits/merges never disturb it.
 * Returns the WHOLE chapter; the caller keeps only the verses on screen.
 */
async function fetchParallelVerses(translation, query) {
  // The Greek NT is not on Bolls - route to the app's SBLGNT source instead.
  if (translation === 'SBLGNT') return fetchSBLGNTChapterMap(query);

  const { verses } = await fetchBollsChapter(
    translation, query, DA_I18N.t('s.S0067'));

  // Markup strip / zero-width strip / trim now happen once, per verse, inside
  // fetchBollsChapter (normalizeVerseText) - this loop just reshapes the
  // already-clean array into a verse-number-keyed map.
  const map = {};
  verses.forEach((v) => {
    map[String(v.verse)] = v.text;
  });
  return map;
}

// ── Parse helpers ─────────────────────────────────────────────────────────────

function parsePassageReference(query) {
  const match = normalizeRefQuery(query).match(PASSAGE_REF_REGEX);
  if (!match) return null;

  const bookNameKey = match[1].trim().toLowerCase().replace(/\s+/g, '');
  const bookNameNormalized = DA_CONSTANTS.FULL_BOOK_NAMES[bookNameKey] || match[1].trim();
  const chapter = parseInt(match[2]);
  const hasVerses = !!match[3];
  const startVerse = hasVerses ? parseInt(match[3]) : null;
  const endVerse = match[4] ? parseInt(match[4]) : startVerse;
  const bollsId = DA_CONSTANTS.BOLLS_BOOKS[bookNameKey];

  return {
    file: DA_CONSTANTS.SBLGNT_BOOKS[bookNameKey],
    chapter,
    startVerse,
    endVerse,
    hasVerses,
    bookName: bookNameNormalized,
    bollsId,
    usfm: DA_CONSTANTS.USFM_BY_BOLLS_ID[bollsId]
  };
}

function parseBollsText(rawText) {
  // Strip zero-width characters from source text (legacy verse markers, BOM,
  // joiners) — verse boundaries are structured data now, never in-band chars.
  rawText = String(rawText).replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
  const verseParts = rawText.split(/(?=\[\d+\])/);
  const propositions = [];
  const verseRefs = [];

  for (const part of verseParts) {
    const m = part.match(/^\[(\d+)\]\s*(.*)$/s);
    if (m) {
      const num = m[1];
      const content = m[2].trim();
      if (content) {
        propositions.push(content);
        verseRefs.push(num);
      }
    } else if (part.trim()) {
      propositions.push(part.trim());
      verseRefs.push(verseRefs.length > 0 ? String(propositions.length) : '1');
    }
  }

  if (propositions.length === 0 && rawText.trim()) {
    return {
      propositions: [rawText.replace(/\[\d+\]\s*/g, '').trim()],
      verseRefs: ['1']
    };
  }

  return { propositions, verseRefs };
}

// ── Official APIs: ESV (api.esv.org) and NASB (API.Bible) ───────────────────
//
// Both keys stay server-side; the page never sees them. Two key-holding
// backends return the same { ok, text, canonical } shape:
//   - Desktop: the Electron main process reads keys from .env (main.js),
//     reached via the preload bridge (window.electronAPI.fetchESV/fetchNASB).
//   - Web: the Firebase Cloud Function proxy (functions/index.js) at
//     DA_CONSTANTS.WEB_PROXY_BASE holds the same keys.
// Any failure falls through to the keyless Bolls source (fetchPassageData).

async function callPassageBackend(route, param) {
  if (window.electronAPI) {
    const bridge = route === 'esv' ? window.electronAPI.fetchESV : window.electronAPI.fetchNASB;
    if (typeof bridge === 'function') return bridge(param);
  }
  const base = DA_CONSTANTS.WEB_PROXY_BASE;
  if (!base) throw new Error(DA_I18N.t('s.S0068'));
  const paramName = route === 'esv' ? 'q' : 'passage';
  const res = await fetch(`${base}/${route}?${paramName}=${encodeURIComponent(param)}`);
  if (!res.ok) throw new Error(DA_I18N.t('s.S0069', { status: res.status }));
  return res.json();
}

function unwrapBackendResult(res, label) {
  if (!res || !res.ok) {
    if (res && res.noKey) throw new Error(DA_I18N.t('s.S0070', { label: label }));
    throw new Error(DA_I18N.t('s.S0071', { label: label, status: res && res.status ? ` (${res.status})` : '' }));
  }
  const parsed = parseBollsText(res.text);
  if (parsed.propositions.length === 0) throw new Error(DA_I18N.t('s.S0073', { label: label }));
  return parsed;
}

async function fetchFromESVApi(query) {
  const res = await callPassageBackend('esv', query);
  const parsed = unwrapBackendResult(res, 'ESV API');
  return { ...parsed, passageRef: res.canonical || query, copyright: '(ESV)' };
}

async function fetchFromNASBApi(query) {
  const ref = parsePassageReference(query);
  if (!ref || !ref.usfm) throw new Error(DA_I18N.t('s.S0075'));
  // API.Bible passage ids: ROM.3 (chapter) or ROM.3.21-ROM.3.26 (verse range).
  let passageId = `${ref.usfm}.${ref.chapter}`;
  if (ref.hasVerses) {
    passageId += `.${ref.startVerse}`;
    if (ref.endVerse && ref.endVerse !== ref.startVerse) {
      passageId += `-${ref.usfm}.${ref.chapter}.${ref.endVerse}`;
    }
  }
  const res = await callPassageBackend('nasb', passageId);
  const parsed = unwrapBackendResult(res, 'NASB API');
  return { ...parsed, passageRef: res.canonical || query, copyright: '(NASB)' };
}

// ── Main entry point ──────────────────────────────────────────────────────────

/**
 * Fetch a Bible passage from the best available source.
 *
 * Source priority:
 *   Greek NT  — SBLGNT (GitHub raw)
 *   Greek OT  — Bolls LXX
 *   Hebrew OT — Bolls WLC
 *   ESV       — api.esv.org (desktop .env key or web proxy) → falls back to Bolls
 *   NASB      — API.Bible (desktop .env key or web proxy) → falls back to Bolls
 *
 * @param {string} version - 'esv' | 'nasb' | 'greek' | 'hebrew'
 * @param {string} query   - Passage reference e.g. "John 1:1-5"
 */
async function fetchLegacyPassageData(version, query) {
  if (version === 'hebrew') {
    // Westminster Leningrad Codex (Hebrew OT) via bolls.life. Returns isRTL so
    // the UI flips to right-to-left layout automatically.
    const data = await fetchFromBolls('WLC', query);
    const parsed = parseBollsText(data.text);
    return { ...parsed, passageRef: data.passageRef, copyright: data.copyright, isHebrew: true, isRTL: true };
  }

  if (version === 'greek') {
    const ref = parsePassageReference(query);
    if (ref && ref.file) {
      const result = await fetchSBLGNTPassage(query, ref);
      return { ...result, isGreek: true };
    } else {
      const data = await fetchFromBolls('LXX', query);
      const parsed = parseBollsText(data.text);
      return { ...parsed, passageRef: data.passageRef, copyright: data.copyright, isGreek: true };
    }
  }

  if (version !== 'nasb') {
    try {
      const result = await fetchFromESVApi(query);
      return { ...result, isGreek: false, source: 'esv-api' };
    } catch (_) {
      // No key/proxy, network error, bad reference, etc. — fall through to
      // the keyless Bolls source below.
    }
  } else {
    try {
      const result = await fetchFromNASBApi(query);
      return { ...result, isGreek: false, source: 'nasb-api' };
    } catch (_) {
      // Same fall-through as ESV above.
    }
  }

  const translation = version === 'nasb' ? 'NASB' : 'ESV';
  const data = await fetchFromBolls(translation, query);
  const parsed = parseBollsText(data.text);
  return { ...parsed, passageRef: data.passageRef, copyright: data.copyright, isGreek: false, source: 'bolls' };
}

// Main-passage IDs stay identical to versionSelect. Parallel codes and pasted
// text have separate entry points and deliberately do not enter this registry.
// Keep metadata local and immutable; add fields only when a caller needs them.
const PASSAGE_TRANSLATIONS = Object.freeze(Object.fromEntries([
  ...['esv', 'nasb', 'greek', 'hebrew'].map(id => ({ id, provider: 'legacy' })),
  {
    id: 'cuvs', provider: 'fetch-bible', providerTranslationId: 'cmn_cus',
    language: 'zh', script: 'Hans', displayNameKey: 'scripture.cuvs', shortName: 'CUVS',
    license: 'Public Domain', onlineAvailable: true, sourceId: 'cmn-cu89s',
    attribution: 'eBible.org / fetch(bible)',
    sourceUrl: 'https://ebible.org/details.php?id=cmn-cu89s'
  },
  {
    id: 'cuvt', provider: 'fetch-bible', providerTranslationId: 'cmn_cut',
    language: 'zh', script: 'Hant', displayNameKey: 'scripture.cuvt', shortName: 'CUVT',
    license: 'Public Domain', onlineAvailable: true, sourceId: 'cmn-cu89t',
    attribution: 'eBible.org / fetch(bible)',
    sourceUrl: 'https://ebible.org/details.php?id=cmn-cu89t'
  }
].map(entry => [entry.id, Object.freeze(entry)])));

// Reuse the canonical 66-book USFM mapping; the CDN uses lowercase USX IDs.
// This parser is local to the new provider: legacy API reference behavior stays
// intact. Accept chapters, chapter ranges, verses and same/cross-chapter ranges.
function parseFetchBibleReference(query) {
  const normalized = normalizeRefQuery(query);
  const m = normalized.match(/^(\d?\s*[a-zA-Z\s]+?)\s*(\d+)(?::(\d+))?(?:-(?:(\d+):)?(\d+))?$/);
  if (!m) throw new Error(DA_I18N.t('scripture.reference'));
  const ref = parsePassageReference(`${m[1]} ${m[2]}`);
  // Some full NT names exist in FULL_BOOK_NAMES but only their short alias
  // exists in BOLLS_BOOKS. Resolve through those existing tables, not a new list.
  if (ref && !ref.usfm) {
    const alias = Object.keys(DA_CONSTANTS.BOLLS_BOOKS).find(key => DA_CONSTANTS.FULL_BOOK_NAMES[key] === ref.bookName);
    if (alias) ref.usfm = DA_CONSTANTS.USFM_BY_BOLLS_ID[DA_CONSTANTS.BOLLS_BOOKS[alias]];
  }
  if (!ref?.usfm) throw new Error(DA_I18N.t('s.S0061', { book: m[1].trim() }));
  const startChapter = Number(m[2]);
  const startVerse = m[3] ? Number(m[3]) : 1;
  const endChapter = m[4] ? Number(m[4]) : !m[3] && m[5] ? Number(m[5]) : startChapter;
  const endVerse = m[3] ? Number(m[5] || m[3]) : null;
  if (startChapter < 1 || startVerse < 1 || endChapter < startChapter ||
      (m[4] && !m[3]) || (endVerse !== null && (endVerse < 1 || endChapter === startChapter && endVerse < startVerse))) {
    throw new Error(DA_I18N.t('scripture.reference'));
  }
  // Canonicalize the book name but retain the requested numeric range.
  return { bookId: ref.usfm.toLowerCase(), startChapter, endChapter, startVerse, endVerse,
    passageRef: `${ref.bookName} ${normalized.slice(m[1].length).trim()}` };
}

function fetchBibleVerseText(slot) {
  if (slot === '') return '';
  if (!Array.isArray(slot)) throw new Error(DA_I18N.t('scripture.invalidData'));
  // Plain JSON strings are body. Objects are explicitly typed headings/notes,
  // never body text. Reject unfamiliar shapes instead of silently losing text.
  for (const part of slot) {
    if (typeof part !== 'string' && (!part ||
        !['heading', 'note'].includes(part.type) || typeof part.contents !== 'string')) {
      throw new Error(DA_I18N.t('scripture.invalidData'));
    }
  }
  return slot.filter(part => typeof part === 'string').join('').replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '');
}

async function fetchFromFetchBible(translation, query) {
  const ref = parseFetchBibleReference(query);
  let res;
  try {
    res = await fetch(`https://v1.fetch.bible/bibles/${translation.providerTranslationId}/txt/${ref.bookId}.json`);
  } catch (_) {
    throw new Error(DA_I18N.t('scripture.network'));
  }
  if (!res.ok) throw new Error(DA_I18N.t('scripture.http', { status: res.status }));
  let data;
  try { data = await res.json(); }
  catch (_) { throw new Error(DA_I18N.t('scripture.invalidData')); }
  if (!data || data.book !== ref.bookId || !Array.isArray(data.contents)) {
    throw new Error(DA_I18N.t('scripture.invalidData'));
  }
  // Bound ranges before iteration; a missing requested chapter is an empty
  // reference, not permission to import just the available part of the range.
  if (ref.endChapter >= data.contents.length) throw new Error(DA_I18N.t('scripture.empty'));
  const propositions = [], verseRefs = [];
  for (let chapter = ref.startChapter; chapter <= ref.endChapter; chapter++) {
    const verses = data.contents[chapter];
    if (!Array.isArray(verses)) throw new Error(DA_I18N.t('scripture.invalidData'));
    if (verses.length <= 1) throw new Error(DA_I18N.t('scripture.empty'));
    const first = chapter === ref.startChapter ? ref.startVerse : 1;
    const last = chapter === ref.endChapter && ref.endVerse !== null ? ref.endVerse : verses.length - 1;
    for (let verse = first; verse <= Math.min(last, verses.length - 1); verse++) {
      const text = fetchBibleVerseText(verses[verse]);
      if (!text.trim()) continue;
      propositions.push(text);
      verseRefs.push(ref.startChapter === ref.endChapter ? String(verse) : `${chapter}:${verse}`);
    }
  }
  if (!propositions.length) throw new Error(DA_I18N.t('scripture.empty'));
  return { propositions, verseRefs, passageRef: ref.passageRef, isGreek: false,
    copyright: `(${translation.shortName}) — ${DA_I18N.t('scripture.publicDomain')} · eBible ${translation.sourceId} · fetch(bible)`,
    source: translation.provider };
}

function getTranslationMetadata(id) {
  return Object.hasOwn(PASSAGE_TRANSLATIONS, id) ? PASSAGE_TRANSLATIONS[id] : undefined;
}

// Adapters return the existing passage result shape consumed by app.js. A new
// provider adds an entry here and translations above, without changing the
// legacy official-API/fallback logic or the main UI's loading flow.
const PASSAGE_PROVIDERS = Object.freeze({
  legacy: (translation, query) => fetchLegacyPassageData(translation.id, query),
  'fetch-bible': fetchFromFetchBible
});

async function fetchPassageData(version, query) {
  // Official ESV queries otherwise bypass the local parser. Normalize Chinese
  // references at this input boundary; leave all existing English API queries
  // byte-for-byte intact, including the API's free-query syntax.
  if (/[\u3400-\u9FFF]/.test(query)) query = normalizeRefQuery(query);
  const translation = getTranslationMetadata(version);
  // Preserve the old entry point's ESV default for unrecognized values. Strict
  // registry lookup itself returns undefined, never an invented translation.
  if (!translation) return fetchLegacyPassageData(version, query);
  return PASSAGE_PROVIDERS[translation.provider](translation, query);
}

window.DA_BIBLE = {
  getTranslationMetadata,
  fetchPassageData,
  fetchParallelVerses,
  parsePassageReference
};
