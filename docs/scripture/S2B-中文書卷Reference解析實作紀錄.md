# S2B：中文書卷 Reference 解析實作紀錄

基線：`2ea27ec8bae4d02ad83ea88cf86a7fb763dd664b`。日期：2026-11-05。僅擴展 Reference 輸入解析；Release 暫停，無新 tag、Release、合併或 S3 開發。

## 現有解析架構審計

- `js/services/bible-service.js` 的 `normalizeRefQuery` 原本統一 typographic dash、NBSP 與外圍空白；`PASSAGE_REF_REGEX` / `parsePassageReference` 解析英文單章、單節和同章節段。
- 英文 aliases 在 `js/utils/constants.js` 的 `BOLLS_BOOKS`、`FULL_BOOK_NAMES`、`SBLGNT_BOOKS`；book key → Bolls numeric ID → `USFM_BY_BOLLS_ID`。CUVS/CUVT 將既有 USFM code 轉小寫作 fetch(bible) book ID。
- S2A 的 `parseFetchBibleReference` 在上述規範化及既有 mapping 上處理章段、跨章節段，未更換其範圍 grammar 或數值檢查。
- ESV 官方 backend 原本接收自由 query，不必經過本地章節 parser；在 `fetchPassageData` 入口只對含漢字的輸入呼叫共享規範化，使中文書卷也可進入既有 ESV 路徑。原英文 query 逐字節保留，包括自由搜尋語法、空白及 dash。
- Main Passage 的 NASB、Greek、Hebrew 及既有 Bolls / SBLGNT helper 使用共享解析。既有 Parallel helper 也共用其中部分 helper，但本階段未新增或修改 Parallel 譯本、入口或 provider。
- `js/utils/editor-logic.js` 的 `parseRefRange` 是已載入 passage label 的編輯範圍分析；`js/utils/paste-parser.js` 有貼上文字的 citation 偵測；persistence 亦有既有 label 分析。這些均未修改。沒有把中文 aliases 塞入共用 BOLLS_BOOKS，避免改變貼上文字的自動偵測。

## Alias resolution 與衝突

`CHINESE_BOOK_ALIASES` 放在 Bible service 的解析區，是凍結的精確 alias → 既有英文 book key 表，不建立新 book ID。`constants.js` 本身保持逐字節不變，保留既有 immutable constants 測試。

先捕獲阿拉伯章數之前的完整漢字 token，再精確查表；不做 prefix fallback、模糊比對、錯字修正或簡繁轉換。因此 `约 / 約` → JHN；`约一 / 約一` → 1JN；`约二 / 約二` → 2JN；`约三 / 約三` → 3JN。`約翰四書` 不會退回匹配 `約`。其他上/下、前/後書亦分別獨立映射。

覆蓋 66 簡體全名、66 繁體全名，以及 90 個指定簡稱拼寫；相同簡繁全名去重後，共 218 個不同 aliases。資料如下：

