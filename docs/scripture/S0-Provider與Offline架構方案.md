# S0：Provider 與 Offline 架構方案

日期：2026-11-04。這是設計，不新增 module、provider、translation、schema 或 dependency。授權與來源證據見同目錄資料源審計。

## 1. 決策

推薦 Strategy C（Hybrid）：保留既有 ESV/NASB、Greek、Hebrew、paste、parallel 路徑，以 registry + adapter 包住既有行為，對新中文來源開有限入口。不是立即把所有舊來源遷到 fetch(bible)。

| 策略 | regression / upstream | 維護、版權、離線 |
| --- | --- | --- |
| A 舊 provider + 特定中文 provider | 初期最小；容易散落 if 與兩份 selector mapping | 隨來源增加越難管 license / offline |
| B 全部立刻統一 | 變動最大，官方 API fallback、原文 versification、parallel 全有風險；upstream 難審 | 整潔但沒有解除版權；單一 CDN 無法替代 ESV/NASB 授權 |
| C Hybrid（推薦） | 舊入口作 legacy adapter；新資料 contract，分次 review，容易 cherry-pick | 可集中 license gate，無需 bundle 全文；保留未來 offline resolver |

fetch(bible) 是優先候選 CDN / metadata provider，無 key、可自託管、可不用 client dependency；但必須先解決節號語義與 edition / 授權 gate。eBible 保留為 provenance、源格式核驗與必要的受控 fallback，不做網站 HTML scraper。沒有合格 fallback 時明確失敗，不偷偷換 edition。

## 2. Translation Registry（概念資料，未實施）

沿用 classic script `window.DA_*` / plain objects，不引入框架或繼承體系。可未來新增小型 `DA_SCRIPTURE` facade；既有 `DA_BIBLE` 保持可用。

```js
// 設計示意；rights 未核實不能只因 metadata.public 就 enable
{
  id: 'cuvs-ebible-cu89s',
  displayName: { en: 'Chinese Union Version (Simplified)',
    'zh-CN': '新标点和合本（简体）', 'zh-Hant': '新標點和合本（簡體）' },
  shortName: 'CUVS', language: 'cmn', script: 'Hans',
  provider: 'fetch-bible', providerTranslationId: 'cmn_cus',
  license: { declared: 'public', verification: 'pending-edition-review', evidence: [] },
  attribution: { text: 'public domain; source: eBible.org', url: '...' },
  onlineAvailable: false, // release gate；另設 declared availability，不混用
  offlineAllowed: 'unclear', downloadable: false,
  cachePolicy: { mode: 'none-until-approved', maxAgeSeconds: null },
  testamentCoverage: ['OT', 'NT'],
  sourceVersion: { sourceUpdated: '2021-10-15', collectionCommit: '...', sha256: '...' },
  versification: { source: 'source-specific', distributed: 'provider-specific' }
}
```

CUVT 獨立 entry：Hant / `cmn_cut` / `cmn-cu89t`；神 / 上帝差異也是身份，不是 UI locale。legacy alias table 明確保留主文 `esv/nasb/greek/hebrew`、parallel `ESV/NASB/SBLGNT/...`，不能把 ID 全部 lower-case 推導。

rights 支援 yes/no/unclear 和來源日期；可下載必須 `offlineAllowed === true` 且 license review 通過；unknown 預設關閉。不能把 UI `onlineAvailable` 當成法律結論。translation metadata 應本地可讀，selector 不因 CDN metadata 掛掉而失去舊選項。

## 3. 最小 adapter contract

```text
getTranslationMetadata(id) -> registry entry（同步，無 secret）
fetchPassage(id, reference, {signal}) -> PassageResult
fetchChapter(id, bookId, chapter, {signal}) -> ChapterResult
```

`fetchChapter` 可作 adapter 的內部能力；不強迫既有 official passage backend 改寫為整章抓取。舊 `fetchPassageData` output 用 wrapper 適配，新中文輸入不經舊 `[N]` parser。

新 record 至少：`sourceRecordId, bookId, chapter, sourceVerseLabel, verseStart, verseEnd, text, kind, sourceVersion, sourceVersification`；`29-30` 是一個 record。book 用明確 USFM code；fetch.bible lowercase 在 adapter 邊界轉換；不得按 array index 猜缺節。

PassageResult 包含 records、warnings、attribution、translationId、sourceVersion；到既有 UI 邊界才產生 propositions / verseRefs / passageRef / flags。只導入 body，不導入 note、heading、cross-reference；superscription 保留 kind，不默認放入 verse 1。請求範圍碰到 span 應回傳完整 span 並顯示實際 reference，不裁切或複製內容。若 source 只有 normalized verse slots 且已失去 span 識別，必須用 pin 的 raw USFM / USX 或配套 span index，不能假設可逆。

空 verse 與 HTTP 故障分開：missing verse 回結構化 absent warning；404 book/chapter、429、timeout、invalid JSON、license denied、corrupt local 分類處理。有序 source records 與查詢 lookup 分離，避免一節一筆假設。abort / request sequence 防止舊 response 覆蓋新選擇；失敗不得清空原文。S1 wrapper 不藉機改變舊 fallback。

fetch(bible) txt JSON 可只保留 string parts；HTML JSON 不直接 innerHTML 到 editor。SDK 可選，不是必要依賴；直接 CDN 小 adapter 更符合現有無 bundler 風格。S2 須用真實 span sample 確定 txt 方案能否保留語義；不行就使用 provider USX / 原始 source 的已審計轉換，不臨時寫 regex 去掉所有 XML。

## 4. Online / Cache / Offline 的區分與 resolver

