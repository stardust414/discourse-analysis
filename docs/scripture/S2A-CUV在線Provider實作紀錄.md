# S2A：CUVS / CUVT 在線 Main Passage Provider

實作核驗日期：2026-11-05。基線：S1 `57ada82da0c9ab8dfce9fadba679568f4568d8e0`。本輪先明確刷新 remote-tracking ref，以 `rev-parse` 和 `ls-remote` 雙重核對後才 reset；乾淨基線的 check 為 458/458。

## 1. 身份、來源與授權 metadata

| internal ID | display | provider resource ID | eBible provenance ID | language / script |
| --- | --- | --- | --- | --- |
| cuvs | 新标点和合本（简体） | cmn_cus | cmn-cu89s | zh / Hans |
| cuvt | 新標點和合本（繁體） | cmn_cut | cmn-cu89t | zh / Hant |

沿用 S1 `PASSAGE_TRANSLATIONS` 與 `PASSAGE_PROVIDERS`，都在 `js/services/bible-service.js`。舊 entries 仍只有 id/provider；新 entries 才加入 providerTranslationId、language、script、displayNameKey、shortName、license、onlineAvailable、sourceId/sourceUrl、attribution。兩版均按本階段指定與來源 metadata 登記 **Public Domain / onlineAvailable=true**，不加入 offline/download UI 或能力。

本次重新檢視官方 manifest：https://v1.fetch.bible/manifest.json ，其中 cmn_cus / cmn_cut 的 script 與公版來源 URL 各自對應上述 eBible ID，沒有用名稱猜 ID。Firecrawl 對大 manifest 的輸出不是完整 catalog，本項只採實際讀到的兩個 entry，不聲稱完整 catalog 校驗。

另外從官方 source collection 再次 fetch main，確認 commit `c45928a5d8ddfea0c695f91306f7236f840d859a`：

- https://github.com/gracious-tech/fetch_collection/blob/c45928a5d8ddfea0c695f91306f7236f840d859a/bibles/cmn_cus/meta.json
- https://github.com/gracious-tech/fetch_collection/blob/c45928a5d8ddfea0c695f91306f7236f840d859a/bibles/cmn_cut/meta.json
- https://ebible.org/details.php?id=cmn-cu89s
- https://ebible.org/details.php?id=cmn-cu89t

source.service=ebible；source.updated 分別 2021-10-15 / 2024-12-30。保留 S0 對 metadata year=1889 與 USFM title=1989 的記錄，不把錯疑年份作為新的 edition 證明。本階段按使用者指定採這兩份來源的公版宣告，不推廣為「所有同名 CUNP 均公版」，也沒有取得新的版權方授權書。

## 2. Endpoint 與真實格式

直接 GET `https://v1.fetch.bible/bibles/{providerTranslationId}/txt/{lowercaseUsxBookId}.json`，無 key、無新依賴、無自建 proxy、無其他來源 fallback；不抓 HTML、不解析 USFM/USX。請求粒度是**一卷**，在本次請求記憶體中取 passage；沒有新增 persistent cache 或整本下載。

官方格式說明：https://fetch.bible/access/manual/ 、https://fetch.bible/access/ 、https://github.com/gracious-tech/fetch/tree/master/converters/usx-to-json 。本次外部讀取實際 JSON：

- https://v1.fetch.bible/bibles/cmn_cus/txt/3jn.json
- https://v1.fetch.bible/bibles/cmn_cut/txt/3jn.json
- https://v1.fetch.bible/bibles/cmn_cus/txt/gen.json （只分析 24:29-31 sample，不把全卷提交）

形狀為 `{book, name, contents}`；contents[chapter][verse] 是 parts array，chapter 0 / verse 0 為預留槽。body 是 strings；`{type:'heading', contents, level}` 和 `{type:'note', contents}` 為副文。strings 內單 newline / 雙 newline 表示換行 / 段落。空 array、空字串或僅副文的 slot 不提供正文。

adapter 僅拼接 string parts，刪除外圍 ASCII 空白，保留內部 newline / 段落與 U+3000 敬稱空格。不做 CJK 空格正規化，不做簡繁轉換，不把 name / heading / footnote / attribution 放入 propositions。未知 part type、錯誤 book / contents / chapter shape、錯誤 JSON 明確報錯，避免靜默漏掉正文。UI 使用既有 copyrightLabel 最小顯示 CUVS/T、公有領域、eBible ID 與 fetch(bible)。

`index.html` CSP 僅增加 `https://v1.fetch.bible` 的 connect-src；未修改 Cloud 或 Firebase 設定。兩個 option 使用三語 i18n keys，不重設 selector、不分組；繁體 UI 選 CUVS 仍簡體，簡體 UI 選 CUVT 仍繁體；CUVT 的「上帝」不替換為「神」。

## 3. Book / reference / normalized versification

復用 `DA_CONSTANTS.USFM_BY_BOLLS_ID` 的66卷表，轉 lowercase，不建另一份 runtime mapping。使用既有 BOLLS_BOOKS aliases；對已有 FULL_BOOK_NAMES 但 BOLLS 僅收短名的 NT 全名，沿既有表找回短 alias（如 1 Corinthians → 1cor → 1CO → 1co）。unit 用獨立的66個官方 code 序列核對，並逐卷核驗 alias 到 CDN ID。

既有共享 parser 只明確支援單章、單節與同章節段；ESV 官方 API 另接收其服務支援的自由 query，沒有在本次縮減其能力。新 provider 局部 parser 接受：`John 1`、`John 1:1`、`John 1:1-5`、`John 1-2`、`John 1:50-2:3`，以及既有英文 alias、數字書卷名、NBSP 與 typographic dash 正規化。不是通用自然語言搜尋、跨書卷清單或 ESV 搜尋服務的複製；不接受的 reference 明確提示格式，絕不偷偷改譯本。