| 現有 USFM ID | 簡體全名 | 繁體全名 | 簡稱 |
| --- | --- | --- | --- |
| GEN | 创世记 | 創世記 | 创 / 創 |
| EXO | 出埃及记 | 出埃及記 | 出 |
| LEV | 利未记 | 利未記 | 利 |
| NUM | 民数记 | 民數記 | 民 |
| DEU | 申命记 | 申命記 | 申 |
| JOS | 约书亚记 | 約書亞記 | 书 / 書 |
| JDG | 士师记 | 士師記 | 士 |
| RUT | 路得记 | 路得記 | 得 |
| 1SA | 撒母耳记上 | 撒母耳記上 | 撒上 |
| 2SA | 撒母耳记下 | 撒母耳記下 | 撒下 |
| 1KI | 列王纪上 | 列王紀上 | 王上 |
| 2KI | 列王纪下 | 列王紀下 | 王下 |
| 1CH | 历代志上 | 歷代志上 | 代上 |
| 2CH | 历代志下 | 歷代志下 | 代下 |
| EZR | 以斯拉记 | 以斯拉記 | 拉 |
| NEH | 尼希米记 | 尼希米記 | 尼 |
| EST | 以斯帖记 | 以斯帖記 | 斯 |
| JOB | 约伯记 | 約伯記 | 伯 |
| PSA | 诗篇 | 詩篇 | 诗 / 詩 |
| PRO | 箴言 | 箴言 | 箴 |
| ECC | 传道书 | 傳道書 | 传 / 傳 |
| SNG | 雅歌 | 雅歌 | 歌 |
| ISA | 以赛亚书 | 以賽亞書 | 赛 / 賽 |
| JER | 耶利米书 | 耶利米書 | 耶 |
| LAM | 耶利米哀歌 | 耶利米哀歌 | 哀 |
| EZK | 以西结书 | 以西結書 | 结 / 結 |
| DAN | 但以理书 | 但以理書 | 但 |
| HOS | 何西阿书 | 何西阿書 | 何 |
| JOL | 约珥书 | 約珥書 | 珥 |
| AMO | 阿摩司书 | 阿摩司書 | 摩 |
| OBA | 俄巴底亚书 | 俄巴底亞書 | 俄 |
| JON | 约拿书 | 約拿書 | 拿 |
| MIC | 弥迦书 | 彌迦書 | 弥 / 彌 |
| NAM | 那鸿书 | 那鴻書 | 鸿 / 鴻 |
| HAB | 哈巴谷书 | 哈巴谷書 | 哈 |
| ZEP | 西番雅书 | 西番雅書 | 番 |
| HAG | 哈该书 | 哈該書 | 该 / 該 |
| ZEC | 撒迦利亚书 | 撒迦利亞書 | 亚 / 亞 |
| MAL | 玛拉基书 | 瑪拉基書 | 玛 / 瑪 |
| MAT | 马太福音 | 馬太福音 | 太 |
| MRK | 马可福音 | 馬可福音 | 可 |
| LUK | 路加福音 | 路加福音 | 路 |
| JHN | 约翰福音 | 約翰福音 | 约 / 約 |
| ACT | 使徒行传 | 使徒行傳 | 徒 |
| ROM | 罗马书 | 羅馬書 | 罗 / 羅 |
| 1CO | 哥林多前书 | 哥林多前書 | 林前 |
| 2CO | 哥林多后书 | 哥林多後書 | 林后 / 林後 |
| GAL | 加拉太书 | 加拉太書 | 加 |
| EPH | 以弗所书 | 以弗所書 | 弗 |
| PHP | 腓立比书 | 腓立比書 | 腓 |
| COL | 歌罗西书 | 歌羅西書 | 西 |
| 1TH | 帖撒罗尼迦前书 | 帖撒羅尼迦前書 | 帖前 |
| 2TH | 帖撒罗尼迦后书 | 帖撒羅尼迦後書 | 帖后 / 帖後 |
| 1TI | 提摩太前书 | 提摩太前書 | 提前 |
| 2TI | 提摩太后书 | 提摩太後書 | 提后 / 提後 |
| TIT | 提多书 | 提多書 | 多 |
| PHM | 腓利门书 | 腓利門書 | 门 / 門 |
| HEB | 希伯来书 | 希伯來書 | 来 / 來 |
| JAS | 雅各书 | 雅各書 | 雅 |
| 1PE | 彼得前书 | 彼得前書 | 彼前 |
| 2PE | 彼得后书 | 彼得後書 | 彼后 / 彼後 |
| 1JN | 约翰一书 | 約翰一書 | 约一 / 約一 |
| 2JN | 约翰二书 | 約翰二書 | 约二 / 約二 |
| 3JN | 约翰三书 | 約翰三書 | 约三 / 約三 |
| JUD | 犹大书 | 猶大書 | 犹 / 猶 |
| REV | 启示录 | 啟示錄 | 启 / 啟 |

## 語法與 punctuation normalization

- 書名與阿拉伯章數間的空白可省略：`创1`、`创 1`、`创世记1`、`創世記 1`。
- 維持既有章、單節、同章節段；CUVS/CUVT 維持既有章段及跨章節段：`创1-2`、`约3:16`、`林前10:1-4`、`約翰福音1:50-2:3`。
- 新增全角冒號 U+FF1A `：` → `:`，全角 hyphen U+FF0D `－` → `-`；保留原 typographic dash / NBSP 規範化，不使用 NFKC 或廣泛 Unicode 轉換。
- UI locale 不參與 alias lookup。English UI 可輸入中文，繁體 UI 可輸入英文；同一輸入框可交替使用兩者。
- 書卷輸入形式不選擇譯本。繁體輸入 + CUVS 仍取 `cmn_cus`；簡體輸入 + CUVT 仍取 `cmn_cut`，正文和神稱不轉換。
- 不新增 legacy provider 的範圍能力：例如 Bolls 單章路徑仍是原單章契約；不能將 CUVS/CUVT 的跨章支援泛化為每個 provider 都支援。官方 ESV 原自由 query 能力不縮減。

