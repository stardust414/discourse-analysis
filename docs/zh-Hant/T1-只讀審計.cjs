/** T1 audit only. Reads frozen application data; writes evidence only with --write. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const cp = require('child_process');
const assert = require('assert/strict');
const ROOT = path.resolve(__dirname, '../..');
const BASE = '403538316c80e1e539c334638592c1fc221b3ce8';
const MAC = 'c02cf5be5ce69135ef617eb317e2b7362446f239';
const git = (...args) => cp.execFileSync('git', args, { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const s = { window: {} }; vm.createContext(s);
for (const name of ['en', 'zh-CN']) vm.runInContext(read('js/i18n/' + name + '.js'), s);
const en = s.window.DA_I18N_CATALOGS.en, zh = s.window.DA_I18N_CATALOGS['zh-CN'];
const keys = Object.keys(en); assert.equal(keys.length, 600); assert.deepEqual([...keys].sort(), Object.keys(zh).sort());
const A = new Set(['common.done', 'common.cancel', 'common.close', 's.S0704', 's.S0706', 's.S0749', 's.S0788', 's.S0768', 's.S0784', 's.S0786', 's.S0437', 's.S0443', 's.S0471', 's.S0486', 's.S0488', 's.S0490', 's.S0494', 's.S0520', 's.S0524', 's.S0526', 's.S0632', 's.S0476', 's.S0480', 's.S0194', 's.S0530', 'action.clear-all', 'action.shift text', 'action.color text', 'state.on', 'state.off', 'position.beginning', 'position.end', 's.S0809', 'native.minimize', 'native.zoomin', 'native.zoomout', 's.S0465', 's.S0747', 's.S0086', 's.S0087', 's.S0725']);
const E = new Set(['language.english', 's.S0605', 's.S0603', 'paste.detected']);
for (const k of [...A, ...E]) assert.ok(Object.hasOwn(en, k), k);
const domain = /篇章|括号|命题|记号|主次|主导|从属|经文|圣经|译本|节号|书卷|新约|旧约|希腊|希伯来|平行|关系|节点|圆点|星号|标签/;
const englishDomain = /\b(?:bracket|bracketing|proposition|notation|profile|parallel|relationship|verse|Bible|SBLGNT|Hebrew|Greek)\b/i;
const vocabulary = ['设置','保存','另存为','打开','文件','项目','搜索','删除','导入','导出','恢复','撤销','重做','回复','发送','评论','剪贴板','复制','粘贴','鼠标','光标','窗口','视图','数据','默认','自定义','创建','添加','链接','密码','发布','替换','合并','编辑','缩进','高亮'];
const ambiguous = ['后','发','里','干','台','复','系','只','面','制'];
function placeholders(value) { return [...new Set([...JSON.stringify(value).matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)].map(x => x[1]))].sort(); }
function line(file, key) { const source = read(file), i = source.indexOf(JSON.stringify(key)); assert.ok(i >= 0); return source.slice(0, i).split('\n').length; }
const records = keys.map((key, index) => {
  const text = typeof zh[key] === 'string' ? zh[key] : JSON.stringify(zh[key]);
  let category, reason;
  if (key.startsWith('relationship.name.')) { category = 'D'; reason = 'D01–D28 關係顯示名稱，保留 profile 異名與原記號。'; }
  else if (E.has(key)) { category = 'E'; reason = '品牌／語言名／版本名或純變數模板，原樣保留，不列為字形翻譯。'; }
  else if (/^(relationship\.|group\.|guide\.|notation\.|profile\.|summary\.|block\.)/.test(key) || domain.test(text) || englishDomain.test(JSON.stringify(en[key]))) { category = 'C'; reason = '專業概念、Guide 定義／關鍵詞或含專業詞的動態文案，繼承 v1.1 語義。'; }
  else if (A.has(key)) { category = 'A'; reason = '逐項檢視後保守列入：詞義與用詞可沿用，僅字形或原有漢字不變。'; }
  else { category = 'B'; reason = '一般軟體介面、說明／錯誤／確認句，依統一 UI 詞表逐句審核；不先批量定稿。'; }
  const risks = [];
  if (key === 's.S0622') risks.push('高優先：英中方向與呼叫參數對照；newTranslation 實為目前譯本，oldTranslation 為新選譯本。繁體建議見普通 UI 表。');
  if (placeholders(en[key]).length) risks.push('動態完整句：保留參數名稱與語義；不要按英文片段拼接。');
  if (category === 'C') risks.push('同句若含 UI 詞亦須套用 B 類詞表；歷史建議不得擅自升為已批准。');
  return { number: index + 1, key, category, english: en[key], zhCN: zh[key], reason, uiVocabularyHits: vocabulary.filter(x => text.includes(x)), oneToManyCharacters: ambiguous.filter(x => text.includes(x)), englishParameters: placeholders(en[key]), chineseParameters: placeholders(zh[key]), englishValueShape: typeof en[key] === 'object' ? Object.keys(en[key]) : 'string', source: { en: 'js/i18n/en.js:' + line('js/i18n/en.js', key), zhCN: 'js/i18n/zh-CN.js:' + line('js/i18n/zh-CN.js', key) }, risks, zhHantStatus: 'T1 分類／建議待審，未建立 production 譯文' };
});
const counts = records.reduce((a, r) => (a[r.category]++, a), { A: 0, B: 0, C: 0, D: 0, E: 0 });
assert.equal(Object.values(counts).reduce((a, b) => a + b), 600); assert.equal(counts.D, 28);
const relationshipDraft = [
 ['series','並列列舉'],['progression','遞進'],['alternative','選擇關係'],['both-and','兩者並列'],['ground','理由'],['inference','推論'],['bilateral','雙向支持'],['double-ground','雙側理由'],['cause-effect','原因—結果'],['action-result','行動—結果'],['action-purpose','行動—目的'],['conditional','條件'],['temporal','時間'],['locative','地點'],['action-manner','行動—方式'],['comparison','比較'],['negative-positive','否定—肯定'],['idea-explanation','意思—解釋'],['question-answer','問題—回答'],['general-specific','概括—具體'],['fact-interpretation','事實—詮釋'],['anticipation-fulfillment','預期—實現'],['concessive','讓步'],['situation-response','處境—回應'],['unspecified','未指定'],['Way-End','方式關係'],['Means-End','手段—目的'],['Adversative','逆接']
].map(([variant, traditional], i) => ({ reviewId: 'D' + String(i + 1).padStart(2, '0'), key: 'relationship.name.' + variant, variant, english: en['relationship.name.' + variant], zhCN: zh['relationship.name.' + variant], suggestedZhHant: traditional, status: '建議，未作繁體人工定稿' }));
assert.equal(relationshipDraft.length, 28);
const { createSandbox, load } = require(path.join(ROOT, 'tests/helpers/harness.js'));
const sb = createSandbox(); ['js/utils/constants.js','js/services/state.js','js/services/profiles.js','js/i18n/relationships.js'].forEach(f => load(sb, f)); sb.DA_I18N.setPreference('zh-CN');
const matrix = [];
for (const p of Object.values(sb.DA_PROFILES.builtins())) {
  sb.DA_PROFILES.setActiveById(p.id);
  const before = JSON.stringify(sb.DA_PROFILES.getActive());
  for (const type of sb.DA_PROFILES.getVisibleTypes()) {
    const raw = sb.DA_PROFILES.getName(type); const english = raw.replace(/\s*\([^)]*\)\s*$/, '').trim(); const term = relationshipDraft.find(r => r.english === english); assert.ok(term, raw);
    const abbr = sb.DA_PROFILES.getAbbr(type);
    matrix.push({ profileId: p.id, profileName: p.name, relationshipId: type, rawEnglishName: raw, englishName: english, originalAbbreviation: abbr, chineseCurrentDisplay: sb.DA_RELATIONSHIPS.getName(type), suggestedZhHantName: term.suggestedZhHant, suggestedCompleteDisplay: term.suggestedZhHant + ' ' + english + '（' + abbr + '）', reviewId: term.reviewId, rawDefinition: sb.DA_CONSTANTS.RELATIONSHIP_DEFINITIONS[type]?.definition || '', approvedOrCurrentChineseHelp: sb.DA_RELATIONSHIPS.getDefinition(type), originalKeywords: sb.DA_CONSTANTS.RELATIONSHIP_DEFINITIONS[type]?.keywords || '', currentChineseKeywords: sb.DA_RELATIONSHIPS.getKeywords(type), originalDominance: JSON.parse(JSON.stringify(p.dominance)), originalLabelOverride: JSON.parse(JSON.stringify(p.labels[type] || {})), originalColor: sb.DA_PROFILES.getColor(type), note: '只建立審核資料；不改 profile 或括號內部 ID、名稱、縮寫、符號、星號、主次、顏色、順序。' });
  }
  assert.equal(JSON.stringify(sb.DA_PROFILES.getActive()), before, 'Read-only extraction mutated active profile');
}
assert.equal(matrix.length, 92);
const perProfile = matrix.reduce((a, r) => (a[r.profileId] = (a[r.profileId] || 0) + 1, a), {}); assert.deepEqual(perProfile, { josiah:18,biblearc:18,gurtner:20,beale:17,schreiner:19 });
const localePlans = [
 ['zh-CN','zh-CN'],['zh-SG','zh-CN'],['zh-Hans','zh-CN'],['zh-Hans-CN','zh-CN'],['zh-Hans-SG','zh-CN'],['zh-TW','zh-Hant'],['zh-HK','zh-Hant'],['zh-MO','zh-Hant'],['zh-Hant','zh-Hant'],['zh-Hant-TW','zh-Hant'],['zh-Hant-HK','zh-Hant'],['zh-Hant-CN','zh-Hant'],['zh-Hans-TW','zh-CN'],['zh-Hant-US','zh-Hant'],['ZH_hant_HK','zh-Hant'],['zh','zh-CN'],['zh-MY','zh-CN'],['en-US','en'],['fr-FR','en'],['ja-JP','en'],['zh-US','en'],['not_a_locale!','en'],['','en']
].map(([input, proposed]) => ({ input, currentActual: sb.DA_I18N.resolveLocale([input]), proposed, status: 'T2 設計預期，未修改 production resolver' }));
const polysemy = ambiguous.map(character => ({ character, keys: records.filter(r => r.oneToManyCharacters.includes(character)).map(r => r.key) }));
const tracked = git('ls-tree','-r','--name-only',BASE,'--','app.js','main.js','preload.js','index.html','styles.css','js','package.json','package-lock.json','scripts','tests','functions').toString().trim().split('\n');
const hashes = tracked.map(file => { const b = fs.readFileSync(path.join(ROOT, file)); assert.ok(b.equals(git('show',BASE+':'+file)), 'Production/test file changed: '+file); return { file, sha256: hash(b) }; });
const appDiff = git('diff','--name-only',MAC,BASE,'--','app.js','main.js','preload.js','index.html','styles.css','js','package.json','package-lock.json').toString().trim().split('\n').filter(Boolean);
assert.deepEqual(appDiff.sort(),['js/services/export-service.js','js/services/notation-ui.js','js/services/persistence.js','js/utils/ui-menus.js'].sort());
assert.ok(!fs.existsSync(path.join(ROOT, 'js/i18n/zh-Hant.js')));
const summary = { sourceBranch:'windows-validation',sourceHead:BASE,worktree:ROOT,branch:git('branch','--show-current').toString().trim(),worktreeStartHead:BASE,englishKeys:keys.length,chineseKeys:Object.keys(zh).length,productionZhHantExists:false,categories:counts,countsAreMutuallyExclusive:true,CandD:counts.C+counts.D,relationNames:28,visibleProfileRows:92,perProfile,visibleUniqueRelationshipIds:new Set(matrix.map(r=>r.relationshipId)).size,canonicalRelationshipIds:Object.keys(sb.DA_CONSTANTS.RELATIONSHIP_LABELS).length,appDifferencesFromMac:appDiff,projectSchema:3,profileSchema:1,newDependenciesRequired:false,proposedNewKey:'language.traditional',proposedT2KeyCountIfApproved:601,allApplicationTestsAndConfigMatchFrozenHead:true,fullSourceHashes:hashes };
const escape = value => (typeof value === 'string' ? value : JSON.stringify(value)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\|/g,'\\|').replace(/\n/g,'<br>');
const keyTable = '# T1：600 key 全量分類清單\n\n來源 English + zh-CN；本表是逐項分類證據，不是繁體字典。分類互斥：A 字形／沿用詞，B UI 用詞與完整句審核，C 專業／幫助，D 28 關係名，E 原文／純參數保留。C／D 中的 UI 動詞仍遵守普通 UI 詞表；不以主分類排除二次檢查。\n\n| # | key | 類別 | English 原值 | zh-CN 原值 |\n| --- | --- | --- | --- | --- |\n' + records.map(r=>'| '+r.number+' | `'+r.key+'` | '+r.category+' | '+escape(r.english)+' | '+escape(r.zhCN)+' |').join('\n')+'\n';
const outputs = {
 'T1-600-key分類審計.json': { scope:'Audit only; no 600-entry zh-Hant translation resource generated',sourceHead:BASE,categories:counts,records },
 'T1-五套profile-92映射.json': { sourceHead:BASE,perProfile,rows:matrix },
 'T1-28關係建議.json': { sourceHead:BASE,rows:relationshipDraft },
 'T1-locale設計案例.json': { primaryLocaleOnly:true,scriptBeforeRegion:true,missingTranslationFallback:'en (never zh-CN)',cases:localePlans },
 'T1-一簡多繁出現位置.json': { records:polysemy },
 'T1-審計摘要.json': summary
};
if (process.argv.includes('--write')) {
  for (const [file,data] of Object.entries(outputs)) fs.writeFileSync(path.join(__dirname,file),JSON.stringify(data,null,2)+'\n');
  fs.writeFileSync(path.join(__dirname,'T1-600-key分類清單.md'),keyTable);
} else {
  for (const [file,data] of Object.entries(outputs)) assert.deepEqual(JSON.parse(read('docs/zh-Hant/'+file)),JSON.parse(JSON.stringify(data)),file+' stale');
  assert.equal(read('docs/zh-Hant/T1-600-key分類清單.md'),keyTable);
}
console.log(JSON.stringify({ english:600,zhCN:600,categories:counts,relationNames:28,profileRows:matrix.length,perProfile,productionZhHantExists:false,applicationUnchanged:true,mode:process.argv.includes('--write')?'write audit documents only':'read-only verify' },null,2));
