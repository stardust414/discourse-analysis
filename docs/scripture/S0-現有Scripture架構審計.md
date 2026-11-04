# S0：現有 Scripture 架構審計

審計日期：2026-11-04（Asia/Shanghai）。範圍：公開基線 `b12e0d23bb0e6b2ebbc8ca13cb4bed679f8f6916`；提示指定的 privacy-clean application source commit 為 `7d388aec57e1b09cfc68ccb39b2b36f43b909ce2`。以下以當前 source 為依據，沒有讀取舊 local-cuv 分支。

## 1. 模組與主載入鏈

這是 classic scripts / `window.DA_*` 架構，沒有現成通用 Provider Registry。來源選路在 `js/services/bible-service.js`，操作編排在 `app.js`，Electron 與 Web 各有持 key 的 backend。

| 層 | 檔案與符號 | 實際行為 |
| --- | --- | --- |
| UI | `index.html:31` `versionSelect`、`passageInput`、`fetchBtn` | 主選項是 `esv / nasb / greek / hebrew`；不是任意翻譯 ID |
| event | `app.js:8` click；`:558` input keydown | `requestFetchPassage()`，有文檔時先詢問 add / replace |
| orchestration | `app.js:260` `fetchPassage(mode)` | 讀 reference、選項；空輸入報錯；disabled / fetching；await `DA_BIBLE.fetchPassageData(version, query)` |
| reference | `bible-service.js` `normalizeRefQuery / parsePassageReference` | 正規化 dash / NBSP；英文書名及 alias → Bolls numeric book → USFM code；regex 只接受單章及可選節段，不支援中文書名或通用跨章查詢 |
| network | `fetchPassageData` 及下表 | 回傳平行的 `propositions[] / verseRefs[]`、`passageRef / copyright` 和 script flags；部分來源有 `source` |
| state | `js/services/state.js` `DA_STATE.resetForNewDocument` | replace 清空每文檔狀態、undo、parallel、cloud session 等後設定正文；add 經 `DA_EDITOR.addPassage`，保護方向一致並處理跨章 refs |
| view | `app.js` `renderAll` → `DA_RENDERER.renderAll` | 設 copyrightLabel、Greek/Hebrew class、`DA_MODES.setRTL`；renderer 把 propositions 寫為可編輯行；Block Diagram 同步 |
| error | `app.js` catch/finally；`DA_UI.showTranslatedStatus` | 顯示 passage.failed；恢復按鈕；網路成功前不 replace 正文。官方 ESV/NASB 失敗會被 service 吞掉並 fallback，UI 另顯示 fallback 成功 |

add 模式的 copyright、script class 不變；方向是 document-global，因此 RTL 混入 LTR 被擋。不能把單一 copyrightLabel 當成完整逐段 provenance。

## 2. 真正來源及處理

| 選擇 / source | endpoint 與 authentication | parsing / verse / error | cache |
| --- | --- | --- | --- |
| ESV 主文 | `https://api.esv.org/v3/passage/text/?q=...`，Authorization Token | `fetchFromESVApi → callPassageBackend → unwrapBackendResult → parseBollsText`；關閉 headings / notes；讀 passages[0]、canonical；任何官方路徑失敗轉 Bolls ESV | 無 app 級 passage cache |
| NASB 主文 | `https://rest.api.bible/v1/bibles`；`/bibles/{bibleId}/passages/{USFM passageId}`，`api-key` | `fetchFromNASBApi`；如 ROM.3.21-ROM.3.26；content-type=text、帶 [N]；關閉 titles / notes。優先選 NASB95，否則任意 NASB，故 exact edition 由 key 可見清單 / pin 決定；失敗轉 Bolls NASB | main 和 warm function 各只 cache resolved bibleId；不是正文 cache |
| Greek NT | `https://raw.githubusercontent.com/Faithlife/SBLGNT/master/data/sblgnt/text/{book}.txt`，無 key | `fetchSBLGNTChapterVerses` 取全卷 tab text，選章、重複 verse 行 join；`fetchSBLGNTPassage` 篩節排序；找不到 / HTTP 失敗 throw。`master` 未 pin | 無 app cache，瀏覽器 HTTP cache 另計 |
| Greek OT | `https://bolls.life/get-text/LXX/{numericBook}/{chapter}/`，無 key | 非 SBLGNT 書卷走 `fetchFromBolls('LXX')`；`isGreek=true`；不把 LXX 當成 Hebrew | 同上 |
| Hebrew OT | Bolls 同形 endpoint，translation=`WLC` | `fetchFromBolls → parseBollsText`；`isHebrew / isRTL=true`；空 / HTTP / book 錯誤 throw；主入口未先驗證 OT coverage | 同上 |
| Bolls fallback | `/get-text/ESV/...` 或 NASB | 抓整章 JSON array `{verse,text,...}`；`normalizeVerseText` 去 markup、零寬字、CJK 旁 ASCII 空格，保留 U+3000；篩節 → `[N]` text → parse | 同上 |
| pasted text | 無 endpoint / key | `app.js:391` importBtn → `importPastedText`；先試 project JSON → `DA_PERSISTENCE.importBracket`；否則 `DA_PASTE.parsePastedText`（`js/utils/paste-parser.js`），start verse / ref 可人工指定；add / replace | 正文進 document，非下載資料庫 |
| file / recent / draft / cloud project | persistence；cloud-sync | 既有完整 document 的其他入口，不是 Bible translation provider | draft / recent 使用 localStorage；cloud 是 project 同步，不是 Scripture CDN |