## 錯誤與不支援形式

未知中文書名保留現有 invalid reference UX，CUVS/CUVT 在網路請求前拒絕。未增加 fuzzy matching、自然語言章節、中文數字章節、全角數字、跨書卷清單或混合書名拼接。`约翰福音第三章十六节`、`约三章十六节` 不支援。

## Provider、schema 與 i18n 邊界

僅 `normalizeRefQuery` 與 `fetchPassageData` 的輸入規範化發生變動。其餘既有 Bible service 函數逐字節比對一致，包括 `parseFetchBibleReference`、`fetchBibleVerseText`、`fetchFromFetchBible`、legacy backend/fallback 和 Parallel helpers。CUVS/CUVT metadata、runtime endpoints、66-book mapping、normalized 空槽/合併槽處理均未改。

未修改 app.js、CSP、main/preload、persistence、依賴或 lockfile；project schema 仍為 **3**。未新增網路 endpoint、離線下載、CNV、TCV 或 Parallel Chinese。

Aliases 是 parser data，不是 UI dictionary keys。609/609/609 字典及 placeholder 均保持；67 個新/增加的 source literals 已逐項分類為 66 個既有英文 book keys 與一個 alias-only reference 重建 template，登記在既有 source audit delta；未修改 audit script 或 grammar exception 白名單。

## 測試

新增 unit 逐一驗證 132 個全名和 90 個簡稱拼寫，另測空白、全角標點、章/節/節段/章段/跨章、John 歧義、未知書名、所有既有英文 alias、ESV 原 query 逐字節保留、NASB/Greek/Hebrew mapping，以及三語 UI 下譯本正文不轉換。

新增 10 個 E2E：CUVS 三個指定例子、CUVT 三個指定例子、繁體 UI + 英文書名、English UI + 繁體/全角輸入、跨章空槽契約、未知中文錯誤 UX。使用真實 UI parser → mock CDN → passage load；不宣稱 mock 是真實 CDN 驗收。

驗證環境是 macOS，使用現有 `npm run check`、`npm run test:e2e` 和 `node scripts/audit-i18n.cjs`。未使用或聲稱執行 Cloud 專用配置。E2E 在當前工作檔的獨立檔案副本執行，受控歷史截圖未被覆寫，所有既有 assertions 保留。

最終結果：

- `npm run check` exit 0：lint / typecheck 通過；**745/745 unit**（原 492 + 新增 253），0 failed / skipped。
- 完整 Mac browser E2E：**147/147**（原 137 + 新增 10），0 failed / skipped；既有 relationship-picker geometry 測試亦通過。沒有套用 Cloud 失敗豁免。
- 完整 i18n audit：**609/609/609**，traditionalMissingKeys=0、issues=[]；7 項既有 grammar exceptions 不變。
- 逐函數差異檢查：只有共享輸入規範化與 Main Passage 入口的中文規範化發生變動；其餘既有 Bible service 函數及 constants.js 逐字節一致。
- 新增/增加的 67 項 source literal 審計紀錄均限 parser data，沒有放寬 audit script 或舊 assertions。
- 實際完成的是 macOS 驗證；本階段未執行 Cloud runner 或 S2B packaged Mac live smoke。

## Mac Release 前的 live smoke 待辦

使用包含 S2B 的新 packaged binary（不能沿用只含 S2A 的舊 ZIP 結果）：

1. CUVS 真實網路載入 `创世记1:1-5`、`约3：16`、`林前10:1-4`。
2. CUVT 真實網路載入 `創世記1:1-5`、`約3：16`、`林後5:17`。
3. 中文章段/跨章輸入、John Gospel/Epistles 歧義、normalized 空槽/合併槽及錯誤 UX。
4. English UI + 中文、繁體 UI + English；切換 UI 不改 Scripture script/神稱。
5. ESV/NASB/Greek/Hebrew 的中英文輸入最小回歸，不改原 provider 範圍能力。
6. split / bracket / comment / save，斷網重開 schema-3 JSON，退出/重啟。

本階段不打包、不執行新的 live gate、不更新暫停中的 S2A Draft，完成後停止。