Online Fetch：使用者請求 passage 從遠端取得；fetch(bible) 的網路傳輸粒度是全卷，不等於全文下載權。Cache：為效能暫存部分 response，有 TTL / 清除規則，不代表永久權。Offline Download：使用者主動安裝完整譯本，長期保存，需明確全本離線及再散布權。

已合法下載的公版版本採 **local first → corrupt/missing → 明確允許時 online fallback**。分析希望延遲低、離線可靠且同一 sourceVersion 決定同一正文；不在使用者分析中靜默更新。顯示更新可用，由使用者選擇安裝。保存 project 不隨 provider 更新重寫正文。

受 30 天 refresh 等條件限制的授權 cache 不能套用永久 local-first；到期停用並按授權刷新，無網路不能假稱已獲永久離線權。CNV / TCV 未核實前不 fetch、不 cache、不提供下載。legacy 來源不因 registry 加欄位就獲離線權。

## 5. Offline Translation Manager（S3，未建立目錄）

現有 main.js 未建立 Scripture data store；renderer sandbox 無 fs。下載資料不放 app.asar（唯讀、更新會替換），不放隨時可淘汰的 browser cache，也不塞入 project 或 localStorage。

建議 Electron main 透過 `app.getPath('userData')` 下專用資料夾：

```text
scripture/translations/{registryId}/
  versions/{contentVersion}/manifest.json
  versions/{contentVersion}/books/...
  current.json
scripture/staging/{downloadId}/...
```

manifest：format/schema version（獨立於 project schema）、translation/edition/provider IDs、source URL、source/collection version、normalization version、每檔 bytes/SHA-256、整包 hash、downloadedAt、license/attribution snapshot、rights evidence、versification、book/chapter coverage。不能把 CDN ETag 當成可信 publisher checksum；有簽名 manifest 最佳，自算 hash 只證明之後未變。

流程：磁碟空間 / rights preflight → staging 分卷下載、限並行、大小限制 → JSON/USX schema、coverage、checksum 驗證 → 同 filesystem rename 發布 immutable version → 原子切換 current。中斷保留 staging + resume manifest；重新驗 hash，不把半包標為已下載。失敗保留舊 current。checksum/schema 壞則 quarantine，提示重新下載；允許 online fallback 時須同 edition，且明示 sourceVersion 改變。

啟動快檢 manifest，讀取驗檔；update detection 比較 source version/hash，不只看 Last-Modified。rollback 至上個已驗版本；delete 先切換狀態並等待讀取結束再刪資料，不能刪 project。刪除下載不影響 project 已存文字。下載進度 / cancel / retry / update / delete 對應明確 state machine：not-installed、downloading、verifying、installed、update-available、corrupt、failed。

preload 只暴露列舉、安裝批准 ID、取消、刪除、讀批准 book 等窄 IPC；main 驗 sender、ID、路徑、URL allowlist，防 traversal / zip slip / zip bomb / 非 Scripture URL。renderer 不提供任意 fs path 或 fetch URL。Web offline 若將來需要，另用 IndexedDB / Cache Storage、quota/eviction 提示；S3 先 Electron，不假稱兩平台相同可靠。

共享 API key 留 Firebase / 其他 server secret manager，proxy 需限流、quota、Origin 之外的濫用保護。main 只適合使用者自行配置的 key，不適合內嵌共享 secret。S0 不要 key、不保存 token、不部署。

## 6. UI / compatibility / parallel

保持簡單原生 selector，8 個左右先扁平列表，不加搜尋頁或複雜分組；可在選項增多後用 English / Chinese / Original Languages optgroup。翻譯 label 經三語 i18n，script 由 translation 決定，繁體 UI 選 CUVS 仍是簡體，絕不自動簡繁轉換。

離線管理小對話框顯示 edition、script、source date、license、下載大小、在線可用 / 已下載、下載 / 更新 / 刪除。unclear rights 不顯示可用下載按鈕。UI 只顯示對使用者有用的版本資訊，不顯示內部 provider mapping。

schema 3 保持。新主文可沿用全文與 copyrightLabel；parallel 用既有 code + full cells。新 provenance 若僅 runtime，不宣稱存檔後可還原 sourceVersion。需要 machine-readable provenance 是獨立提案。

中文先 main。parallel 待單章 span-aware mapping、missing、split/merge、跨章歧義測試過後另個受控增量開啟；不能將新的 span source 塞進舊 numeric map 即宣告支援。main 與 parallel 長期應共用 adapter，但不必同一提交上線。

## 7. 測試與 upstream 成本

unit：registry ID/alias/coverage/rights gate；book mapping；refs / spans / missing / superscription / Psalms / 3 John 15；string-only body parser；HTTP/schema/timeout/abort；attribution；local state、TTL、hash、atomic interrupted/update/delete。資料 fixture 必須小、可授權、pin version；不提交版權全文。

E2E：攔截網路回固定 fixture，CUVS/CUVT selector/load、split、bracket、relationship、undo、save/reopen（斷網）、三語 UI 切換不改正文、parallel replace/cancel、existing ESV/NASB/Greek/Hebrew/paste regression；S3 另 Electron IPC 與實際檔案生命週期整合測試。browser E2E 不足以驗證 userData。

network integration：獨立 opt-in 少量 live metadata / 一個 PD passage / Origin request；測 CORS/CSP/redirect/CDN schema，限流、無 secret log。不得讓全部 E2E 依賴外網；live smoke 失敗要區分環境封鎖與 provider failure。

upstream：C 的小 facade 最易 review，預設不加 dependency、不攜帶整本 source、不攜帶 restricted text、不把 CDN 寫死到 editor；metadata evidence 與責任集中。免費 API 不等於 upstream 免責；未釐清 edition 的全文再發布會令上游承擔法律與維護負擔，因此不能預設 enable。