`parseBollsText` 只辨識 `[數字]`，不能拿來處理 `[29-30]` 或 source verse ID。`fetchBollsChapter` 對空 array 拒絕；未驗證每筆 verse/text schema。以單一 numeric verse map 表示來源會丟失 source spans。

## 3. Backend 與安全邊界

`preload.js` 暴露 `electronAPI.fetchESV / fetchNASB`，分別 invoke `fetch-esv-passage / fetch-nasb-passage`。`main.js` 在 `__dirname/.env` 讀 `ESV_API_KEY / API_BIBLE_KEY / API_BIBLE_NASB_ID`；回傳 `{ok,text,canonical}` 或 `{ok:false,noKey/status/error}`。不讀取或提交現有 secret。

Web fallback backend 是 `DA_CONSTANTS.WEB_PROXY_BASE`：`https://us-central1-discourse-analysis-f4a8e.cloudfunctions.net/bibleProxy`。`functions/index.js` 的 `/esv?q=`、`/nasb?passage=` 使用 Firebase defineSecret；有參數限制、method / route / error 處理。CORS allowlist 是 upstream GitHub Pages 及 localhost，不能假設新公開部署域名已獲准。CORS 不構成 quota authentication。

Electron `BrowserWindow`：`nodeIntegration:false`、`contextIsolation:true`、`sandbox:true`。main 隔離 renderer 的 key 不等於可把共享 production secret 打包給所有桌面使用者；有心使用者仍能讀 app 包。未來共享 key 應留 server。現有 backend 不在 S0 改動。

`index.html:9` CSP connect-src 目前沒有 fetch.bible / eBible / FHL；未來 renderer 直連須另行修改並測試 CSP，curl 200 或 CORS 成功不能代表 UI 可用。

## 4. Parallel Column：獨立審計

`js/utils/ui-menus.js:827` `PARALLEL_TRANSLATIONS` 定義：CUV、CUNPS、KRV、RV1960、LUT、NVIPT、ESV、NASB、SBLGNT、LXX、WLC。CUV / CUNPS 已在 parallel 出現，不能說應用完全沒有中文；但它們不是本項目已驗證身份 / 授權的新中文 source。

`showParallelDialog()` → click Show → confirm 覆寫（可能有人工編輯）→ `DA_BIBLE.fetchParallelVerses(code, DA_STATE.passageRef)` → `DA_RENDERER.distributeVersesToRows(chapterMap)` → pushUndo → `parallelTexts / parallelLabel / parallelHidden` → 清舊 pcol formatting → render。異常顯示 status，不覆寫 cells。

底層與主文共用 `fetchBollsChapter`；SBLGNT 共用 `fetchSBLGNTChapterVerses`。但 parallel ESV/NASB **不走官方 backend**，直接 Bolls；主文小寫 UI ID 與 parallel provider 大寫 code 是不同 mapping。

`js/utils/render-model.js:32` `versesInRef` 用 parseInt 展開如 3-5；`:53` distributor 用 seen，將同節文字放在第一次出現的 row，後續 split rows 空字串。merged main row 拼接數節；missing map key 略過；若全部為空則 showParallelDialog 報錯。source 的 `29-30` map key 不會自動被查到，更不能將同一 span 全文複製給 29、30 兩個 key。

重要 source/comment 不一致：註解聲稱 chapter-qualified ref 不 mapping，但實際 `parseInt('3:14')` 是 3，不是 NaN，可能錯對第 3 節。此缺陷及跨章 / split suffix 是新 provider parallel 上線的測試 gate，S0 不修。

parallel 初次 distribution 後是**可編輯 per-row 全文**，不是 live verse lookup；split / merge 的後續業務在 editor operations 中維持 row alignment。存檔 `parallelLabel` 實際保存 code（例如 CUNPS），不是翻譯後顯示名；`parallelTexts` 保存全文，無獨立 provider metadata。

## 5. Project persistence / schema 3

`js/services/export-service.js:15` `buildBracketData()` 返回 `version:3`、`passageRef`、`propositions[]`、`verseRefs[]`、`verseBreaks[][]`、script flags、`parallelTexts[] / parallelLabel / parallelHidden`、`copyrightLabel`、brackets、comments、format、profile 相關既有資料等。主文**沒有**已存的 translation code / provider / sourceVersion 欄位；不能誤稱只要填一個既有主文 translation code。

`js/services/persistence.js`：`normalizeBracketData` 做舊資料 migration 與 arrays padding；`importBracket` (`:288`) deep-copy 到 reset，還原 copyrightLabel 及 script / direction，render、recent、clear draft。沒有 `DA_BIBLE.fetch*`。本機 JSON、recent、draft 均可恢復已保存文字；cloud 取得 project 本身需要網路，但其內容不是重新向 Bible source 取經文。

結論：在線中文載入後，只要轉成既有 propositions / refs / copyrightLabel，已保存的 JSON 天然可離線重開正文與 parallel。完整離線 app 啟動還需已安裝 Electron / 靜態資產；不能把離線 project 等同於離線下載整本聖經。受版權限制的永久 project 快照權利仍須另確定。

S1 / S2 應保持 schema 3；主文來源顯示暫用既有 copyrightLabel，registry ID 是 runtime 選項。不可冒充已有機器可讀 provenance。若將來需要逐段 sourceVersion（尤其 add 混來源）應另提 schema 設計，不是本次先行升級。