跨章結果使用 `1:50 / 2:1` 等 chapter-qualified verseRefs；單章仍為 `1 / 2`，符合既有 project contract。若要求的章超出 book 或章缺失，整次失敗，避免只匯入部分章後宣告完整成功。

採用 fetch(bible) 的 **normalized verse-based 格式**，官方文件描述其統一 KJV-style numbering，不等於原始 eBible USFM versification。adapter 不還原 raw span、不自行重編 Psalms、不拆分或複製 raw merged record，也不為 normalized 空槽找相鄰正文補齊。

具體現場 sample：Genesis 24:29 的 JSON slot 放 29–30 combined text，24:30 是 `[]`，24:31 有下一筆。S2A 請求29–31只導入29和31兩筆；只請求30回無正文錯誤，**不猜其屬於哪個 source span**。這是 normalized contract 的明確限制，並不宣稱30內容在翻譯原始 source 真正缺失。fixture 鎖定相同 slot 行為，正文用短合成文字，無全卷 dump。完整70個 raw spans 的逐一 live parity 不在本次已驗證範圍。

## 4. Empty / error / persistence

範圍內 empty slot 略過，後續 verse number 保持原索引，不複製前後經文。若結果全空，拋三語 `scripture.empty`。HTTP、transport、malformed response 使用對應三語錯誤，交現有 `app.js` loading catch / status UX；不清掉舊 document，按鈕恢復可用，沒有 FHL/eBible HTML/GitHub fallback、沒有 CUVS/CUVT 互換。

結果依然是 propositions / verseRefs / passageRef / copyright / isGreek / source。既有保存流程沒有改：schema **3**，完整 passage text、verse refs、copyrightLabel 入 JSON；重開 JSON 不呼叫 provider，斷網仍恢復已保存正文。主文沒有 machine-readable translation ID / sourceVersion 持久欄位，本次不增 schema 或 migration。這不是 Offline Translation Manager，也不允許離線載入尚未保存的任意章。

Parallel 維持既有入口與大寫 codes（含原本 CUV/CUNPS），不加入 cuvs/cuvt、不修改 mapping。ESV/NASB 官方 API → Bolls 邏輯、Greek NT/OT、Hebrew、paste 路徑未改；app.js 只修正一條過時的 provider 註解。

## 5. Cloud 與 Mac live smoke

Cloud runtime 直接 GET manifest 與 cmn_cus JSON，仍在 proxy tunnel 階段 HTTP403，並無 origin response，因此不能判定 provider CORS 成敗。官方 collection 的 Git 及外部 Firecrawl 網頁讀取成功不代表 Cloud runtime / Electron renderer 連通。

**Mock/runtime contract validated；real fetch(bible) live request 未驗證，需要在使用者 Mac 上進行 S2A live-network smoke。** 沒有把 Cloud proxy workaround 寫入生產程式。

Mac 必驗：

1. Electron 及正式 Web 的 CDN GET、file:// Origin / CORS / CSP、redirect、HTTP錯誤與連線中斷；不靠關閉 webSecurity。
2. CUVS/CUVT 各載入 Genesis1、單節、節段、John1:50-2:3、章段、數字書卷名；確認簡繁與神稱差異。
3. 創24:29–31、只30、已知空節、Psalm119、3John1:15；與當前 normalized JSON 比對，不能只比 raw USFM 計數。
4. 確認 headings / footnotes 沒進 editor、段落與敬稱空格保留；split / bracket / save，關網後重新開 JSON；三語 UI 切換不改經文。
5. ESV/NASB/Greek/Hebrew/paste 及既有 Parallel regression；確認沒有新下載 UI、Bible localStorage/IndexedDB/userData。

S2B Parallel Chinese、S3 Offline、CNV/TCV 均未實作，完成 S2A 後停止。

## 6. 驗證記錄

新增34個 unit（`tests/fetch-bible.test.js`），新增3個 E2E（`tests/e2e/cuv-online.spec.js`）；使用最小合成 JSON fixture，無全卷或全本聖經入庫。既有 selector 契約測試只擴充期望的兩個 option，三語 catalog 精確總數測試從601更新為609；未改 geometry assertion。

三語各新增8個 keys：兩個名稱、公有領域、reference格式、malformed、HTTP、network、empty錯誤。新／增加 source literals 35條逐項審查並在既有 audit snapshot 登記，沒有改 audit script 或語法例外白名單。

完整驗證結果見完成段落。

完成驗證：

- `npm run check` exit0：lint / typecheck 通過，**492/492 unit**（458 + 新34），0 failed / skipped。
- 完整 E2E **136 passed / 1 failed / 137 total**（134 + 新3）；唯一失敗是既有 `relationship picker opens underneath the bracket's last line`，預期 picker.y >=501.703125，實際5。無新增失敗、無 skip、未改原 assertion。完整 log / error-context 已保留於執行環境，不入 Git。
- 完整 i18n audit：**609/609/609**、traditionalMissingKeys=0、issues=[]、7 approved grammar exceptions 不變。
- diff 審查：22張自動覆寫截圖已備份後還原；沒有測試產物、全卷/全本 dump、環境檔、secret、個人絕對路徑、dependency / lockfile 變動。舊 Bible service 的 legacy 函數與 parallel 函數內容逐字比對未變。
- Cloud fixture/mocked runtime contract 通過；**Cloud 真實 fetch(bible) 直連未驗證，Mac live-network smoke 仍待完成**，不以外部頁面讀取成功冒充 Cloud 應用連通。
